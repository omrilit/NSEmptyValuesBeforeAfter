/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */

if (!VAT) { var VAT = {}; }
VAT.MOSS = VAT.MOSS || {};

VAT.MOSS.TaxRecordAdaptor = function _TaxRecordAdaptor() {};

VAT.MOSS.TaxRecordAdaptor.prototype.adapt = function _adapt(taxCodeObj) {
	return this.addTaxAgency(taxCodeObj);
};

VAT.MOSS.TaxRecordAdaptor.prototype.addTaxAgency = function _addTaxAgency(taxCodeObj) {
	try {
		var dao = new VAT.DAO.TaxCodeDao();
		for (var nexusCode in taxCodeObj) {
			taxCodeObj[nexusCode].TaxAgency = {};

			var taxAgencyObj = dao.getTaxAgency(taxCodeObj[nexusCode].Nexus.country);

			if (taxAgencyObj) {
				taxCodeObj[nexusCode].TaxAgency[taxAgencyObj.name] = taxAgencyObj;
			} else {
				throw nlapiCreateError("Tax Agency Error", "No Tax Agency found");
			}

		}
		return taxCodeObj;
	} catch (ex) {
		logException(ex, "VAT.MOSS.TaxRecordAdaptor.addTaxAgency");
		throw nlapiCreateError("Tax Agency Error", "No Tax Agency found");
	}
};