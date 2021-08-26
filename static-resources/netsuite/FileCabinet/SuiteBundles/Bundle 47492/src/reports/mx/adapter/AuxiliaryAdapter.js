/**
 * Copyright 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.MX = TAF.MX || {};
TAF.MX.Adapter = TAF.MX.Adapter || {};

TAF.MX.Adapter.AuxiliaryLine = function() {
    return {
        date: '',
        referenceNumber: '',
        concept: '',
        credit: 0,
        debit: 0,
    };    
};

TAF.MX.Adapter.AuxiliaryAdapter = function(state) {
    TAF.MX.Adapter.ReportAdapter.apply(this, arguments);
};

TAF.MX.Adapter.AuxiliaryAdapter.prototype = Object.create(TAF.MX.Adapter.ReportAdapter.prototype);

TAF.MX.Adapter.AuxiliaryAdapter.prototype.getLineData = function(params) {
    var line = TAF.MX.Adapter.ReportAdapter.prototype.getLineData.call(this, params);
    return line ? line : null;
};

TAF.MX.Adapter.AuxiliaryAdapter.prototype.getConcept = function(rawData) {
    if (!rawData) {
        throw nlapiCreateError('DATA_ERROR', 'TAF.MX.Adapter.AuxiliaryAdapter.getConcept: Parameter is invalid');
    }

    var memo = rawData.memo || rawData.memoMain;
    
    return memo ? rawData.typeText + ' ' + memo : rawData.typeText;
};

TAF.MX.Adapter.AuxiliaryAdapter.prototype.getTxnLineData = function(rawData) {
    var auxLine = new TAF.MX.Adapter.AuxiliaryLine();
    auxLine.date = rawData.date;
    auxLine.referenceNumber = rawData.typeText + ' ' + rawData.glNumber;
    auxLine.concept = this.getConcept(rawData);
    auxLine.credit = rawData.creditAmount;
    auxLine.debit = rawData.debitAmount;
    return auxLine;
};
