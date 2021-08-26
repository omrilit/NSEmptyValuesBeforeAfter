/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */

if (!VAT) { var VAT = {}; }
VAT.DAO = VAT.DAO || {};

VAT.DAO.TaxControlAccount = function _TaxControlAccount(id) {
	return {
		id: id,
		recordtype: 'taxacct',
		name: '',
		taxaccttype: '',
		isinactive: 'F'
	};
};

VAT.DAO.TaxControlAccountDAO = function _TaxControlAccountDAO() {};

VAT.DAO.TaxControlAccountDAO.prototype.create = function _create(taxControlObj) {
	try {
		var taxControlRec = nlapiCreateRecord('taxacct', {recordmode: 'dynamic', nexus: taxControlObj.nexusid});

		for (var key in taxControlObj) {
		    if (['id', 'recordtype'].indexOf(key) == -1) {
		        taxControlRec.setFieldValue(key, taxControlObj[key]);
		    }
		}

		var taxControlId = nlapiSubmitRecord(taxControlRec);
		taxControlObj.id = taxControlId;
		return taxControlObj;
	} catch (ex) {
		logException(ex, "VAT.DAO.TaxControlAccountDAO.create");
		throw ex;
	}
};