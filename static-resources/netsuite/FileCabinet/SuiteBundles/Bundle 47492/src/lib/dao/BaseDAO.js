/**
 * Copyright 2016 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 *
 * The base class of all Data Access Object classes.
 * 
 * Version    Date            Author           Remarks
 * 1.00       06 May 2016     isalen
 *
 */

if (!TAF) { var TAF = {}; }
TAF.DAO = TAF.DAO || {};

TAF.DAO.BaseDAO = function BaseDAO() {
    this.name = 'BaseDAO';
    this.list = [];
};

TAF.DAO.BaseDAO.prototype.initialize = function initialize(params) {
    //perform parameter validations here
    //perform pre-searching routines here, e.g. adding of filters
};

TAF.DAO.BaseDAO.prototype.search = function search() {
    return [];
};

TAF.DAO.BaseDAO.prototype.rowToObject = function rowToObject(row) {
    return {};
};

TAF.DAO.BaseDAO.prototype.getList = function getList(params) {
    try {
    	this.initialize(params);
    	this.processList(this.search());
    	return this.list;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'BaseDAO.getList', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'Error in running search');
    }
};

TAF.DAO.BaseDAO.prototype.processList = function processList(rows) {
    for (var i = 0; rows && i < rows.length; i++) {
        this.list.push(this.rowToObject(rows[i]));
    }
};
