/**
 * Copyright 2016 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */
 
var TAF = TAF || {};
TAF.PT = TAF.PT || {};
TAF.PT.Adapter = TAF.PT.Adapter || {};

TAF.PT.Adapter.GeneralLedgerAdapter = function GeneralLedgerAdapter() {
};

TAF.PT.Adapter.GeneralLedgerAdapter.prototype.getBalances = function getBalances(data) {
    var balances = {openingDebit: 0, openingCredit: 0, closingDebit: 0, closingCredit: 0};
    data = data || {};
    
    balances.closingDebit = parseFloat(data.closingDebit || 0);
    balances.closingCredit = parseFloat(data.closingCredit || 0);
    balances.openingDebit = parseFloat(data.lastDebit || 0) - parseFloat(data.currentDebit || 0);
    balances.openingCredit = parseFloat(data.lastCredit || 0) - parseFloat(data.currentCredit || 0);
    
    return balances;
};
