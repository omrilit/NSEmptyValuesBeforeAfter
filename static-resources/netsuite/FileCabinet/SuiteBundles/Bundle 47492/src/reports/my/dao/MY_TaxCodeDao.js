/**
 * Copyright © 2017, 2017, Oracle and/or its affiliates. All rights reserved.
 */ 

var TAF = TAF || {};
TAF.MY = TAF.MY || {};
TAF.MY.DAO = TAF.MY.DAO || {};

TAF.MY.DAO.TaxCode = function _TaxCode(id) {
    return {
        id: '',
        itemid: '',
        effectiveFrom: '',
        validUntil: ''
    };
};

TAF.MY.DAO.TaxCodeDao = function _TaxCodeDao() {
    TAF.DAO.SearchDAO.call(this);
    this.recordType = 'salestaxitem';
    this.fields = {
        id: 'internalid',
        itemid: 'itemid',
        effectiveFrom: 'effectiveFrom',
        validUntil: 'validUntil'
    };
};
TAF.MY.DAO.TaxCodeDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.MY.DAO.TaxCodeDao.prototype.createSearchColumns = function _createSearchColumns(params) {
    this.columns.push(new nlobjSearchColumn('itemid'));
    this.columns.push(new nlobjSearchColumn('validuntil').setSort(false));
    this.columns.push(new nlobjSearchColumn('effectivefrom').setSort(false));
    this.columns.push(new nlobjSearchColumn('internalid').setSort(false));
};

TAF.MY.DAO.TaxCodeDao.prototype.createSearchFilters = function _createSearchFilters(params) {
    if (params && params.countryCode) {
        this.filters.push(new nlobjSearchFilter("country", null, "is", params.countryCode));
    }
    
    if (params.category) {
        this.filters.push(new nlobjSearchFilter('custrecord_4110_category', null, 'is', params.category));
        this.filters.push(new nlobjSearchFilter('rate', null, 'equalto', params.rate));
        this.filters.push(new nlobjSearchFilter('availableon', null, 'anyof', params.available));
    }

};

TAF.MY.DAO.TaxCodeDao.prototype.getRglTaxCode = function _getRGLTaxCode(params){
    var params = {
            countryCode: 'MY',
            category: 'S4', //Incidental
            rate: 0,
            available: ['SALE'],
            bookId: params.bookId
        }
    
    this.search(params);
    var taxCodes = this.getList()||[];
    var rglTaxCodes = [];
    
    for(var i = 0; i < taxCodes.length; i++){
        rglTaxCodes.push({taxCode: taxCodes[i].getValue('itemid'),
                          validUntil: taxCodes[i].getValue('validuntil')});
    }
    
    return rglTaxCodes;
};

