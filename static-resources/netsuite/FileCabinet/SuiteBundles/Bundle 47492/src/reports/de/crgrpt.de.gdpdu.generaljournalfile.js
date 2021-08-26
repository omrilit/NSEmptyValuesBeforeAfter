/**
 * Copyright © 2015, 2017, Oracle and/or its affiliates. All rights reserved.
 */
var TAF = TAF || {};

function DE_GDPDU_GJ_Report(state, params, output, job) {
	this.outline = {
		"Section": GeneralJournal
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
		reportIndex.description = 'Buchungsjournal';
		reportIndex.decimalsymbol = SFC.Utilities.Constants.DECIMALSYMBOL;
		reportIndex.digitgroupingsymbol = SFC.Utilities.Constants.DIGITGROUPINGSYMBOL;
		reportIndex.columndelimiter = SFC.Utilities.Constants.COLUMNDELIMITER;
		reportIndex.columns = columns;
		return reportIndex;
	}

	function GeneralJournal() {
		return new DE_GDPDU_GJ_ReportSection(state, params, output, job);
	}
}

function DE_GDPDU_GJ_ReportSection(state, params, output, job) {
	TAF.IReportSection.apply(this, arguments);
	this.Name = 'GeneralJournal';
}
DE_GDPDU_GJ_ReportSection.prototype = Object.create(TAF.IReportSection.prototype);
DE_GDPDU_GJ_ReportSection.prototype.On_Init = function() {
	TAF.IReportSection.prototype.On_Init.call(this);

	this.context = nlapiGetContext();
	this.isMultiCurrency = this.context.getFeature('MULTICURRENCY');
	this.isOneWorld = this.context.getFeature('SUBSIDIARIES');
	this.isMultiBook = this.context.getFeature('MULTIBOOK');
    this.isForeignCurrency = this.context.getFeature('FOREIGNCURRENCYMANAGEMENT');
    this.resource = new ResourceMgr(this.params.job_params.CultureId);

    this.subsidiary = this.isOneWorld ? SFC.Subsidiaries.Load(this.params.subsidiary) : null;
	this.subsidiaryChildren = this.subsidiary && this.params.include_child_subs ? this.subsidiary.GetDescendants() : null;

	if (!this.state.common) {
		this.setCommonState();
	}

	if (!this.state[this.Name]) {
		this.setReportState();
	}
	this.currencyCode = this.getDefaultCurrency();
	this.validateCurrencies();

	this.dao = new TAF.DE.DAO.GeneralJournalDao();
	var acctParams = this.isOneWorld ? {subsidiary: ['anyof', this.state.common.subIds]} : {};
	acctParams.accountingcontext = ['is',this.params.accountingContext];
	this.accounts = new TAF.AccountDao().getList(acctParams, false);
	this.adapter = new TAF.DE.Adapter.GeneralJournalAdapter(this.accounts, this.currencyCode);
};

DE_GDPDU_GJ_ReportSection.prototype.getDefaultCurrency = function() {
    var currency = '';

    if (this.isMultiBook && this.isForeignCurrency && this.params.bookId) {
        currency = this.getAccountingBookCurrency();
    } else if (this.isOneWorld) {
        currency = this.subsidiary.GetCurrencyCode();
    } else if (this.isMultiCurrency) {
        currency = new TAF.DAO.CompanyDao().getInfo().currencyCode;
    }

    return currency;
};

DE_GDPDU_GJ_ReportSection.prototype.getAccountingBookCurrency = function() {
    var dao = new TAF.DAO.AccountingBookDao();
    dao.search({
        internalId: this.params.bookId,
        subsidiary: this.params.subsidiary,
    });
    var books = dao.getList();
    return books && (books.length > 0) ? books[0].currencyName : '';
};

DE_GDPDU_GJ_ReportSection.prototype.setCommonState = function() {
	var subsidiaryList = [];
	if (this.isOneWorld) {
		subsidiaryList.push(this.params.subsidiary);
	}

	for (var ichild = 0; ichild < (this.subsidiaryChildren && this.subsidiaryChildren.length); ichild++) {
		subsidiaryList.push(this.subsidiaryChildren[ichild].GetId());
	}

	this.state.common = {
		periodIds: new TAF.DAO.AccountingPeriodDao().getCoveredPostingPeriods(this.params.periodFrom, this.params.periodTo),
		subIds: this.isOneWorld ? subsidiaryList : null
	};
};

DE_GDPDU_GJ_ReportSection.prototype.setReportState = function() {
	this.state[this.Name] = {
		periodIndex: 0,
		searchIndex: 0
	};
};

DE_GDPDU_GJ_ReportSection.prototype.validateCurrencies = function() {
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
		throw nlapiCreateError('DE_AUDIT_Currency_Check', this.resource.GetString('ERR_CURRENCY_CHECK', {
			'subsidiaries': invalidCurrencySubs.join(', ')
		}), true);
	}
};

DE_GDPDU_GJ_ReportSection.prototype.On_Header = function() {
	this.output.WriteLine(this.formatter.formatGJHeader());
};

DE_GDPDU_GJ_ReportSection.prototype.On_Body = function() {
	try {
		var params = this.state.common;
		var state = this.state[this.Name];

		for (var iperiod = state.periodIndex; iperiod < (params.periodIds && params.periodIds.length); iperiod++) {
			this.dao.search({
				periodIds: params.periodIds[iperiod].id,
				subIds: this.isOneWorld ? params.subIds : [],
	            bookId: this.params.bookId
			});
			var index = this.process(this.dao, state.searchIndex, this.processGLLine);

			state.periodIndex = iperiod;
			state.searchIndex = index;
			if (this.thresholdReached) {
				break;
			}
		}
	} catch (ex) {
		nlapiLogExecution('ERROR', 'DE_GDPDU_GJ_ReportSection.processInternalIdsPerPeriod', ex.toString());
		throw ex;
	}
};

DE_GDPDU_GJ_ReportSection.prototype.On_CleanUp = function() {
	TAF.IReportSection.prototype.On_CleanUp.call(this);
	delete this.state.common;
};

DE_GDPDU_GJ_ReportSection.prototype.processGLLine = function(line) {
	if (!line) {
		throw nlapiCreateError('MISSING_PARAMETER', 'line is a required parameter');
	}

	try {
		var convertedGJLine = this.adapter.getGeneralJournal(line);
		if (convertedGJLine) {
			this.output.WriteLine(this.formatter.formatGJLine(convertedGJLine));
		}
	} catch (ex) {
		nlapiLogExecution('ERROR', 'DE_GDPDU_GJ_ReportSection.processGLLine', ex.toString());
	}
};

var DE_GDPDU_GJ_TXT_Report = function DE_GDPDU_GJ_TXT_Report(state, params, output, job) {
	params.formatter = new TAF.DE.Formatter.GeneralJournalFormatter();
	params.filename = 'transaction_journal.txt';
	DE_GDPDU_GJ_Report.call(this, state, params, output, job);
};
DE_GDPDU_GJ_TXT_Report.prototype = Object.create(DE_GDPDU_GJ_Report.prototype);
DE_GDPDU_GJ_TXT_Report.IsCRGReport = true;
DE_GDPDU_GJ_TXT_Report.ReportId = 'DE_GDPDU_GJ_TXT';
