/**
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.SG = TAF.SG || {};
TAF.SG.DAO = TAF.SG.DAO || {};

// Supply Summary Data

TAF.SG.DAO.SuppDataSummary = function _SuppData(id) {
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

TAF.SG.DAO.SuppDataSummaryDao = function _SuppDataDao() {
    TAF.DAO.SearchDAO.call(this);

    this.name = 'SuppDataDao';
    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_sg_iaf_salessummary';
};
TAF.SG.DAO.SuppDataSummaryDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.SG.DAO.SuppDataSummaryDao.prototype.createSearchFilters = function _createSearchFilters(params) {
    var accountTypeColumn = this.multiBookJoinColumn ? 'accountingtransaction.accounttype' : 'accounttype';
    this.filters = this.searchObj.getFilters(); // store filters and add later
    this.filterExpression = [[
        [ accountTypeColumn, 'anyof', params.salesAccountTypes ],
        'OR',
        [
            [ accountTypeColumn, 'anyof', params.purchaseAccountTypes ],
            'AND',
            [ 'recordtype', 'is', 'journalentry' ], 'AND', [ 'taxitem.custrecord_deemed_supply', 'is', 'T' ]
        ],
        'OR',
        [
            [ accountTypeColumn, 'anyof', params.purchaseAccountTypes ],
            'AND', [ 'recordtype', 'isnot', 'journalentry' ],
            'AND', [ 'taxitem.isreversecharge', 'is', 'T' ],
            'AND', [ 'taxitem.custrecord_post_notional_tax_amount', 'is', 'T' ]
        ]
    ]];
    if (this.isOneWorld) {
        this.filterExpression.push('AND', [ 'subsidiary', 'anyof', params.subIds ]);
    }
    if (params.bookId) {
        this.filterExpression.push('AND', [ 'accountingtransaction.accountingbook', 'is', params.bookId ]);
    }
    if (params.periodIds) {
        this.filterExpression.push('AND', [ 'accountingperiod.internalid', 'anyof', params.periodIds ]);
    }
    if (params.exludedDeferredInputAndOutput) {
        this.filterExpression.push('AND', [ 'taxitem.custrecord_deferred_on', 'noneof', '2' ]);
    }
};

TAF.SG.DAO.SuppDataSummaryDao.prototype.createSearchColumns = function _createSearchColumns(params) {
    this.columns.push(new nlobjSearchColumn('netamount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('account', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('trandate'));
};

TAF.SG.DAO.SuppDataSummaryDao.prototype.rowToObject = function _rowToObject(row) {
    if (!row) {
        throw nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }

    var txn = new TAF.SG.DAO.SuppDataSummary(row.getId());

    txn.netAmount = row.getValue('netamount', this.multiBookJoinColumn);
    txn.accountId = row.getValue('account', this.multiBookJoinColumn);
    txn.taxAmount = row.getValue('taxamount') || 0;
    txn.creditAmount = row.getValue('creditamount') || 0;
    txn.taxItemId = row.getValue('taxcode');
    txn.recordType = row.getValue('recordtype');

    return txn;
};

TAF.SG.DAO.SuppData = function _SuppData(id) {
    return {
        id : id,
        isIndividual : '',
        customerFirstName : '',
        customerMiddleName : '',
        customerLastName : '',
        customerCompanyName : '',
        customerName : '',
        customerUEN : '',
        docDate : '',
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
        vendorUEN: '',
        vendorLineEntityId: '',
        vendorLineUen: ''
    };
};

TAF.SG.DAO.SuppDataDao = function _SuppDataDao() {
    TAF.DAO.SearchDAO.call(this);

    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_sg_iaf_saleslines';
};
TAF.SG.DAO.SuppDataDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.SG.DAO.SuppDataDao.prototype.createSearchFilters = function _createSearchFilters(params) {
    var accountTypeColumn = this.multiBookJoinColumn ? 'accountingtransaction.accounttype' : 'accounttype';
    this.filters = this.searchObj.getFilters(); // store filters and add later
    this.filterExpression = [[
        [ accountTypeColumn, 'anyof', params.salesAccountTypes ],
        'OR',
        [
            [ accountTypeColumn, 'anyof', params.purchaseAccountTypes ],
            'AND',
            [ 'recordtype', 'is', 'journalentry' ], 'AND', [ 'taxitem.custrecord_deemed_supply', 'is', 'T' ]
        ],
        'OR',
        [
            [ accountTypeColumn, 'anyof', params.purchaseAccountTypes ],
            'AND',
            [
                [ 'recordtype', 'isnot', 'journalentry' ],
                'AND', [ 'taxitem.isreversecharge', 'is', 'T' ],
                'AND', [ 'taxitem.custrecord_post_notional_tax_amount', 'is', 'T' ]
            ]
        ],
        'OR',
        [
            [ accountTypeColumn, 'anyof', params.purchaseAccountTypes ],
            'AND',
            [
                [ 'recordtype', 'isnot', 'journalentry' ],
                'AND', [ 'taxitem.isreversecharge', 'is', 'T' ],
                'AND', [ 'taxitem.custrecord_4110_import', 'is', 'T' ],
                'AND', [ 'taxitem.appliestoservice', 'is', 'T' ]
            ]
        ]
    ]];
    if (this.isOneWorld) {
        this.filterExpression.push('AND', [ 'subsidiary', 'anyof', params.subIds ]);
    }
    if (params.bookId) {
        this.filterExpression.push('AND', [ 'accountingtransaction.accountingbook', 'is', params.bookId ]);
    }
    if (params.periodIds) {
        this.filterExpression.push('AND', [ 'accountingperiod.internalid', 'anyof', params.periodIds ]);
    }
    if (params.exludedDeferredInputAndOutput) {
        this.filterExpression.push('AND', [ 'taxitem.custrecord_deferred_on', 'noneof', '2' ]);
    }
};

TAF.SG.DAO.SuppDataDao.prototype.createSearchColumns = function _createSearchColumns(params) {
    this.columns.push(new nlobjSearchColumn('account', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('netamount', this.multiBookJoinColumn));

    if (this.multicurrency) {
        this.columns.push(new nlobjSearchColumn('currency'));
        this.columns.push(new nlobjSearchColumn('fxamount'));
    }

    this.columns.push(new nlobjSearchColumn('entityid', 'vendorLine'));
};

TAF.SG.DAO.SuppDataDao.prototype.rowToObject = function _rowToObject(row) {
    if(!row) {
        throw  nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }

    var txn = new TAF.SG.DAO.SuppData(row.getId());

    txn.isIndividual = row.getValue('isperson','customer') == 'T';
    txn.customerFirstName = row.getValue('firstname', 'customer');
    txn.customerMiddleName = row.getValue('middlename', 'customer');
    txn.customerLastName = row.getValue('lastname', 'customer');
    txn.customerCompanyName = row.getValue('companyname', 'customer');
    txn.customerName = row.getText('entityid');
    txn.customerUEN = row.getValue('custentity_4599_sg_uen', 'customer');
    txn.docDate = row.getValue('custbody_document_date');
    txn.tranDate = row.getValue('trandate');
    txn.number = row.getValue('number');
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
    txn.vendorUEN = row.getValue('custentity_4599_sg_uen', 'vendor');
    txn.vendorLineEntityId = row.getValue('entityid', 'vendorLine');
    txn.vendorLineUen = row.getValue('custentity_4599_sg_uen', 'vendorLine');

    if (this.multicurrency) {
        txn.currency = row.getValue('currency');
        txn.fxAmount = row.getValue('fxamount') || 0;
    }

    return txn;
};


// Realized Gain/Loss

TAF.SG.DAO.IAFRglDAO = function IAFRglDAO() {
    TAF.DAO.RglDao.call(this);
    this.name = 'IAFRglDAO';
    this.reportName = 'TAF SG IAF RGL';
};

TAF.SG.DAO.IAFRglDAO.prototype = Object.create(TAF.DAO.RglDao.prototype);
