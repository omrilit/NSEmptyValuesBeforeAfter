/**
 * Copyright 2016 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.OECD = TAF.OECD || {};
TAF.OECD.DAO = TAF.OECD.DAO || {};

TAF.OECD.DAO.Summary = function _Summary(id) {
    return {
        count : '',
        debit : '',
        credit : ''
    };
};


TAF.OECD.DAO.SuppliesSummaryDao = function _SuppliesSummaryDao(params) {
    TAF.DAO.SearchDAO.call(this, params);
    
    this.name = 'OECD_SuppliesSummaryDao';
    this.types = ['CustInvc', 'CustCred', 'CashSale', 'CashRfnd'];
    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_taf_oecd_suppliessummary';
};
TAF.OECD.DAO.SuppliesSummaryDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.OECD.DAO.SuppliesSummaryDao.prototype.createSearchFilters = function _createSearchFilters(params) {
    if(!params) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params is required');
    }
    
    if (this.isOneWorld && params.subIds) {
        this.filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', params.subIds));
    }
    if (this.isMultiBook && params.bookId) {
        this.filters.push(new nlobjSearchFilter('accountingbook', this.multiBookJoinColumn, 'is', params.bookId));
    }
    
    this.filters.push(new nlobjSearchFilter('internalid', 'accountingperiod', 'anyof', params.periodIds));
    this.filters.push(new nlobjSearchFilter('posting', this.multiBookJoinColumn, 'is', 'T'));
    this.filters.push(new nlobjSearchFilter('account', this.multiBookJoinColumn, 'noneof', '@NONE@'));
    this.filters.push(new nlobjSearchFilter('type', this.multiBookJoinColumn, 'anyof', this.types));
    
    return this.filters;
};

TAF.OECD.DAO.SuppliesSummaryDao.prototype.createSearchColumns = function _createSearchColumns() {
    this.columns.push(new nlobjSearchColumn('debitamount', this.multiBookJoinColumn, 'SUM'));
    this.columns.push(new nlobjSearchColumn('creditamount', this.multiBookJoinColumn, 'SUM'));
    
    return this.columns;    
};

TAF.OECD.DAO.SuppliesSummaryDao.prototype.rowToObject = function _rowToObject(row) {
    if(!row) {
        throw  nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }
    
    try {
        var line = new TAF.OECD.DAO.Summary();
        line.count = row.getValue('internalid', null, 'COUNT') || 0;
        line.debit = row.getValue('debitamount', this.multiBookJoinColumn, 'SUM') || 0;
        line.credit = row.getValue('creditamount', this.multiBookJoinColumn, 'SUM') || 0;
        return line;
    } catch (ex) {
        this.logException(ex, 'rowToObject');
        throw nlapiCreateError('DAO_ERROR', 'Unable to get column values');
    }
};


