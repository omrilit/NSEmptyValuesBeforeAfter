/**
 * Copyright 2016 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.PT = TAF.PT || {};
TAF.PT.Formatter = TAF.PT.Formatter || {};
TAF.PT.Formatter.SAFT = TAF.PT.Formatter.SAFT || {};

TAF.PT.Formatter.SAFT.BaseFormatter = function BaseFormatter() {
    TAF.Formatter.ReportFormatter.call(this);
    this.fields = {};
    this.templates = {};
    this.dateFormat = 'yyyy-MM-dd';
    this.isXML = true;
};

TAF.PT.Formatter.SAFT.BaseFormatter.prototype = Object.create(TAF.Formatter.ReportFormatter.prototype);
