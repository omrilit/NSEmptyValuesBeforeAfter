/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */
if (!VAT) { var VAT = {}; }
VAT.TaxRecord = VAT.TaxRecord || {};
VAT.TaxRecord.TaxControlAccountProcessor = function _TaxControlAccountProcessor(dao) {	this._dao = dao || new VAT.DAO.TaxControlAccountDAO();};
VAT.TaxRecord.TaxControlAccountProcessor.prototype.process = function _process(taxCodeObj) {
	try{		if(!taxCodeObj) return null;		
		for(var nexusCode in taxCodeObj){			var taxCode = taxCodeObj[nexusCode];
			var controlAccounts = taxCode.TaxControlAccount;
			for(var select in controlAccounts){				var controlAccount = controlAccounts[select];
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
