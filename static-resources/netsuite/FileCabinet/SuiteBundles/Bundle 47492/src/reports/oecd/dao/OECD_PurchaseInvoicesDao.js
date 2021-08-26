/**
 * Copyright 2016 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */


var TAF = TAF || {};
TAF.OECD = TAF.OECD || {};
TAF.OECD.DAO = TAF.OECD.DAO || {};

TAF.OECD.DAO.PurchaseInvoicesDao = function _purchaseInvoicesDao(params) {
    TAF.DAO.SearchDAO.call(this, params);
    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_oecd_purcinvoices';
    this.isUOMEnabled = this.context ? this.context.getFeature('UNITSOFMEASURE') : nlapiGetContext().getFeature('UNITSOFMEASURE');
};
TAF.OECD.DAO.PurchaseInvoicesDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.OECD.DAO.PurchaseInvoicesDao.prototype.createSearchColumns = function createSearchColumns(params) {
	this.columns.push(new nlobjSearchColumn('creditamount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('debitamount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('netamount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('account', this.multiBookJoinColumn));
    
    if(this.isUOMEnabled){
    	this.columns.push(new nlobjSearchColumn("unit"));
    	this.columns.push(new nlobjSearchColumn("unitstype", "item"));
    }
    
    if (this.multicurrency) {
        this.columns.push(new nlobjSearchColumn('exchangerate'));
    }
    
    if (this.isMultiBook) {
        this.columns.push(new nlobjSearchColumn('exchangerate', this.multiBookJoinColumn));
    }
};

TAF.OECD.DAO.PurchaseInvoicesDao.prototype.createSearchFilters = function _createSearchFilters(params) {
	if(!params || !params.periodIds) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params is required');
    }
	
	this.filters.push(new nlobjSearchFilter('posting', this.multiBookJoinColumn, 'is', 'T'));
	this.filters.push(new nlobjSearchFilter('internalid', 'accountingperiod', 'anyof', params.periodIds));
    
    if (this.isOneWorld && params.subIds) {
        this.filters.push(new nlobjSearchFilter('subsidiary', this.multiBookJoinColumn, 'anyof', params.subIds));
    }

    if (this.isMultiBook && params.bookId) {
        this.filters.push(new nlobjSearchFilter('accountingbook', this.multiBookJoinColumn, 'is', params.bookId));
    }
};

TAF.OECD.DAO.PurchaseInvoicesDao.prototype.rowToObject = function _rowToObject(row) {
    if (!row) {
        throw  nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }

    try {
        var puchinvoice = {};
        puchinvoice.type = row.getValue('type');
        puchinvoice.internalid = row.getId();
        puchinvoice.lineid = row.getValue('line');
        puchinvoice.tranid = row.getValue('tranid');
        puchinvoice.trandate = row.getValue('trandate');
        puchinvoice.datecreated = row.getValue('datecreated');
        puchinvoice.quantity = row.getValue('quantity');
        puchinvoice.rate = row.getValue('rate');
        puchinvoice.memo = row.getValue('memo');
        puchinvoice.memomain = row.getValue('memomain');
        puchinvoice.vendorid = row.getValue('internalid', 'vendor');
        puchinvoice.account = row.getValue('account', this.multiBookJoinColumn);
        puchinvoice.itemid = row.getValue('itemid','item');
        puchinvoice.itemname = row.getValue('displayname','item');
        puchinvoice.debitamount = row.getValue('debitamount', this.multiBookJoinColumn);
        puchinvoice.creditamount = row.getValue('creditamount', this.multiBookJoinColumn);
        puchinvoice.netamount = row.getValue('netamount', this.multiBookJoinColumn);
        puchinvoice.taxcode = row.getValue('taxcode');
        puchinvoice.unit = this.isUOMEnabled ? (row.getValue('unit') || 'unit') : 'unit';
        
        if (this.multicurrency) {
        	puchinvoice.exchangeRate = row.getValue('exchangerate') || 1;
        }
        
        if (this.isMultiBook) {
        	puchinvoice.bookExchangeRate = row.getValue('exchangerate', this.multiBookJoinColumn) || 1;
        }
        
        return puchinvoice;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.OECD.DAO.PurchaseInvoicesDao.rowToObject', ex.toString());
        throw nlapiCreateError('DAO_ERROR', 'Unable to get column values');
    }
};