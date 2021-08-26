/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.Report = TAF.Report || {};
TAF.Report.AE_FAF_Report = function _AE_FAF_Report(state, params, output, job) {
	this.Outline = {
        "Section": TAF.AE.Section.FAFReportSection.bind(this, state, params, output, job),
        "SubSections": [
            { "Section": TAF.AE.Section.CompanyInfoSection.bind(this, state, params, output, job) },
        	{ "Section": TAF.AE.Section.SupplierPurchaseSection.bind(this, state, params, output, job),
                "SubSections": [{ "Section": TAF.AE.Section.SupplierPurchaseLinesSection.bind(this, state, params, output, job) }]
            },
        	{ "Section": TAF.AE.Section.CustomerSupplySection.bind(this, state, params, output, job),
                "SubSections": [{ "Section": TAF.AE.Section.CustomerSupplyLinesSection.bind(this, state, params, output, job) }]
            },
            { "Section": TAF.AE.Section.GeneralLedgerSection.bind(this, state, params, output, job) }
        ]
    };

	this.GetOutline = function() { return this.Outline; };
}

function AE_FAF_Report(state, params, output, job) {
	params.formatter = new TAF.AE.Formatter.CSV();
    params.filename = '';
    params.reportId = 'AE_FAF_CSV';
    TAF.Report.AE_FAF_Report.call(this, state, params, output, job);
}
AE_FAF_Report.prototype = Object.create(TAF.Report.AE_FAF_Report.prototype);
AE_FAF_Report.IsCRGReport = true;
AE_FAF_Report.ReportId = 'AE_FAF_CSV';
