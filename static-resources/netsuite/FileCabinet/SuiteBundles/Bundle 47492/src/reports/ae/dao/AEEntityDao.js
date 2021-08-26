/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.AE = TAF.AE || {};
TAF.AE.DAO = TAF.AE.DAO || {};

TAF.AE.DAO.EntityDAO = function EntityDAO() {
	this.recordType = 'entity';
	this.fields = ['billcountry', 'shipcountry'];
};

TAF.AE.DAO.EntityDAO.prototype.getCountryById = function _getCountryById(vendorId){
	var country = {};
	
	try {
		var rec = nlapiLookupField(this.recordType, vendorId, this.fields, true);
		country = this.convertToObject(rec);
	} catch (ex) {
        throw nlapiCreateError('SEARCH_ERROR', 'TAF.AE.DAO.EntityDAO.getCountryById');
	}
	return country;
};

TAF.AE.DAO.EntityDAO.prototype.convertToObject = function _convertToObject(row){
	var entity = {};

	try {
		entity.billCountry = row.billcountry;
		entity.shipCountry = row.shipcountry;
	} catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.AE.DAO.EntityDAO.convertToObject', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'TAF.AE.DAO.EntityDAO.convertToObject');
	}

	return entity;
};