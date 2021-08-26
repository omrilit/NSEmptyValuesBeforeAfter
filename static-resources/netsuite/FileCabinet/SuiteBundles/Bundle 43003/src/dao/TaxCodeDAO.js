/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */

if (!VAT) { var VAT = {}; }
VAT.DAO = VAT.DAO || {};

VAT.DAO.TaxCode = function _TaxCode(id) {
	return {
		id: id,
		recordtype: 'salestaxitem',
		itemid: '',
		rate: 0,
		taxagency: '',
		taxtype: '',
		available: '',
		effectivefrom: '',
		validuntil: '',
		isdefault: 'F',
		isinactive: 'F'
	};
};

VAT.DAO.TaxCodeDao = function _TaxCodeDao() {};

VAT.DAO.TaxCodeDao.prototype.getTaxAgency = function _getTaxAgency(nexusCode) {
	try {
		var taxAgencyObj = null;
		var filters = [new nlobjSearchFilter('country', null, 'anyof', nexusCode)];
		var sr = nlapiSearchRecord('salestaxitem', null, filters);

		if (sr && sr.length > 0) {
			var rec = nlapiLoadRecord('salestaxitem', sr[0].getId());
			taxAgencyObj = new VAT.DAO.TaxAgency(rec.getFieldValue('taxagency'));
			taxAgencyObj.name = rec.getFieldText('taxagency');
		}

		return taxAgencyObj;
	} catch (ex) {
		logException(ex, "VAT.DAO.TaxCodeDao.getTaxAgency");
		return null;
	}
};

VAT.DAO.TaxCodeDao.prototype.create = function _create(taxCodeObj) {
	try {
		var taxcoderec = nlapiCreateRecord('salestaxitem', {
			nexuscountry: taxCodeObj.nexuscountry,
			recordmode: "dynamic"
		});

		for (var key in taxCodeObj) {
			if (['id', 'recordtype'].indexOf(key) == -1) {
				taxcoderec.setFieldValue(key, taxCodeObj[key]);
			}
		}
		
		var taxcodeid = nlapiSubmitRecord(taxcoderec);
		taxCodeObj.id = taxcodeid;
		nlapiLogExecution("AUDIT", "Created MOSS TaxCode: Nexus - " + taxCodeObj.nexuscountry, "Item Id: " + taxCodeObj.itemid + ", Internal Id: " + taxcodeid);

		return taxCodeObj;
	} catch (ex) {
		logException(ex, "VAT.DAO.TaxCodeDao.create");
		return ex;
	}
};