/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

if (!TAF) { var TAF = {}; }
TAF.PT = TAF.PT || {};
TAF.PT.DAO = TAF.PT.DAO || {};

TAF.PT.DAO.SalesOrderLine = function _SalesOrderLine(id) {
    return {
        id: id,
        line: '',
        ptTranId: '',
        status: '',
        dateCreated: '',
        createdBy: '',
        ptSignature: '',
        date: '',
        ptSystemEntryDate : '',
        customerId: '', // Customer.Internal ID
        itemInternalId: '', // Item.Internal ID
        itemId: '', // Item.Name
        itemName: '', // Item.Display Name
        rate: '',
        quantity: '',
        amount:'',
        unitOfMeasure: '', // Unit of Measure
        shipDate: '',
        memo: '',
        taxAmount: '',
        netAmount: '',
        grossAmount: '',
        creditAmount: ''
    };
};

TAF.PT.DAO.SalesOrderDao = function _SalesOrderDao(params) {
    TAF.DAO.SearchDAO.call(this, params);
    this.name = 'SalesOrderDao';
    this.savedSearchId = 'customsearch_taf_pt_saft_salesorderline';
    this.recordType = 'transaction';
    this.hasForeignCurrencyManagement = this.context.getFeature('FOREIGNCURRENCYMANAGEMENT');
    this.hasUnitsOfMeasure = this.context.getFeature('UNITSOFMEASURE');
    this.hasSerializedInventory = this.context.getFeature('SERIALIZEDINVENTORY');
    this.isPTInstalled = (params && params.isPTInstalled) || false;
};

TAF.PT.DAO.SalesOrderDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.PT.DAO.SalesOrderDao.prototype.createSearchFilters = function createSearchFilters(params) {
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
};

TAF.PT.DAO.SalesOrderDao.prototype.createSearchColumns = function createSearchColumns(params) {
    this.columns = [];
    
    if (params && params.bookId && this.hasForeignCurrencyManagement) {
        this.columns.push(new nlobjSearchColumn('formulacurrency').setFormula('({rate} * {accountingtransaction.exchangerate}) / {exchangerate}'));
        this.columns.push(new nlobjSearchColumn('formulacurrency').setFormula('({taxamount} * {accountingtransaction.exchangerate}) / {exchangerate}'));
    } else {
        this.columns.push(new nlobjSearchColumn('rate'));
        this.columns.push(new nlobjSearchColumn('taxamount'));
    }
    
    this.columns.push(new nlobjSearchColumn('amount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('netamount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('grossamount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('creditamount', this.multiBookJoinColumn));
    
    if (this.isPTInstalled) {
        this.columns.push(new nlobjSearchColumn('custrecord_pt_tran_id', 'custrecord_pt_tran_rec'));
        this.columns.push(new nlobjSearchColumn('custrecord_pt_tran_signature', 'custrecord_pt_tran_rec'));
        this.columns.push(new nlobjSearchColumn('custrecord_pt_tran_entrydate', 'custrecord_pt_tran_rec'));
    }
    
    if (this.hasUnitsOfMeasure) {
        this.columns.push(new nlobjSearchColumn('unitstype', 'item'));
    }
    
    if (this.hasSerializedInventory){
        this.columns.push(new nlobjSearchColumn('serialnumbers'));
    }
};

TAF.PT.DAO.SalesOrderDao.prototype.rowToObject = function rowToObject(row) {
    var line = new TAF.PT.DAO.SalesOrderLine(row.getId());
    line.line = row.getValue('line');
    line.status = row.getValue('statusref');
    line.dateCreated = row.getValue('datecreated');
    line.createdBy = row.getText('createdby');
    line.date = row.getValue('trandate');
    line.customerId = row.getValue('internalid', 'customer'); // Customer.Internal ID
    line.itemInternalId = row.getValue('internalid', 'item'); // Item.Internal ID
    line.itemId = row.getValue('itemid', 'item'); // Item.Name
    line.itemName = row.getValue('displayname', 'item'); // Item.Display Name
    line.rate = row.getValue(this.columns[0]);
    line.quantity = row.getValue('quantity');
    line.amount = row.getValue('amount', this.multiBookJoinColumn);
    line.unitOfMeasure = this.hasUnitsOfMeasure ? row.getText('unitstype', 'item') : '';
    line.shipDate = row.getValue('shipdate');
    line.memo = row.getValue('memo');
    line.taxAmount = row.getValue(this.columns[1]);
    line.netAmount = row.getValue('netamount', this.multiBookJoinColumn);
    line.grossAmount = row.getValue('grossamount', this.multiBookJoinColumn);
    line.creditAmount = row.getValue('creditamount', this.multiBookJoinColumn);
    line.exchangeRate = this.isMultiBook && this.hasForeignCurrencyManagement ? row.getValue('exchangerate', this.multiBookJoinColumn) : null;
    line.serialNumber = this.hasSerializedInventory ? row.getValue('serialnumbers') : '';
    
    if (this.isPTInstalled) {
        line.ptTranId = row.getValue('custrecord_pt_tran_id', 'custrecord_pt_tran_rec');
        line.ptSignature = row.getValue('custrecord_pt_tran_signature', 'custrecord_pt_tran_rec');
        line.ptSystemEntryDate  = row.getValue('custrecord_pt_tran_entrydate', 'custrecord_pt_tran_rec');
    }
    
    return line;
};
