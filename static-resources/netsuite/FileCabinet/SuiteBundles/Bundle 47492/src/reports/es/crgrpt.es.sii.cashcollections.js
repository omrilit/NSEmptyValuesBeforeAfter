/**
 * Copyright � 2017, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.Report = TAF.Report || {};
TAF.Report.ES_SII_CashCollections_Report = function _ES_SII_CashCollections_Report(state, params, output, job) {
    this.GetOutline = function() {
        return { 'Section': TAF.ES.Section.SIIMainSection.bind(this, state, params, output, job), 'SubSections': [
                { 'Section': TAF.ES.Section.SIIHeaderSection.bind(this, state, params, output, job) },
                { 'Section': TAF.ES.Section.CashCollectionsSection.bind(this, state, params, output, job) }
        ]};
    };
};

function ES_SII_CashCollections_Report(state, params, output, job) {
    params.formatter = new TAF.ES.Formatter.CashCollectionsFormatter('CashCollections');
    params.filename = '';
    params.reportId = TAF.SII.CONSTANTS.REPORT.CASH_COLLECTIONS;
    TAF.Report.ES_SII_CashCollections_Report.call(this, state, params, output, job);
}
ES_SII_CashCollections_Report.prototype = Object.create(TAF.Report.ES_SII_CashCollections_Report.prototype);
ES_SII_CashCollections_Report.IsCRGReport = true;
ES_SII_CashCollections_Report.ReportId = TAF.SII.CONSTANTS.REPORT.CASH_COLLECTIONS;
