/**
 * Copyright © 2018, 2018, Oracle and/or its affiliates. All rights reserved.
 */ 

function MX_SAT_ComplementaryTrialBalance_Report(state, params, output, job) {
    params.isOneWorld = SFC.Context.IsOneWorld();
    params.period = SFC.PostingPeriods.Load(params.periodFrom);
    params.isComplementary = true;

    this.outline = {
       "Section": complementaryTrialBalance
    };
    this.GetOutline = function() { return this.outline; };
    
    function complementaryTrialBalance() {
        return new MX_SAT_ComplementaryTrialBalance_Section(state, params, output, job);
    }
}

//Report Sections
function MX_SAT_ComplementaryTrialBalance_Section(state, params, output, job) {
    MX_SAT_TrialBalance_Section.apply(this, arguments);
    this.Name = 'ComplementaryTrialBalance';
    this.isComplementary = params.isComplementary;

    this.adapter = new TAF.MX.Adapter.TrialBalanceAdapter();
}

MX_SAT_ComplementaryTrialBalance_Section.prototype = Object.create(MX_SAT_TrialBalance_Section.prototype);

MX_SAT_ComplementaryTrialBalance_Section.prototype.On_Header = function() {
    var reportParams = this.job.ReportParams || {};
    var rawData = {
        isOneWorld: this.params.isOneWorld,
        period: this.params.period,
        isComplementary: this.isComplementary,
        dateCreated: reportParams.dateCreated
    };

    if (this.params.isOneWorld) {
        rawData.subsidiary = this.subsidiary;
    } else {
        rawData.company = new TAF.DAO.CompanyDao().getInfo();
    }

    var headerData = this.adapter.getHeaderData(rawData);
    this.output.WriteLine(this.formatter.formatHeader());

    this.output.WriteLine(this.formatter.formatComplementaryBalanceHeader(headerData));
    
    this.output.SetFileName(this.formatter.formatTrialBalanceFilename(headerData));
    this.output.SetPercent(this.PROGRESS_PERCENTAGE.HEADER);
};

//CRG Reports
var MX_SAT_ComplementaryTrialBalance_XML_Report = function _MX_SAT_ComplementaryTrialBalance_XML_Report(state, params, output, job) {
    params.formatter = new TAF.MX.Formatter.XML();
    MX_SAT_ComplementaryTrialBalance_Report.call(this, state, params, output, job);
};
MX_SAT_ComplementaryTrialBalance_XML_Report.prototype = Object.create(MX_SAT_ComplementaryTrialBalance_Report.prototype);
MX_SAT_ComplementaryTrialBalance_XML_Report.IsCRGReport = true;
MX_SAT_ComplementaryTrialBalance_XML_Report.ReportId = 'COMPLEMENTARY_TRIAL_BALANCE_MX_XML';
