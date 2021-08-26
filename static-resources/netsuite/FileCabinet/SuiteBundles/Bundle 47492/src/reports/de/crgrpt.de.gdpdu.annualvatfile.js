/**
 * Copyright © 2015, 2017, Oracle and/or its affiliates. All rights reserved.
 */
var TAF = TAF || {};

function DE_GDPDU_AV_Report(state, params, output, job) {
    this.GetOutline = function() {
        return {
            Section: DE_GDPDU_AV_ReportSection.bind(this, state, params, output, job)
        };
    };

    this.GetReportIndex = function getReportIndex() {
        return getIndex();
    };

    function getIndex() {
        var formatterColumns = params.formatter.TEMPLATE.COLUMNS;
        var columns = [];
        var column;

        for (var i = 0; i < formatterColumns.length; i++) {
           column = formatterColumns[i];
           columns.push(new SFC.Utilities.ReportColumn(column, column.constantType, column.constantDescriptor));
        }
        columns = columns.concat(getPeriodColumns());

        var reportIndex = {};
        reportIndex.url = params.filename;
        reportIndex.name = params.filename;
        reportIndex.description = 'Aufteilung der MwSt. pro Monat während der Periode';
        reportIndex.decimalsymbol = SFC.Utilities.Constants.DECIMALSYMBOL;
        reportIndex.digitgroupingsymbol = SFC.Utilities.Constants.DIGITGROUPINGSYMBOL;
        reportIndex.columndelimiter = SFC.Utilities.Constants.COLUMNDELIMITER;
        reportIndex.columns = columns;

        return reportIndex;
    }

    function getPeriodColumns() {
        var coveredPeriods = new TAF.DAO.AccountingPeriodDao().getCoveredPostingPeriods(params.periodFrom, params.periodTo);
        var periodColumns = [];
        var formattedValue;

        for (var i = 0; i < coveredPeriods.length; i++) {
            formattedValue = replaceInvalidCharacters(coveredPeriods[i].name);
            periodColumns.push(new SFC.Utilities.ReportColumn(formattedValue, SFC.Utilities.Constants.NUMERIC, SFC.Utilities.Constants.NUMERICACCURACY));
        }

        return periodColumns;
    }
}

function DE_GDPDU_AV_ReportSection(state, params, output, job) {
    TAF.IReportSection.apply(this, arguments);
    this.Name = 'AnnualVAT';
}

DE_GDPDU_AV_ReportSection.prototype = Object.create(TAF.IReportSection.prototype);
DE_GDPDU_AV_ReportSection.prototype.On_Init = function() {
    TAF.IReportSection.prototype.On_Init.call(this);
    this.context = nlapiGetContext();
    this.isMultiCurrency = this.context.getFeature('MULTICURRENCY');
    this.isOneWorld = this.context.getFeature('SUBSIDIARIES');
    this.isMultiBook = this.context.getFeature('MULTIBOOK');
    this.resource = new ResourceMgr(this.params.job_params.CultureId);

    this.subsidiary = this.isOneWorld ? SFC.Subsidiaries.Load(this.params.subsidiary) : null;
    this.subsidiaryChildren = this.subsidiary && this.params.include_child_subs ? this.subsidiary.GetDescendants() : null;

    if (!this.state.common) {
        this.setCommonState();
    }

    if (!this.state[this.Name]) {
        this.setReportState();
    }

    this.params.periodNames = [];
    this.params.formattedPeriodNames = [];
    var coveredPeriods = this.state.common.periodIds;
    for (var iperiod = 0; iperiod < coveredPeriods.length; iperiod++) {
        this.params.periodNames.push(coveredPeriods[iperiod].name);
        this.params.formattedPeriodNames.push(replaceInvalidCharacters(coveredPeriods[iperiod].name));
    }
    this.params.formatter.addPeriodFields(this.params.formattedPeriodNames);

    this.taxCodesList = new TAF.DE.DAO.TaxCodeDao().find(this.state.common);
    this.validateCurrencies();
    this.avLineDao = new TAF.DE.DAO.AnnualVatDao();
    this.adapter = new TAF.DE.Adapter.AnnualVatAdapter(this.state[this.Name].taxcodesAmount);
    this.accountingBook = this.isMultiBook ? this.getAccountingBook() : null;
};

DE_GDPDU_AV_ReportSection.prototype.setCommonState = function() {
    var subsidiaryList = [];
    if (this.isOneWorld) {
        subsidiaryList.push(this.params.subsidiary);
    }

    for (var ichild = 0; ichild < (this.subsidiaryChildren && this.subsidiaryChildren.length); ichild++) {
        subsidiaryList.push(this.subsidiaryChildren[ichild].GetId());
    }

    var coveredPeriods = new TAF.DAO.AccountingPeriodDao().getCoveredPostingPeriods(this.params.periodFrom, this.params.periodTo);
    this.state.common = {
        periodIds: coveredPeriods,
        subIds: this.isOneWorld ? subsidiaryList : null
    };
};

DE_GDPDU_AV_ReportSection.prototype.setReportState = function() {
    this.state[this.Name] = {
        periodIndex: 0,
        searchIndex: 0,
        taxcodesAmount: {}
    };
};

DE_GDPDU_AV_ReportSection.prototype.validateCurrencies = function() {
    if (!this.isMultiCurrency || !this.subsidiaryChildren) {
        return;
    }
    var invalidCurrencySubs = [];
    var currencyCode = this.subsidiary.GetCurrencyCode();

    for (var ichild = 0; ichild < this.subsidiaryChildren.length; ++ichild) {
        if (currencyCode != this.subsidiaryChildren[ichild].GetCurrencyCode()) {
            invalidCurrencySubs.push(this.subsidiaryChildren[ichild].GetName());
        }
    }

    if (invalidCurrencySubs.length > 0) {
        throw nlapiCreateError('DE_AUDIT_Currency_Check', this.resource.GetString('ERR_CURRENCY_CHECK', {'subsidiaries': invalidCurrencySubs.join(', ')}), true);
    }
};

DE_GDPDU_AV_ReportSection.prototype.On_Header = function() {
    this.output.WriteLine(this.formatter.formatAVHeader());
};

DE_GDPDU_AV_ReportSection.prototype.On_Body = function() {
    try {
        var commonState = this.state.common;
        var avState = this.state[this.Name];

        for (var iperiod = avState.periodIndex; iperiod < (commonState.periodIds && commonState.periodIds.length); iperiod++) {
            var searchparam = {
                periodIds: commonState.periodIds[iperiod].id,
                subIds: this.isOneWorld ? commonState.subIds : [],
                bookId: this.params.bookId
            };
            this.avLineDao.search(searchparam);
            var index = this.process(this.avLineDao, avState.searchIndex, this.processAVLine);
            avState.periodIndex = iperiod;
            avState.searchIndex = index;

            if (this.thresholdReached) {
                avState.taxcodesAmount = this.adapter.getTaxCodesAmount();
                return;
            }
        }

        var annualVat = null;
        var taxcodeid = '';
        var getAnnualVatParams = {};
        for (var itaxcodes=0; itaxcodes<this.taxCodesList.length; itaxcodes++) {
            taxcodeid = this.taxCodesList[itaxcodes].id;
            getAnnualVatParams = {
                taxcodeObj: this.taxCodesList[itaxcodes],
                taxcodeAmount: this.adapter.getTaxCodesAmount()[taxcodeid],
                periodNames: this.params.periodNames,
                formattedPeriodNames: this.params.formattedPeriodNames,
                bookId: this.accountingBook && this.accountingBook.id
            };

            annualVat = this.adapter.getAnnualVat(getAnnualVatParams);
            this.output.WriteLine(this.formatter.formatAVLine(annualVat));
        }
    } catch (ex) {
        nlapiLogExecution('ERROR', 'DE_GDPDU_AV_ReportSection.On_Body', ex.toString());
        throw ex;
    }
};

DE_GDPDU_AV_ReportSection.prototype.On_Footer = function() {
    try {
        var netAmountTotal = this.adapter.getNetAmountTotal();
        this.output.WriteLine(this.formatter.formatAVLine(netAmountTotal));
    } catch (ex) {
        nlapiLogExecution('ERROR', 'DE_GDPDU_AV_ReportSection.On_Footer', ex.toString());
        throw ex;
    }
};

DE_GDPDU_AV_ReportSection.prototype.On_CleanUp = function() {
    TAF.IReportSection.prototype.On_CleanUp.call(this);
    delete this.state.common;
};

DE_GDPDU_AV_ReportSection.prototype.processAVLine = function(line) {
    if (!line) {
        throw nlapiCreateError('MISSING_PARAMETER', 'line is a required parameter');
    }
    try {
        this.adapter.addTaxCodeAmount(line);
    } catch (ex) {
        nlapiLogExecution('ERROR', 'DE_GDPDU_AV_ReportSection.processAVLine', ex.toString());
    }
};

function replaceInvalidCharacters(value) {
	if (value == undefined){
		return value;
	}
    var INVALID_CHARACTERS = '~!$^&*(){}[]\\|;:\"\'?/,<>@ #`.-+=';
    var VALID_CHARACTER = '_';
    var updatedString = value;
    for (var i = 0; i < INVALID_CHARACTERS.length; i++) {
        updatedString = updatedString.replace(INVALID_CHARACTERS[i], VALID_CHARACTER);
    }
    return updatedString;
};

var DE_GDPDU_AV_TXT_Report = function DE_GDPDU_AV_TXT_Report(state, params, output, job) {
    params.formatter = new TAF.DE.Formatter.AnnualVatFormatter();
    params.filename = 'annualvat.txt';
    DE_GDPDU_AV_Report.call(this, state, params, output, job);
};
DE_GDPDU_AV_TXT_Report.prototype = Object.create(DE_GDPDU_AV_Report.prototype);
DE_GDPDU_AV_TXT_Report.IsCRGReport = true;
DE_GDPDU_AV_TXT_Report.ReportId = 'DE_GDPDU_AV_TXT';

