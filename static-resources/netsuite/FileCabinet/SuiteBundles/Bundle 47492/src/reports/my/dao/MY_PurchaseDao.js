/**
 * Copyright 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.MY = TAF.MY || {};
TAF.MY.DAO = TAF.MY.DAO || {};

TAF.MY.DAO.Purchase = function _Purchase(id) {
	var txn = {
		id : id,
		lineNo : '',
		lineSequenceNo : '',
		isJournal : '',
		internalRecordType: '',
		type : '',
		mainName : '',
		entity : '',
		tranDate : '',		
		tranId : '',
		transactionNumber : '',
		memo : '',
		item : '',
		account : '',
		signedAmount : '',
		netAmount : '',
		taxAmount : '',
		taxCode : '',
		currency : '',
		fxAmount : '',
		exchangeRate : '',
		myBrn : '',
		myImportDeclarationNumber : '',
        bookExchangeRate: 1
	};
	return txn;
};

TAF.MY.DAO.PurchaseDao = function _PurchaseDao() {
	TAF.DAO.SearchDAO.call(this);

	this.savedSearchId = 'customsearch_taf_my_gaf_purchase_lines';
	this.recordType = 'transaction';
};
TAF.MY.DAO.PurchaseDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.MY.DAO.PurchaseDao.prototype.createSearchFilters = function _createSearchFilters(params) {
    if(!params || !params.periodIdList) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params.periodIdList is required');
    }

    this.filters = [new nlobjSearchFilter('internalid', 'accountingperiod', 'anyof', params.periodIdList)];

    if (this.isOneWorld && params.subsidiaryIdList) {
        this.filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', params.subsidiaryIdList));
    }

    if (this.isMultiBook && params.bookId) {
        this.filters.push(new nlobjSearchFilter('accountingbook', this.multiBookJoinColumn, 'is', params.bookId));
    }
};

TAF.MY.DAO.PurchaseDao.prototype.createSearchColumns = function _createSearchColumns(params) {
    if (!params) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params is required');
    }

    this.columns.push(new nlobjSearchColumn('account', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('netamount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('accounttype', this.multiBookJoinColumn));

    if (this.multicurrency) {
        this.columns.push(new nlobjSearchColumn('currency'));
        this.columns.push(new nlobjSearchColumn('fxamount'));
        this.columns.push(new nlobjSearchColumn('exchangerate'));
        
        if (this.isMultiBook && params.bookId) {
            this.columns.push(new nlobjSearchColumn('exchangerate', this.multiBookJoinColumn));
        }
    }
};

TAF.MY.DAO.PurchaseDao.prototype.rowToObject = function _rowToObject(row) {

	if (!row) {
		throw nlapiCreateError('MISSING_PARAMETER', 'row is null or undefined.');
		nlapiLogExecution('ERROR', 'TAF.MY.DAO.PurchaseDao.rowToObject MISSING_PARAMETER', 'row is null or undefined.');
	}

	var txn = new TAF.MY.DAO.Purchase(row.getId());
	txn.lineNo = row.getValue('line');
	txn.lineSequenceNo = row.getValue('linesequencenumber');
	txn.type = row.getValue('type');
	txn.isJournal = row.getValue('type') === 'Journal';
	txn.internalRecordType = row.getValue('recordtype');
	txn.mainName = row.getText('mainname');
	txn.entity = row.getText('entity');	
	txn.tranDate = row.getValue('trandate');	
	txn.tranId = row.getValue('tranid');
	txn.transactionNumber = row.getValue('transactionnumber');
	txn.memo = row.getValue('memo');
	txn.item = row.getText('item');
	txn.account = row.getText('account', this.multiBookJoinColumn);
	txn.signedAmount = row.getValue('signedamount');
	txn.netAmount = row.getValue('netamount', this.multiBookJoinColumn);
	txn.taxAmount = row.getValue('taxamount');
	txn.taxCode = row.getText('taxcode');
	txn.myBrn = row.getValue('custentity_my_brn', 'vendor');
	txn.myImportDeclarationNumber = row.getValue('custbody_my_import_declaration_num');

	if (this.multicurrency) {
		txn.currency = row.getValue('currency');
		txn.fxAmount = row.getValue('fxamount');
		txn.exchangeRate = row.getValue('exchangerate');

        if (this.multiBookJoinColumn) {
            txn.bookExchangeRate = row.getValue('exchangerate', this.multiBookJoinColumn);
        }
	}

	return txn;
};

