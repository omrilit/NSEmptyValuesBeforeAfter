/**
 * Copyright © 2016, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax.DAO = Tax.DAO || {};

Tax.DAO.TaxCodeSearchDAO = function TaxCodeSearchDAO() {
    Tax.DAO.SearchDAO.call(this);
    this.Name = 'TaxCodeSearchDAO';
    this.recordType = 'salestaxitem';
    this.filters = [];
    this.columns = [];
    this.fields = {
        id: 'internalid',
        isService: 'appliestoservice',
        availableOn: 'availableon',
        country: 'country',
        description: 'description',
        isEcCode: 'iseccode',
        isExcludeTaxReports: 'isexcludetaxreports',
        isExport: 'isexport',
        isInactive: 'isinactive',
        isReverseCharge: 'isreversecharge',
        itemId: 'itemid',
        parent: 'parent',
        rate: 'rate',
        taxType: 'taxtype'
    };
};

Tax.DAO.TaxCodeSearchDAO.prototype = Object.create(Tax.DAO.SearchDAO.prototype);

Tax.DAO.TaxCodeSearchDAO.prototype.prepareSearch = function prepareSearch(params) {
    if (params && params.country) {
        this.filters.push(new nlobjSearchFilter('country', null, 'is', params.country));
    }
    
    for (var f in this.fields) {
        this.columns.push(new nlobjSearchColumn(this.fields[f]));
    }
};

Tax.DAO.TaxCodeSearchDAO.prototype.search = function search() {
    try {
        return nlapiCreateSearch(this.recordType, this.filters, this.columns).runSearch();
    } catch(e) {
        throw e;
    }
};

Tax.DAO.TaxCodeSearchDAO.prototype.ListObject = function ListObject() {
    var obj = {};
    
    for (var f in this.fields) {
        obj[f] = '';
    }
    
    return obj;
};

Tax.DAO.TaxCodeSearchDAO.prototype.rowToObject = function rowToObject(row) {
    var obj = new this.ListObject();
    
    for (var f in this.fields) {
        obj[f] = row.getValue(this.fields[f]);
    }
    
    return obj;
};
