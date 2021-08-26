/**
 * Copyright © 2016, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax.DAO = Tax.DAO || {};

Tax.DAO.NexusDAO = function _NexusDAO() {
    Tax.DAO.RecordDAO.call(this);
    this.Name = 'NexusDAO';
    this.recordType = 'nexus';
    this.columns = [];
    this.filters = [];
};

Tax.DAO.NexusDAO.prototype = Object.create(Tax.DAO.RecordDAO.prototype);

Tax.DAO.NexusDAO.prototype.prepareSearch = function prepareSearch(params) {
    if (!params) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'A params object is required.');
    }
    
    this.columns = [
        new nlobjSearchColumn('country'),
        new nlobjSearchColumn('description'),
        new nlobjSearchColumn('externalid'),
        new nlobjSearchColumn('state')
    ];

    if (params.id) {
        this.filters.push(new nlobjSearchFilter('internalid', null, 'is', params.id));
    }
    
    // TODO add other fields as needed
};

Tax.DAO.NexusDAO.prototype.ListObject = function ListObject(id) {
    return {
        id: id,
        country: '',
        description: '',
        externalId: '',
        state: ''
    };
};

Tax.DAO.NexusDAO.prototype.rowToObject = function rowToObject(row) {
    if (!row) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'A search result row is required.');
    }
    
    var nexus = new this.ListObject(row.getId());
    nexus.country = row.getValue('country') || '';
    nexus.description = row.getValue('description') || '';
    nexus.externalId = row.getValue('externalid') || '';
    nexus.state = row.getValue('state') || '';
    
    return nexus;
};
