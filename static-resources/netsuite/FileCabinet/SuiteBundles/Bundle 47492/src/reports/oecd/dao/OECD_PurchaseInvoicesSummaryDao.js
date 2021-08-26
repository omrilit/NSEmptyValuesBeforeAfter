/**
 * Copyright 2016 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */


var TAF = TAF || {};
TAF.OECD = TAF.OECD || {};
TAF.OECD.DAO = TAF.OECD.DAO || {};

TAF.OECD.DAO.PurchaseInvoicesSummaryDao = function _purchaseInvoicesSummaryDao() {
    TAF.DAO.SearchDAO.call(this);
    this.name = 'OECD_PurchaseInvoicesSummaryDao';
    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_oecd_purcinvoices_summary';
};
TAF.OECD.DAO.PurchaseInvoicesSummaryDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.OECD.DAO.PurchaseInvoicesSummaryDao.prototype.createSearchColumns = function createSearchColumns(params) {
	this.columns.push(new nlobjSearchColumn('debitamount', this.multiBookJoinColumn, 'SUM'));
    this.columns.push(new nlobjSearchColumn('creditamount', this.multiBookJoinColumn, 'SUM'));
};

TAF.OECD.DAO.PurchaseInvoicesSummaryDao.prototype.createSearchFilters = function _createSearchFilters(params) {
	if(!params) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params is required');
    }
	
	if(params.periodIds) {
		this.filters.push(new nlobjSearchFilter('internalid', 'accountingperiod', 'anyof', params.periodIds));
	}
	
	if (this.isOneWorld && params.subIds) {
    	this.filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', params.subIds));
    }
	
    if (this.isMultiBook && params.bookId) {
        this.filters.push(new nlobjSearchFilter('accountingbook', this.multiBookJoinColumn, 'is', params.bookId));
    }
    
    this.filters.push(new nlobjSearchFilter('posting', this.multiBookJoinColumn, 'is', 'T'));
};

TAF.OECD.DAO.PurchaseInvoicesSummaryDao.prototype.rowToObject = function _rowToObject(row) {
    if (!row) {
        throw  nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }

    try {
        var puchinvoicesum = {};
        puchinvoicesum.Count = row.getValue('internalid', null, 'COUNT');
        puchinvoicesum.TotalDebit = row.getValue('debitamount', this.multiBookJoinColumn, 'SUM');
        puchinvoicesum.TotalCredit = row.getValue('creditamount', this.multiBookJoinColumn, 'SUM');
        
        return puchinvoicesum;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.OECD.DAO.PurchaseInvoicesSummaryDao.rowToObject', ex.toString());
        throw ex;
    }
};