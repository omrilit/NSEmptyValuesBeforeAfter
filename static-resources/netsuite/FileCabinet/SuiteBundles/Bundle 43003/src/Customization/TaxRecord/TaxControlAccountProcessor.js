/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */
if (!VAT) { var VAT = {}; }
VAT.TaxRecord = VAT.TaxRecord || {};
VAT.TaxRecord.TaxControlAccountProcessor = function _TaxControlAccountProcessor(dao) {
VAT.TaxRecord.TaxControlAccountProcessor.prototype.process = function _process(taxCodeObj) {
	try{
		for(var nexusCode in taxCodeObj){
			var controlAccounts = taxCode.TaxControlAccount;
			for(var select in controlAccounts){
				if(controlAccount && !controlAccount.id){
					controlAccount.nexusid = taxCode.Nexus.id;
					var createdObj = this._dao.create(controlAccount);
					if(createdObj){
						controlAccount.id = createdObj.id;
					}else{
						throw nlapiCreateError("Creation Error", "Unable to create Tax Control Account");
					}
				}
			}
		}
		return taxCodeObj;
	}catch(ex){
		logException(ex, "VAT.TaxRecord.TaxControlAccountProcessor.process");
		throw nlapiCreateError("Tax Control Account creation error", ex.toString());
	}
};