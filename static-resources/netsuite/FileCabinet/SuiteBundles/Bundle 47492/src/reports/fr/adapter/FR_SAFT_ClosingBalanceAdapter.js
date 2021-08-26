/**
 * Copyright © 2016, 2017, Oracle and/or its affiliates. All rights reserved.
 */

 
if (!TAF) { var TAF = {}; }
TAF.Report = TAF.Report || {};
TAF.Report.Adapter = TAF.Report.Adapter || {};

TAF.Report.Adapter.ClosingBalanceAdapter = function ClosingBalanceAdapter(params) {
    TAF.Report.Adapter.AccountBalanceAdapter.call(this, params);
};

TAF.Report.Adapter.ClosingBalanceAdapter.prototype = Object.create(TAF.Report.Adapter.AccountBalanceAdapter.prototype);

TAF.Report.Adapter.ClosingBalanceAdapter.prototype.getBalances = function getBalances(line) {
    var balances = {debit: 0, credit: 0};
    var balance = 0;
    
    if (line.isLeftSide === 'T') {
        balance = Number(line.debit) - Number(line.credit);
        balances.credit = balance >= 0 ? balance : 0;
        balances.debit = balance < 0 ? Math.abs(balance) : 0;
    } else {
        balance = Number(line.credit) - Number(line.debit);
        balances.debit = balance >= 0 ? balance : 0;
        balances.credit = balance < 0 ? Math.abs(balance) : 0;
    }
    
    return balances;
};
