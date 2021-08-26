/**
 * Copyright © 2014, 2017, 2019 Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};

function DE_GDPDU_SAB_Report(state, params, output, job) {
    this.outline = {
        "Section": SumsAndBalances
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
        reportIndex.description = 'Kurzschreibung der Eröffnungssalden, Bewegungen und Endsalden des Kontenplans';
        reportIndex.decimalsymbol = SFC.Utilities.Constants.DECIMALSYMBOL;
        reportIndex.digitgroupingsymbol = SFC.Utilities.Constants.DIGITGROUPINGSYMBOL;
        reportIndex.columndelimiter = SFC.Utilities.Constants.COLUMNDELIMITER;
        reportIndex.columns = columns;
        return reportIndex;
    }

    function SumsAndBalances() {
        return new DE_GDPDU_SAB_ReportSection(state, params, output, job);
    }
}

function DE_GDPDU_SAB_ReportSection(state, params, output, job) {
    TAF.IReportSection.apply(this, arguments);
    this.Name = 'SumsAndBalances';
}

DE_GDPDU_SAB_ReportSection.prototype = Object.create(TAF.IReportSection.prototype);

DE_GDPDU_SAB_ReportSection.prototype.On_Init = function() {
    TAF.IReportSection.prototype.On_Init.call(this);

    this.context = nlapiGetContext();
    this.isMultiCurrency = this.context.getFeature('MULTICURRENCY');
    this.isOneWorld = this.context.getFeature('SUBSIDIARIES');
    this.resource = new ResourceMgr(this.params.job_params.CultureId);
    this.isMultiBook = this.context.getFeature('MULTIBOOK');
    this.sortByAccountNumber = nlapiLoadConfiguration('ACCOUNTINGPREFERENCES').getFieldValue('ACCOUNTNUMBERS') == 'T';

    this.subsidiary = this.isOneWorld ? SFC.Subsidiaries.Load(this.params.subsidiary) : null;
    this.subsidiaryChildren = this.subsidiary && this.params.include_child_subs ? this.subsidiary.GetDescendants() : null;

    if (!this.state.common) {
        this.setCommonState();
    }

    if (!this.state[this.Name]) {
        this.setReportState();
    }
    
    this.validateCurrencies();

    this.dao = new TAF.DE.DAO.SumsAndBalancesDao();
    this.adapter = new TAF.DE.Adapter.SumsAndBalancesAdapter();
    this.accountingBook = this.isMultiBook ? this.getAccountingBook() : null;

    var acctParams = this.isOneWorld ? {subsidiary: ['anyof', this.state.common.subIds]} : {};
    acctParams.accountingcontext = ['is', this.params.accountingContext];
    this.accounts = new TAF.AccountDao().getList(acctParams, false);
};

DE_GDPDU_SAB_ReportSection.prototype.setCommonState = function() {
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
        accountMap: {}
    };
};

DE_GDPDU_SAB_ReportSection.prototype.setReportState = function() {
    this.state[this.Name] = {
        priorPeriodIndex: 0,
        periodIndex: 0,
        initialSABSearchIndex: 0,
        openingBalanceSearchIndex: 0,
        outputAccountId: '0',
        mapDebCredDone: false,
        mapOpenBalDone: false        
    };
};

DE_GDPDU_SAB_ReportSection.prototype.validateCurrencies = function() {
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

DE_GDPDU_SAB_ReportSection.prototype.On_Header = function() {
    this.output.WriteLine(this.formatter.formatSABHeader());
};

DE_GDPDU_SAB_ReportSection.prototype.On_Body = function() {
    if (!this.getAccountMapWithDebitsAndCredits() || !this.getAccountOpeningBalances()) {
        return;
    }
    
    this.completeAndWriteAccountLines();
};

DE_GDPDU_SAB_ReportSection.prototype.getAccountMapWithDebitsAndCredits = function() {
    try {
        var sabState = this.state[this.Name];
        
        if (sabState.mapDebCredDone == true){
        	return true;
        }
        
        var commonState = this.state.common;

        for (var iperiod = sabState.periodIndex; iperiod < (commonState.periodIds && commonState.periodIds.length); iperiod++) {
            this.dao.search({
                periodIds: commonState.periodIds[iperiod].id,
                subIds: this.isOneWorld ? commonState.subIds : [],
                bookId: (this.accountingBook && !this.accountingBook.isPrimary) ? this.accountingBook.id : null
            });
            var index = this.process(this.dao, sabState.initialSABSearchIndex, this.storeSABLine);
            sabState.periodIndex = iperiod;
            sabState.initialSABSearchIndex = index;
            if (this.thresholdReached) {
                return false;
            }
        }
    } catch (ex) {
        nlapiLogExecution('ERROR', 'DE_GDPDU_SAB_ReportSection.getAccountMapWithDebitsAndCredits', ex.toString());
        throw ex;
    }
    sabState.mapDebCredDone = true;   
    return true;
};

DE_GDPDU_SAB_ReportSection.prototype.storeSABLine = function(line) {
    if (!line) {
        throw nlapiCreateError('MISSING_PARAMETER', 'line is a required parameter');
    }
    var accountId = line.accountId;
    var accountMap = this.state.common.accountMap[accountId];
    try {
        var convertedSABMap = this.adapter.getAccountSABMap(line, accountMap);
        if (convertedSABMap) {
            this.state.common.accountMap[accountId] = convertedSABMap;
        }
    } catch (ex) {
        nlapiLogExecution('ERROR', 'DE_GDPDU_SAB_ReportSection.storeSABLine', ex.toString());
    }
};

DE_GDPDU_SAB_ReportSection.prototype.getAccountOpeningBalances = function() {
    try {
        var sabState = this.state[this.Name];
        
        if (sabState.mapOpenBalDone == true){
        	return true;
        }
        	        
        var commonState = this.state.common;
        for (var ipriorPeriod = sabState.priorPeriodIndex; ipriorPeriod < (commonState.priorPeriodIds && commonState.priorPeriodIds.length); ipriorPeriod++) {
            this.dao.search({
                periodIds: commonState.priorPeriodIds[ipriorPeriod].id,
                subIds: this.isOneWorld ? commonState.subIds : [],
                bookId: (this.accountingBook && !this.accountingBook.isPrimary) ? this.accountingBook.id : null
            });
            var index = this.process(this.dao, sabState.openingBalanceSearchIndex, this.storeSABOpeningBalance);
            sabState.priorPeriodIndex = ipriorPeriod;
            sabState.openingBalanceSearchIndex = index;
            
            if (this.thresholdReached) {
                return false;
            }
        }
    } catch (ex) {
        nlapiLogExecution('ERROR', 'DE_GDPDU_SAB_ReportSection.getAccountOpeningBalances', ex.toString());
        throw ex;
    }
    sabState.mapOpenBalDone = true;
    return true;
};

DE_GDPDU_SAB_ReportSection.prototype.storeSABOpeningBalance = function(line) {
    if (!line) {
        throw nlapiCreateError('MISSING_PARAMETER', 'line is a required parameter');
    }
    var accountId = line.accountId;
    var accountMap = this.state.common.accountMap[accountId];
    try {
        var sabMapWithOpeningBalances = this.adapter.addOpeningBalances(line, accountMap);
        if (sabMapWithOpeningBalances) {
            this.state.common.accountMap[accountId] = sabMapWithOpeningBalances;
        } 
    } catch (ex) {
        nlapiLogExecution('ERROR', 'DE_GDPDU_SAB_ReportSection.storeSABOpeningBalance', ex.toString());
    }
};

DE_GDPDU_SAB_ReportSection.prototype.completeAndWriteAccountLines = function() {
    try {
        var sabState = this.state[this.Name];
        var accountMap = this.state.common.accountMap;
        var convertedSABLine = null;
        var account = null;
        var sortedAccountIds = null;
        var accountId = null;
        var sortProperty = null;
        var outputAccountId = null;

        if (Object.keys(accountMap).length > 0) {
            sortedAccountIds = this.getSortedAccountIds(this.accounts);

            for (var i = 0; i < sortedAccountIds.length; i++) {
                accountId = sortedAccountIds[i];
                sortProperty = this.getSortProperty(this.accounts[accountId]);
                outputAccountId = this.sortByAccountNumber ? sabState.outputAccountId : parseInt(sabState.outputAccountId);

                if (sortProperty > outputAccountId && accountMap[accountId]) {
                    account = this.accounts[accountId];
                    convertedSABLine = this.adapter.getSumsAndBalancesOfAccount(accountId, account, accountMap[accountId]);

                    if (convertedSABLine) {
                        this.output.WriteLine(this.formatter.formatSABLine(convertedSABLine));
                    }
                }

                sabState.outputAccountId = sortProperty;
            }
        }
    } catch (ex) {
        nlapiLogExecution('ERROR', 'DE_GDPDU_SAB_ReportSection.completeAccountLinesAndWrite', ex.toString());
        throw ex;
    }
};

DE_GDPDU_SAB_ReportSection.prototype.getSortedAccountIds = function (accounts) {
    var sortedAccounts = this.sortByAccountNumber ? this.adapter.sortAccountsByAccountNumber(accounts) : accounts;
    return Object.keys(sortedAccounts);
};

DE_GDPDU_SAB_ReportSection.prototype.getSortProperty = function (account) {
    return this.sortByAccountNumber ? this.adapter.getAccountNumber(account.getAccountNumber(), account.getAccountName(), (account.getAccountId()).toString())
                                    : parseInt(account.getAccountId());
};

DE_GDPDU_SAB_ReportSection.prototype.On_CleanUp = function() {
    TAF.IReportSection.prototype.On_CleanUp.call(this);
    delete this.state.common;
};

var DE_GDPDU_SAB_TXT_Report = function DE_GDPDU_SAB_TXT_Report(state, params, output, job) {
    params.formatter = new TAF.DE.Formatter.SumsAndBalancesFormatter();
    params.filename = 'account_balances.txt';
    DE_GDPDU_SAB_Report.call(this, state, params, output, job);
};
DE_GDPDU_SAB_TXT_Report.prototype = Object.create(DE_GDPDU_SAB_Report.prototype);
DE_GDPDU_SAB_TXT_Report.IsCRGReport = true;
DE_GDPDU_SAB_TXT_Report.ReportId = 'DE_GDPDU_SAB_TXT';