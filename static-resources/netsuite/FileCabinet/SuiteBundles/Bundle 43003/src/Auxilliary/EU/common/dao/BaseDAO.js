/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.EU = VAT.EU || {};
VAT.EU.DAO = VAT.EU.DAO || {};

VAT.EU.DAO.BaseDAO = function BaseDAO() {
    this.daoName = 'BaseDAO';
    this.list = [];
};
VAT.EU.DAO.BaseDAO.prototype = Object.create(Tax.Processor.prototype);

VAT.EU.DAO.BaseDAO.prototype.process = function(result, params) {
    var list = this.getList(params);
    return {dao: list};
};


VAT.EU.DAO.BaseDAO.prototype.prepareSearch = function prepareSearch(params) {
    //perform parameter validations here
    //perform pre-searching routines here, e.g. adding of filters
};

VAT.EU.DAO.BaseDAO.prototype.search = function search() {
    return [];
};

VAT.EU.DAO.BaseDAO.prototype.processList = function processList(rows) {
    for (var i = 0; rows && i < rows.length; i++) {
        this.list.push(this.rowToObject(rows[i]));
    }
    
    return this.list;
};

VAT.EU.DAO.BaseDAO.prototype.getList = function getList(params) {
    try {
        this.prepareSearch(params);
        this.processList(this.search());
        return this.list;
    } catch(e) {
        throw e;
    }
};

VAT.EU.DAO.BaseDAO.prototype.ListObject = function(row) {
    return row;
};

VAT.EU.DAO.BaseDAO.prototype.rowToObject = function rowToObject(row) {
    return new this.ListObject(row);
};
