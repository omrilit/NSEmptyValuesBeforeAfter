/**
 * Copyright 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.ViewBag = function _ViewBag(nsForm){
	this.nsForm = nsForm;
};

TAF.ViewBag.prototype.CreateBag = function _CreateBag(valueIndex){
	var field = nlapiGetField(valueIndex);
	if (!field && this.nsForm){
		this.nsForm.addField(valueIndex, 'longtext').setDisplayType('hidden');
	}
};

TAF.ViewBag.prototype.SetValue = function _SetValue(valueIndex, value){
	this.CreateBag(valueIndex); 
	var values = {};
	values[valueIndex] = JSON.stringify(value);
	if(this.nsForm)
		this.nsForm.setFieldValues(values);
};

TAF.ViewBag.prototype.GetValue = function _GetValue(valueIndex){
	var fieldValue = nlapiGetFieldValue(valueIndex);
	return fieldValue ? JSON.parse(fieldValue): {};
};

TAF.ViewBag.prototype.SetFieldVisibility = function _SetFieldVisibility(field, isVisible)
{
	if (!this.nsForm) return;
	
	var entityField = this.nsForm.getField(field);
	if (!entityField) return; 
	
	entityField.setDisplayType(
		this.GetDisplayType(isVisible));
};

TAF.ViewBag.prototype.GetDisplayType = function _GetDisplayType(isVisible){
	return isVisible ? "normal": "hidden";
};