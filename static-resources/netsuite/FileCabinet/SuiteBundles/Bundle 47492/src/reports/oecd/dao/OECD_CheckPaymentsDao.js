/**
 * Copyright 2016 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.OECD = TAF.OECD || {};
TAF.OECD.DAO = TAF.OECD.DAO || {};

TAF.OECD.DAO.CheckPayments = function _CheckPayments(id) {
    return {
        id: id,
        type: '',
        internalId: '',
        line: '',
        tranId: '',
        date: '',
        memo: '',
        memoMain: '',
        account: '',
        debitAmount: '',
        creditAmount: ''
    };
};

TAF.OECD.DAO.CheckPaymentsDao = function _CheckPaymentsDao(params) {
    TAF.DAO.SearchDAO.call(this, params);
    this.name = 'OECD_CheckPaymentsDAO';
    this.savedSearchId = 'customsearch_taf_oecd_check_payments';
    this.recordType = 'transaction';
};
TAF.OECD.DAO.CheckPaymentsDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.OECD.DAO.CheckPaymentsDao.prototype.createSearchFilters = function _createSearchFilters(params) {
    if (!params) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params is required');
    }
    if (!params.periodIds || params.periodIds.length == 0) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params.periodIds is required');
    }
    if (this.isOneWorld && (!params.subIds || params.subIds.length == 0)) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params.subIds is required');
    }

    if (this.isOneWorld) {
        this.filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', params.subIds));
    }

    if (this.isMultiBook && params.bookId) {
        this.filters.push(new nlobjSearchFilter('accountingbook', this.multiBookJoinColumn, 'is', params.bookId));
    }

    this.filters.push(new nlobjSearchFilter('internalid', 'accountingperiod', 'anyof', params.periodIds));
};

TAF.OECD.DAO.CheckPaymentsDao.prototype.createSearchColumns = function _createSearchColumns(params) {
    this.columns.push(new nlobjSearchColumn('account', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('debitamount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('creditamount', this.multiBookJoinColumn));
};

TAF.OECD.DAO.CheckPaymentsDao.prototype.rowToObject = function _rowToObject(row) {
    var checkPayment = new TAF.OECD.DAO.CheckPayments();

    try {
        checkPayment.id = row.getId();
        checkPayment.type = row.getValue('type');
        checkPayment.internalId = row.getValue('internalid');
        checkPayment.line = row.getValue('line');
        checkPayment.tranId = row.getValue('tranid');
        checkPayment.date = row.getValue('trandate');
        checkPayment.memo = row.getValue('memo');
        checkPayment.memoMain = row.getValue('memomain');
        checkPayment.account = row.getValue('account', this.multiBookJoinColumn);
        checkPayment.debitAmount = row.getValue('debitamount', this.multiBookJoinColumn);
        checkPayment.creditAmount = row.getValue('creditamount', this.multiBookJoinColumn);
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.OECD.DAO.CheckPaymentsDao.rowToObject', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'TAF.OECD.DAO.CheckPaymentsDao.rowToObject');
    }
    
    return checkPayment;
};
