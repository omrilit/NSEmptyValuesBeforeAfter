/**
 * Copyright © 2016, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax.DAO = Tax.DAO || {};

Tax.DAO.AccountDAO =  function AccountDAO() {
	Tax.DAO.RecordDAO.call(this);
	this.Name = 'AccountDAO';
	this.recordType = 'account';
	this.columns = [];
	this.filters = [];
};

Tax.DAO.AccountDAO.prototype = Object.create(Tax.DAO.RecordDAO.prototype);

Tax.DAO.AccountDAO.prototype.prepareSearch = function prepareSearch(params) {
    if (params && params.specialAccountType) {
        this.filters.push(new nlobjSearchFilter('specialaccounttype', null, 'is', params.specialAccountType));
    }
    
    this.columns = [
        new nlobjSearchColumn('name'),
        new nlobjSearchColumn('type'),
        new nlobjSearchColumn('description')
    ];
};

Tax.DAO.AccountDAO.prototype.ListObject = function ListObject(id) {
    return {id: id, name: '', type: '', description: ''};
};

Tax.DAO.AccountDAO.prototype.rowToObject = function rowToObject(row) {
    var obj = new this.ListObject(row.getId());
    obj.name = row.getValue('name');
    obj.type = row.getValue('type');
    obj.description = row.getValue('description');
    
    return obj;
};
