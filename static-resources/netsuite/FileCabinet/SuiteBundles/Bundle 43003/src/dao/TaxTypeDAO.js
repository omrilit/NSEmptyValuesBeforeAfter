/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */

if (!VAT) { var VAT = {}; }
VAT.DAO = VAT.DAO || {};

VAT.DAO.TaxType = function _TaxType(id) {
	return {
		id: id,
		recordtype: 'taxtype',
		name: '',
		description: '',
		moss: 'F',
		saletaxacct: '',
		purchtaxacct: ''
	};
};

VAT.DAO.TaxTypeDao = function _TaxTypeDao() {};

VAT.DAO.TaxTypeDao.prototype.create = function _create(taxTypeObj) {
	try {
		if(!taxTypeObj) 
			throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'Parameter null');
		
		if(!(taxTypeObj.hasOwnProperty('saletaxacct') && taxTypeObj.hasOwnProperty('purchtaxacct')))
			throw nlapiCreateError('INVALID_PARAMETER_OBJECT', 'Parameter footprint doesnt match the one defined above');
		
		var taxTypeRec = nlapiCreateRecord('taxtype', {recordmode: 'dynamic', country: taxTypeObj.nexuscountry});

		for (var key in taxTypeObj) {
		    if (['id', 'recordtype', 'saletaxacct', 'purchtaxacct'].indexOf(key) == -1) {
		        taxTypeRec.setFieldValue(key, taxTypeObj[key]);
		    }
		}

		taxTypeRec.setLineItemValue('nexusestax', 'saletaxacct', '1', taxTypeObj.saletaxacct);
		taxTypeRec.setLineItemValue('nexusestax', 'purchtaxacct', '1', taxTypeObj.purchtaxacct);

		var taxTypeId = nlapiSubmitRecord(taxTypeRec);
		taxTypeObj.id = taxTypeId;
		return taxTypeObj;
	} catch (ex) {
		logException(ex, "VAT.DAO.TaxTypeDao.create");
		throw ex;
	}
};
