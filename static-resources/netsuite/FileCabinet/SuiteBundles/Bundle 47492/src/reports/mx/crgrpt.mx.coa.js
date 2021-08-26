/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var MX_SAT_COA_ReportSection = function _MX_SAT_COA_ReportSection(state, params, output, job) {
	TAF.IReportSection.apply(this, arguments);
	this.Name = 'MX_COA_Report';
	this.accounts = [];
	this.currentPeriodData = [];
	this.previousPeriodData = [];
	this.adapter = new TAF.MX.Adapter.COAAdapter();
	this.PROGRESS_PERCENTAGE = {
        INIT:    10,
        HEADER:  20,
        BODY:    90,
        FOOTER:  100
    };
	this.SAVED_REPORT = 'TAF Trial Balance';
	var MEXICO_LOCALIZATION_BUNDLE = 'cd476cab-e846-474e-9f11-e213e69c420b';
    this.hasMXLocalization = SFC.Registry.IsInstalled(MEXICO_LOCALIZATION_BUNDLE);
};
MX_SAT_COA_ReportSection.prototype = Object.create(TAF.IReportSection.prototype);

MX_SAT_COA_ReportSection.prototype.On_Init = function _onInit() {
	TAF.IReportSection.prototype.On_Init.call(this);
	nlapiLogExecution('DEBUG', 'MX_SAT_COA_ReportSection: Start Init');

	this.context = nlapiGetContext();
	this.subsidiary = this.params.isOneWorld ? new TAF.DAO.SubsidiaryDao().getSubsidiaryInfo(this.params): null;
    if (this.context.getFeature('MULTIPLECALENDARS')) {
        this.validateAccountingPeriods(this.params.periodFrom, this.subsidiary.getFiscalCalendar());
    }

    var accountingBook = this.getAccountingBook();
    var isSCOAIncluded = !accountingBook || accountingBook.isPrimary;
	var accountParams = this.getAccountParams();
	if(this.hasMXLocalization) {
    	this.mappings = new TAF.DAO.MappingDao().mxGetMappings('MX_ACCOUNT_GROUPING');
    } else {
    	this.mappings = this.getMappings(accountParams);
    }
	this.accounts = new TAF.DAO.AccountDao().getList(accountParams, isSCOAIncluded);
	this.period = {
		start: SFC.PostingPeriods.Load(this.params.periodFrom),
		end: SFC.PostingPeriods.Load(this.params.periodTo)
	};
    var periodDao = new TAF.DAO.AccountingPeriodDao();
    var periodRange = periodDao.getPeriodRangeBeforePeriod(this.params.periodFrom);
	this.currentPeriodData = this.getReportData(this.params.periodFrom, this.params.periodFrom);
    if (periodRange && periodRange.from && periodRange.from.id && periodRange.to && periodRange.to.id) {
        this.previousPeriodData = this.getReportData(periodRange.from.id, periodRange.to.id);
    }
    this.usesAccountingContext = this.params.accountingContext != '';
    this.output.SetPercent(this.PROGRESS_PERCENTAGE.INIT);
    nlapiLogExecution('DEBUG', 'MX_SAT_COA_ReportSection: End Init');
};

MX_SAT_COA_ReportSection.prototype.getAccountParams = function _getAccountParams() {
	var accountParams = {
		type: ['noneof', 'NonPosting'],
		accountingcontext: ['is',this.params.accountingContext]
	};
	if (this.params.isOneWorld) {
		accountParams.subsidiary = ['is', this.params.subsidiary];
	}

	return accountParams;
};

MX_SAT_COA_ReportSection.prototype.getMappings = function _getMappings(accountParams) {
	var mappingCategory = new TAF.DAO.MappingCategoryDao().getByCode('MX_ACCOUNT_GROUPING');

	if (!mappingCategory) {
		throw nlapiCreateError('CATEGORY_NOT_FOUND', 'Mapping category not found! Kindly supply the necessary data');
	}

	var mappings = new TAF.DAO.MappingDao().getList({
		'custrecord_mapper_keyvalue_category': ['anyof', mappingCategory.id]
	}, accountParams);

	return mappings;
};

MX_SAT_COA_ReportSection.prototype.createHeaderIn = function _createHeaderIn() {
	var headerIn = new TAF.MX.Adapter.HeaderIn();
	headerIn.dateCreated = this.period.start.GetStartDate();
	headerIn.subsidiaryInfo = this.subsidiary;
	headerIn.companyInfo = new TAF.DAO.CompanyDao().getInfo();
	return headerIn;
};

MX_SAT_COA_ReportSection.prototype.On_Header = function _onHeader() {
	nlapiLogExecution('AUDIT', 'MX_SAT_COA_ReportSection: Start Header');
	if (!(this.formatter && this.output)) 
	{
		nlapiLogExecution('AUDIT', 'MX_SAT_COA_ReportSection: End Header');
		return;
	}

	var headerOut = this.adapter.getHeader(this.createHeaderIn());
	this.output.WriteLine(this.formatter.formatHeader());
	this.output.WriteLine(this.formatter.formatCOAHeader(headerOut));
    this.output.SetPercent(this.PROGRESS_PERCENTAGE.HEADER);
    this.output.SetFileName(this.formatter.formatCOAFilename(headerOut));
    nlapiLogExecution('AUDIT', 'MX_SAT_COA_ReportSection: End Header');
};

MX_SAT_COA_ReportSection.prototype.On_Body = function _onBody() {
	nlapiLogExecution('AUDIT', 'MX_SAT_COA_ReportSection: Start Body');
	if (!(this.formatter && this.output)) {
		nlapiLogExecution('AUDIT', 'MX_SAT_COA_ReportSection: End Body');
		return;
	}

	var bodyIn = this.adapter.createBodyIn(this.accounts, this.mappings, this.currentPeriodData, this.previousPeriodData);
	bodyIn.usesAccountingContext = this.usesAccountingContext;
	var bodyOut = this.adapter.getBody(bodyIn);
	for(var i in bodyOut.bodyLinesOut) {
		this.output.WriteLine(this.formatter.formatCOABody(bodyOut.bodyLinesOut[i]));
	}

    this.output.SetPercent(this.PROGRESS_PERCENTAGE.BODY);
    nlapiLogExecution('AUDIT', 'MX_SAT_COA_ReportSection: End Body');
};

MX_SAT_COA_ReportSection.prototype.getReportData = function _getReportData(periodFrom, periodTo) {
    var accountingBook = this.getAccountingBook();
    var dao = new TAF.DAO.TrialBalanceDao();
    var params = {
        periodFrom : periodFrom,
        periodTo   : periodTo,
        subsidiary : this.params.subsidiary,
        reportName : this.SAVED_REPORT
    };
    if (this.params.isOneWorld) {
        params.subsidiary = this.params.subsidiary;
    }
    if (accountingBook && !accountingBook.isPrimary) {
        params.bookId = accountingBook.id;
    }
    var searchAccounts = dao.getTrialBalance(params);
    return searchAccounts;
};

MX_SAT_COA_ReportSection.prototype.On_Footer = function _onFooter() {
	nlapiLogExecution('AUDIT', 'MX_SAT_COA_ReportSection: Start Footer');
	if (!(this.formatter && this.output)) 
	{
		nlapiLogExecution('AUDIT', 'MX_SAT_COA_ReportSection: End Footer');
		return;
	}

	this.output.WriteLine(this.formatter.formatCOAFooter());
	this.output.SetPercent(this.PROGRESS_PERCENTAGE.FOOTER);
	nlapiLogExecution('AUDIT', 'MX_SAT_COA_ReportSection: End Footer');
};

MX_SAT_COA_ReportSection.prototype.On_CleanUp = function _onCleanUp() {
	TAF.IReportSection.prototype.On_CleanUp.call(this);
};

var MX_SAT_COA_Report = function _MX_SAT_COA_Report(state, params, output, job) {
	params.isOneWorld = nlapiGetContext().getSetting('FEATURE', 'SUBSIDIARIES') === 'T';
	this.outline = {
		"Section": _coaReport
	};

	function _coaReport() {
		return new MX_SAT_COA_ReportSection(state, params, output, job);
	}
};

MX_SAT_COA_Report.prototype.GetOutline = function _GetOutline() {
	return this.outline;
};

var MX_SAT_COA_XML_Report = function _MX_COA_XML_Report(state, params, output, job) {
	params.formatter = new TAF.MX.Formatter.XML();
	MX_SAT_COA_Report.apply(this, arguments);
};

MX_SAT_COA_XML_Report.IsCRGReport = true;
MX_SAT_COA_XML_Report.ReportId = 'COA_MX_XML';
MX_SAT_COA_XML_Report.prototype = Object.create(MX_SAT_COA_Report.prototype);