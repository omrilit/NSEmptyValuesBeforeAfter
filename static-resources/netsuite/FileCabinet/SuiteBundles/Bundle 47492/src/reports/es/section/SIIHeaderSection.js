/**
 * Copyright 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.ES = TAF.ES || {};
TAF.ES.Section = TAF.ES.Section || {};

TAF.ES.Section.SIIHeaderSection = function _SIIHeaderSection(state, params, output, job) {
    TAF.IReportSection.apply(this, arguments);
    this.Name = 'SIIHeaderSection';
};
TAF.ES.Section.SIIHeaderSection.prototype = Object.create(TAF.IReportSection.prototype);

TAF.ES.Section.SIIHeaderSection.prototype.On_Init = function _On_Init() {
    this.formatter = this.params.formatter;
};

TAF.ES.Section.SIIHeaderSection.prototype.On_Body = function _On_Body() {
    var adapter = new TAF.ES.Adapter.CompanyInformationAdapter();
    var dao = new TAF.ES.DAO.CompanyInformationDAO();
    var data = adapter.getIssuedInvoiceHeader(dao.getList(this.params), this.params.submissionType);
    var headerData = {
        version: data.version,
        name: data.companyName,
        vatNo: data.vatNo,
        submissionType: data.submissionType
    };
    var section = this.formatter.getCabecera(headerData);

    this.output.WriteLine(section);
    this.state.CompanyInformation = data;

    this.output.SetPercent(TAF.SII.CONSTANTS.PROGRESS.HEADER);
};
