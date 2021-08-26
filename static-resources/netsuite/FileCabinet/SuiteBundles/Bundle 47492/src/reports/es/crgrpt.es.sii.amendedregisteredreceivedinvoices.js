/**
 * Copyright 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.Report = TAF.Report || {};
TAF.Report.ES_SII_AmendedRegisteredReceivedInvoices_Report = function _ES_SII_ReceivedInvoices_Report(state, params, output, job) {
    this.GetOutline = function() {
        return { 'Section': TAF.ES.Section.SIIMainSection.bind(this, state, params, output, job), 'SubSections': [
                { 'Section': TAF.ES.Section.SIIHeaderSection.bind(this, state, params, output, job) },
                { 'Section': TAF.ES.Section.ReceivedInvoiceRegisterSection.bind(this, state, params, output, job) }
        ]};
    };
};

function ES_SII_AmendedRegisteredReceivedInvoices_Report(state, params, output, job) {
    params.formatter = new TAF.ES.Formatter.ReceivedInvoiceFormatter('ReceivedInvoices_ErrorCorrection');
    params.filename = '';
    params.reportId = TAF.SII.CONSTANTS.REPORT.RECEIVED_INVOICE_AMENDED_REGISTERED;
    params.submissionType = TAF.SII.CONSTANTS.SUBMISSION_TYPE.UPDATE;
    params.registrationStatus = TAF.SII.CONSTANTS.TRANSACTION.STATUS.REGISTERED_WITH_ERRORS;
    TAF.Report.ES_SII_AmendedRegisteredReceivedInvoices_Report.call(this, state, params, output, job);
}
ES_SII_AmendedRegisteredReceivedInvoices_Report.prototype = Object.create(TAF.Report.ES_SII_AmendedRegisteredReceivedInvoices_Report.prototype);
ES_SII_AmendedRegisteredReceivedInvoices_Report.IsCRGReport = true;
ES_SII_AmendedRegisteredReceivedInvoices_Report.ReportId = TAF.SII.CONSTANTS.REPORT.RECEIVED_INVOICE_AMENDED_REGISTERED;
