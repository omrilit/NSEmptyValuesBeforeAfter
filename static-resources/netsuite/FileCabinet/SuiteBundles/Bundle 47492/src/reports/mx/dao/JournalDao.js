/**
 * Copyright 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.MX = TAF.MX || {};
TAF.MX.DAO = TAF.MX.DAO || {};

TAF.MX.DAO.Journal = function _Journal(id) {
    return {
        id : id,
        isMainline : '',
        entity : '',			//Name
        entityRFC : '',     	//MX Compliance Bundle
        entityTaxNumber : '',
        tranDate : '',			//Date
        type : '',				//Type
        typeText : '',			//Type
        tranId : '',			//Number
        transactionNumber : '', //Number
        glNumber : '',			//GL Number
        accountId : '',
        accountName : '',
        accountNumber : '',
        accountType : '',
        debitAmount : '',
        creditAmount : '',
        amount : '',
        paymentMethod : '',
        bankNumber : '',    	    //Custom record
        subsidiaryCountry: '',
        billingCountry: '',
        currency: '',
        exchangeRate: '',
        mxPaymentMethod: '',
        mxBankName: '',
        mxAccountNumber: '',
        memoMain: '',
        memo: ''
    };
};


TAF.MX.DAO.JournalDao = function _JournalDao(hasMXCompliance) {
    TAF.DAO.SearchDAO.call(this);

    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_taf_mx_journal_lines';
    this.hasMXCompliance = hasMXCompliance;
};
TAF.MX.DAO.JournalDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.MX.DAO.JournalDao.prototype.createSearchFilters = function _createSearchFilters(params) {
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
    this.filters.push(new nlobjSearchFilter('creditamount', this.multiBookJoinColumn, 'greaterthan', 0, null, 1, 0, true));
    this.filters.push(new nlobjSearchFilter('debitamount', this.multiBookJoinColumn, 'greaterthan', 0, null, 0, 1, false));
    return this.filters;
};

TAF.MX.DAO.JournalDao.prototype.createSearchColumns = function _createSearchColumns(params) {
    this.columns.push(new nlobjSearchColumn('account', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('accounttype', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('amount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('debitamount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('creditamount', this.multiBookJoinColumn));

    if (this.isOneWorld) {
        this.columns.push(new nlobjSearchColumn('country', 'subsidiary'));
    }

    if (this.hasMXCompliance) {
        this.columns.push(new nlobjSearchColumn('custentity_mx_rfc', 'vendor'));
        this.columns.push(new nlobjSearchColumn('custentity_mx_rfc', 'customer'));
        this.columns.push(new nlobjSearchColumn('custentity_mx_rfc', 'employee'));
        this.columns.push(new nlobjSearchColumn('custbody_mx_payment_method'));
        this.columns.push(new nlobjSearchColumn('custbody_mx_bank_name'));
        this.columns.push(new nlobjSearchColumn('custbody_mx_bank_acct_num'));
    }

    if (this.glAuditNumbering) {
        this.columns.push(new nlobjSearchColumn('glnumber', this.multiBookJoinColumn));
    }

    if (this.multicurrency) {
        this.columns.push(new nlobjSearchColumn('currency'));
        this.columns.push(new nlobjSearchColumn('exchangerate', this.multiBookJoinColumn));
    }

    return this.columns;
};

TAF.MX.DAO.JournalDao.prototype.rowToObject = function _rowToObject(row) {
    if(!row) {
        throw  nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }

    try {
        var journal = new TAF.MX.DAO.Journal();
        journal.id = row.getId();
        journal.isMainline = (row.getValue('mainline') === '*');
        journal.entity = row.getText('entity') || '';
        journal.entityTaxNumber = row.getValue('vatregnumber', 'vendor') || row.getValue('vatregnumber', 'customer') || '';
        journal.tranDate = row.getValue('trandate') || '';
        journal.type = row.getValue('type') || '';
        journal.typeText = row.getText('type') || '';
        journal.tranId = row.getValue('tranid') || '';
        journal.transactionNumber = row.getValue('transactionnumber') || '';
        journal.accountId = row.getValue('account', this.multiBookJoinColumn) || '';
        journal.accountType = row.getValue('accounttype', this.multiBookJoinColumn) || '';
        journal.debitAmount = row.getValue('debitamount', this.multiBookJoinColumn) || '';
        journal.creditAmount = row.getValue('creditamount', this.multiBookJoinColumn) || '';
        journal.amount = row.getValue('amount', this.multiBookJoinColumn) || '';
        journal.currency = row.getValue('currency');
        journal.exchangeRate = row.getValue('exchangerate', this.multiBookJoinColumn);
        journal.paymentMethod = row.getValue('paymentmethod') || '';
        journal.billingCountry = row.getValue('billcountry', 'vendor');
        journal.memo = row.getValue('memo');
        journal.memoMain = row.getValue('memomain');

        if (this.isOneWorld) {
            journal.subsidiaryCountry = row.getValue('country', 'subsidiary');
        }

        if (this.hasMXCompliance) {
            journal.entityRFC = row.getValue('custentity_mx_rfc', 'vendor') || row.getValue('custentity_mx_rfc', 'customer') || row.getValue('custentity_mx_rfc', 'employee') || '';
            journal.mxPaymentMethod = row.getValue('custbody_mx_payment_method') || '';
            journal.mxBankName = row.getValue('custbody_mx_bank_name') || '';
            journal.mxAccountNumber = row.getValue('custbody_mx_bank_acct_num') || '';
        }

        if (this.glAuditNumbering) {
            journal.glNumber = row.getValue('glnumber', this.multiBookJoinColumn) || '';
        }

        if (this.multicurrency) {
            journal.currency = row.getValue('currency');
            journal.exchangeRate = row.getValue('exchangerate', this.multiBookJoinColumn);
        }

        return journal;
    } catch (ex) {
        this.logException(ex, 'rowToObject');
        throw nlapiCreateError('DAO_ERROR', 'Unable to get column values');
    }
};

