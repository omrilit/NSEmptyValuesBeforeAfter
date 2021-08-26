/**
 * Copyright 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.Report = TAF.Report || {};
TAF.Report.ES_SII_IntraCommunityTransaction_Report = function _ES_SII_IntraCommunityTransaction_Report(state, params, output, job) {
    this.GetOutline = function() {
        return { 'Section': TAF.ES.Section.SIIMainSection.bind(this, state, params, output, job), 'SubSections': [
                { 'Section': TAF.ES.Section.SIIHeaderSection.bind(this, state, params, output, job) }, // Cabecera
                { 'Section': TAF.ES.Section.IntraCommunityTransactionRegisterSection.bind(this, state, params, output, job) } // RegistroLRDetOperacionIntracomunitaria
        ]};
    };
};

function ES_SII_IntraCommunityTransaction_Report(state, params, output, job) {
    params.formatter = new TAF.ES.Formatter.IntraCommunityTransactionFormatter();
    params.filename = '';
    params.reportId = TAF.SII.CONSTANTS.REPORT.INTRA_COMMUNITY_TRANSACTION;
    TAF.Report.ES_SII_IntraCommunityTransaction_Report.call(this, state, params, output, job);
}
ES_SII_IntraCommunityTransaction_Report.prototype = Object.create(TAF.Report.ES_SII_IntraCommunityTransaction_Report.prototype);
ES_SII_IntraCommunityTransaction_Report.IsCRGReport = true;
ES_SII_IntraCommunityTransaction_Report.ReportId = TAF.SII.CONSTANTS.REPORT.INTRA_COMMUNITY_TRANSACTION;
