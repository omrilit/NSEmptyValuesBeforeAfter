/**
 * Copyright 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

if (!TAF) { var TAF = {}; }
TAF.DAO = TAF.DAO || {};

TAF.DAO.Vendor = function _Vendor(id) {
	var vendor = {
		vendorId: id,
		firstName: '',
		middleName: '',
		lastName: '',
		entityId: '',
		billCountryCode: '',
		vatRegNumber: '',
		isPerson: '',
		companyName: '',
		mxRfc: '',
		subsidiary: ''
	};

	return vendor;
};

TAF.DAO.VendorDao = function _VendorDao() {
	this.RECORD_NAME = 'vendor';
};

TAF.DAO.VendorDao.prototype.GetVendorSubsidiaries = function _GetVendorSubsidiaries(vendorId){
	var vendors = nlapiSearchRecord(this.RECORD_NAME, null, 
		[new nlobjSearchFilter("internalid", null, "is", vendorId)], 
		[new nlobjSearchColumn("subsidiary")]);

	var result = [];
	for (var i = 0; vendors && i < vendors.length; i++) {
		var vendor = vendors[i];
		var subId = vendor.getValue('subsidiary');
		result.push(subId);
	}
	return result;
};

TAF.DAO.VendorDao.prototype.getVendorById = function _getVendorById(vendorId){
	var vendor = {};
	try {
		var rec = nlapiLoadRecord('vendor', vendorId);
		vendor = this.convertToObject(rec);
	} catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.DAO.VendorDao.getVendorById', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'TAF.DAO.VendorDao.getVendorById');
	}
	return vendor;
};

TAF.DAO.VendorDao.prototype.convertToObject = function _convertToObject(row){
	var vendor = new TAF.DAO.Vendor();

	try {
		vendor.vendorId = row.getId();
		vendor.firstName = row.getFieldValue('firstname') || '';
		vendor.middleName = row.getFieldValue('middlename') || '';
		vendor.lastName = row.getFieldValue('lastname') || '';
		vendor.entityId = row.getFieldValue('entityid') || '';
		vendor.billCountryCode = row.getFieldValue('billcountry') || '';
		vendor.vatRegNumber = row.getFieldValue('vatregnumber') || '';
		vendor.isPerson = row.getFieldValue('isperson') || '';
		vendor.companyName = row.getFieldValue('companyname') || '';
		vendor.mxRfc = row.getFieldValue('custentity_mx_rfc') || '';
		vendor.subsidiary = row.getFieldValue('subsidiary') || '';
	} catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.DAO.VendorDao.convertToObject', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'TAF.DAO.VendorDao.convertToObject');
	}

	return vendor;
};
