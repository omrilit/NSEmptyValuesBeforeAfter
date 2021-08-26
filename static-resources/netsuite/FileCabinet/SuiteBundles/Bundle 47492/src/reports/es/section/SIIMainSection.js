/**
 * Copyright 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.ES = TAF.ES || {};
TAF.ES.Section = TAF.ES.Section || {};

TAF.ES.Section.SIIMainSection = function _SIIMainSection(state, params, output, job) {
    TAF.IReportSection.apply(this, arguments);
    this.Name = 'SIIMainSection';
};
TAF.ES.Section.SIIMainSection.prototype = Object.create(TAF.IReportSection.prototype);

TAF.ES.Section.SIIMainSection.prototype.On_Init = function _On_Init() {
    this.formatter = this.params.formatter;
};

TAF.ES.Section.SIIMainSection.prototype.On_Header = function _On_Header() {
    this.output.WriteLine(this.formatter.TEMPLATE.MAIN.HEADER);
    this.output.WriteLine(this.formatter.getSuministroHeader());
};

TAF.ES.Section.SIIMainSection.prototype.On_Footer = function _On_Footer() {
    this.output.WriteLine(this.formatter.getSuministroFooter());
    this.output.WriteLine(this.formatter.TEMPLATE.MAIN.FOOTER);
    this.output.SetPercent(TAF.SII.CONSTANTS.PROGRESS.COMPLETE);
};
