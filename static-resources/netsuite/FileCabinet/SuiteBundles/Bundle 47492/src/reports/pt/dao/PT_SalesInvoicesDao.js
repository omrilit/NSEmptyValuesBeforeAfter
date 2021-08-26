/**
 * Copyright 2016 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */
 
var TAF = TAF || {};
TAF.PT = TAF.PT || {};
TAF.PT.DAO = TAF.PT.DAO || {};

TAF.PT.DAO.SalesInvoicesDAO = function SalesInvoicesDAO(params) {
    TAF.DAO.SearchDAO.call(this, params);
    this.name = 'SalesInvoicesDAO';
    this.savedSearchId = 'customsearch_taf_pt_saft_invoice';
    this.recordType = 'transaction';
    this.hasForeignCurrencyManagement = this.context.getFeature('FOREIGNCURRENCYMANAGEMENT');
    this.hasUnitsOfMeasure = this.context.getFeature('UNITSOFMEASURE');
    this.hasSerializedInventory = this.context.getFeature('SERIALIZEDINVENTORY');
};

TAF.PT.DAO.SalesInvoicesDAO.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.PT.DAO.SalesInvoicesDAO.prototype.createSearchColumns = function createSearchColumns(params) {
    this.columns = [];
    
    if (params && params.bookId && this.hasForeignCurrencyManagement) {
        this.columns.push(new nlobjSearchColumn('formulacurrency').setFormula('({taxtotal} * {accountingtransaction.exchangerate}) / {exchangerate}'));
        this.columns.push(new nlobjSearchColumn('formulacurrency').setFormula('({total} * {accountingtransaction.exchangerate}) / {exchangerate}'));
        this.columns.push(new nlobjSearchColumn('formulacurrency').setFormula('({rate} * {accountingtransaction.exchangerate}) / {exchangerate}'));
    } else {
        this.columns.push(new nlobjSearchColumn('taxtotal'));
        this.columns.push(new nlobjSearchColumn('total'));
        this.columns.push(new nlobjSearchColumn('rate'));
    }
    
    if (this.hasUnitsOfMeasure) {
        this.columns.push(new nlobjSearchColumn('unit'));
    }
    
    if (this.hasSerializedInventory) {
        this.columns.push(new nlobjSearchColumn('serialnumbers'));
    }
    
    this.columns.push(new nlobjSearchColumn('creditamount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('debitamount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('netamount', this.multiBookJoinColumn));
};

TAF.PT.DAO.SalesInvoicesDAO.prototype.createSearchFilters = function createSearchFilters(params) {
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

TAF.PT.DAO.SalesInvoicesDAO.prototype.rowToObject = function rowToObject(row) {
    if (!row || !row.getValue) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'A valid search result row is required.');
    }

    return {
        internalId: row.getId(),
        type: row.getValue('type'),
        lineId: row.getValue('line'),
        tranId: row.getValue('tranid'),
        tranDate: row.getValue('trandate'),
        dateCreated: row.getValue('datecreated'),
        createdBy: row.getValue('createdby'),
        quantity: row.getValue('quantity'),
        rate: row.getValue(this.columns[2]),
        memo: row.getValue('memo'),
        customerId: row.getValue('internalid', 'customer'),
        itemInternalId: row.getValue('internalid', 'item'),
        itemName: row.getValue('itemid', 'item'),
        itemDisplayName: row.getValue('displayname', 'item'),
        itemSerialNumbers: this.hasSerializedInventory ? row.getValue('serialnumbers') : null,
        unit: this.hasUnitsOfMeasure ? row.getValue('unit') : null,
        taxCode: row.getValue('taxcode'),
        taxTotal: row.getValue(this.columns[0]),
        transactionTotal: row.getValue(this.columns[1]),
        debit: row.getValue('debitamount', this.multiBookJoinColumn),
        credit: row.getValue('creditamount', this.multiBookJoinColumn),
        netAmount: row.getValue('netamount', this.multiBookJoinColumn)
    };
};
