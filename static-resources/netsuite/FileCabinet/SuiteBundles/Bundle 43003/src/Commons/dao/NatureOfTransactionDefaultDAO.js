/**
 * Copyright © 2016, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax.DAO = Tax.DAO || {};

Tax.DAO.NatureOfTransactionDefaultDAO = function NatureOfTransactionDefaultDAO() {
    Tax.DAO.SearchDAO.call(this);
    this.Name = 'NatureOfTransactionDefaultDAO';
    this.searchType = 'customrecord_notc_default';
    this.filters = [];
    this.columns = [];
    this.fields = {
        id: {id: 'internalid'},
        country: {id: 'custrecord_notcdef_country'},
        notc: {id: 'custrecord_notcdef_notc'},
        notcCode: {id: 'custrecord_notc_code', join: 'custrecord_notcdef_notc'},
        transactionType: {id: 'custrecord_notcdef_trantype'},
        transactionType_text: {id: 'custrecord_notcdef_trantype'}
    };
};

Tax.DAO.NatureOfTransactionDefaultDAO.prototype = Object.create(Tax.DAO.SearchDAO.prototype);

Tax.DAO.NatureOfTransactionDefaultDAO.prototype.prepareSearch = function prepareSearch(params) {
    if (params && params.isInactive) {
        this.filters.push(new nlobjSearchFilter('isinactive', null, 'is', params.isInactive));
    }
    
    if (params && params.country) {
        this.filters.push(new nlobjSearchFilter(this.fields.country.id, null, 'is', params.country));
    }
    
    for (var f in this.fields) {
        this.columns.push(new nlobjSearchColumn(this.fields[f].id, this.fields[f].join || null));
    }
};

Tax.DAO.NatureOfTransactionDefaultDAO.prototype.ListObject = function ListObject() {
    var obj = {};
    
    for (var f in this.fields) {
        obj[f] = '';
    }
    
    return obj;
};

Tax.DAO.NatureOfTransactionDefaultDAO.prototype.rowToObject = function rowToObject(row) {
    var obj = new this.ListObject();
    
    for (var f in this.fields) {
        if (f.indexOf('_text') > -1) {
            obj[f] = row.getText(this.fields[f].id, this.fields[f].join || null);
        } else {
            obj[f] = row.getValue(this.fields[f].id, this.fields[f].join || null);
        }
    }
    
    return obj;
};
