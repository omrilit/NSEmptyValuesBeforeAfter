/**
 * Copyright © 2016, 2017, Oracle and/or its affiliates. All rights reserved.
 */
 
var TAF = TAF || {};
TAF.PT = TAF.PT || {};
TAF.PT.Adapter = TAF.PT.Adapter || {};

TAF.PT.Adapter.GeneralLedgerEntriesAdapter = function GeneralLedgerEntriesAdapter(params) {
    TAF.PT.Adapter.SaftAdapter.call(this, params);
    this.name = 'GeneralLedgerEntriesAdapter';
    this.fiscalMonth = (params && params.fiscalMonth) || 0;
    this.periods = (params && params.periods) || {};
    this.accounts = (params && params.accounts) || {};
    this.usesAccountingContext = (params && params.usesAccountingContext) || false;
};

TAF.PT.Adapter.GeneralLedgerEntriesAdapter.prototype = Object.create(TAF.PT.Adapter.SaftAdapter.prototype);

TAF.PT.Adapter.GeneralLedgerEntriesAdapter.prototype.getSummary = function getSummary(raw) {
    raw = raw || {};
    var companyId = this.context.getCompany();
    
    return {
        companyId: companyId,
        journalDescription: companyId + ' Main Journal',
        count: raw.count || 0,
        totalDebit: raw.debit || 0,
        totalCredit: raw.credit || 0
    };
};

TAF.PT.Adapter.GeneralLedgerEntriesAdapter.prototype.getTransactionHeader = function getTransactionHeader(raw) {
    raw = raw || {};
    
    var description =  raw.memoMain || raw.type || '';
    description = description.replace(/(&lt;|&gt;|'|"|&)/g, ' ');
    
    return {
        tranDate: raw.tranDate || '',
        companyId: this.context.getCompany(),
        internalId: raw.internalId || '',
        fiscalPeriod: this.getFiscalPeriod(this.periods[raw.postingPeriod]),
        createdBy: raw.createdBy || this.UNKNOWN,
        transactionDescription:description,
        postingDate: raw.tranDate || '',
        entityTag: raw.customerId ? 'CustomerID' : 'SupplierID',
        entityId: raw.customerId || raw.vendorId || ''
    };
};

TAF.PT.Adapter.GeneralLedgerEntriesAdapter.prototype.getTransactionLine = function getTransactionLine(raw) {
    raw = raw || {};
    var account = this.accounts[raw.account];
    var accountNumber = null;
    
    if(this.usesAccountingContext){
        accountNumber =  account ? account.getLocalizedNumber() || account.getAccountNumber() || '' : '';
    } else {
        accountNumber =  account ? account.getSCOANumber() || account.getAccountNumber() || '' : '';
    }
    
    var memoText =  raw.memo || this.UNKNOWN;
    memoText = memoText.replace(/(&lt;|&gt;|'|"|&)/g, ' ');
    
    return {
        lineId: raw.lineId || '',
        accountNumber: accountNumber || '',
        entryDate: this.getEntryDate(raw),
        memo: memoText,
        lineTag: raw.debit ? 'DebitLine' : 'CreditLine',
        amountTag: raw.debit ? 'DebitAmount' : 'CreditAmount',
        amount: raw.debit || raw.credit || 0
    };
};

TAF.PT.Adapter.GeneralLedgerEntriesAdapter.prototype.getFiscalPeriod = function getFiscalPeriod(period) {
    if (!period) {
        return '';
    }
    
    var month = nlapiStringToDate(period.startDate).getMonth();
    var offset = 12 - this.fiscalMonth;
    return ((month + offset) % 12) + 1;
};
