/**
 * Copyright 2016 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */
 
var TAF = TAF || {};
TAF.OECD = TAF.OECD || {};
TAF.OECD.DAO = TAF.OECD.DAO || {};

TAF.OECD.DAO.TransactionPaymentSummaryDAO = function TransactionPaymentSummaryDAO(params) {
    TAF.DAO.SearchDAO.call(this, params);
    this.name = 'OECD_TransactionPaymentSummaryDAO';
    this.savedSearchId = 'customsearch_taf_oecd_tran_pymt_summary';
    this.recordType = 'transaction';
};

TAF.OECD.DAO.TransactionPaymentSummaryDAO.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.OECD.DAO.TransactionPaymentSummaryDAO.prototype.createSearchFilters = function createSearchFilters(params) {
    this.filters.push(new nlobjSearchFilter('posting', this.multiBookJoinColumn, 'is', 'T'));
    this.filters.push(new nlobjSearchFilter('accounttype', this.multiBookJoinColumn, 'noneof', ['AcctRec', 'AcctPay']));
    
    if (this.isOneWorld && params && params.subsidiary) {
        this.filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', params.subsidiary));
    }
    
    if (params && params.period) {
        this.filters.push(new nlobjSearchFilter('internalid', 'accountingperiod', 'anyof', params.period));
    }
    
    if (params && params.bookId && this.isMultiBook) {
        this.filters.push(new nlobjSearchFilter('accountingbook', this.multiBookJoinColumn, 'is', params.bookId));
    }
};

TAF.OECD.DAO.TransactionPaymentSummaryDAO.prototype.createSearchColumns = function createSearchColumns() {
    this.columns.push(new nlobjSearchColumn('creditamount', this.multiBookJoinColumn, 'SUM'));
    this.columns.push(new nlobjSearchColumn('debitamount', this.multiBookJoinColumn, 'SUM'));
};

TAF.OECD.DAO.TransactionPaymentSummaryDAO.prototype.rowToObject = function rowToObject(row) {
    if (!row || !row.getValue) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'A valid search result row is required.');
    }
    
    return {
        count: row.getValue('internalid', null, 'COUNT'),
        debit: row.getValue('debitamount', this.multiBookJoinColumn, 'SUM'),
        credit: row.getValue('creditamount', this.multiBookJoinColumn, 'SUM')
    };
};
