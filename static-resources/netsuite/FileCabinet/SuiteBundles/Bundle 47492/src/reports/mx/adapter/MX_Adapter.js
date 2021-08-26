/**
 * Copyright 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.MX = TAF.MX || {};
TAF.MX.Adapter = TAF.MX.Adapter || {};

TAF.MX.Adapter.Header = function _Header() {
    return {
        RFC : '',
        month : '',
        year : '',
        submissionType : '',
        ordenNumber : '',
        tramiteNumber : ''
    };    
};

TAF.MX.Adapter.Account = function _Account() {
    return {
        id             : '',
        accountName    : '',
        accountNumber  : '',
        openingBalance : 0,
        credit         : 0,
        debit          : 0,
        closingBalance : 0
    };    
};

TAF.MX.Adapter.ReportAdapter = function _ReportAdapter(state) {
    if (state) {
        this.initializeState(state);
    }
};

TAF.MX.Adapter.ReportAdapter.prototype.initializeState = function _initializeState(state) {
    this.state = state;
    if (state.isOneWorld) {
        this.state.payee = state.subsidiary.name;
        this.state.RFC = state.subsidiary.vatNumber;
    } else {
        this.state.payee = state.company.companyName;
        this.state.RFC = state.company.employerId || state.company.taxNumber || state.company.taxId;
    }
};

TAF.MX.Adapter.ReportAdapter.prototype.getHeaderData = function _getHeaderData(rawHeader) {
    if (!rawHeader) {
        throw nlapiCreateError('INVALID_PARAMETER', 'Header data is invalid');
    }
    
    var header = new TAF.MX.Adapter.Header();
    
    try {
        header.RFC = this.state.RFC;
        var period = this.getPeriod(rawHeader);
        header.year = period.getFullYear().toString();
        header.month = (period.getMonth() + 1).toString();
        header.submissionType = rawHeader.config.tipoSolicitud;
        header.ordenNumber = rawHeader.config.numOrden;
        header.tramiteNumber = rawHeader.config.numTramite;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.MX.Adapter.ReportAdapter.getHeaderData', ex.toString());
        throw nlapiCreateError('DATA_ERROR', 'Error in converting header data');
    }
    
    return header;
};

TAF.MX.Adapter.ReportAdapter.prototype.getLineData = function _getLineData(params) {
    if (!params) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'An object parameter is required.');
    }
    
    var account = params.account || {};
    var balance = params.balance || {};
    var group = params.group || {};
    var line = null;
    
    if (group && group.value_text) {
        var line = new TAF.MX.Adapter.Account();
        line.id = account.getAccountId();        if(params.usesAccountingContext){            line.accountNumber = account.getLocalizedNumber() || this.getAccountNumber(account);            line.accountName = account.getLocalizedName() || account.getAccountName();        } else {            line.accountNumber = this.getAccountNumber(account);            line.accountName = account.getSCOAName() || account.getAccountName();        }
        line.debit = parseFloat(balance.currentDebit || 0);
        line.credit = parseFloat(balance.currentCredit || 0);
        line.closingBalance = this.getClosingBalance(balance);
        
		//to get the correct opening balance when there are no transactions in the first month of the selected period
        if(line.credit == 0 && line.debit == 0){
            line.openingBalance = balance.isLeftSide == 'T' ?  
              parseFloat(balance.lastDebit || 0) - parseFloat(balance.lastCredit || 0) : 
              parseFloat(balance.lastCredit || 0) - parseFloat(balance.lastDebit || 0);
        }
		else{
			line.openingBalance = this.getOpeningBalance(line, balance);
        }
    }
    return line;
};

TAF.MX.Adapter.ReportAdapter.prototype.getClosingBalance = function getClosingBalance(balance) {
    return balance.isLeftSide == 'T' ?
        parseFloat(balance.closingDebit || 0) - parseFloat(balance.closingCredit || 0) :
        parseFloat(balance.closingCredit || 0) - parseFloat(balance.closingDebit || 0);
};

TAF.MX.Adapter.ReportAdapter.prototype.getOpeningBalance = function _getOpeningBalance(line, balance) {
     return balance.isLeftSide == 'T' ? 
      (parseFloat(balance.lastDebit || 0) - line.debit) - (parseFloat(balance.lastCredit || 0) - line.credit) :
      (parseFloat(balance.lastCredit || 0) - line.credit) - (parseFloat(balance.lastDebit || 0) - line.debit)
};

TAF.MX.Adapter.ReportAdapter.prototype.getAccountNumber = function _getAccountNumber(account) {
    return account.getSCOANumber() || account.getAccountNumber() || account.getAccountId().toString();
};

TAF.MX.Adapter.ReportAdapter.prototype.getPeriod = function _getPeriod(rawHeader) {
    if (!rawHeader || !rawHeader.period || !rawHeader.period.startDate) {
        throw nlapiCreateError('INVALID_PARAMETER', 'Period data is invalid');
    }
    return nlapiStringToDate(rawHeader.period.startDate);
};

TAF.MX.Adapter.ReportAdapter.prototype.getSortedAccountIds = function _getSortedAccountIds(accountList) {
    var THIS = this;
    var ids = Object.keys(accountList);
    var isSortByString = false;
    
    for (var i = 0; i < ids.length; i++) {
        if (isNaN(this.getAccountNumber(accountList[ids[i]]))) {
            isSortByString = true;
            break;
        }
    }
    
    return ids.sort(function(a, b) {
        return isSortByString ?
            THIS.getAccountNumber(accountList[a]).localeCompare(THIS.getAccountNumber(accountList[b])) :
            THIS.getAccountNumber(accountList[a]) - THIS.getAccountNumber(accountList[b]);
    });
};
