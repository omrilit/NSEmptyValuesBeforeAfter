/**
 * Copyright 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.MY = TAF.MY || {};
TAF.MY.DAO = TAF.MY.DAO || {};

TAF.MY.DAO.GeneralLedger = function _GeneralLedger(id) {
    return {
        id: id,
        date: '',
        accountId: '',
        accountNumber: '',
        accountName: '',
        memo: '',
        memoMain: '',
        mainName: '',
        entity: '',
        tranId: '',
        transactionNumber : '',
        type: '',
        typeText: '',
        debitAmount: 0,
        creditAmount: 0,
    };
};


TAF.MY.DAO.GeneralLedgerDao = function _GeneralLedgerDao() {
    TAF.DAO.SearchDAO.call(this);

    this.savedSearchId = 'customsearch_taf_my_gaf_generalledger';
    this.recordType = 'transaction';
};
TAF.MY.DAO.GeneralLedgerDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.MY.DAO.GeneralLedgerDao.prototype.createSearchFilters = function _createSearchFilters(params) {
    if(!params || !params.periodIds) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params is required');
    }

    this.filters = [new nlobjSearchFilter('internalid', 'accountingperiod', 'anyof', params.periodIds)];
    
    if (this.isOneWorld) {
        this.filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', params.subIds));
    }
    
    if (this.isMultiBook && params.bookId) {
        this.filters.push(new nlobjSearchFilter('accountingbook', this.multiBookJoinColumn, 'is', params.bookId));
    }

    this.filters.push(new nlobjSearchFilter('account', this.multiBookJoinColumn, 'noneof', '@NONE@'));
    this.filters.push(new nlobjSearchFilter('creditamount', this.multiBookJoinColumn, 'greaterthan', 0, null, 1, 0, true));
    this.filters.push(new nlobjSearchFilter('debitamount', this.multiBookJoinColumn, 'greaterthan', 0, null, 0, 1, false));
};

TAF.MY.DAO.GeneralLedgerDao.prototype.createSearchColumns = function _createSearchColumns(params) {
    this.columns.push(new nlobjSearchColumn('account', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('debitamount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('creditamount', this.multiBookJoinColumn));
};

TAF.MY.DAO.GeneralLedgerDao.prototype.rowToObject = function _rowToObject(row) {
    var generalLedger = new TAF.MY.DAO.GeneralLedger();
    
    try {
        generalLedger.id = row.getId();
        generalLedger.date = row.getValue('trandate');
        generalLedger.accountId = row.getValue('account', this.multiBookJoinColumn);
        generalLedger.memo = row.getValue('memo');
        generalLedger.memoMain = row.getValue('memomain');
        generalLedger.mainName = row.getText('mainname');
        generalLedger.entity = row.getText('entity');
        generalLedger.tranId = row.getValue('tranid');
        generalLedger.transactionNumber = row.getValue('transactionnumber');
        generalLedger.type = row.getValue('type');
        generalLedger.typeText = row.getText('type');
        generalLedger.debitAmount = row.getValue('debitamount', this.multiBookJoinColumn);
        generalLedger.creditAmount = row.getValue('creditamount', this.multiBookJoinColumn);
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.MY.DAO.GeneralLedgerDao.convertToGeneralLedger', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'TAF.MY.DAO.GeneralLedgerDao.convertToGeneralLedger');
    }
    
    return generalLedger;
};
