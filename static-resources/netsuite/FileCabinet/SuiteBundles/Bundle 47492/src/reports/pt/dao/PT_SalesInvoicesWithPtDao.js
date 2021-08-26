/**
 * Copyright © 2016, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.PT = TAF.PT || {};
TAF.PT.DAO = TAF.PT.DAO || {};

TAF.PT.DAO.SalesInvoicesWithPtDAO = function SalesInvoicesWithPtDAO(params) {
    TAF.DAO.SearchDAO.call(this, params);
    this.name = 'SalesInvoicesWithPtDAO';
    this.savedSearchId = 'customsearch_crg_pt_only_tran_search';
    this.recordType = 'transaction';
    this.hasForeignCurrencyManagement = this.context.getFeature('FOREIGNCURRENCYMANAGEMENT');
    this.hasUnitsOfMeasure = this.context.getFeature('UNITSOFMEASURE');
    this.hasSerializedInventory = this.context.getFeature('SERIALIZEDINVENTORY');
    this.hasAdvancedProjects = this.context.getFeature('ADVANCEDJOBS') || this.context.getFeature('JOBS');
};

TAF.PT.DAO.SalesInvoicesWithPtDAO.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.PT.DAO.SalesInvoicesWithPtDAO.prototype.initialize = function initialize(params) {
    if (!this.recordType) {
        throw nlapiCreateError('MISSING_RECORD_TYPE', 'Please provide the record type of the search.');
    }

    if (this.isMultiBook && params.bookId) {
        this.multiBookJoinColumn = 'accountingtransaction';
    }

    this.filters = [];
    this.columns = [];

    this.createSearchColumns();
    this.createSearchFilters(params);
};

TAF.PT.DAO.SalesInvoicesWithPtDAO.prototype.createSearchColumns = function createSearchColumns(params) {
    this.columns = [
        new nlobjSearchColumn('type'),
        new nlobjSearchColumn('line'),
        new nlobjSearchColumn('tranid'),
        new nlobjSearchColumn('trandate'),
        new nlobjSearchColumn('datecreated'),
        new nlobjSearchColumn('createdby'),
        new nlobjSearchColumn('quantity'),
        new nlobjSearchColumn('rate'),
        new nlobjSearchColumn('memo'),
        new nlobjSearchColumn('internalid', 'customer'),
        new nlobjSearchColumn('internalid', 'item'),
        new nlobjSearchColumn('itemid', 'item'),
        new nlobjSearchColumn('displayname', 'item'),
        new nlobjSearchColumn('taxcode'),
        new nlobjSearchColumn('debitamount', this.multiBookJoinColumn),
        new nlobjSearchColumn('creditamount', this.multiBookJoinColumn),
        new nlobjSearchColumn('netamount', this.multiBookJoinColumn),
        new nlobjSearchColumn('custrecord_pt_tran_id', 'custrecord_pt_tran_rec').setSort(),
        new nlobjSearchColumn('custrecord_pt_tran_signature', 'custrecord_pt_tran_rec'),
        new nlobjSearchColumn('custrecord_pt_tran_entrydate', 'custrecord_pt_tran_rec')
    ];

    if (params && params.bookId && this.hasForeignCurrencyManagement) {
        this.taxTotalColumn = new nlobjSearchColumn('formulacurrency').setFormula('({taxtotal} * {accountingtransaction.exchangerate}) / {exchangerate}');
        this.transactionTotalColumn = new nlobjSearchColumn('formulacurrency').setFormula('({total} * {accountingtransaction.exchangerate}) / {exchangerate}');
    } else {
        this.taxTotalColumn = new nlobjSearchColumn('taxtotal');
        this.transactionTotalColumn = new nlobjSearchColumn('total');
    }

    this.columns.push(this.taxTotalColumn, this.transactionTotalColumn);

    if (this.hasUnitsOfMeasure) {
        this.columns.push(new nlobjSearchColumn('unit'));
    }
    
    if (this.hasSerializedInventory) {
        this.columns.push(new nlobjSearchColumn('serialnumbers'));
    }
    
    if (this.hasAdvancedProjects) {
    	this.columns.push(new nlobjSearchColumn('internalid', 'customermain'));
    } else {
    	this.columns.push(new nlobjSearchColumn('internalid', 'customer'));
    }
};

TAF.PT.DAO.SalesInvoicesWithPtDAO.prototype.createSearchFilters = function createSearchFilters(params) {
    this.filters.push(new nlobjSearchFilter('memorized', null, 'is', 'F'));
    this.filters.push(new nlobjSearchFilter('type', null, 'anyof', ['CustInvc', 'CustCred', 'CashSale', 'CashRfnd']));
    this.filters.push(new nlobjSearchFilter('accounttype', this.multiBookJoinColumn, 'anyof', ['Income', 'OthIncome', 'DeferRevenue']));

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

TAF.PT.DAO.SalesInvoicesWithPtDAO.prototype.rowToObject = function rowToObject(row) {
    if (!row || !row.getValue) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'A valid search result row is required.');
    }
    
    var customerIdColumn = this.hasAdvancedProjects ? 'customermain' : 'customer';

    return {
        internalId: row.getId(),
        type: row.getValue('type'),
        lineId: row.getValue('line'),
        tranId: row.getValue('tranid'),
        tranDate: row.getValue('trandate'),
        dateCreated: row.getValue('datecreated'),
        createdBy: row.getValue('createdby'),
        quantity: row.getValue('quantity'),
        rate: row.getValue('rate'),
        memo: row.getValue('memo'),
        customerId: row.getValue('internalid', customerIdColumn),
        itemInternalId: row.getValue('internalid', 'item'),
        itemName: row.getValue('itemid', 'item'),
        itemDisplayName: row.getValue('displayname', 'item'),
        itemSerialNumbers: this.hasSerializedInventory ? row.getValue('serialnumbers') : null,
        unit: this.hasUnitsOfMeasure ? row.getValue('unit') : null,
        taxCode: row.getValue('taxcode'),
        taxTotal: row.getValue(this.taxTotalColumn),
        transactionTotal: row.getValue(this.transactionTotalColumn),
        debit: row.getValue('debitamount', this.multiBookJoinColumn),
        credit: row.getValue('creditamount', this.multiBookJoinColumn),
        netAmount: row.getValue('netamount', this.multiBookJoinColumn),
        ptTranId: row.getValue('custrecord_pt_tran_id', 'custrecord_pt_tran_rec'),
        ptTranSignature: row.getValue('custrecord_pt_tran_signature', 'custrecord_pt_tran_rec'),
        ptTranEntryDate: row.getValue('custrecord_pt_tran_entrydate', 'custrecord_pt_tran_rec')
    };
};
