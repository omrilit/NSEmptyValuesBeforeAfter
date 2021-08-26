/**
 * Copyright © 2015, 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.FR = TAF.FR || {};
TAF.FR.DAO = TAF.FR.DAO || {};

TAF.FR.DAO.PEJ_BalanceSheetClosingSAFTLine = function _PEJ_BalanceSheetClosingSAFTLine(id) {
	return {
		id: id,
		internalId: '',
		type: '',
		typeCode: '',
		date: '',
		account: '',
		tranId: '',
		memo: '',
		memoMain: '',
		debit: '',
		credit: '',
		amount: '',
		fxAmount: '',
		currency: '',
		glNumber: '',
		transactionNumber: '',
		posting: '',
		accountName: '',
        documentDate: '',
        subsidiaryLegalName: '',
        subsidiaryCurrency: '',
        glNumDate: ''
	};
};

TAF.FR.DAO.PEJ_BalanceSheetClosingDao = function _PEJ_BalanceSheetClosingDao() {
    TAF.DAO.SearchDAO.call(this);
	
	this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_taf_fr_pej_saft_transaction';

    this.isMulticurrencyEnabled = this.context.getFeature('MULTICURRENCY');
    this.isGLNumberingEnabled = this.context.getFeature('GLAUDITNUMBERING');
    this.isProjectsEnabled = this.context.getFeature('JOBS');
    this.isTranNumberAvailable = (this.context.getVersion() >= 2014.1);
    
    if (!this.isOneWorld) {
    	this.companyInfo = new TAF.DAO.CompanyDao().getInfo();
    }
};

TAF.FR.DAO.PEJ_BalanceSheetClosingDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.FR.DAO.PEJ_BalanceSheetClosingDao.prototype.createSearchColumns = function _createSearchColumns(params) {
    if (this.isMulticurrencyEnabled) {
        this.columns.push(new nlobjSearchColumn('currency'));
        this.columns.push(new nlobjSearchColumn('fxamount'));
    }
    if (this.isGLNumberingEnabled) {
        this.columns.push(new nlobjSearchColumn('glnumber', this.multiBookJoinColumn));
        this.columns.push(new nlobjSearchColumn('glnumberdate', this.multiBookJoinColumn));
    }
    if (this.isTranNumberAvailable) {
        this.columns.push(new nlobjSearchColumn('transactionnumber'));
    }
    if (this.isOneWorld) {
        this.columns.push(new nlobjSearchColumn('legalname', 'subsidiary'));
        this.columns.push(new nlobjSearchColumn('currency', 'subsidiary'));
    }
	
    this.columns.push(new nlobjSearchColumn('account', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('debitamount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('creditamount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('amount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('posting', this.multiBookJoinColumn));
};

TAF.FR.DAO.PEJ_BalanceSheetClosingDao.prototype.createSearchFilters = function _createSearchFilters(params) {
	if(!params) {
		throw nlapiCreateError('MISSING_PARAMETER', 'params is required');
	}
	
	if(!params.periodId) {
		throw nlapiCreateError('MISSING_PARAMETER', 'params.periodIds is required');
	}

	this.filters.push(new nlobjSearchFilter('postingperiod', null, 'is', params.periodId));
	this.filters.push(new nlobjSearchFilter('accounttype', this.multiBookJoinColumn, 'noneof', '@NONE@'));
	this.filters.push(new nlobjSearchFilter('voided', null, 'is', 'F', null, 1, 0, false, true));
	this.filters.push(new nlobjSearchFilter('debitamount', this.multiBookJoinColumn, 'isempty', null, null, 0, 0, false));
	this.filters.push(new nlobjSearchFilter('creditamount', this.multiBookJoinColumn, 'isempty', null, null, 0, 1, false));

    if (this.isOneWorld) {
		this.filters.push(new nlobjSearchFilter('subsidiary', this.multiBookJoinColumn, 'anyof', params.subIds));
		this.filters.push(new nlobjSearchFilter('sourcesubsidiary', null, 'anyof', params.subIds));
    }
    
    var accountList = [];
    for (var i=0; i < (params.subIds && params.subIds.length); i++) {
        var subsidiarySetting = nlapiLoadRecord("subsidiarysettings", params.subIds[i]);
        var incomesummaryprofitaccount = subsidiarySetting.getFieldValue('balancesheetclosingaccount');
        var incomesummarylossaccount = subsidiarySetting.getFieldValue('balancesheetopeningaccount');
        accountList.push(incomesummaryprofitaccount);
        accountList.push(incomesummarylossaccount);
    }
    this.filters.push(new nlobjSearchFilter('accountmain', this.multiBookJoinColumn, 'anyof', accountList));
	
    if (this.isMultiBook && params.bookId) {
        this.filters.push(new nlobjSearchFilter('accountingbook', this.multiBookJoinColumn, 'is', params.bookId));
	}
};

TAF.FR.DAO.PEJ_BalanceSheetClosingDao.prototype.rowToObject = function _rowToObject(row) {
	if (!row) {
		throw nlapiCreateError('MISSING_PARAMETER', 'row is required');
	}
	
	var saftLine = new TAF.FR.DAO.PEJ_BalanceSheetClosingSAFTLine(row.getId());
	saftLine.internalId = row.getValue('internalid');
	saftLine.date = row.getValue('trandate');
	saftLine.tranId = row.getValue('tranid');
	saftLine.memo = row.getValue('memo');
	saftLine.memoMain = row.getValue('memomain');

	saftLine.documentDate = row.getValue('custbody_document_date');
    saftLine.type = row.getText('type');
    saftLine.typeCode = row.getValue('type');
    
    saftLine.account = row.getValue('account', this.multiBookJoinColumn);
    saftLine.debit = row.getValue('debitamount', this.multiBookJoinColumn);
    saftLine.credit = row.getValue('creditamount', this.multiBookJoinColumn);
    saftLine.amount = row.getValue('amount', this.multiBookJoinColumn);
    saftLine.posting = row.getValue('posting', this.multiBookJoinColumn);
    saftLine.accountName = row.getText('account', this.multiBookJoinColumn);

	if (this.isMulticurrencyEnabled) {
        saftLine.currency = row.getText('currency');
		saftLine.fxAmount = row.getValue('fxamount');
	}
	if (this.isGLNumberingEnabled) {
		saftLine.glNumber = row.getValue('glnumber', this.multiBookJoinColumn);
		saftLine.glNumDate = row.getValue('glnumberdate', this.multiBookJoinColumn);
	}
	if (this.isTranNumberAvailable) {
		saftLine.transactionNumber = row.getValue('transactionnumber');
	}
	if (this.isOneWorld) {
        saftLine.subsidiaryLegalName = row.getValue('legalname', 'subsidiary') || '';
        saftLine.subsidiaryCurrency = row.getText('currency', 'subsidiary') || '';
	} else {
		saftLine.subsidiaryLegalName = this.companyInfo.legalName || '';
	}
	
	return saftLine;
};
