/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.AE = TAF.AE || {};
TAF.AE.DAO = TAF.AE.DAO || {};

// Purchase Summary

TAF.AE.DAO.PurchaseSummary = function _PurchaseSummary(id) {
    var summary = {
        id: id,
        netAmount: '',
        taxAmount: '',
        taxItemId: ''
    };
    return summary;
};

TAF.AE.DAO.PurchaseSummaryDao = function _PurchaseSummaryDao() {
    TAF.DAO.SearchDAO.call(this);

    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_ae_faf_purchase_summary';
};
TAF.AE.DAO.PurchaseSummaryDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.AE.DAO.PurchaseSummaryDao.prototype.createSearchFilters = function _createSearchFilters(params) {
    var accountTypeColumn = this.multiBookJoinColumn ? 'accountingtransaction.accounttype' : 'accounttype';
    this.filters = this.searchObj.getFilters();
    this.filterExpression = [
    	[ accountTypeColumn, 'anyof', params.accountTypes ],
    	'AND',
    	[ 'recordtype', 'isnot', 'journalentry' ]
	];
    if (this.isOneWorld) {
        this.filterExpression.push('AND', [ 'subsidiary', 'anyof', params.subIds ]);
    }
    if (params.bookId) {
        this.filterExpression.push('AND', [ 'accountingtransaction.accountingbook', 'is', params.bookId ]);
    }
    if (params.periodIds) {
        this.filterExpression.push('AND', [ 'accountingperiod.internalid', 'anyof', params.periodIds ]);
    }
};

TAF.AE.DAO.PurchaseSummaryDao.prototype.createSearchColumns = function _createSearchColumns(params) {
    this.columns.push(new nlobjSearchColumn('netamount', this.multiBookJoinColumn));
};

TAF.AE.DAO.PurchaseSummaryDao.prototype.rowToObject = function _rowToObject(row) {
    if (!row) {
        throw nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }

    var txn = new TAF.AE.DAO.PurchaseSummary(row.getId());

    txn.netAmount = row.getValue('netamount', this.multiBookJoinColumn);
    txn.taxAmount = row.getValue('taxamount') || 0;
    txn.taxItemId = row.getValue('taxcode');

    return txn;
};

// Purchase Lines

TAF.AE.DAO.Purchase = function _Purchase(id) {
    var txn = {
        id: id,
        entity: '',
        mainName: '',
        tranDate: '',
        aeInvoiceDate: '',
        aeTrn: '',
        number: '',
        line: '',
        item: '',
        account: '',
        shippingCountry: '',
        billingCountry: '',
        netAmount: '',
        taxAmount: '',
        taxItem: '',
        taxItemId: '',
        currency: '',
        fxAmount: '',
        recordType: '',
        employeeId: '',
        vendorId: '',
        vendorLineId: '',
        vendorLineEntityId: '',
        vendorLineTrn: ''
    };
    return txn;
};

TAF.AE.DAO.PurchaseDao = function _PurchaseDao() {
    TAF.DAO.SearchDAO.call(this);

    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_ae_faf_purchase';
};
TAF.AE.DAO.PurchaseDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.AE.DAO.PurchaseDao.prototype.createSearchFilters = function _createSearchFilters(params) {
    var accountTypeColumn = this.multiBookJoinColumn ? 'accountingtransaction.accounttype' : 'accounttype';
    this.filters = this.searchObj.getFilters();
    this.filterExpression = [
    	[ accountTypeColumn, 'anyof', params.accountTypes ],
    	'AND',
    	[ 'recordtype', 'isnot', 'journalentry' ]
	];
    if (this.isOneWorld) {
        this.filterExpression.push('AND', [ 'subsidiary', 'anyof', params.subIds ]);
    }
    if (params.bookId) {
        this.filterExpression.push('AND', [ 'accountingtransaction.accountingbook', 'is', params.bookId ]);
    }
    if (params.periodIds) {
        this.filterExpression.push('AND', [ 'accountingperiod.internalid', 'anyof', params.periodIds ]);
    }

    var language = nlapiGetContext().getPreference('LANGUAGE');
    var srchFilter = [ new nlobjSearchFilter('locale', null, 'is', language) ];
    var rs = nlapiSearchRecord('account', null, srchFilter,null);
    if(!rs) {
        language = '@NONE@';
    }

    this.filterExpression.push('AND', [ 'account.locale', 'is', language ]);
    this.filterExpression.push('AND', [ 'account.accountingcontext', 'is', params.accountingContext ]);
};

TAF.AE.DAO.PurchaseDao.prototype.createSearchColumns = function _createSearchColumns(params) {
    this.columns.push(new nlobjSearchColumn('account', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('netamount', this.multiBookJoinColumn));

    if (this.multicurrency) {
        this.columns.push(new nlobjSearchColumn('currency'));
        this.columns.push(new nlobjSearchColumn('fxamount'));
    }

    if (this.isMultiBook) {
        this.columns.push(new nlobjSearchColumn('netamount', this.multiBookJoinColumn));
    }
    
    this.columns.push(new nlobjSearchColumn('localizeddisplayname', 'account'));
    this.columns.push(new nlobjSearchColumn('internalid', 'employee'));
    this.columns.push(new nlobjSearchColumn('internalid', 'vendor'));
    this.columns.push(new nlobjSearchColumn('internalid', 'vendorLine'));
    this.columns.push(new nlobjSearchColumn('entityid', 'vendorLine'));
    this.columns.push(new nlobjSearchColumn('vatregnumber', 'vendorLine'));
    this.columns.push(new nlobjSearchColumn('custcol_emirate'));
};

TAF.AE.DAO.PurchaseDao.prototype.rowToObject = function _rowToObject(row) {
    if(!row) {
        throw  nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }

    var txn = new TAF.AE.DAO.Purchase(row.getId());

    txn.entity = row.getText('entity');
    txn.mainName = row.getText('mainname');
    txn.tranDate = row.getValue('trandate');
    txn.aeInvoiceDate = row.getValue('custbody_document_date');
    txn.aeEmirate = row.getText('custcol_emirate');
    txn.aeTrn = row.getValue('vatregnumber', 'vendor');
    txn.number = row.getValue('number');
    txn.glNumber = row.getValue('glnumber');
    txn.line = row.getValue('line');
    txn.item = row.getText('item');
    txn.account = row.getText('account', this.multiBookJoinColumn);
    txn.shippingCountry = row.getText('shipcountry');
    txn.billingCountry = row.getText('billcountry');
    txn.taxItem = row.getText('taxcode'); 
    txn.taxItemId = row.getValue('taxcode');
    txn.netAmount = row.getValue('netamount', this.multiBookJoinColumn) || 0;
    txn.taxAmount = row.getValue('taxamount') || 0;
    txn.recordType = row.getValue('recordtype');
    txn.employeeId = row.getValue('internalid', 'employee');
    txn.vendorId = row.getValue('internalid', 'vendor');
    txn.vendorLineId = row.getValue('internalid', 'vendorLine');
    txn.vendorLineEntityId = row.getValue('entityid', 'vendorLine');
    txn.vendorLineTrn = row.getValue('vatregnumber', 'vendorLine');
    txn.localizedName = row.getValue('localizeddisplayname', 'account');

    if (this.multicurrency) {
        txn.currency = row.getValue('currency');
        txn.fxAmount = row.getValue('fxamount') || 0;
    }

    return txn;
};
