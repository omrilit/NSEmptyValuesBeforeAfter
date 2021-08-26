/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.PT = TAF.PT || {};
TAF.PT.DAO = TAF.PT.DAO || {};

TAF.PT.DAO.SalesOrderSummaryDao = function _SalesOrderSummaryDao(params) {
    TAF.DAO.SearchDAO.call(this, params);
    this.name = 'SalesOrderSummaryDao';
    this.savedSearchId = 'customsearch_taf_pt_saft_work_docs_smry';
    this.recordType = 'transaction';
};

TAF.PT.DAO.SalesOrderSummaryDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.PT.DAO.SalesOrderSummaryDao.prototype.createSearchFilters = function createSearchFilters(params) {
    if (params && params.subsidiary) {
        this.filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', params.subsidiary));
    }
    
    if (params && params.startDate) {
        this.filters.push(new nlobjSearchFilter('trandate', null, 'onorafter', params.startDate));
    }
    
    if (params && params.endDate) {
        this.filters.push(new nlobjSearchFilter('trandate', null, 'onorbefore', params.endDate));
    }
    
    if (params && params.bookId && this.isMultiBook) {
        this.filters.push(new nlobjSearchFilter('accountingbook', this.multiBookJoinColumn, 'is', params.bookId));
    }
    
    if (params && params.status) {
        this.filters.push(new nlobjSearchFilter('status', null, 'noneof', ['SalesOrd:C', 'SalesOrd:H']));
    }
};

TAF.PT.DAO.SalesOrderSummaryDao.prototype.createSearchColumns = function createSearchColumns() {
    this.columns.push(new nlobjSearchColumn('creditamount', this.multiBookJoinColumn, 'SUM'));
    this.columns.push(new nlobjSearchColumn('debitamount', this.multiBookJoinColumn, 'SUM'));
};

TAF.PT.DAO.SalesOrderSummaryDao.prototype.rowToObject = function rowToObject(row) {
    return {
        tranCount: row.getValue('internalid', null, 'COUNT'),
        debitTotal: row.getValue('debitamount', this.multiBookJoinColumn, 'SUM'),
        creditTotal: row.getValue('creditamount', this.multiBookJoinColumn, 'SUM')
    };
};
