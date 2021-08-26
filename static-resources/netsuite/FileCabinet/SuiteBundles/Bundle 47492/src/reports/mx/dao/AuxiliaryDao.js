/**
 * Copyright 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.MX = TAF.MX || {};
TAF.MX.DAO = TAF.MX.DAO || {};

TAF.MX.DAO.AuxiliaryLine = function _AuxiliaryLine(id){
    return {
        id: id,
        date: '',
        typeText: '',
        debitAmount: '',
        creditAmount: '',
        glNumber : '',
        memo: '',
        memoMain: ''
    };
};

TAF.MX.DAO.AuxiliaryLineDao = function _AuxiliaryLineDao(params) {
	TAF.DAO.SearchDAO.call(this, params);
    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_taf_mx_auxiliary';
};
TAF.MX.DAO.AuxiliaryLineDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.MX.DAO.AuxiliaryLineDao.prototype.createSearchColumns = function createSearchColumns(params) {
	this.columns.push(new nlobjSearchColumn('account', this.multiBookJoinColumn));
	this.columns.push(new nlobjSearchColumn('debitamount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('creditamount', this.multiBookJoinColumn));
    
    if (this.glAuditNumbering) {
		this.columns.push(new nlobjSearchColumn('glnumber', this.multiBookJoinColumn));
    }  
};

TAF.MX.DAO.AuxiliaryLineDao.prototype.createSearchFilters = function _createSearchFilters(params) {
	if(!params) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params is required');
    }

	this.filters.push(new nlobjSearchFilter('internalid', 'accountingperiod', 'anyof', params.periodIds));
	
	if (params.accountId) {
		this.filters.push(new nlobjSearchFilter('account', this.multiBookJoinColumn, 'is', params.accountId));
    }
	
	if (this.isOneWorld && params.subId) {
		this.filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', params.subId));
    }

    this.filters.push(new nlobjSearchFilter('posting', this.multiBookJoinColumn, 'is', 'T'));
    this.filters.push(new nlobjSearchFilter('accounttype', null, 'noneof', '@NONE@'));
    this.filters.push(new nlobjSearchFilter('voided', null, 'is', 'F', null, 1, 0, false, true));
    this.filters.push(new nlobjSearchFilter('debitamount', this.multiBookJoinColumn, 'isempty', null, null, 0, 0, false));
    this.filters.push(new nlobjSearchFilter('creditamount', this.multiBookJoinColumn, 'isempty', null, null, 0, 1, false));
    
    if (this.isMultiBook && params.bookId) {
    	this.filters.push(new nlobjSearchFilter('accountingbook', this.multiBookJoinColumn, 'is', params.bookId));
    }

};

TAF.MX.DAO.AuxiliaryLineDao.prototype.rowToObject = function _rowToObject(row) {
	if(!row) {
        throw  nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }
    try {
        var auxiliaryLine = new TAF.MX.DAO.AuxiliaryLine();
        auxiliaryLine.id = row.getId();
        auxiliaryLine.date = row.getValue('trandate') || '';
        auxiliaryLine.typeText = row.getText('type') || '';
        auxiliaryLine.debitAmount = row.getValue('debitamount', this.multiBookJoinColumn) || 0;
        auxiliaryLine.creditAmount = row.getValue('creditAmount', this.multiBookJoinColumn) || 0;
        auxiliaryLine.accountId = row.getValue('account', this.multiBookJoinColumn);
        auxiliaryLine.memo = row.getValue('memo');
        auxiliaryLine.memoMain = row.getValue('memomain');
        if (this.glAuditNumbering) {
            auxiliaryLine.glNumber = row.getValue('glnumber') || '';
        }
        
        return auxiliaryLine;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'Error in AuxiliaryLineDao.convertRowToObject', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'Error in processing search results.');
    }    
};

