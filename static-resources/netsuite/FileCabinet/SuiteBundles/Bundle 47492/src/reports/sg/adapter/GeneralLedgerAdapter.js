/**
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.SG = TAF.SG || {};
TAF.SG.Adapter = TAF.SG.Adapter || {};

TAF.SG.Adapter.GeneralLedger = function _GeneralLedger(id) {
	return {
		transactionDate: '',
		accountID: '',
		accountName: '',
		transactionDescription: '',
		name: '',
		transactionID: '',
		sourceDocumentID: '',
		sourceType: '',
		debit: 0,
		credit: 0,
		balance: 0
	};
};

TAF.SG.Adapter.GeneralLedgerSummary = function _GeneralLedgerSummary() {
	return {
		totalDebit: 0,
		totalCredit: 0,
		transactionCountTotal: 0,
		gltCurrency: ''
	};
};

TAF.SG.Adapter.GeneralLedgerAdapter = function _GeneralLedgerAdapter(state) {
	this.OPENING_BALANCE = 'OPENING BALANCE';
	this.DEFAULT_CURRENCY = 'SGD';
	this.DEFAULT_DATE = '12/31/9999';
	this.balance = 0;
	if (state) {
	    this.lastInternalId = state.InternalID;
	    this.glNumber = state.GLNumber;
	    this.isGLSupported = state.IsGLSupported;
	}
};

TAF.SG.Adapter.GeneralLedgerAdapter.prototype.getOpeningBalance = function _getOpeningBalance(accountBalance, params) {
	try {
	    var generalLedger = new TAF.SG.Adapter.GeneralLedger();
	    
		generalLedger.transactionDate = params.startDate || this.DEFAULT_DATE;		generalLedger.accountID = accountBalance.localizedNumber || accountBalance.accountNumber;
	    generalLedger.accountName = accountBalance.localizedName || accountBalance.name;
		generalLedger.transactionDescription = this.OPENING_BALANCE;
		generalLedger.balance = accountBalance.balance || 0;
		this.balance = generalLedger.balance;
		
	    return generalLedger;
	} catch (ex) {
		nlapiLogExecution('ERROR', 'TAF.SG.Adapter.GeneralLedgerAdapter.getOpeningBalance', ex.toString());
		throw nlapiCreateError('DATA_ERROR', 'Unable to convert opening balance');
	}
};

TAF.SG.Adapter.GeneralLedgerAdapter.prototype.getGeneralLedger = function _getGeneralLedger(glLine) {
	var generalLedger = new TAF.SG.Adapter.GeneralLedger();
	try {
		generalLedger.transactionDate = glLine.date || this.DEFAULT_DATE;		generalLedger.accountID = glLine.localizedNumber || glLine.accountNumber;		generalLedger.accountName = glLine.localizedName || glLine.accountName;
		generalLedger.transactionDescription = glLine.memo || glLine.memoMain;
		generalLedger.name = glLine.type == 'journalentry' ? glLine.entity : glLine.mainName;
		generalLedger.transactionID = this.getSubTranId(glLine).toString();
		generalLedger.sourceDocumentID = glLine.tranId;
		generalLedger.sourceType = glLine.typeText;
		generalLedger.debit = glLine.debitAmount || 0;
		generalLedger.credit = glLine.creditAmount || 0;
		generalLedger.balance = this.computeBalance(generalLedger.debit, generalLedger.credit);
	} catch (ex) {
		nlapiLogExecution('ERROR', 'TAF.SG.Adapter.GeneralLedgerAdapter.getGeneralLedger', ex.toString());
	}
	return generalLedger;
};

TAF.SG.Adapter.GeneralLedgerAdapter.prototype.getSubTranId = function _getSubTranId(glLine) {
    if (this.isGLSupported) {
        return glLine.subTranId;
    }
    
    if (this.lastInternalId != glLine.id) {
        this.lastInternalId = glLine.id;
        this.glNumber++;
    }
    
    return this.glNumber;
};

TAF.SG.Adapter.GeneralLedgerAdapter.prototype.computeBalance = function _computeBalance(debit, credit) {
	var balance = parseFloat(this.balance || 0);
	balance = balance + parseFloat(debit) - parseFloat(credit);
	this.balance = balance;
	return balance;
};

TAF.SG.Adapter.GeneralLedgerAdapter.prototype.getSummary = function _getSummary(glSummary, baseCurrency) {
	var summary = new TAF.SG.Adapter.GeneralLedgerAdapter();
	try {
		summary.totalDebit = glSummary.debitAmount || 0;
		summary.totalCredit = glSummary.creditAmount || 0;
		summary.transactionCountTotal = glSummary.noOfLines || 0;
		summary.gltCurrency = baseCurrency || this.DEFAULT_CURRENCY;
	} catch (ex) {
		nlapiLogExecution('ERROR', 'TAF.SG.Adapter.GeneralLedgerAdapter.getSummary', ex.toString());
	}
	return summary;
};

TAF.SG.Adapter.GeneralLedgerAdapter.prototype.getBalanceMap = function _getBalanceMap(balances, accounts) {
    var balanceMap = {};
    
    for (var a in accounts) {
        balanceMap[a] = accounts[a];
        balanceMap[a].balance = this.getBalance(balances[a]);
    }
    
    return balanceMap;
};

TAF.SG.Adapter.GeneralLedgerAdapter.prototype.getBalance = function _getBalance(account) {
    if (!account) {
        return 0;
    }

    if (account.isLeftSide === 'T') {
        account.balance = Number(account.debit) - Number(account.credit);
        account.debit = account.balance >= 0 ? account.balance : 0;
        account.credit = account.balance < 0 ? Math.abs(account.balance) : 0;
    } else {
        account.balance = Number(account.credit) - Number(account.debit);
        account.credit = account.balance >= 0 ? account.balance : 0;
        account.debit = account.balance < 0 ? Math.abs(account.balance) : 0;
    }
    
    return account.balance;
};
