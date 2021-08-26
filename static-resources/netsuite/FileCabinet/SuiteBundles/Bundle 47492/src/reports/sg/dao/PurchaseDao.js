/**
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.SG = TAF.SG || {};
TAF.SG.DAO = TAF.SG.DAO || {};

// Purchase Summary

TAF.SG.DAO.PurchaseSummary = function _PurchaseSummary(id) {
    var summary = {
        id: id,
        netAmount: '',
        taxAmount: '',
        taxCodeId: ''
    };
    return summary;
};

TAF.SG.DAO.PurchaseSummaryDao = function _PurchaseSummaryDao() {
    TAF.DAO.SearchDAO.call(this);

    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_sg_iaf_purchase_summary';
};
TAF.SG.DAO.PurchaseSummaryDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.SG.DAO.PurchaseSummaryDao.prototype.createSearchFilters = function _createSearchFilters(params) {
    var accountTypeColumn = this.multiBookJoinColumn ? 'accountingtransaction.accounttype' : 'accounttype';
    this.filters = this.searchObj.getFilters(); // store filters and add later
    this.filterExpression = [
        [ accountTypeColumn, 'anyof', params.accountTypes ],
        'AND', [
            [ 'recordtype', 'isnot', 'journalentry' ],
            'OR',
            [
                 [ 'recordtype', 'is', 'journalentry' ],
                 'AND', [ 'taxitem.custrecord_deemed_supply', 'is', 'F' ]
            ]
        ]
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
    if (params.exludedDeferredInputAndOutput) {
        this.filterExpression.push('AND', [ 'taxitem.custrecord_deferred_on', 'noneof', '2' ]);
    }
};

TAF.SG.DAO.PurchaseSummaryDao.prototype.createSearchColumns = function _createSearchColumns(params) {
    this.columns.push(new nlobjSearchColumn('netamount', this.multiBookJoinColumn));
};

TAF.SG.DAO.PurchaseSummaryDao.prototype.rowToObject = function _rowToObject(row) {
    if (!row) {
        throw nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }

    var txn = new TAF.SG.DAO.PurchaseSummary(row.getId());

    txn.netAmount = row.getValue('netamount', this.multiBookJoinColumn);
    txn.taxAmount = row.getValue('taxamount') || 0;
    txn.taxCodeId = row.getValue('taxcode');

    return txn;
};

// Purchase Lines

TAF.SG.DAO.Purchase = function _Purchase(id) {
    var txn = {
        id: id,
        entity: '',
        mainName: '',
        tranDate: '',
        sgInvoiceDate: '',
        sgUen: '',
        number: '',
        sgImportPermitNumber: '',
        line: '',
        item: '',
        account: '',
        netAmount: '',
        taxAmount: '',
        taxCode: '',
        taxCodeId: '',
        currency: '',
        fxAmount: '',
        recordType: '',
        vendorLineEntityId: '',
        vendorLineUen: ''
    };
    return txn;
};

TAF.SG.DAO.PurchaseDao = function _PurchaseDao() {
    TAF.DAO.SearchDAO.call(this);

    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_sg_iaf_purchase';
};
TAF.SG.DAO.PurchaseDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.SG.DAO.PurchaseDao.prototype.createSearchFilters = function _createSearchFilters(params) {
    var accountTypeColumn = this.multiBookJoinColumn ? 'accountingtransaction.accounttype' : 'accounttype';
    this.filters = this.searchObj.getFilters(); // store filters and add later
    this.filterExpression = [
        [ accountTypeColumn, 'anyof', params.accountTypes ],
        'AND', [
            [ 'recordtype', 'isnot', 'journalentry' ],
            'OR',
            [
                 [ 'recordtype', 'is', 'journalentry' ],
                 'AND', [ 'taxitem.custrecord_deemed_supply', 'is', 'F' ]
            ]
        ]
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
    if (params.exludedDeferredInputAndOutput) {
        this.filterExpression.push('AND', [ 'taxitem.custrecord_deferred_on', 'noneof', '2' ]);
    }
};

TAF.SG.DAO.PurchaseDao.prototype.createSearchColumns = function _createSearchColumns(params) {
    this.columns.push(new nlobjSearchColumn('account', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('netamount', this.multiBookJoinColumn));

    if (this.multicurrency) {
        this.columns.push(new nlobjSearchColumn('currency'));
        this.columns.push(new nlobjSearchColumn('fxamount'));
    }

    if (this.isMultiBook) {
        this.columns.push(new nlobjSearchColumn('netamount', this.multiBookJoinColumn));
    }

    this.columns.push(new nlobjSearchColumn('entityid', 'vendorLine'));
};

TAF.SG.DAO.PurchaseDao.prototype.rowToObject = function _rowToObject(row) {
    if(!row) {
        throw  nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }

    var txn = new TAF.SG.DAO.Purchase(row.getId());

    txn.entity = row.getText('entity');
    txn.mainName = row.getText('mainname');
    txn.tranDate = row.getValue('trandate');
    txn.sgInvoiceDate = row.getValue('custbody_document_date');
    txn.sgUen = row.getValue('custentity_4599_sg_uen', 'vendor');
    txn.number = row.getValue('number');
    txn.sgImportPermitNumber = row.getValue('custbody_4599_sg_import_permit_num');
    txn.line = row.getValue('line');
    txn.item = row.getText('item');
    txn.account = row.getText('account', this.multiBookJoinColumn);
    txn.taxCode = row.getText('taxcode'); 
    txn.taxCodeId = row.getValue('taxcode');
    txn.netAmount = row.getValue('netamount', this.multiBookJoinColumn) || 0;
    txn.taxAmount = row.getValue('taxamount') || 0;
    txn.recordType = row.getValue('recordtype');
    txn.vendorLineEntityId = row.getValue('entityid', 'vendorLine');
    txn.vendorLineUen = row.getValue('custentity_4599_sg_uen', 'vendorLine');

    if (this.multicurrency) {
        txn.currency = row.getValue('currency');
        txn.fxAmount = row.getValue('fxamount') || 0;
    }

    return txn;
};
