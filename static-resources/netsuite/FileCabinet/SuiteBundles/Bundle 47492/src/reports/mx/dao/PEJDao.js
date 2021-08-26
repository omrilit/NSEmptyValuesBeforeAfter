/**
 * Copyright 2020 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.MX = TAF.MX || {};
TAF.MX.DAO = TAF.MX.DAO || {};

TAF.MX.DAO.PEJLine = function _PEJLine(id){
    return {
        id: id,
        date: '',
        typeText: '',
        debitAmount: '',
        creditAmount: '',
        glNumber : '',
        memo: '',
        memoMain: '',
        isReversal: ''
    };
};

TAF.MX.DAO.PEJLineDao = function _PEJLineDao(params) {
	TAF.DAO.SearchDAO.call(this, params);
    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_taf_fr_pej_saft_transaction';
};
TAF.MX.DAO.PEJLineDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.MX.DAO.PEJLineDao.prototype.createSearchColumns = function createSearchColumns(params) {
	this.columns.push(new nlobjSearchColumn('account', this.multiBookJoinColumn));
	this.columns.push(new nlobjSearchColumn('debitamount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('creditamount', this.multiBookJoinColumn));
    
    if (this.glAuditNumbering) {
		this.columns.push(new nlobjSearchColumn('glnumber', this.multiBookJoinColumn));
    }  
};

TAF.MX.DAO.PEJLineDao.prototype.createSearchFilters = function _createSearchFilters(params) {
	if(!params) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params is required');
    }

	this.filters.push(new nlobjSearchFilter('internalid', 'accountingperiod', 'anyof', params.periodIds));
	
	if (params.accountId) {
	//	this.filters.push(new nlobjSearchFilter('account', this.multiBookJoinColumn, 'is', params.accountId));
    }
	
	if (this.isOneWorld && params.subId) {
		this.filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', params.subId));
    }

   // this.filters.push(new nlobjSearchFilter('posting', this.multiBookJoinColumn, 'is', 'T'));
   // this.filters.push(new nlobjSearchFilter('accounttype', null, 'noneof', '@NONE@'));
  //  this.filters.push(new nlobjSearchFilter('voided', null, 'is', 'F', null, 1, 0, false, true));
   // this.filters.push(new nlobjSearchFilter('debitamount', this.multiBookJoinColumn, 'isempty', null, null, 0, 0, false));
  //  this.filters.push(new nlobjSearchFilter('creditamount', this.multiBookJoinColumn, 'isempty', null, null, 0, 1, false));
    
    if (this.isMultiBook && params.bookId) {
    	this.filters.push(new nlobjSearchFilter('accountingbook', this.multiBookJoinColumn, 'is', params.bookId));
    }

};

TAF.MX.DAO.PEJLineDao.prototype.rowToObject = function _rowToObject(row) {
	if(!row) {
        throw  nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }
    try {
        var pejLine = new TAF.MX.DAO.PEJLine();
        pejLine.id = row.getId();
        pejLine.date = row.getValue('trandate') || '';
        pejLine.typeText = row.getText('type') || '';
        pejLine.debitAmount = row.getValue('debitamount', this.multiBookJoinColumn) || 0;
        pejLine.creditAmount = row.getValue('creditAmount', this.multiBookJoinColumn) || 0;
        pejLine.accountId = row.getValue('account', this.multiBookJoinColumn);
        pejLine.memo = row.getValue('memo');
        pejLine.memoMain = row.getValue('memomain');
        pejLine.isReversal = row.getValue('isreversal');
        if (this.glAuditNumbering) {
            pejLine.glNumber = row.getValue('glnumber') || '';
        }
        
        return pejLine;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'Error in AuxiliaryLineDao.convertRowToObject', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'Error in processing search results.');
    }    
};

