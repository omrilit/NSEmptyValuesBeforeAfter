/**
 * Copyright 2016 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */
 
var TAF = TAF || {};
TAF.PT = TAF.PT || {};
TAF.PT.Adapter = TAF.PT.Adapter || {};

TAF.PT.Adapter.SalesInvoicesAdapter = function SalesInvoicesAdapter(params) {
    TAF.PT.Adapter.SaftAdapter.call(this, params);
    this.name = 'SalesInvoicesAdapter';
};

TAF.PT.Adapter.SalesInvoicesAdapter.prototype = Object.create(TAF.PT.Adapter.SaftAdapter.prototype);

TAF.PT.Adapter.SalesInvoicesAdapter.prototype.getSummary = function getSummary(raw) {
    return {
        count: isNaN(raw.count) ? 0 : raw.count,
        totalDebit: isNaN(raw.debit) ? 0 : raw.debit,
        totalCredit: isNaN(raw.credit) ? 0 : raw.credit
    };
};
