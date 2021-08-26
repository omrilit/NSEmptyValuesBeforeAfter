/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var VAT = VAT || {};
VAT.Formatter = VAT.Formatter || {};
VAT.Formatter.DE = VAT.Formatter.DE || {};

VAT.Formatter.DE.Intrastat = function _IntrastatFormatter(fieldDefinitions) {
	VAT.Formatter.ReportFormatter.call(this);
	
	this.fields = fieldDefinitions.getFields();
};
VAT.Formatter.DE.Intrastat.prototype = Object.create(VAT.Formatter.ReportFormatter.prototype);

VAT.Formatter.DE.Intrastat.AsciiFieldDefinitions = function _FieldDefinitions() {};
VAT.Formatter.DE.Intrastat.AsciiFieldDefinitions.prototype.getFields = function _getFields() {
	var fields = {
		endmonth: {
			type: VAT.Formatter.FieldTypes.TEXT_ZERO_PADDED,
			width: 2
		},
		row: {
			type: VAT.Formatter.FieldTypes.TEXT_ZERO_PADDED,
			width: 6
		},
		regionindex: {
			type: VAT.Formatter.FieldTypes.TEXT_ZERO_PADDED,
			width: 2
		},
		vatno: {
			type: VAT.Formatter.FieldTypes.TEXT_PADDED_WITHOUT_SPECIAL_CHAR,
			width: 11
		},
		countrycode: {
			type: VAT.Formatter.FieldTypes.TEXT_PADDED,
			width: 2
		},
		region: {
			type: VAT.Formatter.FieldTypes.TEXT_PADDED,
			width: 2
		},
		notc: {
			type: VAT.Formatter.FieldTypes.TEXT_PADDED,
			width: 2
		},
		transportmode: {
			type: VAT.Formatter.FieldTypes.TEXT_PADDED,
			width: 1
		},
		commoditycode: {
			type: VAT.Formatter.FieldTypes.TEXT_PADDED,
			width: 8
		},
		grossweight: {
			type: VAT.Formatter.FieldTypes.TEXT_PADDED,
			width: 11
		},
		quantity: {
			type: VAT.Formatter.FieldTypes.TEXT_PADDED,
			width: 11
		},
		netamount: {
			type: VAT.Formatter.FieldTypes.TEXT_PADDED,
			width: 11
		},
		statisticalvalue: {
			type: VAT.Formatter.FieldTypes.TEXT_PADDED,
			width: 11
		},
		endyear: {
			type: VAT.Formatter.FieldTypes.TEXT_ZERO_PADDED,
			width: 2
		}
	};
	return fields;
};
