/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.EU = VAT.EU || {};

VAT.EU.BaseDataFormatter = function _BaseDataFormatter() {
    this.data = [];
    this.params = {};
};

VAT.EU.BaseDataFormatter.prototype.format = function _format(data, params) {
    if (!data) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'data is required');
    }
    
    if (!params) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'params is required');
    }
    
    try {
        this.initializeData(data, params);
        this.formatData();
        
        return this.data;
    } catch (e) {
        logException(e, 'VAT.EU.BaseDataFormatter.format');
        throw e;
    }
};

VAT.EU.BaseDataFormatter.prototype.initializeData = function _initializeData(data, params) {
    if (!data) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'data is required');
    }
    
    if (!params) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'params is required');
    }
    
    this.unformattedData = data;
    this.data = data;
    this.params = params;
};

VAT.EU.BaseDataFormatter.prototype.formatData = function _formatData() {
    //Override this method in formatter-specific subclasses 
};

VAT.EU.BaseDataFormatter.prototype.setColumnProperty = function _setColumnProperty(property) {
    if (!property) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'property is required');
    }
    
    try {
        var propertyMap = this.getColumnPropertyMap(property);
        
        for (var rowIndex = 0; this.data && rowIndex < this.data.length; rowIndex++) {
            var reportRow = this.data[rowIndex];
            
            for ( var columnKey in propertyMap) {
                reportRow[columnKey].properties[property] = propertyMap[columnKey];
            }
        }
    } catch (e) {
        logException(e, 'VAT.EU.BaseDataFormatter.setColumnProperty');
        throw e;
    }
    
    
};

VAT.EU.BaseDataFormatter.prototype.getColumnPropertyMap = function _getColumnPropertyMap(property) {
    if (!property) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'property is required');
    }
    
    var map = {};
    
    try {
        for (var int = 0; int < this.params.columns.length; int++) {
            var eachColumn = this.params.columns[int];
            if (eachColumn[property]) {
                map[eachColumn.id] = eachColumn[property];
            }
        }
        return map;
    } catch (e) {
        logException(e, 'VAT.EU.BaseDataFormatter.getColumnPropertyMap');
        throw e;
    }
    
};

VAT.EU.BaseDataFormatter.prototype.setDecimalPlaces = function _setDecimalPlaces(decimalPlaces, columnKey) {
    if (!decimalPlaces && decimalPlaces != 0) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'decimalPlaces is required');
    }
    
    if (!columnKey) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'columnKey is required');
    }
    
    try {
        for (var rowIndex = 0; this.data && rowIndex < this.data.length; rowIndex++) {
            var reportRow = this.data[rowIndex];
            
            reportRow[columnKey].value = reportRow[columnKey].value.toFixed(decimalPlaces);
        }
    } catch (e) {
        logException(e, 'VAT.EU.BaseDataFormatter.setDecimalPlaces');
        throw e;
    }
    
};

VAT.EU.BaseDataFormatter.prototype.setDateFormat = function _setDateFormat(columnKey, format) {
    if (!columnKey) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'columnKey is required');
    }
    
    if (!format) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'format is required');
    }
    
    try {
        for (var rowIndex = 0; this.data && rowIndex < this.data.length; rowIndex++) {
            var reportRow = this.data[rowIndex];
            
            reportRow[columnKey].value = nlapiDateToString(Date.parseExact(reportRow[columnKey].value, 'yyyy-MM-dd'), format);
        }
    } catch (e) {
        logException(e, 'VAT.EU.BaseDataFormatter.setDecimalPlaces');
        throw e;
    }
};