/**
 * Copyright © 2016, Oracle and/or its affiliates. All rights reserved.
 */

var ITR = ITR || {};

ITR.ViewBag = function _ViewBag(nsForm){
	this.nsForm = nsForm;
};

ITR.ViewBag.prototype.CreateBag = function _CreateBag(valueIndex){
	var field = nlapiGetField(valueIndex);
	if (!field && this.nsForm){
		this.nsForm.addField(valueIndex, 'longtext').setDisplayType('hidden');
	}
};

ITR.ViewBag.prototype.SetValue = function _SetValue(valueIndex, value){
	this.CreateBag(valueIndex); 
	var values = {};
	values[valueIndex] = JSON.stringify(value);
	if(this.nsForm)
		this.nsForm.setFieldValues(values);
};

ITR.ViewBag.prototype.GetValue = function _GetValue(valueIndex){
	var fieldValue = nlapiGetFieldValue(valueIndex);
	return fieldValue ? JSON.parse(fieldValue): {};
};

ITR.ViewBag.prototype.SetFieldVisibility = function _SetFieldVisibility(field, isVisible)
{
	if (!this.nsForm) return;
	
	var entityField = this.nsForm.getField(field);
	if (!entityField) return; 
	
	entityField.setDisplayType(
		this.GetDisplayType(isVisible));
};

ITR.ViewBag.prototype.GetDisplayType = function _GetDisplayType(isVisible){
	return isVisible ? "normal": "hidden";
};