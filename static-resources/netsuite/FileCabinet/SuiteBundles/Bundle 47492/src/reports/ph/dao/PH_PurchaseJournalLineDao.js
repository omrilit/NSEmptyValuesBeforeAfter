/**
 * Copyright 2016 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */


var TAF = TAF || {};
TAF.PH = TAF.PH || {};
TAF.PH.DAO = TAF.PH.DAO || {};
TAF.PH.DAO.PurchaseJournalLine = function _PurchaseJournalLine() {
    return {
    	trandate: '',
    	tranid: '',
    	memo: '',
        type: '',
        vatregnumber: '',
    	address: '',
    	entityid: '',
        isindividual: '',
        firstname: '',
        lastname: '',
        companyname: '',
    	discount: '',
    	gross: '',
        taxtotal: ''
    };
};

TAF.PH.DAO.PurchaseJournalLineDao = function _purchasejournallineDao() {
    TAF.DAO.SearchDAO.call(this);
    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_ph_taf_purchasejournal_trxn';
};
TAF.PH.DAO.PurchaseJournalLineDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.PH.DAO.PurchaseJournalLineDao.prototype.createSearchColumns = function createSearchColumns(params) {
	if(!params) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params is required');
    }
	this.columns.push(new nlobjSearchColumn('tranid', null, 'GROUP'));
	if (this.isMultiBook && params.bookId) {
        this.discount = new nlobjSearchColumn('formulacurrency', null, 'SUM').setFormula('NVL(ABS(({discountamount}*{accountingtransaction.exchangerate}) / {exchangerate}) / 2, 0)');
        this.gross = new nlobjSearchColumn('formulacurrency', null, 'SUM').setFormula("CASE WHEN {mainline}='*' THEN ABS(({grossamount}*{accountingtransaction.exchangerate}) / {exchangerate}) ELSE 0 END");
        this.taxtotal = new nlobjSearchColumn('formulacurrency', null, 'SUM').setFormula("CASE WHEN {mainline}='*' THEN ABS(({taxtotal}*{accountingtransaction.exchangerate}) / {exchangerate}) ELSE 0 END");
    } else {
        this.discount = new nlobjSearchColumn('formulacurrency', null, 'SUM').setFormula('NVL(ABS({discountamount}) / 2, 0)');
        this.gross = new nlobjSearchColumn('formulacurrency', null, 'SUM').setFormula("CASE WHEN {mainline}='*' THEN ABS({grossamount}) ELSE 0 END");
        this.taxtotal = new nlobjSearchColumn('formulacurrency', null, 'SUM').setFormula("CASE WHEN {mainline}='*' THEN ABS({taxtotal}) ELSE 0 END");
    }
	this.columns.push(this.discount);
	this.columns.push(this.gross);
	this.columns.push(this.taxtotal);
};

TAF.PH.DAO.PurchaseJournalLineDao.prototype.createSearchFilters = function _createSearchFilters(params) {
	if(!params) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params is required');
    }
	this.filters.push(new nlobjSearchFilter('internalid', null, 'is', params.internalId));
	
	if (this.isMultiBook && params.bookId) {
        this.filters.push(new nlobjSearchFilter('accountingbook', this.multiBookJoinColumn, 'is', params.bookId));
    }
};

TAF.PH.DAO.PurchaseJournalLineDao.prototype.rowToObject = function _rowToObject(row) {
    if (!row) {
        throw  nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }
    try {	
	    var pjLine = new TAF.PH.DAO.PurchaseJournalLine();
	    pjLine.trandate = row.getValue('trandate', null, 'GROUP');
	    pjLine.tranid = row.getValue('tranid', null, 'GROUP');
	    pjLine.memo = row.getValue('memomain', null, 'GROUP');
	    pjLine.type = row.getValue('type', null, 'GROUP');
	    pjLine.vatregnumber = row.getValue('vatregnumber', 'vendor', 'GROUP'); // Vendor TIN
	    pjLine.address = row.getValue('billaddress', 'vendor', 'GROUP');
	    pjLine.entityid = row.getValue('entityid', 'vendor', 'GROUP');
	    pjLine.isindividual = row.getValue('isperson', 'vendor', 'GROUP') == 'T';
	    pjLine.firstname = row.getValue('firstname', 'vendor', 'GROUP');
	    pjLine.lastname = row.getValue('lastname', 'vendor', 'GROUP');
	    pjLine.companyname = row.getValue('companyname', 'vendor', 'GROUP');
	    pjLine.discount =  row.getValue(this.discount);
	    pjLine.gross = row.getValue(this.gross);
	    pjLine.taxtotal = row.getValue(this.taxtotal);
	    return pjLine;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.PH.DAO.PurchaseJournalLineDao.rowToObject', ex.toString());
        throw ex;
    }
};