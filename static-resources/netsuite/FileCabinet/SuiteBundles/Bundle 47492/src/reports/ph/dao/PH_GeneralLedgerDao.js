/**
 * Copyright 2016 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.PH = TAF.PH || {};
TAF.PH.DAO = TAF.PH.DAO || {};

TAF.PH.DAO.GeneralLedgerDao = function _GeneralLedgerDao() {
    TAF.DAO.SearchDAO.call(this);
    
    this.name = 'GeneralLedgerDao';
    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_taf_ph_generalledger'; // TAF PH General Ledger Search
};
TAF.PH.DAO.GeneralLedgerDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.PH.DAO.GeneralLedgerDao.prototype.createSearchFilters = function _createSearchFilters(params) {
    if(!params) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params is required');
    }

    if(!params.periodIds) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params.periodIds is required');
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

TAF.PH.DAO.GeneralLedgerDao.prototype.rowToObject = function(row) {
    if (!row) {
        throw  nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }

    try {
        var object = {};
        object.internalId = row.getValue('internalid', null, 'GROUP');
        object.transactionId = row.getValue('tranid', null, 'GROUP');
        return object;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.PH.DAO.GeneralLedgerDao.convertRowToObject', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'Error converting row to object');
    }
};


TAF.PH.DAO.GeneralLedgerDetailsDao = function _GeneralLedgerDao() {
    TAF.DAO.SearchDAO.call(this);
    
    this.name = 'GeneralLedgerDetailsDao';
    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_taf_ph_generalledger_detail'; // TAF PH General Ledger Details Search
};
TAF.PH.DAO.GeneralLedgerDetailsDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.PH.DAO.GeneralLedgerDetailsDao.prototype.createSearchColumns = function _createSearchColumns(params) {
    this.columns.push(new nlobjSearchColumn('creditamount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('debitamount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('account', this.multiBookJoinColumn));
};

TAF.PH.DAO.GeneralLedgerDetailsDao.prototype.createSearchFilters = function _createSearchFilters(params) {
    if(!params) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params is required');
    }
    if(!params.internalId) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params.internalId is required');
    }

    this.filters.push(new nlobjSearchFilter('internalid', null, 'is', params.internalId));
    this.filters.push(new nlobjSearchFilter('voided', null, 'is', 'F', null, 1, 0, false, true));
    this.filters.push(new nlobjSearchFilter('debitamount', this.multiBookJoinColumn, 'isempty', null, null, 0, 0, false));
    this.filters.push(new nlobjSearchFilter('creditamount', this.multiBookJoinColumn, 'isempty', null, null, 0, 1, false));

    if (this.isMultiBook && params.bookId) {
        this.filters.push(new nlobjSearchFilter('accountingbook', this.multiBookJoinColumn, 'is', params.bookId));
    }
};

TAF.PH.DAO.GeneralLedgerDetailsDao.prototype.rowToObject = function(row) {
    if (!row) {
        throw  nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }

    try {
        var object = {};

        object.lineSequenceNumber = row.getValue('linesequencenumber');
        object.transactionNumber = row.getValue('tranid');
        object.date = row.getValue('trandate');
        object.creditAmount = row.getValue('creditamount', this.multiBookJoinColumn);
        object.debitAmount = row.getValue('debitamount', this.multiBookJoinColumn);
        object.memoMain = row.getValue('memomain');
        object.account = row.getText('account', this.multiBookJoinColumn);
        object.accountId = row.getValue('account', this.multiBookJoinColumn);
        object.type = row.getText('type');
        object.typeCode = row.getValue('type');

        return object;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.PH.DAO.GeneralLedgerDetailsDao.convertRowToObject', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'Error converting row to object');
    }
};
