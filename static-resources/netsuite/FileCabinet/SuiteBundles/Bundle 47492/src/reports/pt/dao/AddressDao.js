/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.PT = TAF.PT || {};
TAF.PT.DAO = TAF.PT.DAO || {};

TAF.PT.DAO.Address = function _Address() {
	return {
		address1:'',
		address2:'',
		city:'',
		postalCode:'',
		region:'',
		country:''
	};
};

TAF.PT.DAO.AddressDao = function _AddressDao() {};

TAF.PT.DAO.AddressDao.prototype.getAddress = function _getAddress(params) {
	
	var address = new TAF.PT.DAO.Address();
	try {
		if (params.locationId) {
			address = this._getLocationAddress(params.locationId);
		} else {
			address = nlapiGetContext().getFeature('SUBSIDIARIES') ? this._getSubsidiaryAddress(params.subId) : this._getCompanyAddress();
		}
	}catch (ex) {
		nlapiLogExecution('ERROR', 'TAF.PT.DAO.AddressDao().getAddress() exception: ' + ex.toString());
	}
	return address;
};

TAF.PT.DAO.AddressDao.prototype._getLocationAddress = function _getLocationAddress(locationId){
	var address = new TAF.PT.DAO.Address();
	var location = nlapiLoadRecord('location', locationId);
	address.address1 = location.getFieldValue('addr1') || '';
	address.address2 = location.getFieldValue('addr2') || '';
	address.city = location.getFieldValue('city') || '';
	address.postalCode = location.getFieldValue('zip') || '';
	address.region = location.getFieldValue('state') || '';
	address.country = location.getFieldValue('country') || '';
	return address;
};

TAF.PT.DAO.AddressDao.prototype._getSubsidiaryAddress = function _getSubsidiaryAddress(subId) {
	var address = new TAF.PT.DAO.Address();
	var subsidiary = nlapiLoadRecord('subsidiary', subId);
	address.address1 = subsidiary.getFieldValue('addr1') || '';
	address.address2 = subsidiary.getFieldValue('addr2') || '';
	address.postalCode = subsidiary.getFieldValue('zip') || '';
	address.city = subsidiary.getFieldValue('city') || '';
	address.region = subsidiary.getFieldValue('state') || '';
	address.country = subsidiary.getFieldValue('country') || '';
	return address;
};

TAF.PT.DAO.AddressDao.prototype._getCompanyAddress = function _getCompanyAddress() {
	var address = new TAF.PT.DAO.Address();
	var company = nlapiLoadConfiguration('companyinformation');
	address.address1 = company.getFieldValue('address1') || '';
	address.address2 = company.getFieldValue('address2') || '';
	address.postalCode = company.getFieldValue('zip') || '';
	address.city = company.getFieldValue('city') || '';
	address.region = company.getFieldValue('state') || '';
	address.country = company.getFieldValue('country') || '';
	return address;
};
