/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.EU = VAT.EU || {};

VAT.EU.BaseDataAdapter = function _BaseDataAdapter() {
    this.data = {};
    this.params = {};
    this.dataRowClass = null;
    this.output = [];
};

VAT.EU.BaseDataAdapter.prototype.transform = function _transform(data, params) {
    if (!data) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'data is required');
    }
    
    if (!params) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'params is required');
    }
    
    this.initializeData(data, params);
    this.transformData();
    
    return this.output;
};

VAT.EU.BaseDataAdapter.prototype.initializeData = function _initializeData(data, params) {
    if (!data) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'data is required');
    }
    
    if (!params) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'params is required');
    }
    
    this.data = data;
    this.params = params;
};

VAT.EU.BaseDataAdapter.prototype.transformData = function _transformData() {
    //Override this method in adapter-specific subclasses 
};

VAT.EU.BaseDataAdapter.prototype.createDataRow = function _createDataRow(params) {
    if (!params) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'params is required');
    }
    
    if (!this.dataRowClass) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'dataRowClass is required');
    }
    
    try {
        var row = new this.dataRowClass();
        row.injectRowData(params);
        return row;
    } catch(e) {
        logException(e, 'VAT.EU.BaseDataAdapter.createDataRow');
        throw e;
    }
};