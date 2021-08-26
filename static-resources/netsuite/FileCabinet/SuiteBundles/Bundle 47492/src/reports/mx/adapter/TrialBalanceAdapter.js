/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.MX = TAF.MX || {};
TAF.MX.Adapter = TAF.MX.Adapter || {};

TAF.MX.Adapter.TrialBalanceAdapter = function(state) {
    TAF.MX.Adapter.ReportAdapter.apply(this, arguments);

    this.TYPE_NORMAL = 'N';
    this.TYPE_MODIFIED = 'C';
};

TAF.MX.Adapter.TrialBalanceAdapter.prototype = Object.create(TAF.MX.Adapter.ReportAdapter.prototype);

TAF.MX.Adapter.TrialBalanceAdapter.prototype.getHeaderData = function(rawData) {
    var data = {};

    var period = rawData.period.GetEndDate();
    data.year = period.getFullYear().toString();
    data.month = (period.getMonth() + 1).toString();

    data.RFC = rawData.isOneWorld ?
        rawData.subsidiary.getFederalIdNumber() :
        rawData.company.employerId || rawData.company.taxNumber || rawData.company.taxId;

    if (rawData.isComplementary) {
        data.type = this.TYPE_MODIFIED;
        data.dateCreated = rawData.dateCreated;
    } else {
        data.type = this.TYPE_NORMAL;
    }

    return data;
};

TAF.MX.Adapter.TrialBalanceAdapter.prototype.isAccountValid = function _isAccountValid(account) {
    if (!account) {
        return false;
    }
    return true;
};


