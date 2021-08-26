/**
 * Copyright © 2017, 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.Report = TAF.Report || {};
TAF.Report.ES_SII_ReceivedInvoiceCorrectedAmendingTxn_Report = function _ES_SII_ReceivedInvoiceCorrectedAmendingTxn_Report(state, params, output, job) {
    this.GetOutline = function() {
        return { 'Section': TAF.ES.Section.SIIMainSection.bind(this, state, params, output, job), 'SubSections': [
                { 'Section': TAF.ES.Section.SIIHeaderSection.bind(this, state, params, output, job) },
                { 'Section': TAF.ES.Section.ReceivedInvoiceAmendingTxnSection.bind(this, state, params, output, job) }
        ]};
    };
};

function ES_SII_ReceivedInvoiceCorrectedAmendingTxn_Report(state, params, output, job) {
    params.formatter = new TAF.ES.Formatter.ReceivedInvoiceFormatter('ReceivedInvoices_CorrectedAmendingTransactions');
    params.filename = '';
    params.reportId = TAF.SII.CONSTANTS.REPORT.RECEIVED_INVOICE_CORRECTED_AMENDING_TXN;
    params.submissionType = TAF.SII.CONSTANTS.SUBMISSION_TYPE.UPDATE;
    params.registrationStatus = TAF.SII.CONSTANTS.TRANSACTION.STATUS.REGISTERED_WITH_ERRORS;
    TAF.Report.ES_SII_ReceivedInvoiceCorrectedAmendingTxn_Report.call(this, state, params, output, job);
}
ES_SII_ReceivedInvoiceCorrectedAmendingTxn_Report.prototype = Object.create(TAF.Report.ES_SII_ReceivedInvoiceCorrectedAmendingTxn_Report.prototype);
ES_SII_ReceivedInvoiceCorrectedAmendingTxn_Report.IsCRGReport = true;
ES_SII_ReceivedInvoiceCorrectedAmendingTxn_Report.ReportId = TAF.SII.CONSTANTS.REPORT.RECEIVED_INVOICE_CORRECTED_AMENDING_TXN;
