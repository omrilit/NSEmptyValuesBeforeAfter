/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.AE = TAF.AE || {};
TAF.AE.Adapter = TAF.AE.Adapter || {};

TAF.AE.Adapter.GeneralLedger = function _GeneralLedger(id) {
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

TAF.AE.Adapter.GeneralLedgerSummary = function _GeneralLedgerSummary() {
	return {
		totalDebit: 0,
		totalCredit: 0,
		gltCurrency: '',
		transactionCountTotal: 0
	};
};

TAF.AE.Adapter.GeneralLedgerAdapter = function _GeneralLedgerAdapter(state) {
	this.OPENING_BALANCE = 'OPENING BALANCE';
	this.DEFAULT_CURRENCY = 'AED';
	this.balance = 0;
	if (state) {
	    this.lastInternalId = state.InternalID;
	    this.glNumber = state.GLNumber;
	    this.isGLSupported = state.IsGLSupported;
	}
};

TAF.AE.Adapter.GeneralLedgerAdapter.prototype.getGeneralLedger = function _getGeneralLedger(glLine) {
	var generalLedger = new TAF.AE.Adapter.GeneralLedger();
	try {
		generalLedger.transactionDate = glLine.date || this.DEFAULT.DATE;		generalLedger.accountID = glLine.localizedNumber || glLine.acctNumber;		generalLedger.accountName = glLine.localizedName || glLine.accountName;
		generalLedger.transactionDescription = glLine.memo || glLine.memoMain;
		generalLedger.name = glLine.type == 'journalentry' ? glLine.entity : glLine.mainName;
		generalLedger.transactionID = glLine.subTranId;
		generalLedger.sourceDocumentID = glLine.tranId;
		generalLedger.sourceType = glLine.typeText;
		generalLedger.debit = glLine.debitAmount || 0;
		generalLedger.credit = glLine.creditAmount || 0;
		generalLedger.balance = this.computeBalance(generalLedger.debit, generalLedger.credit);
	} catch (ex) {
		nlapiLogExecution('ERROR', 'TAF.AE.Adapter.GeneralLedgerAdapter.getGeneralLedger', ex.toString());
	}
	return generalLedger;
};

TAF.AE.Adapter.GeneralLedgerAdapter.prototype.computeBalance = function _computeBalance(debit, credit) {
	var balance = parseFloat(this.balance || 0);
	balance = balance + parseFloat(debit) - parseFloat(credit);
	this.balance = balance;
	return balance;
};

TAF.AE.Adapter.GeneralLedgerAdapter.prototype.getSummary = function _getSummary(glSummary, baseCurrency) {
	var summary = new TAF.AE.Adapter.GeneralLedgerSummary();
	try {
		summary.totalDebit = glSummary.debitAmount || 0;
		summary.totalCredit = glSummary.creditAmount || 0;
		summary.gltCurrency = baseCurrency || this.DEFAULT_CURRENCY;
	} catch (ex) {
		nlapiLogExecution('ERROR', 'TAF.AE.Adapter.GeneralLedgerAdapter.getSummary', ex.toString());
	}
	return summary;
};

TAF.AE.Adapter.GeneralLedgerAdapter.prototype.getBalanceMap = function _getBalanceMap(balances, accounts) {
    var balanceMap = {};
    
    for (var a in accounts) {
        balanceMap[a] = accounts[a];
        balanceMap[a].balance = this.getBalance(balances[a]);
        balanceMap[a].accountId = accounts[a].getAccountId();
    }
    
    return balanceMap;
};

TAF.AE.Adapter.GeneralLedgerAdapter.prototype.getBalance = function _getBalance(account) {
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
