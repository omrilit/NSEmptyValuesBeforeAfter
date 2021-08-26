/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

if (!TAF) { var TAF = {}; }
TAF.PT = TAF.PT || {};
TAF.PT.DAO = TAF.PT.DAO || {};


TAF.PT.DAO.ItemFulfillmentLine = function ItemFulfillmentLine(id) {
    return {
        id: id,
        createdBy : '',
        tranDate : '',
        dateCreated : '',
        shipAddress1 : '',
        shipAddress2 : '',
        shipCity : '',
        shipZip : '',
        shipState : '',
        shipCountry : '',
        lineId : '',
        itemInternalId : '',
        itemName : '',
        itemDisplayName : '',
        itemSerialNumbers : '',
        quantity : '',
        location : '',
        unitsType : '',
        salesOrder : {},
        customerInternalId : ''
    };
};

TAF.PT.DAO.ItemFulfillmentLineDao = function _ItemFulfillmentLineDao(params) {
    TAF.DAO.SearchDAO.call(this, params);
    this.name = 'ItemFulfillmentLineDao';
    this.savedSearchId = 'customsearch_taf_pt_saft_itemfulfillment';
    this.recordType = 'transaction';
    this.hasForeignCurrencyManagement = this.context.getFeature('FOREIGNCURRENCYMANAGEMENT');
    this.hasUnitsOfMeasure = this.context.getFeature('UNITSOFMEASURE');
    this.hasSerializedInventory = this.context.getFeature('SERIALIZEDINVENTORY');
};

TAF.PT.DAO.ItemFulfillmentLineDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.PT.DAO.ItemFulfillmentLineDao.prototype.createSearchFilters = function createSearchFilters(params) {
    if (params && params.subsidiary) {
        this.filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', params.subsidiary));
    }
    
    if (params && params.bookId && this.isMultiBook) {
        this.filters.push(new nlobjSearchFilter('accountingbook', this.multiBookJoinColumn, 'is', params.bookId));
    }
    
    if (params && params.period) {
        for (var iperiod = 0; iperiod < params.period.length; iperiod++) {
            if (params.period.length > 1) {
                var leftparens = (iperiod == 0) ? 1 : 0;
                var rightparens = ((iperiod + 1) == params.period.length) ? 1 : 0;
                var isor = ((iperiod + 1) == params.period.length) ? false : true;
                this.filters.push(new nlobjSearchFilter('postingperiod', 'applyingtransaction', 'is', params.period[iperiod], null, leftparens, rightparens, isor));
            } else {
                this.filters.push(new nlobjSearchFilter('postingperiod', 'applyingtransaction', 'is', params.period[iperiod], null, 0, 0, false));
            }
        }
    }
};

TAF.PT.DAO.ItemFulfillmentLineDao.prototype.createSearchColumns = function createSearchColumns(params) {
    this.columns = [];
    
    if (params && params.bookId && this.hasForeignCurrencyManagement) {
        this.columns.push(new nlobjSearchColumn('formulacurrency').setFormula('({taxamount} * {accountingtransaction.exchangerate}) / {exchangerate}'));
        this.columns.push(new nlobjSearchColumn('formulacurrency').setFormula('({rate} * {accountingtransaction.exchangerate}) / {exchangerate}'));
    } else {
        this.columns.push(new nlobjSearchColumn('taxamount'));
        this.columns.push(new nlobjSearchColumn('rate'));
    }
    
    this.columns.push(new nlobjSearchColumn('amount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('netamount', this.multiBookJoinColumn));
    
    if (this.hasUnitsOfMeasure) {
        this.columns.push(new nlobjSearchColumn('unitstype', 'item'));
    }
    
    if (this.hasSerializedInventory) {       
        this.columns.push(new nlobjSearchColumn('serialnumbers'));      
    }
};

TAF.PT.DAO.ItemFulfillmentLineDao.prototype.rowToObject = function _rowToObject(row) {
	var obj = new TAF.PT.DAO.ItemFulfillmentLine(row.getValue('internalid', 'applyingTransaction'));
    
	obj.createdBy = row.getText('createdby', 'applyingTransaction');
    obj.tranDate = row.getValue('trandate', 'applyingTransaction');
    obj.dateCreated =  row.getValue('datecreated', 'applyingTransaction');
    obj.shipAddress1 = row.getValue('shipaddress1', 'applyingTransaction');
    obj.shipAddress2 = row.getValue('shipaddress2', 'applyingTransaction');
    obj.shipCity = row.getValue('shipcity', 'applyingTransaction');
    obj.shipZip = row.getValue('shipzip', 'applyingTransaction');
    obj.shipState = row.getValue('shipstate', 'applyingTransaction');
    obj.shipCountry = row.getValue('shipcountry', 'applyingTransaction');
    obj.lineId = row.getValue('line', 'applyingTransaction');
    obj.itemInternalId = row.getValue('internalid','item');
    obj.itemName = row.getValue('itemid','item');
    obj.itemDisplayName = row.getValue('displayname', 'item');
    obj.itemSerialNumbers = this.hasSerializedInventory ? row.getValue('serialnumbers') : null,
    obj.quantity = row.getValue('quantity', 'applyingTransaction');
    obj.location = row.getValue('location', 'applyingTransaction');
    obj.unitsType = this.hasUnitsOfMeasure ? row.getText('unitstype', 'item') : null;
    obj.customerInternalId = row.getValue('internalid', 'customer');
    obj.salesOrder = {
    	rate: row.getValue(this.columns[1]),
    	quantity: row.getValue('quantity'),
    	amount: row.getValue('amount', this.multiBookJoinColumn),
    	netAmount: row.getValue('netamount', this.multiBookJoinColumn),
    	taxAmount: row.getValue(this.columns[0]),
    	memo: row.getValue('memo')
    };
    
    return obj;
};
