/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */

if (!VAT) { var VAT = {}; }
VAT.TaxRecord = VAT.TaxRecord || {};
VAT.TaxRecord.TaxCodeProcessor = function _TaxCodeProcessor(dao) {	this._dao = dao || new VAT.DAO.TaxCodeDao();
};
VAT.TaxRecord.TaxCodeProcessor.prototype.process = function _process(taxCodeObj) {	if(!taxCodeObj) 		throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'Parameter null or missing Tax Codes');	
    try{
       for(var nexusCode in taxCodeObj){
			var nexusObj = taxCodeObj[nexusCode];
			var taxCodes = nexusObj.TaxCode;
			var taxTypeId = this.getTaxTypeId(nexusObj);
			var taxAgencyId = this.getTaxAgencyId(nexusObj);
			for(var select in taxCodes){				var taxCode = taxCodes[select];
				taxCode.taxtype = taxTypeId;
				taxCode.taxagency = taxAgencyId;
				taxCode.nexuscountry = nexusObj.Nexus.country;
				if(!taxCode.id && taxAgencyId && taxTypeId){
					var createdObj = this._dao.create(taxCode);
					taxCode.id = createdObj.id;
				}
			}
		}
		return taxCodeObj;
	}catch(ex){
		logException(ex, "VAT.TaxRecord.TaxCodeProcessor.process");		return null;
	}
};
VAT.TaxRecord.TaxCodeProcessor.prototype.getTaxTypeId = function _getTaxTypeId(nexusTax) {
	try{
		var keys = Object.keys(nexusTax.TaxType);
		return nexusTax.TaxType[keys[0]].id;
	}catch(ex){
		logException(ex, "VAT.TaxRecord.TaxCodeProcessor.getTaxTypeId");
		return null;
	}
};
VAT.TaxRecord.TaxCodeProcessor.prototype.getTaxAgencyId = function _getTaxAgencyId(nexusTax) {
	try{
		var keys = Object.keys(nexusTax.TaxAgency);		return nexusTax.TaxAgency[keys[0]].id;
	}catch(ex){
		logException(ex, "VAT.TaxRecord.TaxCodeProcessor.getTaxAgencyId");
		return null;
	}
};