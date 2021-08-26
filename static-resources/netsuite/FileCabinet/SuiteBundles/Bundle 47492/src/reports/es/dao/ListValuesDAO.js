/**
 * Copyright � 2017, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.ES = TAF.ES || {};
TAF.ES.DAO = TAF.ES.DAO || {};

TAF.ES.DAO.ListValuesDAO = function _ListValuesDAO(params) {
	TAF.DAO.SearchDAO.call(this, params);
    this.name = 'ListValuesDAO';
    this.recordType = 'customrecord_sii_list_val';
};
TAF.ES.DAO.ListValuesDAO.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.ES.DAO.ListValuesDAO.prototype.getMap = function _getMap() {
    var map = {};
    var list;

    do {
        list = this.getList();
        for (var i = 0; i < list.length; i++) {
            map[list[i].id] = list[i];
        }
    } while(this.hasMoreRows);

    return map;
};

TAF.ES.DAO.ListValuesDAO.prototype.createSearchColumns = function _createSearchColumns(params) {
    this.columns.push(new nlobjSearchColumn('name'));
    this.columns.push(new nlobjSearchColumn('custrecord_sii_list_code'));
    this.columns.push(new nlobjSearchColumn('custrecord_sii_list_type'));
};

TAF.ES.DAO.ListValuesDAO.prototype.createSearchFilters = function _createSearchFilters(params) {
    this.filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
    
    if (params && params.code) {
        this.filters.push(new nlobjSearchFilter('custrecord_sii_list_code', null, 'is', params.code));
    }
};

TAF.ES.DAO.ListValuesDAO.prototype.rowToObject = function _rowToObject(row) {
	if(!row) {
        throw  nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }
    try {
        return {
            id: row.getId(),
            name: row.getValue('name'),
            code: row.getValue('custrecord_sii_list_code'),
            listType: row.getValue('custrecord_sii_list_type')
        };
    } catch (ex) {
        nlapiLogExecution('ERROR', 'Error in ListValuesDAO.rowToObject', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'Error in processing search results.');
    }
};
