/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */

function OnFieldChange(type, name) {
	try {
			setDateCulture(nlapiGetContext().getPreference('LANGUAGE'));
			
			if (name == 'custpage_use_tax_period_name') {
				var useTaxPeriodName = nlapiGetFieldValue('custpage_use_tax_period_name');
				disablePeriodFields(useTaxPeriodName == 'T' ? true : false);
				if (useTaxPeriodName == 'F' ) {
					nlapiSetFieldValue('custpage_month_sample', getSample('month', setNewSeparator(nlapiGetFieldValue('custpage_month'))));
					nlapiSetFieldValue('custpage_quarter_sample', getSample('quarter', setNewSeparator(nlapiGetFieldValue('custpage_quarter'))));
					nlapiSetFieldValue('custpage_annual_sample', getSample('year', setNewSeparator(nlapiGetFieldValue('custpage_year'))));
				}
				return;
			} else if (name == 'custpage_period_separator') {
				nlapiSetFieldValue('custpage_month_sample', getSample('month', setNewSeparator(nlapiGetFieldValue('custpage_month'))));
				nlapiSetFieldValue('custpage_quarter_sample', getSample('quarter', setNewSeparator(nlapiGetFieldValue('custpage_quarter'))));
				return;
			}
			
			var fieldValue = nlapiGetFieldValue(name);
			var sample = getSample(name, fieldValue);
			if (name.indexOf('date') > -1 || 
				name.indexOf('number') > -1) {
				nlapiSetFieldValue(name + '_sample', sample);
			} else {
				nlapiSetFieldValue(name + '_sample', setNewSeparator(sample));
			}
	} catch(ex) {
		var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
		nlapiLogExecution("ERROR", "OnFieldChange", errorMsg);
	}
}

function setNewSeparator(fieldValue) {
	var sepRegExp = /\/|,|-|_/;
	var periodSeparator = nlapiGetFieldValue('custpage_period_separator');
	return fieldValue.replace(sepRegExp, periodSeparator.replace('_', ' '));
}

function setDateCulture(language) {
	if (language.length > 2) {
		language = language.substr(0, 2);
	}
	
	switch(language) {
		case "bg": Date.CultureInfo = Date.CultureInfo_bg; break;
		case "cs": Date.CultureInfo = Date.CultureInfo_cs; break;
		case "da": Date.CultureInfo = Date.CultureInfo_da; break;
		case "de": Date.CultureInfo = Date.CultureInfo_de; break;
		case "el": Date.CultureInfo = Date.CultureInfo_el; break;
		case "en": Date.CultureInfo = Date.CultureInfo_en; break;
		case "es": Date.CultureInfo = Date.CultureInfo_es; break;
		case "fi": Date.CultureInfo = Date.CultureInfo_fi; break;
		case "fr": Date.CultureInfo = Date.CultureInfo_fr; break;
		case "it": Date.CultureInfo = Date.CultureInfo_it; break;
		case "kr": Date.CultureInfo = Date.CultureInfo_kr; break;
		case "nl": Date.CultureInfo = Date.CultureInfo_du; break;
//		case "pl": Date.CultureInfo = Date.CultureInfo_pl; break;
		case "pt": Date.CultureInfo = Date.CultureInfo_pt; break;
		case "ro": Date.CultureInfo = Date.CultureInfo_ro; break;
		case "sl": Date.CultureInfo = Date.CultureInfo_sl; break;
		case "sr": Date.CultureInfo = Date.CultureInfo_sr; break;
		case "sv": Date.CultureInfo = Date.CultureInfo_sv; break;
		case "th": Date.CultureInfo = Date.CultureInfo_th; break;
		case "za": Date.CultureInfo = Date.CultureInfo_zh_tw; break;
		case "zh": Date.CultureInfo = Date.CultureInfo_zh; break;
		default: Date.CultureInfo = Date.CultureInfo_en;
	}
}

function getSample(fieldName, fieldValue) {
	var sample = '';
	
	if (fieldName.indexOf('date') > -1 || 
		fieldName.indexOf('month') > -1 || 
		fieldName.indexOf('year') > -1) {
		sample = new Date().toString(fieldValue);
	} else if (fieldName.indexOf('negative') > -1) {
		sample = accounting.formatMoney(-123456789, {
				symbol : '',
				precision : 2, 
				thousand : ',', 
				decimal : '.',
				format : {
				pos : '%v',
				neg : fieldValue }});
	} else if (fieldName.indexOf('number') > -1) {
		sample = accounting.formatNumber(123456789, fieldValue.substr(0, 1), fieldValue.substr(1, 1), fieldValue.substr(2, 1));
	} else if (fieldName.indexOf('quarter') > -1) {
		var sepRegExp = /\/|,|-| /;
		var year = new Date().toString(fieldValue.split(sepRegExp)[1]);
		var quarter = (fieldValue.indexOf('QQ') > -1 ? '0' : '') + getQuarter();
		sample = quarter + fieldValue.match(sepRegExp)[0] + year;
	}	
	return 'Example ' + sample;
	
	function getQuarter() {
		var today = new Date();
		var quarter = [1, 2, 3, 4];
		return quarter[Math.floor(today.getMonth() / 3)];
	}
}

function disablePeriodFields(disableField) {
	var periodFields = ['month', 'quarter', 'year', 'period_separator'];
	for (var field = 0; field < periodFields.length; field++) {
		nlapiDisableField('custpage_' + periodFields[field], disableField); 
	}
}

function OnSave() {
	parent.OnFormatSave();
	return true;
}