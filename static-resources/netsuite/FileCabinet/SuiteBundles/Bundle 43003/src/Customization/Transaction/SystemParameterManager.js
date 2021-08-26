/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       05 Aug 2014     isalen
 *
 */
var VAT = VAT || {};


VAT.SystemParameter = function SystemParameter(id) {
    return {
        id: id,
        name: '',
        value: ''
    };
};


VAT.SystemParameterManager = function SystemParameterManager() {
    this.cache = {};
    this.recordType = 'customrecord_itr_system_parameter';
    this.fields = {
        id: 'internalid',
        name: 'name',
        value: 'custrecord_itr_sys_par_value'
    };
};


VAT.SystemParameterManager.prototype.getByName = function getByName(name) {
    if (!this.cache[name]) {
        this.load(name);
    }
    
    return this.cache[name] || null;
};


VAT.SystemParameterManager.prototype.add = function add(systemParameter) {
    var rec = nlapiCreateRecord(this.recordType);
    rec.setFieldValue(this.fields.name, systemParameter.name);
    rec.setFieldValue(this.fields.value, systemParameter.value);
    systemParameter.id = nlapiSubmitRecord(rec);
    this.cache[systemParameter.name] = systemParameter;
    return systemParameter;
};


VAT.SystemParameterManager.prototype.update = function update(systemParameter) {
    var rec = nlapiLoadRecord(this.recordType, systemParameter.id);
    rec.setFieldValue(this.fields.value, systemParameter.value);
    systemParameter.id = nlapiSubmitRecord(rec);
    this.cache[systemParameter.name] = systemParameter;
    return systemParameter;
};


VAT.SystemParameterManager.prototype.load = function load(name) {
    var filter = [new nlobjSearchFilter(this.fields.name, null, 'is', name)];
    var columns = [];
    for (var key in this.fields) {
        columns.push(new nlobjSearchColumn(this.fields[key]));
    }
    
    var params = nlapiSearchRecord(this.recordType, null, filter, columns);
    
    if (params) {
        var obj = this.objectify(params[0]);
        this.cache[obj.name] = obj;
    }
};


VAT.SystemParameterManager.prototype.loadAll = function loadAll() {
    var columns = [];
    for (var key in this.fields) {
        columns.push(new nlobjSearchColumn(this.fields[key]));
    }
    
    var params = nlapiSearchRecord(this.recordType, null, null, columns);
    
    var obj;
    for (var j = 0; j < params.length; j++) {
         obj = this.objectify(params[j]);
         this.cache[obj.name] = obj;
    }
};


VAT.SystemParameterManager.prototype.objectify = function objectify(row) {
    var obj = new VAT.SystemParameter(row.getId());
    obj.name = row.getValue(this.fields.name);
    obj.value = row.getValue(this.fields.value);
    
    return obj;
};
