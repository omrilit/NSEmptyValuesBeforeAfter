/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */

if (!VAT) { var VAT = {}; }
VAT.MOSS = VAT.MOSS || {};

VAT.MOSS.TaxCountry = {
    "GR" : "EL"
};

VAT.MOSS.TaxCodesExtractor = function TaxCodesExtractor() {
	this.FileObject = new VAT.MOSS.TaxPropertiesFile();
	this.SEPARATOR = '-';
	this.UNDEFINED = 'undefined';
};

VAT.MOSS.TaxCodesExtractor.prototype.getTaxRecords = function getTaxRecords(nexusObject) {
	
	var taxCodesList = null;
	
	if (!nexusObject) {
		nlapiLogExecution('ERROR', 'MOSSTaxCodesExtractor.getTaxRecords()', 'Nexus object is null.');
		throw nlapiCreateError('Null Object', 'MOSSTaxCodesExtractor.getTaxRecords(): Nexus object is null.'); 
	}
	
	if (typeof nexusObject.id == 'undefined' || typeof nexusObject.country == 'undefined') {
		nlapiLogExecution('ERROR', 'MOSSTaxCodesExtractor.getTaxRecords()', 'Nexus id or country code is undefined.');
		throw nlapiCreateError('Undefined property', 'MOSSTaxCodesExtractor.getTaxRecords(): Nexus id or country code is undefined.'); 
	}
		
	var nexusTaxProperties = this.getMOSSNexusTaxProperties(nexusObject.country, this.FileObject);
	
	if (!nexusTaxProperties) {
		nlapiLogExecution('ERROR', 'MOSSTaxCodesExtractor.getTaxRecords()', 'No Tax Properties for given MOSS Nexus is defined.');
		throw nlapiCreateError('Null Object', 'MOSSTaxCodesExtractor.getTaxRecords(): No Tax Properties for given MOSS Nexus is defined.');
	}
	
	taxCodesList = {};
	taxCodesList[nexusObject.country] = {};
	
	for (var classname in nexusTaxProperties) {
		
		taxCodesList[nexusObject.country][classname] = {};
		var records = nexusTaxProperties[classname];
		
		for (var recordname in records) {
			
			taxCodesList[nexusObject.country][classname][recordname] = {};
			var taxRecordJSON = records[recordname];
			
			if (!VAT.DAO.hasOwnProperty([classname])) {
				throw nlapiCreateError('Undefined property', 'MOSSTaxCodesExtractor.getTaxRecords(): No Classname property exist.');
			}
			
			var taxRecordObj = new VAT.DAO[classname]();
			
			for (var attribute in taxRecordJSON) {
				taxRecordObj[attribute] = taxRecordJSON[attribute];
			}
			
			taxCodesList[nexusObject.country][classname][recordname] = taxRecordObj;
		}
	}
	
	taxCodesList[nexusObject.country].Nexus = nexusObject; 
	return taxCodesList;
};


VAT.MOSS.TaxCodesExtractor.prototype.getMOSSNexusTaxProperties = function getMOSSNexusTaxProperties(nexus, fileObject) {
	
	var taxProperties = null;
	var NewTaxCodes = {}; 
	
	if (!nexus) {
		nlapiLogExecution('ERROR', 'MOSSTaxCodesExtractor.getMOSSNexusTaxProperties()', 'Nexus parameter is null');
		return taxProperties;
	} 
	
	if (!fileObject) {
		nlapiLogExecution('ERROR', 'MOSSTaxCodesExtractor.getMOSSNexusTaxProperties()', 'File Object is null');
		return taxProperties;
	}
	
	taxProperties = typeof fileObject[nexus] == this.UNDEFINED ? null : fileObject[nexus];	

	if (taxProperties) {
		for (var nexuskey in fileObject) {
			if (nexuskey != nexus) {
				for (var taxcode in fileObject[nexuskey].TaxCode) {
					var taxcodeattributes = fileObject[nexuskey].TaxCode[taxcode];
					var nexusName = VAT.MOSS.TaxCountry[nexus] || nexus;
					var mosstaxcode = taxcode + this.SEPARATOR + nexusName;
					taxcodeattributes.itemid = mosstaxcode;
					NewTaxCodes[mosstaxcode] = taxcodeattributes;
				}
			}
		}
		taxProperties.TaxCode = NewTaxCodes;
	}
	
	return taxProperties;
};
