/**
 * Copyright 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.MY = TAF.MY || {};
TAF.MY.Adapter = TAF.MY.Adapter || {};

TAF.MY.Adapter.GeneralLedger = function _GeneralLedger() {
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

TAF.MY.Adapter.GeneralLedgerAdapter = function _GeneralLedgerAdapter(params) {
    this.DEFAULT_DATE = '12/31/9999';
    this.OPENING_BALANCE = 'OPENING BALANCE';
    
    this.totals = params.totals || {};
    this.balances = params.balances || {};
    this.startDate = params.startDate || this.DEFAULT_DATE;
    this.accounts = params.accounts;
};

TAF.MY.Adapter.GeneralLedgerAdapter.prototype.getGeneralLedger = function _getGeneralLedger(glLine) {
    if (!glLine) {
        throw nlapiCreateError('DATA_ERROR', 'TAF.MY.Adapter.GeneralLedgerAdapter.getGeneralLedger: Parameter is invalid');
    }

    var generalLedger = new TAF.MY.Adapter.GeneralLedger();
    try {
        var account = this.accounts[glLine.accountId];
        generalLedger.transactionDate = glLine.date || this.DEFAULT_DATE;        generalLedger.accountID = account.getLocalizedNumber() || account.getAccountNumber() || account.getAccountId();        generalLedger.accountName = account.getLocalizedName() || account.getAccountName();
        generalLedger.transactionDescription = glLine.memo || glLine.memoMain;
        generalLedger.name = glLine.entity || glLine.mainName;
        generalLedger.transactionID = glLine.id;
        generalLedger.sourceDocumentID = glLine.tranId || glLine.transactionNumber;
        generalLedger.sourceType = glLine.typeText;
        generalLedger.debit = parseFloat(glLine.debitAmount || 0);
        generalLedger.credit = parseFloat(glLine.creditAmount || 0);
        generalLedger.balance = this.computeBalance(glLine.accountId, generalLedger.debit, generalLedger.credit);
        
        this.updateTotalAmounts(generalLedger.debit, generalLedger.credit);
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.MY.Adapter.GeneralLedgerAdapter.getGeneralLedger', ex.toString());
        throw nlapiCreateError('DATA_ERROR', 'TAF.MY.Adapter.GeneralLedgerAdapter.getGeneralLedger');
    }

    return generalLedger;
};

TAF.MY.Adapter.GeneralLedgerAdapter.prototype.getOpeningBalanceLine = function _getOpeningBalanceLine(glLine) {
    if (!glLine) {
        throw nlapiCreateError('DATA_ERROR', 'TAF.MY.Adapter.GeneralLedgerAdapter.getOpeningBalanceLine: Parameter is invalid');
    }
    
    var generalLedger = new TAF.MY.Adapter.GeneralLedger();
    
    try {
        var account = this.accounts[glLine.accountId];
        generalLedger.transactionDate = this.startDate;        generalLedger.accountID = account.getLocalizedNumber() || account.getAccountNumber() || account.getAccountId();        generalLedger.accountName = account.getLocalizedName() || account.getAccountName();
        generalLedger.transactionDescription = this.OPENING_BALANCE;
        generalLedger.balance = this.balances[glLine.accountId].amount;
        
        this.updateTotalBalance(generalLedger.balance);
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.MY.Adapter.GeneralLedgerAdapter.getOpeningBalanceLine', ex.toString());
        throw nlapiCreateError('DATA_ERROR', 'TAF.MY.Adapter.GeneralLedgerAdapter.getOpeningBalanceLine');
    }

    return generalLedger;
};

TAF.MY.Adapter.GeneralLedgerAdapter.prototype.updateTotalBalance = function _updateTotalBalance(balance) {
    this.totals.ledgerLines++;
    this.totals.ledgerBalance = parseFloat(this.totals.ledgerBalance || 0) + parseFloat(balance || 0);
};

TAF.MY.Adapter.GeneralLedgerAdapter.prototype.updateTotalAmounts = function _updateTotalAmounts(debit, credit) {
    this.totals.ledgerLines++;
    this.totals.ledgerDebit += parseFloat(debit || 0) ;
    this.totals.ledgerCredit += parseFloat(credit || 0);
    this.totals.ledgerBalance = parseFloat(this.totals.ledgerBalance || 0) + parseFloat(debit || 0) - parseFloat(credit || 0);
};

TAF.MY.Adapter.GeneralLedgerAdapter.prototype.computeBalance = function _computeBalance(accountId, debit, credit) {
    this.balances[accountId].amount = this.balances[accountId].amount + debit - credit;
    return this.balances[accountId].amount;
};

TAF.MY.Adapter.TrialBalanceAdapter = function _TrialBalanceAdapter() {
};

TAF.MY.Adapter.TrialBalanceAdapter.prototype.getOpeningBalanceObject = function _getOpeningBalanceObject(trialBalanceList) {
    var reduceFunction = function(list, entry) {
        list[entry.id] = {
            amount: entry.amount,
            isDisplayed: false
        };
        return list;
    };
    return trialBalanceList.reduce(reduceFunction, {});
};
