/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.AE = TAF.AE || {};
TAF.AE.DAO = TAF.AE.DAO || {};

TAF.AE.DAO.CustomerSupplySummary = function _CustomerSupplySummary(id) {
    return {
        id: id,
        netAmount: '',
        accountId: '',
        taxAmount: '',
        creditAmount: '',
        taxItemId: '',
        recordType: ''
    };
};

TAF.AE.DAO.CustomerSupplySummaryDao = function _CustomerSupplySummaryDao() {
    TAF.DAO.SearchDAO.call(this);

    this.name = 'CustomerSupplyDao';
    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_ae_faf_sales_summary';
};
TAF.AE.DAO.CustomerSupplySummaryDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.AE.DAO.CustomerSupplySummaryDao.prototype.createSearchFilters = function _createSearchFilters(params) {
    var accountTypeColumn = this.multiBookJoinColumn ? 'accountingtransaction.accounttype' : 'accounttype';
    this.filters = this.searchObj.getFilters();
    this.filterExpression = [
    	[ accountTypeColumn, 'anyof', params.salesAccountTypes ],
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

TAF.AE.DAO.CustomerSupplySummaryDao.prototype.createSearchColumns = function _createSearchColumns(params) {
    this.columns.push(new nlobjSearchColumn('netamount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('account', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('trandate'));
};

TAF.AE.DAO.CustomerSupplySummaryDao.prototype.rowToObject = function _rowToObject(row) {
    if (!row) {
        throw nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }

    var txn = new TAF.AE.DAO.CustomerSupplySummary(row.getId());

    txn.netAmount = row.getValue('netamount', this.multiBookJoinColumn);
    txn.accountId = row.getValue('account', this.multiBookJoinColumn);
    txn.taxAmount = row.getValue('taxamount') || 0;
    txn.creditAmount = row.getValue('creditamount') || 0;
    txn.taxItemId = row.getValue('taxcode');
    txn.recordType = row.getValue('recordtype');

    return txn;
};

TAF.AE.DAO.CustomerSupply = function _CustomerSupply(id) {
    return {
        id : id,
        isIndividual : '',
        customerId: '',
        customerFirstName : '',
        customerMiddleName : '',
        customerLastName : '',
        customerCompanyName : '',
        customerName : '',
        customerTRN : '',
        tranDate : '',
        number : '',
        lineID : '',
        item : '',
        netAmount : '',
        taxAmount : '',
        taxItem : '',
        taxItemId : '',
        shippingCountry : '',
        currency : '',
        exchangeRate : '',
        billingCountry : '',
        account : '',
        accountId: '',
        recordType: '',
        creditAmount: '',
        vendorName: '',
        vendorIsIndividual: '',
        vendorTRN: '',
        vendorLineEntityId: '',
        vendorLineTrn: ''
    };
};

TAF.AE.DAO.CustomerSupplyDao = function _CustomerSupplyDao() {
    TAF.DAO.SearchDAO.call(this);

    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_ae_faf_sales';
};
TAF.AE.DAO.CustomerSupplyDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.AE.DAO.CustomerSupplyDao.prototype.createSearchFilters = function _createSearchFilters(params) {
    var accountTypeColumn = this.multiBookJoinColumn ? 'accountingtransaction.accounttype' : 'accounttype';
    this.filters = this.searchObj.getFilters();
    this.filterExpression = [
    	[ accountTypeColumn, 'anyof', params.salesAccountTypes ],
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

TAF.AE.DAO.CustomerSupplyDao.prototype.createSearchColumns = function _createSearchColumns(params) {
    this.columns.push(new nlobjSearchColumn('account', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('netamount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('internalid', 'customer'));

    if (this.multicurrency) {
        this.columns.push(new nlobjSearchColumn('currency'));
        this.columns.push(new nlobjSearchColumn('fxamount'));
    }

    this.columns.push(new nlobjSearchColumn('localizeddisplayname', 'account'));
    this.columns.push(new nlobjSearchColumn('entityid', 'vendorLine'));
    this.columns.push(new nlobjSearchColumn('vatregnumber', 'vendorLine'));
    this.columns.push(new nlobjSearchColumn('custcol_emirate'));
};

TAF.AE.DAO.CustomerSupplyDao.prototype.rowToObject = function _rowToObject(row) {
    if(!row) {
        throw  nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }

    var txn = new TAF.AE.DAO.CustomerSupplySummary(row.getId());

    txn.isIndividual = row.getValue('isperson','customer') == 'T';
    txn.customerId = row.getValue('internalid', 'customer');
    txn.customerFirstName = row.getValue('firstname', 'customer');
    txn.customerMiddleName = row.getValue('middlename', 'customer');
    txn.customerLastName = row.getValue('lastname', 'customer');
    txn.customerCompanyName = row.getValue('companyname', 'customer');
    txn.customerName = row.getText('entityid');
    txn.customerTRN = row.getValue('vatregnumber', 'customer');
    txn.customerEmirate = row.getText('custcol_emirate');
    txn.tranDate = row.getValue('trandate');
    txn.number = row.getValue('number');
    txn.glNumber = row.getValue('glnumber');
    txn.lineID = row.getValue('line');
    txn.item = row.getText('item');
    txn.account = row.getText('account', this.multiBookJoinColumn);
    txn.accountId = row.getValue('account', this.multiBookJoinColumn);
    txn.taxItem = row.getText('taxcode');
    txn.taxItemId = row.getValue('taxcode');
    txn.shippingCountry = row.getText('shipcountry');
    txn.billingCountry = row.getText('billcountry');
    txn.netAmount = row.getValue('netamount', this.multiBookJoinColumn) || 0;
    txn.taxAmount = row.getValue('taxamount') || 0;
    txn.recordType = row.getValue('recordtype') || '';
    txn.creditAmount = row.getValue('creditamount') || 0;
    txn.vendorName = row.getText('mainname') || '';
    txn.vendorTRN = row.getValue('vatregnumber', 'vendor');
    txn.vendorLineEntityId = row.getValue('entityid', 'vendorLine');
    txn.vendorLineTrn = row.getValue('vatregnumber', 'vendorLine');
    txn.localizedName = row.getValue('localizeddisplayname', 'account');

    if (this.multicurrency) {
        txn.currency = row.getValue('currency');
        txn.fxAmount = row.getValue('fxamount') || 0;
    }

    return txn;
};
