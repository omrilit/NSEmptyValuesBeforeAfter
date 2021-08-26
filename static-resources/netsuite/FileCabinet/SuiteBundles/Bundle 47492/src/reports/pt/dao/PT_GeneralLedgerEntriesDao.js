/**
 * Copyright 2016 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */
 
var TAF = TAF || {};
TAF.PT = TAF.PT || {};
TAF.PT.DAO = TAF.PT.DAO || {};

TAF.PT.DAO.GeneralLedgerEntriesDAO = function GeneralLedgerEntriesDAO(params) {
    TAF.DAO.SearchDAO.call(this, params);
    this.name = 'GeneralLedgerEntriesDAO';
    this.savedSearchId = 'customsearch_taf_pt_saft_gl_entries';
    this.recordType = 'transaction';
};

TAF.PT.DAO.GeneralLedgerEntriesDAO.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.PT.DAO.GeneralLedgerEntriesDAO.prototype.createSearchFilters = function createSearchFilters(params) {
    this.filters.push(new nlobjSearchFilter('posting', this.multiBookJoinColumn, 'is', 'T'));
    
    if (params && params.subsidiary) {
        this.filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', params.subsidiary));
    }
    
    if (params && params.period) {
        this.filters.push(new nlobjSearchFilter('internalid', 'accountingperiod', 'anyof', params.period));
    }
    
    if (params && params.bookId && this.isMultiBook) {
        this.filters.push(new nlobjSearchFilter('accountingbook', this.multiBookJoinColumn, 'is', params.bookId));
    }
};

TAF.PT.DAO.GeneralLedgerEntriesDAO.prototype.rowToObject = function rowToObject(row) {
    if (!row || !row.getValue) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'A valid search result row is required.');
    }
    
    return {id: row.getValue('internalid', null, 'GROUP')};
};
