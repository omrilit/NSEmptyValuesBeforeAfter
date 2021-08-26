/**
 * Copyright © 2015, 2017, 2018, 2019 Oracle and/or its affiliates. All rights reserved.
 */
var TAF = TAF || {};

function DE_GDPDU_AP_Report(state, params, output, job) {
	this.GetOutline = function() {
		return {
		    Section: DE_GDPDU_AP_ReportSection.bind(this, state, params, output, job)
		};
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
		reportIndex.description = 'Kreditorentransaktionen';
		reportIndex.decimalsymbol = SFC.Utilities.Constants.DECIMALSYMBOL;
		reportIndex.digitgroupingsymbol = SFC.Utilities.Constants.DIGITGROUPINGSYMBOL;
		reportIndex.columndelimiter = SFC.Utilities.Constants.COLUMNDELIMITER;
		reportIndex.columns = columns;
		reportIndex.fkeyname = 'Vendor_ID';
		reportIndex.reference = 'payable_master_data.txt';
		return reportIndex;
	}
}

function DE_GDPDU_AP_ReportSection(state, params, output, job) {
	TAF.IReportSection.apply(this, arguments);
	this.ENTRIES_PER_PAGE = 1000;
	this.Name = 'AccountsPayable';
}

DE_GDPDU_AP_ReportSection.prototype = Object.create(TAF.IReportSection.prototype);
DE_GDPDU_AP_ReportSection.prototype.On_Init = function() {
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
	
	this.validateCurrencies();
	
	if (this.isOneWorld && this.context.getFeature('MULTIPLECALENDARS')) {
		this.validateAccountingPeriods(this.params.periodTo, this.subsidiary.GetFiscalCalendar());
	}

	this.apTrialBalanceDao = new TAF.DE.DAO.TrialBalanceDao('AccountsPayable');
	this.apLineDao = new TAF.DE.DAO.AccountsPayableLineDao();
	this.adapter = new TAF.DE.Adapter.APAdapter(this.state.common.openingBalanceTotal);
	this.accountingBook = this.isMultiBook ? this.getAccountingBook() : null;
};

DE_GDPDU_AP_ReportSection.prototype.setCommonState = function() {	
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
		openingBalanceTotal: 0
	};
};

DE_GDPDU_AP_ReportSection.prototype.setReportState = function() {
	this.state[this.Name] = {
		priorPeriodIndex: 0,
		periodIndex: 0,
		searchIndex: 0,
		index: 0,
		fileIndex : 0,
        rowFileIndex : 0,
	};
};

DE_GDPDU_AP_ReportSection.prototype.validateCurrencies = function() {
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

DE_GDPDU_AP_ReportSection.prototype.On_Header = function() {
	this.output.WriteLine(this.formatter.formatAPHeader());
};

DE_GDPDU_AP_ReportSection.prototype.On_Body = function() {
	try {
		var apState = this.state[this.Name];
		var commonState = this.state.common;
		var basePeriod = null;
		var openingBalancePeriodTotal = 0;
		var trialBalanceParams = {};
		for (var ipriorPeriod = apState.priorPeriodIndex; ipriorPeriod < (commonState.priorPeriodIds && commonState.priorPeriodIds.length); ipriorPeriod++) {			
			basePeriod = commonState.priorPeriodIds[ipriorPeriod];
			trialBalanceParams = {
					subsidiary: commonState.subIds != null ? (commonState.subIds.length > 1 ? '-' + this.params.subsidiary : this.params.subsidiary) : null,
					periodFrom: basePeriod.id,
					periodTo: basePeriod.id,
					bookId: this.accountingBook && this.accountingBook.id
			};
			
            var trialBalanceSummary = this.apTrialBalanceDao.getSummary(trialBalanceParams);
            openingBalancePeriodTotal = trialBalanceSummary.amount;
            
			this.adapter.addOpeningBalanceTotal(parseFloat(openingBalancePeriodTotal) || 0);
			
			apState.priorPeriodIndex+=1;
			if (this.job.IsThresholdReached()) {				
				commonState.openingBalanceTotal = this.adapter.getOpeningBalanceTotal();
				return;
			}
		}
		commonState.openingBalanceTotal = this.adapter.getOpeningBalanceTotal();
	} catch (ex) {
		nlapiLogExecution('ERROR', 'DE_GDPDU_AP_ReportSection.On_Body processOpeningBalancePerPeriod', ex.toString());
		throw ex;
	} 
	
	if(this.params.useSS2Engine){
		try {
			var csvDaoParams = {jobId : this.job.GetId() };
			var dao = new TAF.DE.DAO.AccountsPayableCsvDao(csvDaoParams);
			
			this.processTxtFiles(dao, this.processAPLine);
		}
		catch(ex) {
			nlapiLogExecution('ERROR', 'DE_GDPDU_AP_ReportSection.processInternalIdsPerPeriod.SS2', ex.toString());
			throw ex;
		}
	}
	else {
		try {
		var apState = this.state[this.Name];
		var commonState = this.state.common;
		
		for (var iperiod = apState.periodIndex; iperiod < (commonState.periodIds && commonState.periodIds.length); iperiod++) {
			this.apLineDao.search({
					periodIds: commonState.periodIds[iperiod].id,
					subIds: this.isOneWorld ? commonState.subIds : [],
					bookId: this.accountingBook && this.accountingBook.id
				});
				var index = this.process(this.apLineDao, apState.searchIndex, this.processAPLine);
				apState.periodIndex = iperiod;
				apState.searchIndex = index;
				if (this.thresholdReached) {
					return;
				}
			}		
		} catch (ex) {
			nlapiLogExecution('ERROR', 'DE_GDPDU_AP_ReportSection.processInternalIdsPerPeriod', ex.toString());
			throw ex;
		}
	}
};

DE_GDPDU_AP_ReportSection.prototype.On_CleanUp = function() {
	TAF.IReportSection.prototype.On_CleanUp.call(this);
	delete this.state.common;
};

DE_GDPDU_AP_ReportSection.prototype.processAPLine = function(line) {
	if (!line) {
		throw nlapiCreateError('MISSING_PARAMETER', 'line is a required parameter');
	}
	
	try {
		var convertedApLine = this.adapter.getAccountsPayable(line);
		if (convertedApLine) {
			this.output.WriteLine(this.formatter.formatAPLine(convertedApLine));
		}
	} catch (ex) {
		nlapiLogExecution('ERROR', 'DE_GDPDU_AP_ReportSection.processAPLine', ex.toString());
	}
};

var DE_GDPDU_AP_TXT_Report = function DE_GDPDU_AP_TXT_Report(state, params, output, job) {
	params.formatter = new TAF.DE.Formatter.APFormatter();
	params.filename = 'payables.txt';
	DE_GDPDU_AP_Report.call(this, state, params, output, job);
};
DE_GDPDU_AP_TXT_Report.prototype = Object.create(DE_GDPDU_AP_Report.prototype);
DE_GDPDU_AP_TXT_Report.IsCRGReport = true;
DE_GDPDU_AP_TXT_Report.ReportId = 'DE_GDPDU_AP_TXT';
