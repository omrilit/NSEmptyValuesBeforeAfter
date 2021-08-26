/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax.DAO = Tax.DAO || {};

Tax.DAO.RecordDAO =  function RecordDAO() {
	Tax.DAO.BaseDAO.call(this);
	this.Name = 'RecordDAO';
	this.recordType = '';
	this.id = null;
	this.columns = [];
	this.filters = [];
};
Tax.DAO.RecordDAO.prototype = Object.create(Tax.DAO.BaseDAO.prototype);

Tax.DAO.RecordDAO.prototype.search = function _search(params) {
	if (!this.recordType) {
		throw nlapiCreateError('INVALID_RECORD_TYPE', 'Please provide the name of the record.');
	}
	
	try {
		return nlapiSearchRecord(this.recordType, this.id, this.filters, this.columns);
	} catch(e) {
	    logException(e, 'RecordDAO.search');
		throw e;
	}
};