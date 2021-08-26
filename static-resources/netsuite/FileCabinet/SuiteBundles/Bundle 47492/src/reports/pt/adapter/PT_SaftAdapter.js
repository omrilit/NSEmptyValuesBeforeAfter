/**
 * Copyright 2016 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.PT = TAF.PT || {};
TAF.PT.Adapter = TAF.PT.Adapter || {};

TAF.PT.Adapter.SaftAdapter = function SaftAdapter(params) {
    this.name = 'SaftAdapter';
    this.context = (params && params.context) || nlapiGetContext();
    this.UNKNOWN = 'Desconhecido';
};

TAF.PT.Adapter.SaftAdapter.prototype.getStableHash = function getStableHash(mod, s) {
    var hash = 0;

    for (var i = 0; i < s.length; ++i) {
        hash += s.charCodeAt(i);
        hash += hash << 10;
        hash ^= hash >> 6;
    }

    hash += hash << 3;
    hash ^= hash << 10;
    hash += hash << 15;

    return Math.abs(hash) % mod;
};

TAF.PT.Adapter.SaftAdapter.prototype.getEntryDate = function getEntryDate(row) {
    var sed = row.ptTranEntryDate;

    if (sed) {
        return sed;
    }

    sed = nlapiStringToDate(row.dateCreated);
    var derivedSeconds = this.getStableHash(60, row.dateCreated.toString() + row.internalId.toString());
    sed.setSeconds(derivedSeconds);
    return sed.toString('yyyy-MM-ddTHH:mm:ss');
};
