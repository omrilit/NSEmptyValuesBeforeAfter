/**
 * Copyright 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.Report = TAF.Report || {};
TAF.Report.ES_SII_IssuedInvoices_Report = function _ES_SII_IssuedInvoices_Report(state, params, output, job) {
    this.GetOutline = function() {
        return { 'Section': TAF.ES.Section.SIIMainSection.bind(this, state, params, output, job), 'SubSections': [
                { 'Section': TAF.ES.Section.SIIHeaderSection.bind(this, state, params, output, job) }, // Cabecera
                { 'Section': TAF.ES.Section.IssuedInvoiceRegisterSection.bind(this, state, params, output, job) } // RegistroLRfacturasEmitidas
        ]};
    };
};

function ES_SII_IssuedInvoices_Report(state, params, output, job) {
    params.formatter = new TAF.ES.Formatter.InvoiceFormatter('IssuedInvoices');
    params.filename = '';
    params.reportId = TAF.SII.CONSTANTS.REPORT.ISSUED_INVOICE;
    TAF.Report.ES_SII_IssuedInvoices_Report.call(this, state, params, output, job);
}
ES_SII_IssuedInvoices_Report.prototype = Object.create(TAF.Report.ES_SII_IssuedInvoices_Report.prototype);
ES_SII_IssuedInvoices_Report.IsCRGReport = true;
ES_SII_IssuedInvoices_Report.ReportId = TAF.SII.CONSTANTS.REPORT.ISSUED_INVOICE;
