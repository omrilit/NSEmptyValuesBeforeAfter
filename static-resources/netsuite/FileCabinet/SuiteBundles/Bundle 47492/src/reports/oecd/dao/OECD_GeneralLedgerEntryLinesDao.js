/**
 * Copyright 2016 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */
 
var TAF = TAF || {};
TAF.OECD = TAF.OECD || {};
TAF.OECD.DAO = TAF.OECD.DAO || {};

TAF.OECD.DAO.GeneralLedgerEntryLinesDAO = function GeneralLedgerEntryLinesDAO(params) {
    TAF.DAO.SearchDAO.call(this, params);
    this.name = 'OECD_GeneralLedgerEntryLinesDAO';
    this.savedSearchId = 'customsearch_taf_oecd_gl_entry_lines';
    this.recordType = 'transaction';
    this.hasForeignCurrencyManagement = this.context.getFeature('FOREIGNCURRENCYMANAGEMENT');
};

TAF.OECD.DAO.GeneralLedgerEntryLinesDAO.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.OECD.DAO.GeneralLedgerEntryLinesDAO.prototype.createSearchColumns = function createSearchColumns(params) {
    this.columns.push(new nlobjSearchColumn('creditamount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('debitamount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('account', this.multiBookJoinColumn));
    
    this.taxAmountColumn = params && params.bookId && this.hasForeignCurrencyManagement ?
        new nlobjSearchColumn('formulacurrency').setFormula('({taxamount} * {accountingtransaction.exchangerate}) / {exchangerate}') :
        new nlobjSearchColumn('taxamount');
    
    this.columns.push(this.taxAmountColumn);
};

TAF.OECD.DAO.GeneralLedgerEntryLinesDAO.prototype.createSearchFilters = function createSearchFilters(params) {
    if (params && params.internalId) {
        this.filters.push(new nlobjSearchFilter('internalid', null, 'is', params.internalId));
    }
    
    if (params && params.bookId && this.isMultiBook) {
        this.filters.push(new nlobjSearchFilter('accountingbook', this.multiBookJoinColumn, 'is', params.bookId));
    }
};

TAF.OECD.DAO.GeneralLedgerEntryLinesDAO.prototype.rowToObject = function rowToObject(row) {
    if (!row || !row.getValue) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'A valid search result row is required.');
    }
    
    return {
        id: row.getId(),
        lineId: row.getValue('line'),
        tranId: row.getValue('tranid'),
        debit: row.getValue('debitamount', this.multiBookJoinColumn),
        credit: row.getValue('creditamount', this.multiBookJoinColumn),
        tranDate: row.getValue('trandate'),
        taxAmount: row.getValue(this.taxAmountColumn),
        taxCode: row.getText('taxcode'),
        memoMain: row.getValue('memomain'),
        memo: row.getValue('memo'),
        dateCreated: row.getValue('datecreated'),
        vendorId: row.getValue('internalid', 'vendor'),
        customerId: row.getValue('internalid', 'customer'),
        account: row.getValue('account', this.multiBookJoinColumn),
        type: row.getValue('type'),
        postingPeriod: row.getText('postingperiod')
    };
};
