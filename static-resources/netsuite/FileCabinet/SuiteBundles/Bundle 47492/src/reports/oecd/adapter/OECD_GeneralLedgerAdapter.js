/**
 * Copyright 2016 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */
 
var TAF = TAF || {};
TAF.OECD = TAF.OECD || {};
TAF.OECD.Adapter = TAF.OECD.Adapter || {};

TAF.OECD.Adapter.GeneralLedgerAdapter = function GeneralLedgerAdapter() {
};

TAF.OECD.Adapter.GeneralLedgerAdapter.prototype.getBalances = function getBalances(data) {
    data = data || {};
    
    var isLeftSide = data.isLeftSide === 'T';
    var balances = {amount: 0, amountTag: ''};
    
    var balance = isLeftSide ?
        parseFloat(data.closingDebit || 0) - parseFloat(data.closingCredit || 0) - parseFloat(data.debit || 0) + parseFloat(data.credit || 0):
        parseFloat(data.closingCredit || 0) - parseFloat(data.closingDebit || 0) + parseFloat(data.debit || 0) - parseFloat(data.credit || 0);
    
    balances.amount = Math.abs(balance);
    balances.amountTag = isLeftSide ?
        (balance >= 0 ? 'OpeningDebitBalance' : 'OpeningCreditBalance') :
        (balance >= 0 ? 'OpeningCreditBalance' : 'OpeningDebitBalance')
    
    return balances;
};
