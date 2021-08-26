/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */

if (!VAT) { var VAT = {}; }
VAT.TaxRecord = VAT.TaxRecord || {};

VAT.TaxRecord.TaxTypeProcessor = function _TaxTypeProcessor() {};

VAT.TaxRecord.TaxTypeProcessor.prototype.process = function _process(taxCodeObj) {
	try{
		var dao = new VAT.DAO.TaxTypeDao();
		
		for(var nexusCode in taxCodeObj){
			var types = taxCodeObj[nexusCode].TaxType;
			var taxControlId = this.getTaxControlId(taxCodeObj[nexusCode]);
			var nexusCountry = taxCodeObj[nexusCode].Nexus.country;
			
			for(var select in types){
				types[select].saletaxacct = taxControlId;
				types[select].nexuscountry = nexusCountry;
				
				if(!types[select].id){
					var createdObj = dao.create(types[select]);
					
					if(createdObj){
						taxCodeObj[nexusCode].TaxType[select].id = createdObj.id;
					}else{
						throw nlapiCreateError("Creation Error", "Unable to create Tax Type");
					}
				}
			}
		}
		return taxCodeObj;
	}catch(ex){
		logException(ex, "VAT.TaxRecord.TaxTypeProcessor.process");
		throw nlapiCreateError("Tax Type creation error", ex.toString());
	}
};

VAT.TaxRecord.TaxTypeProcessor.prototype.getTaxControlId = function _getTaxControlId(nexusTax) {
	try{
		var keys = Object.keys(nexusTax.TaxControlAccount);
		return nexusTax.TaxControlAccount[keys[0]].id;
	}catch(ex){
		logException(ex, "VAT.TaxRecord.TaxTypeProcessor.getTaxControlId");
		return null;
	}
};

