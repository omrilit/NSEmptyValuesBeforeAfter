/**
 * Copyright © 2014, 2018 Oracle and/or its affiliates. All rights reserved.
 */

var VAT;
if (!VAT) VAT = {};
if (!VAT.Report) VAT.Report = {};

VAT.Report.FORMAT_STRING = 'Format';
VAT.Report.PREF_ALT_CODES = ['dateformat', 'longdateformat', 'negative_number_format', 'numberformat'];
VAT.Report.PERIOD_ALT_CODES = ['use_tax_period_name', 'period_separator', 'month', 'quarter', 'year'];
VAT.Report.SEPARATORS_REGEXP = /\/|,|-|_/;
VAT.Report.EXEMPT_COUNTRY_CODES = ['CO', 'IE'];

VAT.Report.FormatPage = function() {
	var _FormatterUtils = new VAT.Report.FormatterUtils();
	
	VAT.ResMgr = initResMgr();
	
	this.Run = function() {
		var params = initParams();
		var form = nlapiCreateForm(VAT.Report.FORMAT_STRING);
		
		if (request.getMethod() == 'POST') { //SAVE
			saveFormatting(params);
			var htmlscript = '<script language="javascript">parent.Ext.WindowMgr.getActive().close();</script>';
			form.addField('custpage_close', 'inlinehtml').setDefaultValue(htmlscript);
			response.writePage(form);
		} else {
			form.setScript('customscript_5362_format_cs');
			
			var groupName = 'preferences_group';
			form.addFieldGroup(groupName, VAT.ResMgr.GetString("FORM_5362_FLDGRP_LABEL")).setSingleColumn(true);

			addParamsFields(form, params);
			
			var prefFields = _FormatterUtils.LoadFormatFieldByAltCode(VAT.Report.PREF_ALT_CODES);
			var periodFields = _FormatterUtils.LoadFormatFieldByAltCode(VAT.Report.PERIOD_ALT_CODES);
			
			_FormatterUtils.SetDefaultFormat(params.subid, prefFields);
			_FormatterUtils.SetSavedFormat(params.subid, params.countrycode, prefFields, periodFields);
			
			addPreferencesFields(form, groupName, prefFields);
			addPeriodFields(form, groupName, periodFields, params.countrycode);
			
			form.addSubmitButton('Save');
			form.addButton('custpage_btncancel', 'Cancel', 'parent.Ext.WindowMgr.getActive().close();');
		}
		
		response.writePage(form);
	};
	
	function initResMgr(){
		var _CultureId = nlapiGetContext().getPreference("LANGUAGE");
	    return (new ResourceMgr(_CultureId));
	}
	
	function initParams() {
		var allParams = request == null ? [] : request.getAllParameters();
	    var params = {};

	    for (var i in allParams)
	        params[i] = allParams[i];
	    return params;
	}
	
	function addParamsFields(form, params) {
		for (var param in params) {
			form.addField('custpage_'+ param, 'text', param).setDisplayType('hidden').setDefaultValue(params[param]);
		}
		form.addField('actiontype', 'text').setDisplayType('hidden').setDefaultValue('format');
	}
	
	function saveFormatting(params) {
		var isOneWorld = nlapiGetContext().getSetting("FEATURE", "SUBSIDIARIES") == "T";
		var subId = isOneWorld ? params.custpage_subid : '';
		var countrycode = params.custpage_countrycode;
		
		var fields = _FormatterUtils.LoadFormatFields(subId, countrycode);
		var format = createSavedFormat(fields);
		
		var id = getConfigId(subId, countrycode);
		if (id) {
			var record = nlapiLoadRecord('customrecord_tax_return_setup_item', id);
			record.setFieldValue('custrecord_vat_cfg_value', format);
			nlapiSubmitRecord(record);
		}
		else {
			var record = nlapiCreateRecord('customrecord_tax_return_setup_item');
//			if (isOneWorld) {
//				record.setFieldValue('custrecord_vat_cfg_subsidiary', subId);
//			}
			record.setFieldValue('custrecord_vat_cfg_name', VAT.Report.FORMAT_STRING);
			record.setFieldValue('custrecord_vat_cfg_country', countrycode);
			record.setFieldValue('custrecord_vat_cfg_value', format);
			nlapiSubmitRecord(record);
		}
		
		function getConfigId(subId, countrycode) {
			var filters = [new nlobjSearchFilter('custrecord_vat_cfg_name', null, 'is', VAT.Report.FORMAT_STRING),
			               new nlobjSearchFilter('custrecord_vat_cfg_country', null, 'is', countrycode)];
			
//			if (subId) {
//				filters.push(new nlobjSearchFilter('custrecord_vat_cfg_subsidiary', null, 'is', subId));
//			}
			
			var columns = [new nlobjSearchColumn('custrecord_vat_cfg_name')];
			
			var searchResults = nlapiSearchRecord('customrecord_tax_return_setup_item', null, filters, columns);
			if (searchResults && searchResults.length > 0) {
				return searchResults[0].getId();
			}
		}
		
		function createSavedFormat(fields) {
			var format = [];
			for (var field in fields) {
				if (field == VAT.Report.PERIOD_ALT_CODES[0]) {
					if (params['custpage_' + field]) {
						format.push('"' + field + '" : ' + '"T"');
					} else {
						format.push('"' + field + '" : ' + '"F"');
					}
				} else {
					var value = params['custpage_' + field];
					if (value == undefined) { //disabled fields, get first value
						value = fields[field].listValues['default'];
					}
					format.push('"' + field + '" : ' + '"' + value + '"');
				}
			}
			return '{' + format.join(',') + '}';
		}
	}
	
	function addPeriodFields(form, groupName, fields, countrycode) {
		var useTaxPeriodName = fields[VAT.Report.PERIOD_ALT_CODES[0]].value == 'T' ? true : false;
		var periodSeparator = fields[VAT.Report.PERIOD_ALT_CODES[1]].value ? fields[VAT.Report.PERIOD_ALT_CODES[1]].value : '/';
		var displayType = VAT.Report.EXEMPT_COUNTRY_CODES.indexOf(countrycode) > -1 ? 'disabled' : 'normal';
		
		for (var f in fields) { //f is id
			var field = fields[f];
			
			if (!field.listValues) {
				if (f == VAT.Report.PERIOD_ALT_CODES[0]) {
					var taxPeriodField = form.addField(getExternalId(f), 'checkbox', field.label, null, groupName);
					taxPeriodField.setDefaultValue(field.value);
					taxPeriodField.setDisplayType(displayType);
				}
				continue;
			}
			
			var listField = form.addField(getExternalId(f), 'select', field.label, null, groupName);
			listField.setDisplayType(displayType);
			
			for (var item in field.listValues) {
				if (item == 'default') {
					field.value = field.value ? field.value : field.listValues[item];
					continue;
				}
				listField.addSelectOption(item, field.listValues[item] == " " ? "&nbsp;" : field.listValues[item]);
			}
			if (useTaxPeriodName) {
				listField.setDisplayType('disabled');
			}
			
			if (f == VAT.Report.PERIOD_ALT_CODES[1]) {
				listField.setDefaultValue(periodSeparator);
				continue;
			}
			listField.setDefaultValue(field.value);
			
			var sampleField = form.addField(getExternalId(f) + '_sample', 'text', null, null, groupName).setDisplayType('inline');
			sampleField.setDefaultValue('Example ' + (useTaxPeriodName ? '' : getSample(getExternalId(f), field.value.replace('/', periodSeparator))));
		}
	}
	
	function addPreferencesFields(form, groupName, fields) {
		for (var f in fields) //f is id
		{
    		var field = fields[f];
			
			var listField = form.addField(getExternalId(f), 'select', field.label, null, groupName);
			for (var item in field.listValues) {
				listField.addSelectOption(item, field.listValues[item]);
			}

			listField.setDefaultValue(field.value);

			var sampleField = form.addField(getExternalId(f) + '_sample', 'text', null, null, groupName);
			sampleField.setDefaultValue('Example ' + getSample(getExternalId(f), field.value));
			sampleField.setDisplayType('inline');
		}
    }
	
	function getExternalId(id) {
        return 'custpage_' + id;
    }
    
    function getSample(fieldName, fieldValue) 
    {
    	var sample = '';
    	
    	if (!fieldValue)
    		return sample;

    	if (fieldName.indexOf('date') > -1 || 
    		fieldName.indexOf('month') > -1 || 
    		fieldName.indexOf('year') > -1) {
    		sample = new Date().toString(fieldValue.replace('_', ' '));
    	} else if (fieldName.indexOf('negative') > -1) {
    		sample = accounting.formatMoney(-123456789, {
				symbol : '',
				precision : 2, 
				thousand : ',', 
				decimal : '.',
				format : {
					pos : '%v',
					neg : fieldValue
				}});
    	} else if (fieldName.indexOf('number') > -1) {
    		sample = accounting.formatNumber(123456789, fieldValue.substr(0, 1), fieldValue.substr(1, 1), fieldValue.substr(2, 1));
    	} else if (fieldName.indexOf('quarter') > -1) {
    		var year = new Date().toString(fieldValue.split(VAT.Report.SEPARATORS_REGEXP)[1]);
    		var quarter = (fieldValue.indexOf('QQ') > -1 ? '0' : '') + getQuarter();
    		sample = quarter + fieldValue.match(VAT.Report.SEPARATORS_REGEXP)[0].replace('_', ' ') + year;
    	}
		return sample;
		
		function getQuarter() {
			var today = new Date();
			var quarter = [1, 2, 3, 4];
			return quarter[Math.floor(today.getMonth() / 3)];
		}
    }
};
