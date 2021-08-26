/**
 * Copyright 2015 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.PT = TAF.PT || {};
TAF.PT.Formatter = TAF.PT.Formatter || {};
TAF.PT.Formatter.SAFT = TAF.PT.Formatter.SAFT || {};

TAF.PT.Formatter.SAFT.SalesInvoicesFormatter = function SalesInvoicesFormatter() {
    TAF.PT.Formatter.SAFT.BaseFormatter.call(this);
    
    this.fields = {
        count: {type: TAF.Formatter.FieldTypes.INTEGER},
        totalDebit: {type: TAF.Formatter.FieldTypes.DECIMAL},
        totalCredit: {type: TAF.Formatter.FieldTypes.DECIMAL},
    };
    
    this.templates = {
        SUMMARY: [
            '<SalesInvoices>',
                '<NumberOfEntries>{count}</NumberOfEntries>',
                '<TotalDebit>{totalDebit}</TotalDebit>',
                '<TotalCredit>{totalCredit}</TotalCredit>'
        ].join(''),
        
        FOOTER:
            '</SalesInvoices>'
    }
};

TAF.PT.Formatter.SAFT.SalesInvoicesFormatter.prototype = Object.create(TAF.PT.Formatter.SAFT.BaseFormatter.prototype);

TAF.PT.Formatter.SAFT.SalesInvoicesFormatter.prototype.formatSummary = function formatSummary(data) {
    return this.formatElement(data, this.templates.SUMMARY);
};

TAF.PT.Formatter.SAFT.SalesInvoicesFormatter.prototype.formatFooter = function formatFooter() {
    return this.formatElement({}, this.templates.FOOTER);
};
