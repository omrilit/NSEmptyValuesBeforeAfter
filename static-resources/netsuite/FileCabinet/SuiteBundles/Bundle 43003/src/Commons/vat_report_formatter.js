/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.Formatter = VAT.Formatter || {};

VAT.Formatter.FieldTypes = {
	TEXT: 'text',
	TEXT_PADDED: 'text_padded',
	TEXT_ZERO_PADDED: 'text_zero_padded',
	TEXT_QUOTES: 'text_quotes',
	DATE: 'date',
	INTEGER: 'integer',
	DECIMAL: 'decimal',
	UNSIGNED_DECIMAL: 'unsigned_decimal',
	TEXT_PADDED_WITHOUT_SPECIAL_CHAR: 'text_padded_without_special_char'
};

VAT.Formatter.ReportFormatter = function _ReportFormatter() {
	this.fields = {};
	this.ZERO_PAD = '00000000000000000000';
	this.SPACE_PAD = '                    '
	this.TEMPLATE = {};
	this.dateFormat = 'MM/dd/yyyy';
};

VAT.Formatter.ReportFormatter.prototype.formatElement = function _formatElement(mapElement, template) {
	var obj = this.formatDataObject(mapElement);
	return _App.RenderTemplate(template, obj);
};

VAT.Formatter.ReportFormatter.prototype.formatDataObject = function _formatDataObject(raw) {
	var formatted = {};

	for (var f in raw) {
		var rawField = raw[f];
		var fieldDef = this.fields[f];

		formatted[f] = fieldDef ? this.formatField(rawField, fieldDef) : rawField;
	}

	return formatted;
};

VAT.Formatter.ReportFormatter.prototype.formatField = function _formatField(data, fieldDefinition) {
	var result = '';
	switch (fieldDefinition.type) {
		case VAT.Formatter.FieldTypes.TEXT:
			result = this.formatString(data, fieldDefinition.width);
			break;
		case VAT.Formatter.FieldTypes.TEXT_PADDED:
			result = this.formatPaddedString(data, fieldDefinition.width, this.SPACE_PAD);
			break;
		case VAT.Formatter.FieldTypes.TEXT_ZERO_PADDED:
			result = this.formatPaddedString(data, fieldDefinition.width, this.ZERO_PAD);
			break;
		case VAT.Formatter.FieldTypes.TEXT_QUOTES:
			result = this.formatString(data, fieldDefinition.width);
			if (result) {
				result = '"' + result + '"';
			}
			break;
		case VAT.Formatter.FieldTypes.DATE:
			result = this.formatDate(data, this.dateFormat);
			break;
		case VAT.Formatter.FieldTypes.INTEGER:
			result = this.formatInteger(data);
			break;
		case VAT.Formatter.FieldTypes.DECIMAL:
			result = this.formatDecimal(data);
			break;
		case VAT.Formatter.FieldTypes.UNSIGNED_DECIMAL:
			result = Math.abs(data);
			result = this.formatDecimal(result);
			break;
		case VAT.Formatter.FieldTypes.TEXT_PADDED_WITHOUT_SPECIAL_CHAR:
			result = this.formatPaddedStringAndRemoveSpecialChar(data, fieldDefinition.width, this.SPACE_PAD);
			break;
		default:
			nlapiLogExecution('DEBUG', 'VAT.ReportFormatter.formatField', 'No format for ' + fieldDefinition.type);
			result = data;
	}

	return result;
};

VAT.Formatter.ReportFormatter.prototype.formatDate = function _formatDate(dateObj, format) {
	if (!dateObj) {
		return '';
	}

	dateObj = typeof dateObj === 'string' ? nlapiStringToDate(dateObj) : dateObj;
	var formatted = dateObj.toString(format);
	return formatted;
};

VAT.Formatter.ReportFormatter.prototype.replaceInvalidCharacters = function _replaceInvalidCharacters(data) {
	return data.toString().replace(/\n/g, ' ');
};

VAT.Formatter.ReportFormatter.prototype.removeSpecialCharacters = function _removeSpecialCharacters(data) {
	return data.toString().replace(/[^a-zA-Z0-9]/g, '');
};

VAT.Formatter.ReportFormatter.prototype.formatString = function _formatString(data, width) {
	if (!data) {
		return '';
	}

	var formatted = this.replaceInvalidCharacters(data);
	return formatted.substr(0, width);
};

VAT.Formatter.ReportFormatter.prototype.formatPaddedString = function _formatPaddedString(data, width, padChar) {
	if (!data) {
		data = '';
	}

	var formatted = this.replaceInvalidCharacters(data);
	var output = (padChar || '') + formatted.slice(0, width);
	return output.slice(-width);
};

VAT.Formatter.ReportFormatter.prototype.formatPaddedStringAndRemoveSpecialChar = function _formatPaddedStringAndRemoveSpecialChar(data, width, padChar) {
	if (!data) {
		data = '';
	}

	var withoutSpecialChar = this.removeSpecialCharacters(data);	
	var formatted = this.replaceInvalidCharacters(withoutSpecialChar);
	var output = (padChar || '') + formatted.slice(0, width);
	var slicedOutput = output.slice(-width);
	return slicedOutput;
};


VAT.Formatter.ReportFormatter.prototype.formatInteger = function _formatInteger(data) {
	if (!data) {
		return '0';
	}

	return Number(data).toFixed(0);
};

VAT.Formatter.ReportFormatter.prototype.formatDecimal = function _formatDecimal(data) {
	if (!data) {
		return '0.00';
	}

	return Number(data).toFixed(2);
};