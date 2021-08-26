/**
 * Copyright 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */
var TAF = TAF || {};
TAF.UserEvent = TAF.UserEvent || {};
TAF.UE = TAF.UserEvent || {};
TAF.UE.Entity = TAF.UE.Entity || {};
TAF.DAO = TAF.DAO || {};

TAF.UE.Entity.OnBeforeLoad = function _OnBeforeLoad(nsType, nsForm, nsRequest) {
	 new TAF.UE.Entity.Hide().OnBeforeLoad(nsType, nsForm, nsRequest); 
};

TAF.UE.Entity.Hide = function _Hide() {
	var context = nlapiGetContext();
	this.isOneWorld = (context.getSetting('FEATURE', 'SUBSIDIARIES') === 'T');
	this.isUi = (context.getExecutionContext() === 'userinterface');
	this.BRN_FIELD_NAME = 'custentity_my_brn';
	this.UEN_FIELD_NAME = 'custentity_4599_sg_uen';
	this.SUPPORTED_FIELDS_BY_COUNTRY = {		
		"MY": [this.BRN_FIELD_NAME],
		"SG": [this.UEN_FIELD_NAME]
	};
	this.SUBSIDIARY_CACHE = 'custpage_taf_subsidiarycache';
	this.SUBSIDIARY_COUNTRY_COUNT = 'custpage_taf_subcountrycount';
};

TAF.UE.Entity.Hide.prototype.OnBeforeLoad = function _OnBeforeLoad(nsType, nsForm, nsRequest) {
	try {
		var viewBag = new TAF.ViewBag(nsForm);
		var subCache = this.CreateSubsidiaryCache();
		
		viewBag.SetValue(this.SUBSIDIARY_CACHE, subCache);
		var countryCount = this.CreateCountryCountCache(
			nsType, subCache, 'MY');
		
		viewBag.SetValue(this.SUBSIDIARY_COUNTRY_COUNT, countryCount);
		
		if(!this.CanUpdateVisibility(nsForm, nsType))
			return;
		
		var country = this.GetCountry(subCache);
		viewBag.SetFieldVisibility(this.UEN_FIELD_NAME, 
			this.IsFieldSupported(country, this.UEN_FIELD_NAME));
		
		if(country !== 'MY' && countryCount['MY'] > 0)
			country = 'MY';
				
		viewBag.SetFieldVisibility(this.BRN_FIELD_NAME, 
			this.IsFieldSupported(country, this.BRN_FIELD_NAME));
		
	} catch (ex) {
		nlapiLogExecution('ERROR', 'TAF.UE.Entity.Hide._OnBeforeLoad', ex.toString());
	}
};

TAF.UE.Entity.Hide.prototype.CanUpdateVisibility = function _CanUpdateVisibility(nsForm, nsType) {
	// OW: only execute if view
	// SI: always execute
	return nsForm && this.isUi && 
		(!this.isOneWorld || 
		(this.isOneWorld && nsType == 'view'));
};

TAF.UE.Entity.Hide.prototype.CreateCountryCountCache = 
	function _CreateCountryCountCache (nsType, subCache, targetCountry) {
	var vId = nlapiGetRecordId();
	var returnValue = {};
	if(targetCountry) {
		returnValue[targetCountry] = 0;
		if (vId != -1 && this.RecTypeMultiSub(nlapiGetRecordType(), nsType)) {
			var vendorSub = new TAF.DAO.VendorDao().
				GetVendorSubsidiaries(vId);
			returnValue[targetCountry] += 
				this.CountOccurencesOf(targetCountry, vendorSub, subCache);
		}	
	}
	return returnValue;
};

TAF.UE.Entity.Hide.prototype.CountOccurencesOf = function _CountOccurencesOf(targetCountry, vendorSub, subCache) {
	var ctr = 0;
	if (subCache && vendorSub) {
		for (var i = 0; i < vendorSub.length ; ++i) {
			if (subCache[vendorSub[i]] == targetCountry)
				++ctr;
		}
	}
	
	return ctr;
};  

TAF.UE.Entity.Hide.prototype.CreateSubsidiaryCache = function _CreateSubsidiaryCache() {
	try {
		return this.isOneWorld ? 
			(new TAF.DAO.SubsidiaryDao().
				getCountryList() || []):[];	
	}
	catch(ex) {
		nlapiLogExecution('ERROR', 'TAF.UE.Entity.Hide.CreateSubsidiaryCache', ex.toString());
		return [];
	}
};

TAF.UE.Entity.Hide.prototype.GetCountry = function _GetCountry(subCache) {
	try {
		if(this.isOneWorld) {
			var subCountry = subCache[nlapiGetFieldValue('subsidiary')];
			if (subCountry) {
				return subCountry;
			}
		}
		return 	nlapiLoadConfiguration('companyinformation').
				getFieldValue('country');
	}
	catch(ex) {
		nlapiLogExecution('ERROR', 'TAF.UE.Entity.Hide.GetCountry', ex.toString());
		return '';
	}
};

TAF.UE.Entity.Hide.prototype.IsFieldSupported = function _IsFieldSupported(country, field) {
	if(this.SUPPORTED_FIELDS_BY_COUNTRY) {
		var fieldsByCountry = this.SUPPORTED_FIELDS_BY_COUNTRY[country];
		if (fieldsByCountry && fieldsByCountry instanceof Array &&  
			fieldsByCountry.indexOf(field) !== -1)
			return true;
	} 
	return false;
};

TAF.UE.Entity.Hide.prototype.RecTypeMultiSub = function _RecTypeMultiSub(recType, nsType) {
	return (recType == "vendor" && 
		(nsType == "view" || nsType == "edit") && 
		this.isOneWorld);
};