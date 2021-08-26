/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.CS = TAF.CS || {};
TAF.CS.Entity = TAF.CS.Entity || {};

TAF.CS.Entity.OnFieldChanged = function _OnFieldChanged(nsType, nsName, nsLine) {	
    if (nsName == 'subsidiary') {
    	new TAF.CS.Entity.Hide().SetFieldVisibility();
    }
};

TAF.CS.Entity.OnPageInit = function _OnPageInit() {	
    new TAF.CS.Entity.Hide().SetFieldVisibility();
};

TAF.CS.Entity.OnValidateDelete = function _OnValidateDelete(nsType){
	if(nsType === "submachine")
	{		
		var hide = new TAF.CS.Entity.Hide();
		var subId = nlapiGetCurrentLineItemValue(nsType, 'subsidiary');
		var country = hide.subCache[subId];
		
		--hide.countryCount[country];
		nlapiSetFieldValue(hide.SUBSIDIARY_COUNTRY_COUNT, 
			JSON.stringify(hide.countryCount));
		
		hide.SetFieldVisibility();
	}
	return true;
};

TAF.CS.Entity.OnValidateLine = function _OnValidateLine(nsType){
	if(nsType === "submachine")
	{
		var hide = new TAF.CS.Entity.Hide();
		var subId = nlapiGetCurrentLineItemValue(nsType, 'subsidiary');
		var country = hide.subCache[subId];
		
		++hide.countryCount[country];
		nlapiSetFieldValue(hide.SUBSIDIARY_COUNTRY_COUNT, 
			JSON.stringify(hide.countryCount));
		
		hide.SetFieldVisibility();
	}
	return true;
};

TAF.CS.Entity.Hide = function _Hide(){
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
	
	// Restore Cache
	var viewBag = new TAF.ViewBag();
	this.subCache = viewBag.GetValue(this.SUBSIDIARY_CACHE);
	this.countryCount = viewBag.GetValue(this.SUBSIDIARY_COUNTRY_COUNT);
};

TAF.CS.Entity.Hide.prototype.SetFieldVisibility = function _SetFieldVisibility() {
    if (!this.CanUpdateVisibility()) {
        // Do not update if SI or not UI
        return;
    }

    var country = this.GetCountry();
    nlapiSetFieldDisplay(this.UEN_FIELD_NAME, this.IsFieldSupported(country, this.UEN_FIELD_NAME));
    if(country != 'MY' && this.countryCount['MY'] > 0)
    	country = 'MY';
    
    nlapiSetFieldDisplay(this.BRN_FIELD_NAME, 
		this.IsFieldSupported(country, this.BRN_FIELD_NAME));
};

TAF.CS.Entity.Hide.prototype.CanUpdateVisibility = function _CanUpdateVisibility(){
	return (this.isOneWorld && this.isUi) ? true: false;
};

TAF.CS.Entity.Hide.prototype.GetCountry = function _GetCountry() {
    var subId = nlapiGetFieldValue('subsidiary');
    if(!this.subCache)
    	return '';
    return this.subCache[subId] || '';
};

TAF.CS.Entity.Hide.prototype.IsFieldSupported = function _IsFieldSupported(country, fieldName){
	if(this.SUPPORTED_FIELDS_BY_COUNTRY) {
		var fieldsByCountry = this.SUPPORTED_FIELDS_BY_COUNTRY[country];
		if (fieldsByCountry && fieldsByCountry instanceof Array &&  
			fieldsByCountry.indexOf(fieldName) !== -1)
			return true;
	}
	return false;
};
