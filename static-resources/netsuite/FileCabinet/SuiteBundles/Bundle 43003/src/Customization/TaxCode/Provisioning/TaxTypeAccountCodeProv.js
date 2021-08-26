/**
 * Copyright © 2015, 2017, Oracle and/or its affiliates. All rights reserved.
 */

if (!VAT) { var VAT = {}; }

VAT.TaxProvisioning = function _taxProvisioning(nexus, isVat) {
	if (!nexus) {
		throw nlapiCreateError('MISSING_REQD_ARGUMENT', 'nexus is required');
	}

	this.nexus = nexus.toString().toUpperCase();
	this.defaultTaxTypeId;
	this.taxType = isVat ? 'VAT' : 'GST';
};

VAT.TaxProvisioning.prototype.run = function() {
	try {
        var taxCodesXML = new XMLData("4450_taxcode_prov.xml", "c38c2877-1200-4b7b-a733-f6ca16094bc0", this.nexus);
        if (!taxCodesXML.IsTaxProvision) {
            nlapiLogExecution('AUDIT', 'VAT.TaxProvisioning.run', 'Tax provisioning is not available for ' + this.nexus);
            return;
        }

		var taxAgency = new VAT.DAO.TaxCodeDao().getTaxAgency(this.nexus);
		var undeletedTaxCodes = this.processTaxCodesByCountry(this.nexus);
		
		var taxTypeId = this.getTaxTypeId();
        var taxCodeMgr = new TaxCode();
		var nexusTaxCodes = taxCodesXML.NexusTaxCodes;	
		for (var tc in nexusTaxCodes) {
			var taxCode = nexusTaxCodes[tc];
			if (undeletedTaxCodes[tc] == taxCode.itemid.toString()) {
				continue;
			}

			var createdTaxCode = this.createTaxCodeRecord(this.nexus, taxTypeId, taxAgency.id);
			taxCodeMgr.createTaxCode(taxCodesXML, taxCode, createdTaxCode);
		}
	} catch (ex) {
		logException(ex, 'VAT.TaxProvisioning.run');
	}
};

VAT.TaxProvisioning.prototype.processTaxCodesByCountry = function(country) {
	if (!country) {
		throw nlapiCreateError('MISSING_REQD_ARGUMENT', 'country is required');
	}
	
	var result = this.getTaxCodesByCountry(country);
	
	if (result && result[0]){
		this.defaultTaxTypeId = result[0].getValue('taxtype');
	}
	
	return this.deleteTaxCodesByCountry(result);	
}

VAT.TaxProvisioning.prototype.getTaxCodesByCountry = function(country) {
	var filters = new nlobjSearchFilter('country', null, 'is', country);
	var columns = [				
					new nlobjSearchColumn('internalid').setSort(),
					new nlobjSearchColumn('name'),
					new nlobjSearchColumn('taxtype')];

	return nlapiSearchRecord('salestaxitem', null, filters, columns);
}

VAT.TaxProvisioning.prototype.deleteTaxCodesByCountry = function(result) {	
	var undeletedTaxCodes = {};
	for (var isr = 0; result && isr < result.length; isr++) {
		var taxCodeId = result[isr].getId();		
		try {
			nlapiDeleteRecord('salestaxitem', taxCodeId);
		} catch (ex) {
			undeletedTaxCodes[result[isr].getValue('name')] = taxCodeId;
		}
	}
	return undeletedTaxCodes;
};

VAT.TaxProvisioning.prototype.getTaxTypeId = function(country) {
	if (this.defaultTaxTypeId){
		return this.defaultTaxTypeId;
	}
	
	var taxTypeName = this.taxType + '_' + this.nexus;
	var taxTypeId = this.getTaxTypeByName(taxTypeName);
	
	if (!taxTypeId) {
		var nexusId = this.getNexusIdByCountry(this.nexus);
		var taxAccounts = this.createTaxAccounts(nexusId, this.nexus, this.taxType);
		taxTypeId = this.createTaxType(this.nexus, taxTypeName, taxAccounts.sale, taxAccounts.purchase);
	}
	
	return taxTypeId;
}


VAT.TaxProvisioning.prototype.getNexusIdByCountry = function(country) {
	if (!country) {
		throw nlapiCreateError('MISSING_REQD_ARGUMENT', 'country is required');
	}

	var nexusId = null;
	var sr = nlapiSearchRecord('nexus', null, new nlobjSearchFilter('country', null, 'is', country));
	if (sr && sr.length > 0) {
		nexusId = sr[0].getId();
	}
	return nexusId;
};

VAT.TaxProvisioning.prototype.getTaxTypeByName = function(taxTypeName) {
	if (!taxTypeName) {
		throw nlapiCreateError('MISSING_REQD_ARGUMENT', 'taxTypeName is required');
	}

	var taxTypeId = null;
	var filter = new nlobjSearchFilter('name', null, 'is', taxTypeName);
	var sr = nlapiSearchRecord('taxtype', null, filter);
	if (sr && sr.length > 0) {
		taxTypeId = sr[0].getId();
	}
	return taxTypeId;
};

VAT.TaxProvisioning.prototype.createTaxType = function(country, taxTypeName, saleId, purchaseId) {
	if (!country) {
		throw nlapiCreateError('MISSING_REQD_ARGUMENT', 'country is required');
	}
	if (!taxTypeName) {
		throw nlapiCreateError('MISSING_REQD_ARGUMENT', 'taxTypeName is required');
	}
	if (!saleId) {
		throw nlapiCreateError('MISSING_REQD_ARGUMENT', 'saleId is required');
	}
	if (!purchaseId) {
		throw nlapiCreateError('MISSING_REQD_ARGUMENT', 'purchaseId is required');
	}

	var taxType = new VAT.DAO.TaxType();
	taxType.name = taxTypeName;
	taxType.nexuscountry = country;
	taxType.saletaxacct = saleId;
	taxType.purchtaxacct = purchaseId;

	try {
		taxType = new VAT.DAO.TaxTypeDao().create(taxType);
	} catch (ex) {
		logException(ex, 'VAT.TaxProvisioning.createTaxType');
	}
	return taxType ? taxType.id : null;
};

VAT.TaxProvisioning.prototype.createTaxAccounts = function(nexusId, country, taxType) {
	if (!nexusId) {
		throw nlapiCreateError('MISSING_REQD_ARGUMENT', 'nexusId is required');
	}
	if (!country) {
		throw nlapiCreateError('MISSING_REQD_ARGUMENT', 'country is required');
	}
	if (!taxType) {
		throw nlapiCreateError('MISSING_REQD_ARGUMENT', 'taxType is required');
	}

	var taxAccounts = {};
	var taxAccountTypes = {
		sale : country + ' ' + taxType + ' on Sales',
		purchase: country + ' ' + taxType + ' on Purchases',
		liability: country + ' ' + taxType + ' Liability'
	};

	try {
		for (var type in taxAccountTypes) {
			var taxControlAccount = new VAT.DAO.TaxControlAccount();
			taxControlAccount.nexusid = nexusId;
			taxControlAccount.name = taxAccountTypes[type];
			taxControlAccount.taxaccttype = type == 'purchase' ? type : 'sale';
			taxControlAccount = new VAT.DAO.TaxControlAccountDAO().create(taxControlAccount);
			taxAccounts[type] = taxControlAccount.id;
		}
	} catch (ex) {
		logException(ex, 'VAT.TaxProvisioning.createTaxAccounts');
	}
	return taxAccounts;
};

VAT.TaxProvisioning.prototype.createTaxCodeRecord = function _create(country, taxTypeId, vendorId) {
	if (!country) {
		throw nlapiCreateError('MISSING_REQD_ARGUMENT', 'country is required');
	}
	if (!taxTypeId) {
		throw nlapiCreateError('MISSING_REQD_ARGUMENT', 'taxTypeId is required');
	}
	if (!vendorId) {
		throw nlapiCreateError('MISSING_REQD_ARGUMENT', 'vendorId is required');
	}

	var taxCodeRec = null;

	var taxCode = new VAT.DAO.TaxCode();
	taxCode.nexuscountry = country;
	taxCode.includechildren = 'T';
	taxCode.itemid = 'temp_taxcode';
	taxCode.rate = 0;
	taxCode.taxagency = vendorId;
	taxCode.taxtype = taxTypeId;
	taxCode.available = 'BOTH';

	try {
		taxCodeRec = nlapiCreateRecord('salestaxitem', {
			nexuscountry: taxCode.nexuscountry,
			recordmode: "dynamic"
		});

		for (var key in taxCode) {
			if (['id', 'recordtype'].indexOf(key) == -1) {
				taxCodeRec.setFieldValue(key, taxCode[key]);
			}
		}
	} catch (ex) {
		logException(ex, "VAT.DAO.TaxProvisioning.createTaxCodeRecord");
	}
	return taxCodeRec;
};
