/**
 * Copyright © 2016, 2018, Oracle and/or its affiliates. All rights reserved.
 */

 
if (!TAF) { var TAF = {}; }
TAF.Report = TAF.Report || {};
TAF.Report.Adapter = TAF.Report.Adapter || {};

TAF.Report.Adapter.AccountBalanceAdapter = function AccountBalanceAdapter(params) {
    this.accountsMap = params.accountsMap;
    this.date = params.date;
    this.resource = params.resource;
    this.usesAccountingContext = params.usesAccountingContext;
    this.companyLegalName = params.companyLegalName;
};

TAF.Report.Adapter.AccountBalanceAdapter.prototype.getBalanceLine = function getBalanceLine(line) {
    var balances = this.getBalances(line);
    
    if (!(balances.debit + balances.credit)) {
        return null;
    }
    
    var account = this.accountsMap[line.internalId];
    var balance = new TAF.FR.Adapter.SAFT();
    
    try {
        var accountInfo = this.getAccountInfo(account);
        balance.compteNum = accountInfo.number;
        balance.compteLib = accountInfo.name;
        balance.journalCode = this.resource.type;
        balance.journalLib = this.resource.description;
        balance.ecritureNum = this.resource.type + '1';
        balance.ecritureDate = this.date;
        balance.pieceRef = this.resource.pieceRef;
        balance.pieceDate = this.date;
        balance.ecritureLib = this.resource.longDescription;
        balance.debit = balances.debit;
        balance.credit = balances.credit;
        balance.validDate = this.date;
        balance.montantDevise = '';
        balance.iDevise = '';
        balance.compAuxNum = '';
        balance.compAuxLib = '';
        balance.ecritureLet = '';
        balance.dateLet = '';
        balance.establishmentCode = this.companyLegalName;
    } catch(ex) {
        nlapiLogExecution('ERROR', 'TAF.Report.Adapter.AccountBalanceAdapter.getBalanceLine', ex.toString());
        throw ex;
    }
    
    return balance;
};

TAF.Report.Adapter.AccountBalanceAdapter.prototype.getAccountInfo = function getAccountInfo(account) {
    var accountInfo = {
        number: '',
        name: ''
    };

    if(this.usesAccountingContext){
        accountInfo.number = account.getLocalizedNumber() || account.getAccountNumber();
        accountInfo.name = account.getLocalizedName() || account.getAccountName();
    } else {
        accountInfo.number = account.getSCOANumber() || account.getAccountNumber();
        accountInfo.name = account.getSCOAName() || account.getAccountName();
    }

    if (accountInfo.number && accountInfo.name.indexOf(accountInfo.number) === 0) {
        accountInfo.name = accountInfo.name.replace(accountInfo.number + ' ', ''); // only replace the first occurrence
    }

    return accountInfo;
};

TAF.Report.Adapter.AccountBalanceAdapter.prototype.getBalances = function getBalances(line) {
    var balances = {debit: 0, credit: 0};
    var balance = 0;
    
    if (line.isLeftSide === 'T') {
        balance = Number(line.debit) - Number(line.credit);
        balances.debit = balance >= 0 ? balance : 0;
        balances.credit = balance < 0 ? Math.abs(balance) : 0;
    } else {
        balance = Number(line.credit) - Number(line.debit);
        balances.credit = balance >= 0 ? balance : 0;
        balances.debit = balance < 0 ? Math.abs(balance) : 0;
    }
    
    return balances;
};
