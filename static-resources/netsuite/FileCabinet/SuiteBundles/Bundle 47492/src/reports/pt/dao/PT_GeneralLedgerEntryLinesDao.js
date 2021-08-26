/**
 * Copyright 2016 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */
 
var TAF = TAF || {};
TAF.PT = TAF.PT || {};
TAF.PT.DAO = TAF.PT.DAO || {};

TAF.PT.DAO.GeneralLedgerEntryLinesDAO = function GeneralLedgerEntryLinesDAO(params) {
    TAF.DAO.SearchDAO.call(this, params);
    this.name = 'GeneralLedgerEntryLinesDAO';
    this.savedSearchId = 'customsearch_taf_pt_saft_gl_entry_lines';
    this.recordType = 'transaction';
    this.isPTInstalled = (params && params.isPTInstalled) || false;
};

TAF.PT.DAO.GeneralLedgerEntryLinesDAO.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.PT.DAO.GeneralLedgerEntryLinesDAO.prototype.createSearchColumns = function createSearchColumns() {
    this.columns.push(new nlobjSearchColumn('creditamount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('debitamount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('account', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn("stage", 'customer'));
    
    if (this.isPTInstalled) {
        this.columns.push(new nlobjSearchColumn('custrecord_pt_tran_entrydate', 'custrecord_pt_tran_rec'));
        this.columns.push(new nlobjSearchColumn('custrecord_pt_tran_id', 'custrecord_pt_tran_rec'));
    }
};

TAF.PT.DAO.GeneralLedgerEntryLinesDAO.prototype.createSearchFilters = function createSearchFilters(params) {
    this.filters.push(new nlobjSearchFilter('account', this.multiBookJoinColumn, 'noneof', '@NONE@'));
    this.filters.push(new nlobjSearchFilter('voided', null, 'is', 'F', null, 1, 0, false, true));
    this.filters.push(new nlobjSearchFilter('debitamount', this.multiBookJoinColumn, 'isempty', null, null, 0, 0, false));
    this.filters.push(new nlobjSearchFilter('creditamount', this.multiBookJoinColumn, 'isempty', null, null, 0, 1, false));    
    this.filters.push(new nlobjSearchFilter('voided', null, 'is', 'F'));
	
    if (params && params.internalId) {
        this.filters.push(new nlobjSearchFilter('internalid', null, 'is', params.internalId));
    }
    
    if (params && params.bookId && this.isMultiBook) {
        this.filters.push(new nlobjSearchFilter('accountingbook', this.multiBookJoinColumn, 'is', params.bookId));
    }
};

TAF.PT.DAO.GeneralLedgerEntryLinesDAO.prototype.rowToObject = function rowToObject(row) {
    if (!row || !row.getValue) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'A valid search result row is required.');
    }
    
    return {
        internalId: row.getId(),
        lineId: row.getValue('line'),
        tranId: row.getValue('tranid'),
        tranDate: row.getValue('trandate'),
        memoMain: row.getValue('memomain'),
        memo: row.getValue('memo'),
        dateCreated: row.getValue('datecreated'),
        vendorId: row.getValue('internalid', 'vendor'),
        customerId: row.getValue('internalid', 'customer'),
        type: row.getValue('type'),
        postingPeriod: row.getValue('postingperiod'),
        createdBy: row.getValue('createdby'),
        debit: row.getValue('debitamount', this.multiBookJoinColumn),
        credit: row.getValue('creditamount', this.multiBookJoinColumn),
        account: row.getValue('account', this.multiBookJoinColumn),
        ptTranEntryDate: this.isPTInstalled ? row.getValue('custrecord_pt_tran_entrydate', 'custrecord_pt_tran_rec') : null,
        ptTranId: this.isPTInstalled ? row.getValue('custrecord_pt_tran_id', 'custrecord_pt_tran_rec') : null,
        stage: row.getValue('stage', 'customer')
    };
};
