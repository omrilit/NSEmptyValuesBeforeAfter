/**
 * Copyright © 2015, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};

function DE_GODB_PMD_Report(state, params, output, job) {
    this.outline = {
        "Section": PayableMasterData
    };

    this.GetOutline = function() {
        return this.outline;
    };
    
    this.GetReportIndex = function getReportIndex() {
        return getIndex();
    };
    
    function getIndex() {
        var formatterColumns = params.formatter.TEMPLATE.COLUMNS;
        var columns = [];
        for (var i = 0; i < formatterColumns.length; i++) {
           var column = formatterColumns[i];
           columns.push(new SFC.Utilities.ReportColumn(column, column.constantType, column.constantDescriptor));
        }
        
        var reportIndex = {};
        reportIndex.url = params.filename;
        reportIndex.name = params.filename;
        reportIndex.description = 'Lieferantenübersicht und Transaktionen pro Periode';
        reportIndex.decimalsymbol = SFC.Utilities.Constants.DECIMALSYMBOL;
        reportIndex.digitgroupingsymbol = SFC.Utilities.Constants.DIGITGROUPINGSYMBOL;
        reportIndex.columndelimiter = SFC.Utilities.Constants.COLUMNDELIMITER;
        reportIndex.columns = columns;
        return reportIndex;
    }

    function PayableMasterData() {
        return new DE_GODB_PMD_ReportSection(state, params, output, job);
    }
}

function DE_GODB_PMD_ReportSection(state, params, output, job) {
    TAF.IReportSection.apply(this, arguments);
    this.Name = 'PayablesMasterData';
}

DE_GODB_PMD_ReportSection.prototype = Object.create(TAF.IReportSection.prototype);

DE_GODB_PMD_ReportSection.prototype.On_Init = function() {
    TAF.IReportSection.prototype.On_Init.call(this);

    this.context = nlapiGetContext();
    this.isMultiCurrency = this.context.getFeature('MULTICURRENCY');
    this.isOneWorld = this.context.getFeature('SUBSIDIARIES');
    this.isMultiBook = this.context.getFeature('MULTIBOOK');

    if (!this.state.common) {
        this.setCommonState();
    }

    if (!this.state[this.Name]) {
        this.setReportState();
    }

    this.vendorDao = new TAF.DE.DAO.VendorDao();
    this.adapter = new TAF.DE.Adapter.EntityAdapter();
    this.accountingBook = this.isMultiBook ? this.getAccountingBook() : null;
};

DE_GODB_PMD_ReportSection.prototype.setCommonState = function() {
    this.subsidiary = this.isOneWorld ? SFC.Subsidiaries.Load(this.params.subsidiary) : null;
    this.subsidiaryChildren = this.subsidiary && this.params.include_child_subs ? this.subsidiary.GetDescendants() : null;
    
    var subsidiaryList = [];
    if (this.isOneWorld) {
        subsidiaryList.push(this.params.subsidiary);
    }

    for (var ichild = 0; ichild < (this.subsidiaryChildren && this.subsidiaryChildren.length); ichild++) {
        subsidiaryList.push(this.subsidiaryChildren[ichild].GetId());
    }

    this.state.common = {
        periodIds: new TAF.DAO.AccountingPeriodDao().getCoveredPostingPeriods(this.params.periodFrom, this.params.periodTo),
        subIds: this.isOneWorld ? subsidiaryList : null,
        priorPeriodIds: new TAF.DAO.AccountingPeriodDao().getPostingPeriodsBeforePeriod(this.params.periodFrom),
    };
};

DE_GODB_PMD_ReportSection.prototype.setReportState = function() {
    this.state[this.Name] = {
        priorPeriodIndex: 0,
        periodIndex: 0,
        searchIndex: 0,
        txnCustomerIds: []
    };
};

DE_GODB_PMD_ReportSection.prototype.On_Header = function() {
    this.output.WriteLine(this.formatter.formatPMDHeader());
};

DE_GODB_PMD_ReportSection.prototype.On_Body = function() {
    try {
        var params = this.state.common;
        var state = this.state[this.Name];

        for (var iperiod = state.periodIndex; iperiod < (params.periodIds && params.periodIds.length); iperiod++) {
            this.vendorDao.search({
                periodIds: params.periodIds[iperiod].id,
                subIds: this.isOneWorld ? params.subIds : [],
                bookId: this.params.bookId
            });
            var index = this.process(this.vendorDao, state.searchIndex, this.processPMDLine);

            state.periodIndex = iperiod;
            state.searchIndex = index;
            if (this.thresholdReached) {
                return;
            }
        }
    } catch (ex) {
        nlapiLogExecution('ERROR', 'DE_GODB_PMD_ReportSection.On_Body', ex.toString());
        throw ex;
    }
};

DE_GODB_PMD_ReportSection.prototype.processPMDLine = function(rawLine) {
    if (!rawLine) {
        throw nlapiCreateError('MISSING_PARAMETER', 'rawLine is a required parameter');
    }
    if (this.state[this.Name].txnCustomerIds.indexOf(rawLine.internalId) > -1) {
        return;
    }

    try {
        var convertedLine = this.adapter.getLine(rawLine);
        if (convertedLine) {
            this.output.WriteLine(this.formatter.formatPMDLine(convertedLine));
            this.state[this.Name].txnCustomerIds.push(rawLine.internalId);
        }
    } catch (ex) {
        nlapiLogExecution('ERROR', 'DE_GODB_PMD_ReportSection.processPMDLine', ex.toString());
    }
};

DE_GODB_PMD_ReportSection.prototype.On_CleanUp = function() {
    TAF.IReportSection.prototype.On_CleanUp.call(this);
    delete this.state.common;
};

var DE_GODB_PMD_TXT_Report = function DE_GODB_PMD_TXT_Report(state, params, output, job) {
    params.formatter = new TAF.DE.Formatter.PayablesMasterDataFormatter();
    params.filename = 'payable_master_data.txt';
    DE_GODB_PMD_Report.call(this, state, params, output, job);
};
DE_GODB_PMD_TXT_Report.prototype = Object.create(DE_GODB_PMD_Report.prototype);
DE_GODB_PMD_TXT_Report.IsCRGReport = true;
DE_GODB_PMD_TXT_Report.ReportId = 'DE_GODB_PMD_TXT';
