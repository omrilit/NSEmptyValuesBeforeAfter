/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */
var VAT = VAT || {};
VAT.EU = VAT.EU || {};

VAT.EU.FormBuilder = function FormBuilder(title) {
	if (!title) {
		throw nlapiCreateError('MISSING_PARAMETER', 'title argument is required');
	}
	this.form = nlapiCreateForm(title);
};

VAT.EU.FormBuilder.prototype.addButton = function _addButton(button) {
	if (!button) {
		throw nlapiCreateError('MISSING_PARAMETER', 'button argument is required');
	}
	try {
		var extJsButton = {};
		if (button.menuItems) {
			extJsButton = this.createExtJsButtonMenu(button.id, button.label, button.menuItems);
		} else {
			extJsButton = this.createExtJsButton(button.id, button.label, button.script);
		}

		button.type = 'inlinehtml';
		button.data = extJsButton;
		var formButton = this.addField(button);
		return formButton;
	} catch (ex) {
		logException(ex, 'VAT.EU.FormBuilder.addButton');
		throw ex;
	}
};

VAT.EU.FormBuilder.prototype.addButtons = function _addButtons(buttons) {
	if (!buttons) {
		throw nlapiCreateError('MISSING_PARAMETER', 'buttons argument is required');
	}
	try {
		for (var b in buttons) {
			var button = buttons[b];
			this.addButton(button);
		}
	} catch (ex) {
		logException(ex, 'VAT.EU.FormBuilder.addButtons');
		throw ex;
	}
};

VAT.EU.FormBuilder.prototype.addField = function _addField(field) {
	if (!field) {
		throw nlapiCreateError('MISSING_PARAMETER', 'field argument is required');
	}
	
	nlapiLogExecution('DEBUG', 'field', JSON.stringify(field));
	
	try {
		var formField = this.form.addField('custpage_' + field.id, field.type, field.label);
		formField.setDisplayType(field.displayType || 'normal');
		
		if (field.data) {
			formField.setDefaultValue(field.data);
		}
		
		if (field.layoutType && field.breakType) {
			formField.setLayoutType(field.layoutType, field.breakType);
		} else if (field.layoutType) {
			formField.setLayoutType(field.layoutType);
		}
		
		return formField;
	} catch (ex) {
		logException(ex, 'VAT.EU.FormBuilder.addField');
		throw ex;
	}
};

VAT.EU.FormBuilder.prototype.addSelectField = function _addSelectField(field) {
	if (!field) {
		throw nlapiCreateError('MISSING_PARAMETER', 'field argument is required');
	}
	try {
		var formField = this.form.addField('custpage_' + field.id, field.type, field.label);
		for (var i = 0; field.data && i < field.data.length; i++) {
			var option = field.data[i];
			formField.addSelectOption(option.id, option.text, field.value === option.id ? true : false);
		}
		if (field.layoutType && field.breakType) {
			formField.setLayoutType(field.layoutType, field.breakType);
		} else if (field.layoutType) {
			formField.setLayoutType(field.layoutType);
		}
		return formField;
	} catch (ex) {
		logException(ex, 'VAT.EU.FormBuilder.addField');
		throw ex;
	}
};

VAT.EU.FormBuilder.prototype.addFields = function _addFields(fields) {
	if (!fields) {
		throw nlapiCreateError('MISSING_PARAMETER', 'fields argument is required');
	}
	try {
		nlapiLogExecution('DEBUG', 'fields', JSON.stringify(fields));
		for (var f in fields) {
			var field = fields[f];
			if (field.type === 'select') {
				this.addSelectField(field);
			} else {
				this.addField(field);
			}
			
		}
	} catch (ex) {
		logException(ex, 'VAT.EU.FormBuilder.addFields');
		throw ex;
	}
};

VAT.EU.FormBuilder.prototype.setScript = function _setScript(script) {
	if (!script) {
		throw nlapiCreateError('MISSING_PARAMETER', 'script argument is required');
	}
	try {
		this.form.setScript(script);
	} catch (ex) {
		logException(ex, 'VAT.EU.FormBuilder.setScript');
		throw ex;
	}
};

VAT.EU.FormBuilder.prototype.getForm = function _getForm() {
	return this.form;
};

VAT.EU.FormBuilder.prototype.createExtJsButton = function _createExtJsButton(id, label, onClick) {
	if (!id) {
		throw nlapiCreateError('MISSING_PARAMETER', 'id argument is required');
	}
	if (!label) {
		throw nlapiCreateError('MISSING_PARAMETER', 'label argument is required');
	}
	if (!onClick) {
		throw nlapiCreateError('MISSING_PARAMETER', 'onClick argument is required');
	}

	return [
		"<span id='_", id, "'/>",
		"<script type='text/javascript'>",
		"Ext.onReady(function(){new Ext.Button({", 
			"id: '", id, "',",
			"text: '", label, "',",
			"renderTo: '_", id, "',",
			"style: 'margin:3px',",
			"listeners: {afterrender: function() {Ext.select('.x-btn-text').setStyle({'font-size': '14px','color': '#333333','font-weight': 600,'padding':'0px 12px','height':'23px'});}},",
			"handler: function(){", onClick, "}", 
		"})}); </script>"
	].join("");
};

VAT.EU.FormBuilder.prototype.createExtJsButtonMenu = function _createExtJsButtonMenu(id, label, menuItems) {
	if (!id) {
		throw nlapiCreateError('MISSING_PARAMETER', 'id argument is required');
	}
	if (!label) {
		throw nlapiCreateError('MISSING_PARAMETER', 'label argument is required');
	}
	if (!menuItems || menuItems.length == 0) {
		throw nlapiCreateError('MISSING_PARAMETER', 'menuItems argument is required');
	}
	
	var menu = ["menu: ["];
	var menuItem;
	for (var i = 0; i < menuItems.length; i++) {
		menuItem = menuItems[i];
		menu.push("{",
		    "text: '" + menuItem.label + "',",
			"style: 'font-size:14px; color:#333333; font-weight:600; padding:0px 12px; line-height:23px; height:23px',",
			"handler: function() {" + menuItem.script + "},",
			"listeners: {afterrender: function(){Ext.select('.x-menu').setStyle({'background-image': 'none'})}}",
		    "}");
	}
	menu.push("]");

	return [
		"<span id='_", id, "'/>",
		"<script type='text/javascript'>",
		"Ext.onReady(function(){new Ext.Button({", 
			"id: '", id, "',",
			"text: '", label, "',",
			"renderTo: '_", id, "',",
			"style: 'margin:3px',",
			"listeners: {afterrender: function() {Ext.select('.x-btn-text').setStyle({'font-size': '14px','color': '#333333','font-weight': 600,'padding':'0px 12px','height':'23px'});}},",
			menu.join(''),
		"})}); </script>"
	].join("");
};