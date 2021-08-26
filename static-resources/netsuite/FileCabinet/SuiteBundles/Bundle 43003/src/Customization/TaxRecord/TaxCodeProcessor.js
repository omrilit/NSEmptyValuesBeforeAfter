/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */

if (!VAT) { var VAT = {}; }
VAT.TaxRecord = VAT.TaxRecord || {};
VAT.TaxRecord.TaxCodeProcessor = function _TaxCodeProcessor(dao) {
};
VAT.TaxRecord.TaxCodeProcessor.prototype.process = function _process(taxCodeObj) {
    try{
       for(var nexusCode in taxCodeObj){
			var nexusObj = taxCodeObj[nexusCode];
			var taxCodes = nexusObj.TaxCode;
			var taxTypeId = this.getTaxTypeId(nexusObj);
			var taxAgencyId = this.getTaxAgencyId(nexusObj);
			for(var select in taxCodes){
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
		logException(ex, "VAT.TaxRecord.TaxCodeProcessor.process");
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
		var keys = Object.keys(nexusTax.TaxAgency);
	}catch(ex){
		logException(ex, "VAT.TaxRecord.TaxCodeProcessor.getTaxAgencyId");
		return null;
	}
};