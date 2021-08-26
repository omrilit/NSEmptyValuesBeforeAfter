/**
 * Copyright � 2016, 2017, Oracle and/or its affiliates. All rights reserved.
 */

if (!TAF) { var TAF = {}; }
TAF.DAO = TAF.DAO || {};

TAF.DAO.SearchDAO = function _SearchDAO(params) {
    this.name = 'SearchDAO';
    this.MAX_RESULTS_PER_LINE = 1000;
    this.savedSearchId = '';
    this.recordType = '';
    this.fields = {};
    this.filterExpression = [];
    this.filters = [];
    this.columns = [];
    this.searhObj = null;
    this.searchResult = null;
    this.multiBookJoinColumn = null;
    this.hasMoreRows = false;

    this.context = (params && params.context) || nlapiGetContext();
    this.isMultiBook = this.context.getFeature('MULTIBOOK');
    this.isOneWorld = this.context.getFeature('SUBSIDIARIES');
    this.multicurrency = this.context.getFeature('MULTICURRENCY');
    this.glAuditNumbering = this.context.getFeature('GLAUDITNUMBERING');
    this.classes = this.context.getFeature('CLASSES');
    this.department = this.context.getFeature('DEPARTMENTS');
    this.locations = this.context.getFeature('LOCATIONS');
};

TAF.DAO.SearchDAO.prototype.initialize = function _initialize(params) {
    if (!this.recordType) {
        throw nlapiCreateError('MISSING_RECORD_TYPE', 'Please provide the record type of the search.');
    }
    if(!params) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params is required');
    }

    if (this.isMultiBook && params.bookId) {
        this.multiBookJoinColumn = 'accountingtransaction';
    }

    this.filterExpression = [];
    this.filters = [];
    this.columns = [];

    this.createSearchColumns(params);
    this.createSearchFilters(params);
};

TAF.DAO.SearchDAO.prototype.createSearchColumns = function _createSearchColumns(params) {
    for (var field in this.fields) {
        this.columns.push(new nlobjSearchColumn(this.fields[field]));
    }
};

TAF.DAO.SearchDAO.prototype.createSearchFilters = function _createSearchFilters(params) {
    var operator = 'is';
    for (var field in this.fields) {
        if (params[field]) {
            operator = Array.isArray(params[field]) ? 'anyof' : 'is';
            this.filters.push(new nlobjSearchFilter(this.fields[field], null, operator, params[field]));
        }
    }
};

TAF.DAO.SearchDAO.prototype.getList = function _getList(startIndex, endIndex) {
    if (!this.searchResult) {
        throw nlapiCreateError('INVALID_SEARCH', 'Unable to extract report data');
    }

    try {
        var list = [];
        var start = startIndex || 0;
        var end = endIndex || (start + this.MAX_RESULTS_PER_LINE);
        var sr = this.searchResult.getResults(start, end);

        for (var isr = 0; sr && isr < sr.length; isr++) {
            list.push(this.rowToObject(sr[isr]));
        }
        
        this.hasMoreRows = list.length >= this.MAX_RESULTS_PER_LINE;
    } catch (ex) {
        nlapiLogExecution('ERROR', this.name + '.getList', ex.toString());
        throw ex;
    }
    return list;
};

TAF.DAO.SearchDAO.prototype.search = function _search(params) {
    try {
        this.searchObj = this.savedSearchId ? nlapiLoadSearch(this.recordType, this.savedSearchId) : nlapiCreateSearch(this.recordType);

        this.initialize(params);

        if (this.filterExpression.length > 0) {
            this.searchObj.setFilterExpression(this.filterExpression);
        }
        if (this.filters.length > 0) {
            this.searchObj.addFilters(this.filters);
        }
        if (this.columns.length > 0) {
            this.searchObj.addColumns(this.columns);
        }

        this.searchResult = this.searchObj.runSearch();
        return this; //this is to allow call-chaining
    } catch (ex) {
        nlapiLogExecution('ERROR', this.name + '.search', ex.toString());
        throw ex;
    }
};

TAF.DAO.SearchDAO.prototype.rowToObject = function _rowToObject(row) {
    return row;
};

TAF.DAO.SearchDAO.prototype.getMap = function _getMap(startIndex, endIndex) {
    if (!this.searchResult) {
        throw nlapiCreateError('INVALID_SEARCH', 'Unable to extract report data');
    }

    try {
        var map = [];
        var start = startIndex || 0;
        var end = endIndex || (start + this.MAX_RESULTS_PER_LINE);
        var sr = this.searchResult.getResults(start, end);

        for (var isr = 0; sr && isr < sr.length; isr++) {
            map[sr[isr].getId()] = this.rowToObject(sr[isr]);
        }

    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.DAO.SearchDAO.getList', ex.toString());
        throw ex;
    }
    return map;
};

