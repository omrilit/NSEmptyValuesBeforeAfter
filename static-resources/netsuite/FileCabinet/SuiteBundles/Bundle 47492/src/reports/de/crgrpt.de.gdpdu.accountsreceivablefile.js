/**
 * Copyright © 2015, 2017, Oracle and/or its affiliates. All rights reserved.
 */
var TAF = TAF || {};

function DE_GDPDU_AR_Report(state, params, output, job) {
    this.outline = {
        "Section": AccountsReceivable
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
        reportIndex.description = 'Debitorentransaktionen';
        reportIndex.decimalsymbol = SFC.Utilities.Constants.DECIMALSYMBOL;
        reportIndex.digitgroupingsymbol = SFC.Utilities.Constants.DIGITGROUPINGSYMBOL;
        reportIndex.columndelimiter = SFC.Utilities.Constants.COLUMNDELIMITER;
        reportIndex.columns = columns;
        reportIndex.fkeyname = 'Customer_ID';
        reportIndex.reference = 'receivable_master_data.txt';
        return reportIndex;
    }

    function AccountsReceivable() {
        return new DE_GDPDU_AR_ReportSection(state, params, output, job);
    }
}

function DE_GDPDU_AR_ReportSection(state, params, output, job) {
    TAF.IReportSection.apply(this, arguments);
	this.ENTRIES_PER_PAGE = 1000;
    this.Name = 'AccountsReceivable';
}

DE_GDPDU_AR_ReportSection.prototype = Object.create(TAF.IReportSection.prototype);
DE_GDPDU_AR_ReportSection.prototype.On_Init = function() {
    TAF.IReportSection.prototype.On_Init.call(this);

    this.context = nlapiGetContext();
    this.isMultiCurrency = this.context.getFeature('MULTICURRENCY');
    this.isOneWorld = this.context.getFeature('SUBSIDIARIES');
    this.resource = new ResourceMgr(this.params.job_params.CultureId);
    this.isMultiBook = this.context.getFeature('MULTIBOOK');

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

    this.arTrialBalanceDao = new TAF.DE.DAO.TrialBalanceDao('AccountsReceivable');
    this.arLineDao = new TAF.DE.DAO.AccountsReceivableLineDao();
    this.adapter = new TAF.DE.Adapter.ARAdapter(this.state.common.openingBalanceTotal);
    this.accountingBook = this.isMultiBook ? this.getAccountingBook() : null;
};

DE_GDPDU_AR_ReportSection.prototype.setCommonState = function() {
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

DE_GDPDU_AR_ReportSection.prototype.setReportState = function() {
    this.state[this.Name] = {
    	priorPeriodIndex: 0,
        periodIndex: 0,
        searchIndex: 0,
		index: 0,
		fileIndex : 0,
        rowFileIndex : 0
    };
};

DE_GDPDU_AR_ReportSection.prototype.validateCurrencies = function() {
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

DE_GDPDU_AR_ReportSection.prototype.On_Header = function() {
    this.output.WriteLine(this.formatter.formatARHeader());
};

DE_GDPDU_AR_ReportSection.prototype.On_Body = function() {
	var arState = this.state[this.Name];
		
	try {
		var commonState = this.state.common;
		var basePeriod = null;
		var openingBalancePeriodTotal = 0;
		var trialBalanceParams = {};			
		for (var ipriorPeriod = arState.priorPeriodIndex; ipriorPeriod < (commonState.priorPeriodIds && commonState.priorPeriodIds.length); ipriorPeriod++) {
			basePeriod = commonState.priorPeriodIds[ipriorPeriod];
			trialBalanceParams = {
					subsidiary: commonState.subIds != null ? (commonState.subIds.length > 1 ? '-' + this.params.subsidiary : this.params.subsidiary) : null,
					periodFrom: basePeriod.id,
					periodTo: basePeriod.id,
                    bookId: (this.accountingBook && !this.accountingBook.isPrimary) ? this.accountingBook.id : null
			};
			
			var trialBalanceSummary = this.arTrialBalanceDao.getSummary(trialBalanceParams);
			openingBalancePeriodTotal = trialBalanceSummary.amount;
			this.adapter.addOpeningBalanceTotal(parseFloat(openingBalancePeriodTotal) || 0);
			arState.priorPeriodIndex+=1;
			if (this.job.IsThresholdReached()) {
				commonState.openingBalanceTotal = this.adapter.getOpeningBalanceTotal();
				return;
			}
		}
		commonState.openingBalanceTotal = this.adapter.getOpeningBalanceTotal();
    } catch (ex) {
        nlapiLogExecution('ERROR', 'DE_GDPDU_AR_ReportSection.On_Body processOpeningBalancePerPeriod', ex.toString());
        throw ex;
    }	
    
    if(this.params.useSS2Engine){
    	try {
			var csvDaoParams = {jobId : this.job.GetId() };
			var dao = new TAF.DE.DAO.AccountsReceivableCsvDao(csvDaoParams);
			
			this.processTxtFiles(dao, this.processARLine);
		}
		catch(ex) {
			nlapiLogExecution('ERROR', 'DE_GDPDU_AR_ReportSection.processInternalIdsPerPeriod.SS2', ex.toString());
			throw ex;
		}
	}
	else {
		try {	    	
	    	var commonState = this.state.common;
	    	for (var iperiod = arState.periodIndex; iperiod < (commonState.periodIds && commonState.periodIds.length); iperiod++) {
				this.arLineDao.search({
					periodIds: commonState.periodIds[iperiod].id,
					subIds: this.isOneWorld ? commonState.subIds : [],
		            bookId: (this.accountingBook && !this.accountingBook.isPrimary) ? this.accountingBook.id : null
				});
				var index = this.process(this.arLineDao, arState.searchIndex, this.processARLine);
				arState.periodIndex = iperiod;
				arState.searchIndex = index;
				if (this.thresholdReached) {
					return;
				}
			}
	    } catch (ex) {
	        nlapiLogExecution('ERROR', 'DE_GDPDU_AR_ReportSection.processInternalIdsPerPeriod', ex.toString());
	        throw ex;
	    }
	}
};

DE_GDPDU_AR_ReportSection.prototype.On_CleanUp = function() {
    TAF.IReportSection.prototype.On_CleanUp.call(this);
    delete this.state.common;
};

DE_GDPDU_AR_ReportSection.prototype.processARLine = function(line) {
	try {
	    if (!line) {
	        throw nlapiCreateError('MISSING_PARAMETER', 'line is a required parameter');
	    }
	    try {
	        var convertedARLine = this.adapter.getAccountsReceivable(line);
	        this.output.WriteLine(this.formatter.formatARLine(convertedARLine));
	    } catch (ex) {
	        nlapiLogExecution('ERROR', 'DE_GDPDU_AR_ReportSection.processARLine', ex.toString());
	    }
	}
	catch (ex) {
		nlapiLogExecution('ERROR', 'DE_GDPDU_GL_ReportSection.processARLine', ex.toString());
	}
};

var DE_GDPDU_AR_TXT_Report = function DE_GDPDU_AR_TXT_Report(state, params, output, job) {
    params.formatter = new TAF.DE.Formatter.ARFormatter();
    params.filename = 'receivables.txt';
    DE_GDPDU_AR_Report.call(this, state, params, output, job);
};
DE_GDPDU_AR_TXT_Report.prototype = Object.create(DE_GDPDU_AR_Report.prototype);
DE_GDPDU_AR_TXT_Report.IsCRGReport = true;
DE_GDPDU_AR_TXT_Report.ReportId = 'DE_GDPDU_AR_TXT';
