/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */

if (!VAT.Report) VAT.Report = {};

VAT.Report.FORMAT_STRING = 'Format';
VAT.Report.PREF_ALT_CODES = ['dateformat', 'longdateformat', 'negative_number_format', 'numberformat'];
VAT.Report.PERIOD_ALT_CODES = ['use_tax_period_name', 'period_separator', 'month', 'quarter', 'year'];
VAT.Report.SEPARATORS_REGEXP = /\/|,|-|_/;
VAT.Report.EXEMPT_COUNTRY_CODES = ['CO', 'IE'];
VAT.Report.EXECUTION_CONTEXT = {UI: 'userinterface', SUITELET: 'suitelet'};

if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function (searchElement) {
		if (this == null) {
			throw new TypeError();
		}
		var t = Object(this);
		var len = t.length >>> 0;
		if (len === 0) {
			return -1;
		}
		var n = 0;
		if (arguments.length > 1) {
			n = Number(arguments[1]);
			if (n != n) {
				n = 0;
			} else if (n != 0 && n != Infinity && n != -Infinity) {
				n = (n > 0 || -1) * Math.floor(Math.abs(n));
			}
		}
		if (n >= len) {
			return -1;
		}
		var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
		for (; k < len; k++) {
			if (k in t && t[k] === searchElement) {
				return k;
			}
		}
		return -1;
	}
}

VAT.Report.FormatterUtils = function(request, response) {
	var _isOneWorld = nlapiGetContext().getSetting("FEATURE", "SUBSIDIARIES") == "T";

	this.SetDefaultFormat = function(subId, fields) {
		var configRec = null;
		if (subId && _isOneWorld) {
			configRec = nlapiLoadRecord('subsidiary', subId);
		}
		else {
			configRec = nlapiLoadConfiguration('companypreferences');
		}

		if (!configRec) {
			return;
		}

		for (var altCode = 0; altCode < VAT.Report.PREF_ALT_CODES.length; altCode++) {
			fields[VAT.Report.PREF_ALT_CODES[altCode]].value = VAT.Report.PREF_ALT_CODES[altCode].indexOf('date') > -1 ?
					getDateValue(VAT.Report.PREF_ALT_CODES[altCode], configRec.getFieldValue(VAT.Report.PREF_ALT_CODES[altCode].toUpperCase())) : //date
					getNumberValue(VAT.Report.PREF_ALT_CODES[altCode], configRec.getFieldValue(VAT.Report.PREF_ALT_CODES[altCode].toUpperCase())); //number

		}

		function getDateValue(fieldName, fieldValue) {
			var listValues = fields[fieldName].listValues;
			for (var v in listValues) { //match value
				if (listValues[v] == fieldValue) {
					return v;
				}
			}
		}

		function getNumberValue(fieldName, fieldValue) {
			var counter = 0;
			var listValues = fields[fieldName].listValues;
			for (var v in listValues) { //match value
				if (counter == fieldValue) {
					return v;
				}
				counter++;
			}
		}
	};

	this.SetSavedFormat = function(subId, countrycode, prefFields, periodFields) {
		try {
			var filters = [new nlobjSearchFilter('custrecord_vat_cfg_name', null, 'is', VAT.Report.FORMAT_STRING),
						   new nlobjSearchFilter('custrecord_vat_cfg_country', null, 'is', countrycode)];
			var sr = nlapiSearchRecord('customrecord_tax_return_setup_item', null, filters, new nlobjSearchColumn('custrecord_vat_cfg_value'));
			if (!sr || sr.length == 0) {
				return;
			}

			var formats = JSON.parse(sr[0].getValue('custrecord_vat_cfg_value'));
			for (var f in formats) {
				if (prefFields[f]) {
					prefFields[f].value = formats[f];
				} else {
					periodFields[f].value = formats[f];
				}
			}
		} catch (ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution('ERROR', 'VAT.Report.FormatterUtils.SetSavedFormat', errorMsg);
		}
	};

	this.LoadFormatFields = function() {
		var fields = {};
		try {
			var filters = [new nlobjSearchFilter('custrecord_map_type', null, 'is', VAT.Report.FORMAT_STRING)];
			var columns = [new nlobjSearchColumn('name'),
						   new nlobjSearchColumn('custrecord_alt_code'),
						   new nlobjSearchColumn('custrecord_internal_id')];

			var searchResults = nlapiSearchRecord('customrecord_tax_report_map', null, filters, columns);

			if (searchResults) {
				for (var result = 0; result < searchResults.length; result++) {
					fields[searchResults[result].getValue('custrecord_alt_code')] = {
							label : searchResults[result].getValue("name"),
							listValues : searchResults[result].getValue('custrecord_internal_id') ? JSON.parse(searchResults[result].getValue('custrecord_internal_id')) : '',
							value : ''
					};
				}
			}
		} catch (ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution('ERROR', 'VAT.Report.FormatterUtils.LoadFormatFields', errorMsg);
		}
		return fields;
	};

	this.LoadFormatFieldByAltCode = function(altCodes) {
		var fields = {};
		try {
			for (var altCode = 0; altCode < altCodes.length; altCode++) {
				var filters = [new nlobjSearchFilter('custrecord_alt_code', null, 'is', altCodes[altCode])];
				var columns = [new nlobjSearchColumn('name'),
						   new nlobjSearchColumn('custrecord_alt_code'),
						   new nlobjSearchColumn('custrecord_internal_id')];

				var searchResults = nlapiSearchRecord('customrecord_tax_report_map', null, filters, columns);
				if (!searchResults || searchResults.length == 0) {
					continue;
				}

				fields[searchResults[0].getValue('custrecord_alt_code')] = {
						label : searchResults[0].getValue("name"),
						listValues : searchResults[0].getValue('custrecord_internal_id') ? JSON.parse(searchResults[0].getValue('custrecord_internal_id')) : '',
						value : ''
					};
			}
		} catch (ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution('ERROR', 'VAT.Report.FormatterUtils.LoadFormatFieldByAltCode', errorMsg);
		}
		return fields;
	};

	this.LoadSavedFormat = function(subId, countrycode) {
		//Commonly causes error when Reports are not setup correctly (check manual changes, vat.XX.report, vat.main, etc)
		try {
			var filters = [new nlobjSearchFilter('custrecord_vat_cfg_name', null, 'is', VAT.Report.FORMAT_STRING),
						   new nlobjSearchFilter('custrecord_vat_cfg_country', null, 'is', countrycode)];
			var sr = nlapiSearchRecord('customrecord_tax_return_setup_item', null, filters, new nlobjSearchColumn('custrecord_vat_cfg_value'));
			if (sr && sr.length > 0) {
				return formats = JSON.parse(sr[0].getValue('custrecord_vat_cfg_value'));
			}
		} catch (ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution('ERROR', 'VAT.Report.FormatterUtils.LoadSavedFormat', errorMsg);
		}
	};

	this.LoadFormat = function(subId, countrycode, context) { //can be called from server/client side but executed as server script
		var format = countrycode && this.LoadSavedFormat(subId, countrycode);

		if (!format) {
			format = {};
			var formatFields = this.LoadFormatFields();
			this.SetDefaultFormat(subId, formatFields);

			for (var field in formatFields) {
				if (formatFields[field].value) {
					format[field] = formatFields[field].value;
				} else {
					for (var v in formatFields[field].listValues) {
						if (v == 'default') {
							format[field] = formatFields[field].listValues[v];
						}
					}
				}
			}
		}

		if (context == VAT.Report.EXECUTION_CONTEXT.UI) {
			response.write(JSON.stringify(format));
		} else {
			return format;
		}
	};
};

VAT.Report.Formatter = function(subId, countryCode, languageCode, formatStore, bookId) {
	var _context = nlapiGetContext();
	var _isOneWorld = _context.getFeature('SUBSIDIARIES');
	var _isMultibook = _context.getFeature('MULTIBOOK');
	var _SubId = subId;
	var _BookId = bookId;
	var _CountryCode = countryCode;
	var _LanguageCode = languageCode ? languageCode.toLowerCase() : 'en';
	var _FormatStore = formatStore;
	var _Format = getFormat();
	var _NumberFormat = getNumberFormat();
	var _NegativeNumberFormat = getNegativeNumberFormat();
	var _UseTaxPeriodName = useTaxPeriodName();
	var _PeriodSeparator = getPeriodSeparator();
	var _MonthFormat = getMonthFormat();
	var _QuarterFormat = getQuarterFormat();
	var _YearFormat = getYearFormat();
	var _PeriodTypes = {month:'M', quarter:'Q', year:'Y'};
	var _PeriodType = _PeriodTypes.month;
	var _Currency = getCurrency();

	Date.CultureInfo = Date.CultureInfo_en;
	function setDateCulture() {
		switch(_LanguageCode) {
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

	function getFormat() {
		try {
			var format = {};
			if (_FormatStore) {
				format = _FormatStore;
			} else {
				format = new VAT.Report.FormatterUtils().LoadFormat(_SubId, _CountryCode, VAT.Report.EXECUTION_CONTEXT.SUITELET);
			}
			return format;
		} catch (ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution('ERROR', 'VAT.Report.Formatter.getFormat', errorMsg);
		}
	}

	function getNumberFormat() {
		var format = _Format['numberformat'];

		if (!format)
			format = '2,.';

		return {
				precision : format.substr(0, 1),
				thousand : format.substr(1, 1),
				decimal : format.substr(2, 1)
			};
	}

	function getNegativeNumberFormat() {
		var format = _Format['negative_number_format'];
		return format ? format : '-%v';
	}

	function useTaxPeriodName() {
		return _Format['use_tax_period_name'] ? _Format['use_tax_period_name'] == 'T' ? true : false : false;
	}

	function getPeriodSeparator() {
		return _Format['period_separator'] ? _Format['period_separator'] : '/';
	}

	function getMonthFormat() {
		var format = _Format['month'];
		return format ? format : 'MMMM YYYY';
	}

	function getQuarterFormat() {
		var format = _Format['quarter'];
		return format ? format : 'QQ_yyyy';
	}

	function getYearFormat() {
		var format = _Format['year'];
		return format ? format : 'yyyy';
	}

	function getCurrency() {
		var symbol = '';
		var placement = '';
		var precision = '';

		try {
			var currencyId = 1;
			if (_SubId && _isOneWorld) {
				var filters = [new nlobjSearchFilter('internalid', null, 'is', _SubId)];
				var columns = []
				var currencyColumn = 'currency';

				if (_isMultibook && _BookId) {
					filters.push(new nlobjSearchFilter('accountingbook', null, 'is', _BookId));
					currencyColumn = 'accountingbookcurrency';
				}
				columns.push(new nlobjSearchColumn(currencyColumn));

				var rs = nlapiSearchRecord('subsidiary', null, filters, columns);
				if (rs && rs.length > 0) {
					currencyId = rs[0].getValue(currencyColumn);
				}
			}

			var currency = nlapiLoadRecord('currency', currencyId);
			symbol = currency.getFieldValue('defaultdisplaysymbol');
			placement = currency.getFieldValue('defaultlocaleformatsample').toString().indexOf(symbol) == 0 ? 1 : 2;
			precision = nlapiCreateRecord('journalentry', _SubId ? {subsidiary : _SubId} : null).getFieldValue('currencyprecision');
		} catch (ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution('DEBUG', 'VAT.Report.Formatter', 'getCurrency Error: ' + errorMsg);
		} finally { //client script - inject currency from server
			if (!symbol && !placement) {
				try {
					var currency = '{currency}';
					symbol = currency ? currency.symbol : '';
					placement = currency ? currency.placement : '1';
					precision = currency ? currency.precision : '2';
				} catch(ex) {
					var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
					nlapiLogExecution('DEBUG', 'VAT.Report.Formatter', 'getCurrency finally Error: ' + errorMsg);
				}
			}
		}

		return {
			symbol : symbol ? symbol : '',
			placement : placement ? placement : '1',
			precision : precision ? precision : '2'
		};
	}

	function isDecimalExists(value) {
		try {
			if (!value) {
				return false;
			}

			if (value.toString().indexOf(_NumberFormat.decimal) > -1) {
				return true;
			}
		} catch(ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution('DEBUG', 'VAT.Report.Formatter.isDecimalExists', errorMsg);
		}
		return false;
	}

	function isThousandExists(value) {
		try {
			if (!value) {
				return false;
			}

			if (value.toString().indexOf(_NumberFormat.thousand) > -1) {
				return true;
			}
		} catch(ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution('DEBUG', 'VAT.Report.Formatter.isThousandExists', errorMsg);
		}
		return false;
	}

	function unformat(value, isWhole) {
		if (!value) {
			return 0;
		}
		try {
			if (value.toString().indexOf('-') == value.length - 1) { //if 123- move negative sign at the beginning
				value = '-' + value.slice(0, value.length - 1);
			}

			if (value.toString().indexOf(')') > -1 && value.toString().indexOf('(') < 0) { //add - at the beginning, remove ) if negative cent
				value = '-' + value.replace(')', '');
			}

			if (isWhole && isThousandExists(value)) { //add decimal fraction if formatted && whole number
				value = value + _NumberFormat.decimal + '00';
			}

			if (value) {
				value = accounting.unformat(value, _NumberFormat.decimal);
			}
		} catch(ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution('DEBUG', 'VAT.Report.Formatter.unformat', errorMsg);
		}
		return value;
	}

	return {
		shortdate : _Format['dateformat'] || 'MM/dd/yy',
		longdate : _Format['longdateformat'] || 'MMMM dd, yyyy',
		number : _NumberFormat,
		negative : _NegativeNumberFormat,
		month: _MonthFormat,
		quarter: _QuarterFormat,
		year: _YearFormat,
		periodtypes: _PeriodTypes,
		usetaxperiodname: _UseTaxPeriodName,
		currencysymbol: _Currency.symbol,
		thousand: _NumberFormat.thousand,
		decimal: _NumberFormat.decimal,
		precision: _NumberFormat.precision,
		poscurrencyformat: _Currency.placement == 1 ? '%s %v' : '%v %s',
		negcurrencyformat: _Currency.placement == 1 ? '%s ' + _NegativeNumberFormat : _NegativeNumberFormat + ' %s',
		zerocurrencyformat: _Currency.placement == 1 ? '%s %v' : '%v %s',
		setPeriodType : function(periodtype) {
			_PeriodType = periodtype;
		},
		formatNumber : function(value, displayCurrency) { //whole number
			var formatted = value;
			try {
				if (isDecimalExists(value)) {
					value = unformat(value);
				}

				formatted = accounting.formatMoney(value, {
					symbol : displayCurrency ? _Currency.symbol : '',
					precision : 0,
					thousand : _NumberFormat.thousand,
					decimal : _NumberFormat.decimal,
					format : {
						pos : displayCurrency ? (_Currency.placement == 1 ? '%s %v' : '%v %s') : '%v',
						neg : displayCurrency ? (_Currency.placement == 1 ? '%s ' + _NegativeNumberFormat : _NegativeNumberFormat + ' %s') : _NegativeNumberFormat,
						zero : displayCurrency ? (_Currency.placement == 1 ? '%s %v' : '%v %s') : '%v'
					}
				});
			} catch (ex) {
				var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
				nlapiLogExecution('ERROR', 'VAT.Report.Formatter', 'formatNumber Error: ' + errorMsg);
			}
			return formatted;
		},
		formatCurrency : function(value, displayCurrency, numberFormatParam) { //with decimal fraction
			if (numberFormatParam) {
				_NumberFormat.precision = numberFormatParam.substr(0, 1);
				if (numberFormatParam.length == 2) {
					_NumberFormat.thousand = '';
					_NumberFormat.decimal = numberFormatParam.substr(1, 1);
				} else if (numberFormatParam.length == 3) {
					_NumberFormat.thousand = numberFormatParam.substr(1, 1);
					_NumberFormat.decimal = numberFormatParam.substr(2, 1);
				}
			}

			var formatted = value;
			try {
				if (isDecimalExists(value)) {
					value = unformat(value);
				}

				formatted = accounting.formatMoney(value, {
					symbol : displayCurrency ? _Currency.symbol : '',
					precision : _NumberFormat.precision,
					thousand : _NumberFormat.thousand,
					decimal : _NumberFormat.decimal,
					format : {
						pos : displayCurrency ? (_Currency.placement == 1 ? '%s %v' : '%v %s') : '%v',
						neg : displayCurrency ? (_Currency.placement == 1 ? '%s ' + _NegativeNumberFormat : _NegativeNumberFormat + ' %s') : _NegativeNumberFormat,
						zero : displayCurrency ? (_Currency.placement == 1 ? '%s %v' : '%v %s') : '%v'
					}
				});
			} catch (ex) {
				var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
				nlapiLogExecution('ERROR', 'VAT.Report.Formatter', 'formatCurrency Error: ' + errorMsg);
			}
			return formatted;
		},
		formatDate : function(date, format, isPeriod) {
			if (!date) {
				nlapiLogExecution('ERROR', 'VAT.Report.Formatter.formatDate', 'Date is undefined.');
				return date;
			}
			if (!format && !isPeriod) {
				format = 'MMMM dd yyyy';
				nlapiLogExecution('ERROR', 'VAT.Report.Formatter.formatDate', 'Date format is undefined');
			}

			if ((_UseTaxPeriodName && isPeriod) || (isPeriod && VAT.Report.EXEMPT_COUNTRY_CODES.indexOf(_CountryCode) > -1)) {
				return date.toString();
			}

			var formattedDate = date;
			var parsedDate = Date.parse(date);

			if (!parsedDate) {
				return formattedDate;
			}

			try {
				setDateCulture();
				if (isPeriod && (_PeriodType == _PeriodTypes.quarter)) {
					var year = parsedDate.toString(_QuarterFormat.split(VAT.Report.SEPARATORS_REGEXP)[1]);
					var quarter = (_QuarterFormat.toString().indexOf('QQ') > -1 ? '0' : '') + getQuarter(parsedDate);
					formattedDate = quarter + _PeriodSeparator.replace('_', ' ') + year;
				} else if (isPeriod) { //month/year
					formattedDate = parsedDate.toString(_PeriodType == _PeriodTypes.month ? _MonthFormat : _YearFormat).replace(VAT.Report.SEPARATORS_REGEXP, _PeriodSeparator).replace('_', ' ');
				} else {
					formattedDate = parsedDate.toString(format);
				}
			} catch (ex) {
				var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
				nlapiLogExecution('ERROR', 'VAT.Report.Formatter', 'formatDate Error: ' + errorMsg);
			} finally {
				Date.CultureInfo = Date.CultureInfo_en;
			}

			return formattedDate;

			function getQuarter(date) {
				var quarter = [1, 2, 3, 4];
				return quarter[Math.floor(date.getMonth() / 3)];
			}
		},
		formatRegExpString: function(oldString, regexp) {
			if (!regexp) {
				return oldString;
			}
			var newString = oldString.match(new RegExp(regexp, 'g'));
			if (newString && newString.length > 0) {
				newString = newString[0];
			}
			return newString;
		},
		unformat : function(value, decimal) {
			return unformat(value, decimal);
		}
	};
};

VAT.Report.FormatterSingleton = (function() { //singleton
	var _instance = null;
	return {
		getInstance : function(subId, countryCode, languageCode, formatStore, bookId) {
			if (!_instance) {
				if (languageCode && languageCode.length > 2) {
					languageCode = languageCode.substr(0, 2);
				}

				_instance = new VAT.Report.Formatter(subId, countryCode, languageCode, formatStore, bookId);
			}
			return _instance;
		}
	};
})();
