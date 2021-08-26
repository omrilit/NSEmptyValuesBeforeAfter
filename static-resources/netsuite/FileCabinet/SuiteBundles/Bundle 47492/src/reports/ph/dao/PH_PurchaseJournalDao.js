/**
 * Copyright 2016 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */


var TAF = TAF || {};
TAF.PH = TAF.PH || {};
TAF.PH.DAO = TAF.PH.DAO || {};

TAF.PH.DAO.PurchaseJournalDao = function _purchasejournalDao() {
    TAF.DAO.SearchDAO.call(this);
    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_ph_taf_purchasejournal';
};
TAF.PH.DAO.PurchaseJournalDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.PH.DAO.PurchaseJournalDao.prototype.createSearchColumns = function createSearchColumns(params) {};

TAF.PH.DAO.PurchaseJournalDao.prototype.createSearchFilters = function _createSearchFilters(params) {
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

TAF.PH.DAO.PurchaseJournalDao.prototype.rowToObject = function _rowToObject(row) {
    if (!row) {
        throw  nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }

    try {
        var puchjournal = {};
        puchjournal.internalId = row.getValue('internalid', null, 'GROUP');
        return puchjournal;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.PH.DAO.PurchaseJournalDao.rowToObject', ex.toString());
        throw ex;
    }
};