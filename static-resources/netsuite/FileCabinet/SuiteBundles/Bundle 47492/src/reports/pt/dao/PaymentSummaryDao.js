/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.PT = TAF.PT || {};
TAF.PT.DAO = TAF.PT.DAO || {};

TAF.PT.DAO.PaymentSummary = function _PaymentSummary() {
    return {
        internalIdCount: 0,
        debitTotal: 0,
        creditTotal: 0,
        unappliedTotal: 0
    };
};

TAF.PT.DAO.PaymentSummaryDao = function _PaymentSummaryDao(params) {
    TAF.DAO.SearchDAO.call(this, params);
    this.name = 'PaymentSummaryDao';
    this.savedSearchId = 'customsearch_taf_pt_saft_paymentsummary';
    this.recordType = 'transaction';
    this.hasForeignCurrencyManagement = this.context.getFeature('FOREIGNCURRENCYMANAGEMENT');
};

TAF.PT.DAO.PaymentSummaryDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.PT.DAO.PaymentSummaryDao.prototype.createSearchFilters = function createSearchFilters(params) {
    this.filters.push(new nlobjSearchFilter('account', this.multiBookJoinColumn, 'noneof', '@NONE@'));
    
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

TAF.PT.DAO.PaymentSummaryDao.prototype.createSearchColumns = function createSearchColumns(params) {
    this.columns = [];
    var unappliedAmount = params && params.bookId && this.hasForeignCurrencyManagement ? '{accountingtransaction.amount}' : '{amount}';
    var appliedAmount = params && params.bookId && this.hasForeignCurrencyManagement ?
        '({appliedtolinkamount} * {accountingtransaction.exchangerate}) / {exchangerate}' :
        '{appliedtolinkamount}';
    
    
    this.columns.push(
        new nlobjSearchColumn('formulacurrency', null, 'SUM').setFormula('CASE WHEN {appliedtolinkamount} < 0 THEN -' + appliedAmount + ' ELSE 0 END')
    );
    
    this.columns.push(
        new nlobjSearchColumn('formulacurrency', null, 'SUM').setFormula('CASE WHEN {appliedtolinkamount} >= 0 THEN ' + appliedAmount + ' ELSE 0 END')
    );
    
    this.columns.push(
        new nlobjSearchColumn('formulacurrency', null, 'SUM').setFormula('CASE WHEN {appliedtolinkamount} is null THEN -' + unappliedAmount + ' ELSE 0 END')
    );
};

TAF.PT.DAO.PaymentSummaryDao.prototype.rowToObject = function rowToObject(row) {
    return {
        internalIdCount: row.getValue('internalid', null, 'COUNT'),
        debitTotal: row.getValue(this.columns[0]),
        creditTotal: row.getValue(this.columns[1]),
        unappliedTotal: row.getValue(this.columns[2])
    };
};
