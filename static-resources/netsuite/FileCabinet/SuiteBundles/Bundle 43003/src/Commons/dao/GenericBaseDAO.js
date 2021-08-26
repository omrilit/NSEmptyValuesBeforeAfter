/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax = Tax || {};
Tax.DAO = Tax.DAO || {};

Tax.DAO.BaseDAO = function BaseDAO() {
	Tax.Processor.call(this);
	this.Name = 'BaseDAO';
	this.list = [];
};
Tax.DAO.BaseDAO.prototype = Object.create(Tax.Processor.prototype);

Tax.DAO.BaseDAO.prototype.prepareSearch = function prepareSearch(params) {
	//perform parameter validations here
	//perform pre-searching routines here, e.g. adding of filters
};

Tax.DAO.BaseDAO.prototype.search = function search() {
	return [];
};

Tax.DAO.BaseDAO.prototype.processList = function processList(rows) {
	for (var i = 0; rows && i < rows.length; i++) {
		this.list.push(this.rowToObject(rows[i]));
	}
	return this.list;
};

Tax.DAO.BaseDAO.prototype.processRecord = function processRecord(record) {
	this.list = this.recordToObject(record);
	return this.list;
};

Tax.DAO.BaseDAO.prototype.getList = function getList(params) {
	try {
		this.prepareSearch(params);
		this.processList(this.search());
		return this.list;
	} catch(ex) {
		throw ex;
	}
};

Tax.DAO.BaseDAO.prototype.getRecord = function(params) {
	if (!params.id) {
		throw nlapiCreateError('MISSING_PARAMETER', 'params.id is required!');
	}
	try {
		var list = this.processRecord(nlapiLoadRecord(this.recordType, params.id));
		return {dao: list};
	} catch (ex) {
		throw ex;
	}
};

Tax.DAO.BaseDAO.prototype.ListObject = function(row) {
	return row;
};

Tax.DAO.BaseDAO.prototype.rowToObject = function rowToObject(row) {
	return new this.ListObject(row);
};

Tax.DAO.BaseDAO.prototype.recordToObject = function recordToObject(record) {
	var objRecord = new this.ListObject(record.getId());
	for (var field in this.fields) {
		objRecord[field] = record.getFieldValue(this.fields[field]);
	}
	return objRecord;
};

Tax.DAO.BaseDAO.prototype.process = function(result, params) {
	var cache = this.getCache(this.Name);
	if (cache) {
		return {dao: cache};
	}
	var list = this.getList(params);
	this.cache(this.Name, list);
	return {dao: list};
};

Tax.DAO.BaseDAO.prototype.getCache = function(cacheName) {
	if (!cacheName) {
		throw nlapiCreateError('MISSING_PARAMETER', 'cacheName parameter is required');
	}

	var cache = Tax.Cache.MemoryCache.getInstance().load(cacheName);
	return cache;
};

Tax.DAO.BaseDAO.prototype.cache = function(cacheName, data) {
	if (!cacheName) {
		throw nlapiCreateError('MISSING_PARAMETER', 'cacheName parameter is required');
	}

	var cache = Tax.Cache.MemoryCache.getInstance().save(cacheName, data);
	return cache;
};