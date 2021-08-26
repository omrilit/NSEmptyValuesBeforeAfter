/**
 * Copyright © 2015, 2018 Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};

Tax.ReportFormatter = function ReportFormatter(params) {
	this.formatter = new VAT.Report.FormatterSingleton.getInstance(params.subsidiary, params.countryCode, params.languageCode);
	this.context = params.context || nlapiGetContext();
};

Tax.ReportFormatter.prototype.format = function format(value, type, format) {

	var formattedValue = value;
	var displayCurrency = false;
	var formatResult;
	var match;

	switch (type) {
        case 'date':
            var dateFormat = format ? format : this.getDefaultDateFormat();
            formattedValue = this.formatter.formatDate(value, dateFormat, false);
            break;
        case 'numeric':
            formattedValue = this.formatter.formatCurrency(value, displayCurrency, format); //should displaying of currency be supported?
            break;
        case 'roundnumeric':
            value = Math.round(value);
            // intentional fallthrough
        case 'floornumeric':
            formatResult = (this.formatter.formatCurrency(value, displayCurrency, format) || '').toString();
            match = formatResult.match(/(\.|,)([^(.|,)]*?)$/); // look for ',' or '.', whichever occurs last
            formattedValue = match ? formatResult.substr(0, match.index) : formatResult;
            break;
        case 'ceilnumeric':
            var ceilValue = Math.ceil(value);
            formatResult = (this.formatter.formatCurrency(ceilValue, displayCurrency, format) || '').toString();
            match = formatResult.match(/(\.|,)([^(.|,)]*?)$/); // look for ',' or '.', whichever occurs last
            formattedValue = match ? formatResult.substr(0, match.index) : formatResult;
            break;
        case 'ceilwholenumber':
            formattedValue = Math.ceil(value);
            break;
        case 'roundwholenumber':
            formattedValue = Math.round(value);
            break;
        case 'regexp':
            formattedValue = this.formatter.formatRegExpString(value, format);
            break;
        default: // ?
            nlapiLogExecution('DEBUG', 'Tax.ReportFormatter.prototype.format', 'No formatting defined for type "' + type + '"');
            break;
    }

	return formattedValue;
};

Tax.ReportFormatter.prototype.getDefaultDateFormat = function getDefaultDateFormat() {
    var datePref = this.context.getPreference('DATEFORMAT');
    datePref = datePref.toUpperCase().replace("DD", "dd").replace("D", "dd"); 
    
    return datePref.toLowerCase().replace("mm", "MM").replace("month", "MMMM").replace("mon", "MMM").replace("m", "MM");
};