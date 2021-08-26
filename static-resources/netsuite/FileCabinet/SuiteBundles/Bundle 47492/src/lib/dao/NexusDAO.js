/**
 * Copyright 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.DAO = TAF.DAO || {};
TAF.DAO.Nexus = function Nexus(id) {
    return {
        id: id,
        country: ''
    };
};
TAF.DAO.NexusDAO = function NexusDAO() {
    this.recordType = 'nexus';
};
TAF.DAO.NexusDAO.prototype.getById = function getById(id) {
    if (!id) {
        return null;
    }
    var filter = [new nlobjSearchFilter('internalid', null, 'is', id)];
    var column = [new nlobjSearchColumn('country')];
    var result = nlapiSearchRecord('nexus', null, filter, column);
    var nexus = result ? this.objectify(result[0]) : null;
    return nexus;
};
TAF.DAO.NexusDAO.prototype.getByCountryCode = function getByCountryCode(country) {
    if (!country) {
        return null;
    }
    var filter = [new nlobjSearchFilter('country', null, 'is', country)];
    var column = [new nlobjSearchColumn('country')];
    var result = nlapiSearchRecord('nexus', null, filter, column);
    var nexus = result ? this.objectify(result[0]) : null;
    return nexus;
};
TAF.DAO.NexusDAO.prototype.objectify = function objectify(row) {
    var nexus = new TAF.DAO.Nexus(row.getId());
    nexus.country = row.getValue('country');
    return nexus;
};
