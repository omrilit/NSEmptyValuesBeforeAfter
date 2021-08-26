/**
 * Copyright 2016 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */
 
var TAF = TAF || {};
TAF.PH = TAF.PH || {};
TAF.PH.DAO = TAF.PH.DAO || {}

TAF.PH.DAO.CashDisbursementsDAO = function CashDisbursementsDAO() {
    TAF.DAO.SearchDAO.call(this);
    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_taf_ph_cashdisbursements';
};

TAF.PH.DAO.CashDisbursementsDAO.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.PH.DAO.CashDisbursementsDAO.prototype.createSearchFilters = function createSearchFilters(params) {
    this.filters = [
        new nlobjSearchFilter('posting', null, 'is', 'T'),
        new nlobjSearchFilter('type', null, 'anyof', ['VendPymt', 'Check', 'CashRfnd', 'CustRfnd', 'TaxPymt', 'TaxLiab', 'Paycheck'])
    ];
    
    if (params && params.subsidiary) {
        this.filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', params.subsidiary));
    }
    
    if (params && params.periodIds) {
        this.filters.push(new nlobjSearchFilter('internalid', 'accountingperiod', 'anyof', params.periodIds));
    }
};

TAF.PH.DAO.CashDisbursementsDAO.prototype.rowToObject = function rowToObject(row) {
    if (!row || !row.getValue) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'A valid search result row is required.');
    }
    
    return {id: row.getValue('internalid', null, 'GROUP')};
};





TAF.PH.DAO.CashDisbursementLineDAO = function CashDisbursementLineDAO() {
    TAF.DAO.SearchDAO.call(this);
    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_taf_ph_cashdisbursemnt_line';
};

TAF.PH.DAO.CashDisbursementLineDAO.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.PH.DAO.CashDisbursementLineDAO.prototype.createSearchColumns = function createSearchColumns(params) {
    this.columns.push(new nlobjSearchColumn('tranid'));
    this.columns.push(new nlobjSearchColumn('account', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('debitamount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('creditamount', this.multiBookJoinColumn));
};

TAF.PH.DAO.CashDisbursementLineDAO.prototype.createSearchFilters = function createSearchFilters(params) {
    this.filters = [];
    
    if (params && params.internalId) {
        this.filters.push(new nlobjSearchFilter('internalid', null, 'is', params.internalId));
    }
    
    if (params && params.bookId) {
        this.filters.push(new nlobjSearchFilter('accountingbook', this.multiBookJoinColumn, 'is', params.bookId));
    }
    
    this.filters.push(new nlobjSearchFilter('voided', null, 'is', 'F', null, 1, 0, false, true));
    this.filters.push(new nlobjSearchFilter('debitamount', this.multiBookJoinColumn, 'isempty', null, null, 0, 0, false));
    this.filters.push(new nlobjSearchFilter('creditamount', this.multiBookJoinColumn, 'isempty', null, null, 0, 1, false));
};

TAF.PH.DAO.CashDisbursementLineDAO.prototype.rowToObject = function rowToObject(row) {
    var line = this.createNewLine();
    line.line = row.getValue('linesequencenumber');
    line.tranDate = row.getValue('trandate');
    line.tranId = row.getValue('tranid');
    line.memo = row.getValue('memomain');
    line.account = row.getText('account', this.multiBookJoinColumn);
    line.accountId = row.getValue('account', this.multiBookJoinColumn);
    line.debit = row.getValue('debitamount', this.multiBookJoinColumn);
    line.credit = row.getValue('creditamount', this.multiBookJoinColumn);
    line.type = row.getText('type');
    
    return line;
};

TAF.PH.DAO.CashDisbursementLineDAO.prototype.createNewLine = function createNewLine() {
    return {
        line: '',
        tranDate: '',
        trandId: '',
        memo: '',
        account: '',
        debit: '',
        credit: '',
        type: ''
    };
};
