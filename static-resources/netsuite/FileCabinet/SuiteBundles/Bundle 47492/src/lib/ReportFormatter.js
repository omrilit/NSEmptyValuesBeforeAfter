/**
 * Copyright 2014, 2019, NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.Formatter = TAF.Formatter || {};

TAF.Formatter.FieldTypes = {
        TEXT: 'text',
        TEXT_QUOTES: 'text_quotes',
        DATE: 'date',
        INTEGER: 'integer',
        INTEGER_PADDED: 'integer_padded',
        DECIMAL: 'decimal',
        UNSIGNED_DECIMAL: 'unsigned_decimal',
        SIGNED_DECIMAL: 'signed_decimal',
        CURRENCY: 'currency',
        SIGNED_CURRENCY: 'signed_currency'
        
};

TAF.Formatter.ReportFormatter = function _ReportFormatter() {
    this.fields = {};
    this.isXML = false;
    this.ZERO = '0000000000';
    this.TEMPLATE = {};
    this.dateFormat = 'MM/dd/yyyy';
    this.INVALID_CHARACTERS = /\n/g;
    this.REPLACEMENT_STRING = ' ';
    this.charMap = {};
};

TAF.Formatter.ReportFormatter.prototype.formatElement = function _formatElement(mapElement, template) {
    var obj = this.formatDataObject(mapElement);
    return SFC.Utilities.RenderTemplate(template, obj);
};

TAF.Formatter.ReportFormatter.prototype.formatDataObject = function _formatDataObject(raw) {
    var formatted = {};
    
    for (var f in raw) {
        var rawField = raw[f];
        var fieldDef = this.fields[f];
        formatted[f] = fieldDef ? this.formatField(rawField, fieldDef) : rawField;
    }
    
    return formatted;
};

TAF.Formatter.ReportFormatter.prototype.formatField = function _formatField(data, fieldDefinition) {
    var result = '';

    switch (fieldDefinition.type) {
        case TAF.Formatter.FieldTypes.TEXT:
            result = this.formatString(data, fieldDefinition.width);
            break;
        case TAF.Formatter.FieldTypes.TEXT_QUOTES:
            result = this.formatString(data, fieldDefinition.width);
            if (result) {
                result = '"' + result + '"';
            }
            break;
        case TAF.Formatter.FieldTypes.DATE:
            var dateFormat = fieldDefinition.dateFormat || this.dateFormat;
            result = this.formatDate(data, dateFormat);
            break;
        case TAF.Formatter.FieldTypes.INTEGER:
            result = this.formatInteger(data);
            break;
        case TAF.Formatter.FieldTypes.INTEGER_PADDED:
            result = this.formatInteger(data);
            result = this.padNumber(result, fieldDefinition.width);
            break;
        case TAF.Formatter.FieldTypes.DECIMAL:
            result = this.formatDecimal(data, fieldDefinition.defaultValue);
            break;
        case TAF.Formatter.FieldTypes.UNSIGNED_DECIMAL:
            result = Math.abs(data);
            result = this.formatDecimal(result, fieldDefinition.defaultValue);
            break;
        case TAF.Formatter.FieldTypes.SIGNED_DECIMAL:
            result = this.formatSignedDecimal(data, fieldDefinition.defaultValue);
            break;
        case TAF.Formatter.FieldTypes.CURRENCY:
            result = this.formatCurrency(data, fieldDefinition.thousandSign, fieldDefinition.decimalSign);
            break;
        case TAF.Formatter.FieldTypes.SIGNED_CURRENCY:
            result = this.formatSignedCurrency(data, fieldDefinition.thousandSign, fieldDefinition.decimalSign);
            break;
        default:
            nlapiLogExecution('DEBUG', 'TAF.ReportFormatter.formatField', 'No format for ' + fieldDefinition.type);
            result = data;
    }

    return result;
};

TAF.Formatter.ReportFormatter.prototype.formatCurrency = function _formatCurrency(data, thousandSign, decimalSign) {
    return SFC.Utilities.FormatCurrency(data, thousandSign, decimalSign);
};

TAF.Formatter.ReportFormatter.prototype.formatDate = function _formatDate(dateObj, format) {
    if (!dateObj) {
        return '';
    }

    dateObj = typeof dateObj === 'string' ? nlapiStringToDate(dateObj) : dateObj;
    var formatted = dateObj.toString(format);
    return formatted;
};

TAF.Formatter.ReportFormatter.prototype.padNumber = function _padNumber(data, width) {
    if (!data) {
        data = 0;
    }
    
    var zero = this.ZERO + data;
    return zero.slice(-width);
};

TAF.Formatter.ReportFormatter.prototype.replaceInvalidCharacters = function _replaceInvalidCharacters(data) {
    return data ? data.replace(this.INVALID_CHARACTERS, this.REPLACEMENT_STRING) : data;
};

TAF.Formatter.ReportFormatter.prototype.formatString = function _formatString(data, width) {
    if (!data) {
        return '';
    }

    var formatted = data.replace(/&lt;/g, '<');
    formatted = formatted.replace(/&gt;/g, '>');
    formatted = this.replaceInvalidCharacters(formatted);
    
    var mapping = null;
    for (var char in this.charMap) {
        mapping = this.charMap[char];
        formatted = formatted.replace(mapping.regex, mapping.replaceChar);
    }
    
    if (this.isXML) {
        formatted = TAF.XML.escape({xmlText: formatted});
    }
    
    if (width) {
        formatted = formatted.substr(0, width);
    }
    
    //cleanup truncated escaped characters
    if (this.isXML) {
        var lastAmpersand = formatted.lastIndexOf("&");
        if(lastAmpersand>formatted.lastIndexOf(";")){
            formatted = formatted.substr(0, lastAmpersand);
        }
    }
    return formatted;

};

TAF.Formatter.ReportFormatter.prototype.formatInteger = function _formatInteger(data) {
    if (!data) {
        return 0;
    }

    return Number(data).toFixed(0);
};

TAF.Formatter.ReportFormatter.prototype.formatDecimal = function _formatDecimal(data, def) {
    if (!data) {
        return def === undefined ? '0.00' : def;
    }
    
    var decimal = Number(data).toFixed(2);
    return decimal == -decimal ? Math.abs(decimal).toFixed(2) : decimal;
};

TAF.Formatter.ReportFormatter.prototype.formatSignedDecimal = function _formatSignedDecimal(data, def) {
    if (!data) {
        return def === undefined ? '0.00' : def;
    }
    
    return Number(data).toFixed(2);
};
