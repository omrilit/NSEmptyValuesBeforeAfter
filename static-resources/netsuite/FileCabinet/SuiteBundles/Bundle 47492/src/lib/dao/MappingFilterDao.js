/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

if (!TAF) { var TAF = {}; }
TAF.DAO = TAF.DAO || {};

TAF.DAO.MappingFilter = function _MappingFilter(id) {
    return {
        id: id,
        name: '',
        label: '',
        dao: '',
        feature: '',
        isUi: '',
        daoFilter: '',
        mappingFilters: '',
    };
};

TAF.DAO.MappingFilterDao = function _MappingFilterDao() {
    this.RECORD_NAME = 'customrecord_mapper_filter';
    this.FIELDS = {
        NAME            : 'name',
        UI_LABEL        : 'custrecord_mapper_filter_label',
        DAO             : 'custrecord_mapper_filter_dao',
        FEATURE         : 'custrecord_mapper_filter_feature_name',
        IS_UI           : 'custrecord_mapper_filter_is_ui',
        DAO_FILTER      : 'custrecord_mapper_filter_dao_filter',
        MAPPING_FILTERS : 'custrecord_mapper_filter_list'
    };
};

TAF.DAO.MappingFilterDao.prototype.getMappingFilterByIds = function _getMappingFilterByIds(filterIds) {
    var mappingFilters = [];
    
    if (!Array.isArray(filterIds)) {
        return mappingFilters;
    }

    try {
        var filters = this.getSearchFilters(filterIds);
        var columns = this.getSearchColumns();
    
        var searchResult = nlapiSearchRecord(this.RECORD_NAME, null, filters, columns);
        for (var i = 0; i < searchResult.length; i++) {
            mappingFilters.push(this.convertToMappingFilterObject(searchResult[i]));
        }
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.DAO.MappingFilterDao.getMappingFilterByIds', ex.toString());
    }
    
    return mappingFilters;
};

TAF.DAO.MappingFilterDao.prototype.getSearchColumns = function _getSearchColumns() {
    var columns = [];
    for (var key in this.FIELDS) {
        columns.push(new nlobjSearchColumn(this.FIELDS[key]));
    }
    return columns;
};

TAF.DAO.MappingFilterDao.prototype.getSearchFilters = function _getSearchFilters(filterIds) {
    var filters = [
                   new nlobjSearchFilter('isinactive', null, 'is', 'F'),
                   new nlobjSearchFilter('internalid', null, 'anyof', filterIds),
                   ];
    return filters;
};

TAF.DAO.MappingFilterDao.prototype.convertToMappingFilterObject = function _convertToMappingFilterObject(searchObj) {
    var mappingFilterObj = new TAF.DAO.MappingFilter();
    
    mappingFilterObj.id = searchObj.getId() || '';
    mappingFilterObj.name = searchObj.getValue(this.FIELDS.NAME) || '';
    mappingFilterObj.label = searchObj.getValue(this.FIELDS.UI_LABEL) || '';
    mappingFilterObj.dao = searchObj.getValue(this.FIELDS.DAO) || '';
    mappingFilterObj.feature = searchObj.getValue(this.FIELDS.FEATURE) || '';
    mappingFilterObj.isUi = (searchObj.getValue(this.FIELDS.IS_UI) === 'T');
    
    var daoFilter = searchObj.getValue(this.FIELDS.DAO_FILTER) || '{}';
    var mappingFilters = searchObj.getValue(this.FIELDS.MAPPING_FILTERS) || '{}';
    
    mappingFilterObj.daoFilter = JSON.parse(daoFilter);
    mappingFilterObj.mappingFilters = JSON.parse(mappingFilters);
    
    return mappingFilterObj;    
};

