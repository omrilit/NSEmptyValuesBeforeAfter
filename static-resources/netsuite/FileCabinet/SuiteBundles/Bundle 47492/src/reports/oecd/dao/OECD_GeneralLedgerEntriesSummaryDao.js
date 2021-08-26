/**
 * Copyright 2016 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */
 
var TAF = TAF || {};
TAF.OECD = TAF.OECD || {};
TAF.OECD.DAO = TAF.OECD.DAO || {};

TAF.OECD.DAO.GeneralLedgerEntriesSummaryDAO = function GeneralLedgerEntriesSummaryDAO(params) {
    TAF.DAO.SearchDAO.call(this, params);
    this.name = 'OECD_GeneralLedgerEntriesSummaryDAO';
    this.savedSearchId = 'customsearch_taf_oecd_gl_entries_summary';
    this.recordType = 'transaction';
};

TAF.OECD.DAO.GeneralLedgerEntriesSummaryDAO.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.OECD.DAO.GeneralLedgerEntriesSummaryDAO.prototype.createSearchFilters = function createSearchFilters(params) {
    this.filters.push(new nlobjSearchFilter('posting', this.multiBookJoinColumn, 'is', 'T'));
    
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

TAF.OECD.DAO.GeneralLedgerEntriesSummaryDAO.prototype.createSearchColumns = function createSearchColumns() {
    this.columns.push(new nlobjSearchColumn('creditamount', this.multiBookJoinColumn, 'SUM'));
    this.columns.push(new nlobjSearchColumn('debitamount', this.multiBookJoinColumn, 'SUM'));
};

TAF.OECD.DAO.GeneralLedgerEntriesSummaryDAO.prototype.rowToObject = function rowToObject(row) {
    if (!row || !row.getValue) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'A valid search result row is required.');
    }
    
    return {
        count: row.getValue('internalid', null, 'COUNT'),
        debit: row.getValue('debitamount', this.multiBookJoinColumn, 'SUM'),
        credit: row.getValue('creditamount', this.multiBookJoinColumn, 'SUM')
    };
};
