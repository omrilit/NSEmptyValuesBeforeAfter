/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.MX = TAF.MX || {};
TAF.MX.Adapter = TAF.MX.Adapter || {};


TAF.MX.Adapter.HeaderOut = function _HeaderOut() {
	return {
		RFC: '',
		month: '',
		year: '',
	};
};

TAF.MX.Adapter.HeaderIn = function _HeaderIn() {
	return {
		dateCreated: new Date(),
		subsidiaryInfo: {},
		companyInfo: {}
	};
};


TAF.MX.Adapter.BodyLineOut = function _BodyLineOut() {
	return {
		sortIndex: 0,
		groupCode: '',
		accountNumber: '',
		description: '',
		accountLevel: '',
		accountType: ''
	};
};

TAF.MX.Adapter.BodyLineIn = function _BodyLineIn() {
	return {
		account: {},
		mapping: {},
	};
};


TAF.MX.Adapter.BodyOut = function _BodyOut() {
	return {
		bodyLinesOut: []
	};
};

TAF.MX.Adapter.BodyIn = function _BodyIn() {
	return {
		bodyLinesIn: [],
	};
};

TAF.MX.Adapter.COAAdapter = function _COAAdapter() {
	this.isOneWorld = nlapiGetContext().getSetting('FEATURE', 'SUBSIDIARIES') === 'T';
	this.accountTypeMap = {
		'D': ['AcctRec', 'Bank', 'DeferExpense', 'FixedAsset', 'OthAsset', 'OthCurrAsset', 'UnbilledRec', 'COGS', 'Expense', 'OthExpense'],
		'A': ['Equity', 'Income', 'OthIncome', 'AcctPay', 'CredCard', 'DeferRevenue', 'LongTermLiab', 'OthCurrLiab']
	};
	this.usesAccountingContext = false;
};

TAF.MX.Adapter.COAAdapter.prototype.getHeader = function _getHeader(headerIn) {
	if(!headerIn)
		throw nlapiCreateError('MISSING_PARAMETER', 'Parameter in not assigned');
	
	if(this.isOneWorld){
		if(!headerIn.subsidiaryInfo)
			throw nlapiCreateError('MISSING_PARAMETER', 'Account is one world and subsidiary info missing');
	}
	else if(!headerIn.companyInfo)
		throw nlapiCreateError('MISSING_PARAMETER', 'Company info missing');

	var dateCreated = headerIn.dateCreated;
	if(Object.prototype.toString.call(dateCreated) !== '[object Date]')
		throw nlapiCreateError('INVALID_DATA', 'Invalid Date');

	var header = new TAF.MX.Adapter.HeaderOut();
	header.month = (dateCreated.getMonth() + 1).toString();
	header.year = dateCreated.getFullYear().toString();
	header.RFC = this.isOneWorld ?
		headerIn.subsidiaryInfo.getFederalIdNumber() :
		headerIn.companyInfo.employerId;
	return header;
};

TAF.MX.Adapter.COAAdapter.prototype.getAccountTypeMap = function _getAccountTypeMap(){
	return this.accountTypeMap;
};

TAF.MX.Adapter.COAAdapter.prototype.convertToAccountType = function _convertToAccountType(accountType){
	var map = this.getAccountTypeMap();
	return map['D'].indexOf(accountType) != -1 ? 'D':
		map['A'].indexOf(accountType) != -1 ? 'A':'';
};

TAF.MX.Adapter.COAAdapter.prototype.getBodyLine = function _getBodyLine(bodyLineIn) {
	if (!bodyLineIn)
		throw nlapiCreateError('MISSING_PARAMETER', 'Parameter in not assigned');
	
	var account = bodyLineIn.account;
	var mapping = bodyLineIn.mapping;
	
	if (!account)
		throw nlapiCreateError('MISSING_PARAMETER', 'Account not assigned');
	
	var accountLevel = 0;
	var mappingValue = 0.0;
	
	if( mapping && mapping.value_text && 
		!isNaN(mapping.value_text)){
		mappingValue = mapping.value_text; 
		accountLevel = ((parseFloat(mappingValue) % 1) === 0) ? 1: 2;
	}
	
	var accountType = this.convertToAccountType(account.getType());
	if(Object.keys(this.getAccountTypeMap()).indexOf(accountType) == -1){
		throw nlapiCreateError('INVALID_DATA', 'Account type should only be D or A');
	}
	
	var SCOANumber = account.getSCOANumber();
	var SCOAName = account.getSCOAName();
	var accountNumber = account.getAccountNumber();

	var bodyLine = new TAF.MX.Adapter.BodyLineOut();
	if(this.usesAccountingContext){
	    bodyLine.accountNumber = account.getLocalizedNumber() || accountNumber ||account.getAccountId();
	    bodyLine.description = account.getLocalizedName() || account.getAccountName();
    } else {
        bodyLine.accountNumber = SCOANumber || accountNumber || account.getAccountId();
        bodyLine.description = SCOAName || account.getAccountName();
    }
	
	bodyLine.accountType = accountType;
	
	if(accountLevel){
		bodyLine.groupCode = mappingValue.toString();
		bodyLine.accountLevel = accountLevel.toString();
		bodyLine.sortIndex = mappingValue;
	}
	else{
		bodyLine.groupCode = '';
		bodyLine.accountLevel = '';
		bodyLine.sortIndex = 0;	
	}
	return bodyLine;
};

TAF.MX.Adapter.COAAdapter.prototype.getBody = function _getBody(bodyIn) {
	var bodyOut = new TAF.MX.Adapter.BodyOut();
	this.usesAccountingContext = bodyIn.usesAccountingContext;
	
	if (bodyIn && bodyIn.bodyLinesIn && bodyIn.bodyLinesIn.length > 0) {
		var bodyLinesOut = [];
		for (var idx = 0; idx < bodyIn.bodyLinesIn.length; ++idx) {
			bodyLinesOut.push(this.getBodyLine(bodyIn.bodyLinesIn[idx]));
		}
		
		bodyLinesOut.sort(function(a,b){
			return a.sortIndex - b.sortIndex; });
		
		bodyOut.bodyLinesOut = bodyLinesOut;
	}
	
	return bodyOut;
};

TAF.MX.Adapter.COAAdapter.prototype.createBodyIn = function _createBodyIn(accounts, mappings, currentPeriodData, previousPeriodData) {
	var bodyIn = new TAF.MX.Adapter.BodyIn();
	var account;

	for(var i = 0; i < currentPeriodData.length; i++) {
		account = accounts[currentPeriodData[i].id];
		if (!account) {
			continue;
		}

		var mapping = mappings[account.getAccountId()];
		if (!mapping || !mapping.value_text) {
		    continue;
		}

		bodyIn.bodyLinesIn.push(this.createBodyLineIn(account, mapping));
	}

	return bodyIn;
};

TAF.MX.Adapter.COAAdapter.prototype.createBodyLineIn = function _createBodyLineIn(account, mapping) {
	var bodyLineIn = new TAF.MX.Adapter.BodyLineIn();
	bodyLineIn.account = account;
	bodyLineIn.mapping = mapping;
	return bodyLineIn;
};

