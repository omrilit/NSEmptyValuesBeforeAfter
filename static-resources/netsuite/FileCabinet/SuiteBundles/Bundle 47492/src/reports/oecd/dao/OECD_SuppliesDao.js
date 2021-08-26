/**
 * Copyright 2016 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.OECD = TAF.OECD || {};
TAF.OECD.DAO = TAF.OECD.DAO || {};

TAF.OECD.DAO.SupplyLine = function _SupplyLine(id) {
    return {
        id : id,
        type : '',
        line : '',
        tranId : '',
        date : '',
        quantity : '',
        rate : '',
        memo : '',
        memoMain : '',
        itemId : '',
        displayName : '',
        salesDescription : '',
        purchaseDescription : '',
        stockDescription : '',
        debitAmount : '',
        creditAmount : '',
        taxTotal : '',
        totalAmount : '',
        account: '',
        customer: '',
        exchangeRate: 1,
        bookExchangeRate: 1,
        unit: ''
    };
};


TAF.OECD.DAO.SuppliesDao = function _SuppliesDao(params) {
    TAF.DAO.SearchDAO.call(this, params);

    this.types = ['CustInvc', 'CustCred', 'CashSale', 'CashRfnd'];
    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_taf_oecd_supplies';
    this.hasUnitsOfMeasure =  this.context ? this.context.getFeature('UNITSOFMEASURE') : nlapiGetContext().getFeature('UNITSOFMEASURE');
};
TAF.OECD.DAO.SuppliesDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.OECD.DAO.SuppliesDao.prototype.createSearchFilters = function _createSearchFilters(params) {
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

TAF.OECD.DAO.SuppliesDao.prototype.createSearchColumns = function _createSearchColumns() {
    this.columns.push(new nlobjSearchColumn('account', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('debitamount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('creditamount', this.multiBookJoinColumn));
    
    if (this.multicurrency) {
        this.columns.push(new nlobjSearchColumn('exchangerate'));
    }
    
    if (this.isMultiBook) {
        this.columns.push(new nlobjSearchColumn('exchangerate', this.multiBookJoinColumn));
    }
    
    if (this.hasUnitsOfMeasure) {
        this.columns.push(new nlobjSearchColumn('unit'));
    }
    
    return this.columns;    
};

TAF.OECD.DAO.SuppliesDao.prototype.rowToObject = function _rowToObject(row) {
    if(!row) {
        throw  nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }
    
    try {
        var line = new TAF.OECD.DAO.SupplyLine();
        line.id = row.getId();
        line.type = row.getValue('type') || '';
        line.line = row.getValue('line') || '';
        line.tranId = row.getValue('tranid') || '';
        line.date = row.getValue('trandate') || '';
        line.quantity = row.getValue('quantity') || '';
        line.rate = row.getValue('rate') || '';
        line.memo = row.getValue('memo') || '';
        line.memoMain = row.getValue('memomain') || '';
        line.itemId = row.getValue('itemid', 'item') || '';
        line.displayName = row.getValue('displayname', 'item') || '';
        line.salesDescription = row.getValue('salesdescription', 'item') || '';
        line.purchaseDescription = row.getValue('purchasedescription', 'item') || '';
        line.stockDescription = row.getValue('stockdescription', 'item') || '';
        line.debitAmount = row.getValue('debitamount', this.multiBookJoinColumn) || '';
        line.creditAmount = row.getValue('creditamount', this.multiBookJoinColumn) || '';
        line.taxTotal = row.getValue('taxtotal') || '';
        line.totalAmount = row.getValue('totalamount') || '';
        line.account = row.getValue('account', this.multiBookJoinColumn) || '';
        line.customer = row.getValue('entity') || '';

        if (this.multicurrency) {
            line.exchangeRate = row.getValue('exchangerate') || 1;
        }
        
        if (this.isMultiBook) {
            line.bookExchangeRate = row.getValue('exchangerate', this.multiBookJoinColumn) || 1;
        }
        
        if (this.hasUnitsOfMeasure) {
            line.unit = row.getValue('unit') || '';
        }
        
        return line;
    } catch (ex) {
        this.logException(ex, 'rowToObject');
        throw nlapiCreateError('DAO_ERROR', 'Unable to get column values');
    }
};

