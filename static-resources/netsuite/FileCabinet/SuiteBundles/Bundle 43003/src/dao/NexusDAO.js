/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */
if (!VAT) { var VAT = {}; }VAT.DAO = VAT.DAO || {};
VAT.DAO.Nexus = function Nexus(id) {    return {        id: id,        country: ''    };};
VAT.DAO.NexusDAO = function NexusDAO() {    this.recordType = 'nexus';};
VAT.DAO.NexusDAO.prototype.getById = function getById(id) {    if (!id) {        return null;    }
    var filter = [new nlobjSearchFilter('internalid', null, 'is', id)];    var column = [new nlobjSearchColumn('country')];    var result = nlapiSearchRecord('nexus', null, filter, column);    var nexus = result ? this.objectify(result[0]) : null;    return nexus;};
VAT.DAO.NexusDAO.prototype.getByCountryCode = function getByCountryCode(country) {    if (!country) {        return null;    }
    var filter = [new nlobjSearchFilter('country', null, 'is', country)];    var column = [new nlobjSearchColumn('country')];    var result = nlapiSearchRecord('nexus', null, filter, column);    var nexus = result ? this.objectify(result[0]) : null;
    return nexus;};
VAT.DAO.NexusDAO.prototype.objectify = function objectify(row) {    var nexus = new VAT.DAO.Nexus(row.getId());    nexus.country = row.getValue('country');    return nexus;
};
