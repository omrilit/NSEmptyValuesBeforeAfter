/**
 * Copyright 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

if (!TAF) { var TAF = {}; }
TAF.DAO = TAF.DAO || {};

TAF.DAO.Config = function _Config(id) {
    return {
        id:         id,
        report:     '',
        subsidiary: '',
        key:        '',
        value:      ''
    };
};

TAF.DAO.ConfigDao = function _ConfigDao() {
    this.isOneWorld = nlapiGetContext().getFeature('SUBSIDIARIES');
    this.RECORD_NAME = 'customrecord_taf_configuration';
    this.DEFAULT_COLUMNS = [new nlobjSearchColumn('custrecord_taf_config_report_name'),
                            new nlobjSearchColumn('custrecord_taf_config_subsidiary'),
                            new nlobjSearchColumn('custrecord_taf_config_key'),
                            new nlobjSearchColumn('custrecord_taf_config_value')];
};

TAF.DAO.ConfigDao.prototype.getConfigValue = function _getConfigValue(params) {
    if (!params) {
        throw nlapiCreateError('DATA_ERROR', 'TAF.DAO.ConfigDao.getConfigValue: Parameter is invalid');
    }
    
    var configValue = '';
    
    try {
        var filters = [new nlobjSearchFilter('isinactive', null, 'is', 'F'),
                       new nlobjSearchFilter('custrecord_taf_config_report_name', null, 'is', params.report),
                       new nlobjSearchFilter('custrecord_taf_config_key', null, 'is', params.key)];        if (params.subsidiary) {            filters.push(new nlobjSearchFilter('custrecord_taf_config_subsidiary', null, 'is', params.subsidiary))        }
        var records = this.searchRecords(filters, this.DEFAULT_COLUMNS);
        if ((records[0]) && (records[0].value)) {
            configValue = records[0].value;
        }
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.DAO.ConfigDao.getConfigValue', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'TAF.DAO.ConfigDao.getConfigValue');
    }
    
    return configValue;
};

TAF.DAO.ConfigDao.prototype.searchRecords = function _searchRecords(filters, columns) {
    var configList = [];
    
    try {
        var searchResults = nlapiSearchRecord(this.RECORD_NAME, null, filters, columns);
        if (!searchResults) {
            return configList;
        }
        
        for (var i = 0; i < searchResults.length; i++) {
            var config = this.convertToObject(searchResults[i]);
            configList.push(config);
        }
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.DAO.ConfigDao.searchRecords', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'TAF.DAO.ConfigDao.searchRecords');
    }
    
    return configList;    
};

TAF.DAO.ConfigDao.prototype.convertToObject = function _convertToObject(searchObject) {
    var config = {};
    try {
        config = new TAF.DAO.Config(searchObject.getId() || '');
        config.report     = searchObject.getValue('custrecord_taf_config_report_name') || '';
        config.key        = searchObject.getValue('custrecord_taf_config_key')         || '';
        config.value      = searchObject.getValue('custrecord_taf_config_value')       || '';
        if (this.isOneWorld) {
            config.subsidiary = searchObject.getValue('custrecord_taf_config_subsidiary')  || '';
        }
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.DAO.ConfigDao.convertToObject', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'TAF.DAO.ConfigDao.convertToObject');
    }
    return config;
};

