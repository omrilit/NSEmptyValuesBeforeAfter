/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

if (!TAF) { var TAF = {}; }
TAF.PT = TAF.PT || {};
TAF.PT.DAO = TAF.PT.DAO || {};


TAF.PT.DAO.Payment = function Payment(id) {
    return {
        id: id,
        ptTranId : '',
        ptSystemEntryDate : '',
        dateCreated : '',
        tranDate : '',
        createdBy : '',
        customerId : '',
        line : '',
        amount : '',
        taxAmount : '',
        netAmount : '',
        grossAmount : '',
        invoiceId : '',
        invoiceDate : ''
    };
};

TAF.PT.DAO.PaymentDao = function _PaymentDao(params) {
    TAF.DAO.SearchDAO.call(this, params);
    this.name = 'PaymentDao';
    this.savedSearchId = 'customsearch_taf_pt_saft_payment';
    this.recordType = 'transaction';
    this.hasForeignCurrencyManagement = this.context.getFeature('FOREIGNCURRENCYMANAGEMENT');
    this.isPTInstalled = (params && params.isPTInstalled) || false;
};

TAF.PT.DAO.PaymentDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.PT.DAO.PaymentDao.prototype.createSearchFilters = function createSearchFilters(params) {
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

TAF.PT.DAO.PaymentDao.prototype.createSearchColumns = function createSearchColumns(params) {
    this.columns = [];
    
    if (params && params.bookId && this.hasForeignCurrencyManagement) {
        this.columns.push(new nlobjSearchColumn('formulacurrency').setFormula('({taxamount} * {accountingtransaction.exchangerate}) / {exchangerate}'));
        this.columns.push(new nlobjSearchColumn('formulacurrency').setFormula('({appliedtolinkamount} * {accountingtransaction.exchangerate}) / {exchangerate}'));
    } else {
        this.columns.push(new nlobjSearchColumn('taxamount'));
        this.columns.push(new nlobjSearchColumn('appliedtolinkamount'));
    }
    
    if (this.isPTInstalled) {
        this.columns.push(new nlobjSearchColumn('custrecord_pt_tran_id', 'custrecord_pt_tran_rec'));
        this.columns.push(new nlobjSearchColumn('custrecord_pt_tran_entrydate', 'custrecord_pt_tran_rec'));
    }
    
    this.columns.push(new nlobjSearchColumn('amount', this.multiBookJoinColumn));
};

TAF.PT.DAO.PaymentDao.prototype.rowToObject = function rowToObject(row) {
    var obj = new TAF.PT.DAO.Payment(row.getId());
    
    if (this.isPTInstalled) {
        obj.ptTranId = row.getValue('custrecord_pt_tran_id', 'custrecord_pt_tran_rec');
        obj.ptSystemEntryDate = row.getValue('custrecord_pt_tran_entrydate', 'custrecord_pt_tran_rec');
    }
    
    obj.dateCreated = row.getValue('datecreated');
    obj.tranDate = row.getValue('trandate');
    obj.createdBy = row.getText('createdby');
    obj.customerId = row.getValue('entity');
    obj.amount = row.getValue('amount', this.multiBookJoinColumn);
    obj.taxAmount = row.getValue(this.columns[0]);
    obj.invoiceId = row.getValue('appliedtotransaction');
    obj.invoiceDate = row.getValue('trandate','appliedtotransaction');
    obj.appliedToType = row.getValue('type','appliedtotransaction');
    obj.paidAmount = row.getValue(this.columns[1]);
    
    return obj;
};
