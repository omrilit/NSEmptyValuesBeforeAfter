/**
 * Copyright © 2017, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax.EU = Tax.EU || {};
Tax.EU.Intrastat = Tax.EU.Intrastat || {};

Tax.EU.Intrastat.IntrastatFormatter = function Formatter() {
    this.Name = 'IntrastatFormatter';
};
Tax.EU.Intrastat.IntrastatFormatter.prototype = Object.create(Tax.Processor.prototype);

Tax.EU.Intrastat.IntrastatFormatter.prototype.process = function _process(result, params) {
    if (!result) {
        throw nlapiCreateError('MISSING_PARAMETER', 'result argument is required');
    }
    if (!params) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params argument is required');
    }

    try {
    	var adapterData = result.adapter;
        var columnDefinition = null;
        var currentAdapterData = null;

        result.formatter = {};

        this.initFormatter(params);

        for (var adapterName in adapterData) {
        	columnDefinition = this.getColumnDefinition(params);
        	currentAdapterData = adapterData[adapterName];

        	if (columnDefinition && Object.keys(columnDefinition).length > 0) {
    			for (var i = 0; i < currentAdapterData.length; i++) {
    		    	for (var key in columnDefinition) {
    	    			currentAdapterData[i][key] = this.format(currentAdapterData[i][key], columnDefinition[key]);
    	    		}
    	    	}
            }

            result.formatter[adapterName] = currentAdapterData;
        }

        return result;
    } catch (ex) {
        logException(ex, 'IntrastatFormatter.process');
        throw ex;
    }     
};

Tax.EU.Intrastat.IntrastatFormatter.prototype.format = function _format(value, columnMeta) {
    if (!columnMeta) {
        return value;
    }
    
    if (((value == 0) && 
            (columnMeta.type == 'numeric' || columnMeta.type == 'floornumeric' || columnMeta.type == 'roundwholenumber' || columnMeta.type == 'roundnumeric') &&
            (!columnMeta.noblank)) ||
        (value === '' || value == null || value == undefined)) {
        return '';
    }
	return this.formatter.format(value, columnMeta.type, columnMeta.format);
};

Tax.EU.Intrastat.IntrastatFormatter.prototype.getColumnDefinition = function _getColumnDefinition(params) {
    if (!params || !params.meta || !params.meta.columns) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params.meta.columns argument is required');
    }
	return params.meta.columns['ReportAdapter'];
};

Tax.EU.Intrastat.IntrastatFormatter.prototype.initFormatter = function _initFormatter(params) {
	var formatterParams = {
        countryCode: params.countryCode || params.countrycode,
        languageCode: this.getLocale(params.languageCode? params.languageCode.toLowerCase() : '')
    };
    if (params.isOneWorld) {
        formatterParams.subsidiary = params.subsidiary;
    }
    this.formatter = new Tax.ReportFormatter(formatterParams);
};

Tax.EU.Intrastat.IntrastatFormatter.prototype.getLocale = function _getLocale(languageCode) {
	var locale = 'en';

	switch (languageCode) {
		case 'kor': locale = 'kr'; break;
		case 'pol': locale = 'pl'; break;
		case 'dut': locale = 'nl'; break;
		case 'dan': locale = 'da'; break;
		case 'srp': locale = 'sr'; break;
		case 'bul': locale = 'bg'; break;
		case 'chi': locale = 'zh'; break;
		case 'cze': locale = 'cs'; break;
		case 'swe': locale = 'sv'; break;
		case 'slv': locale = 'sl'; break;
		case 'tha': locale = 'th'; break;
		case 'ron': locale = 'ro'; break;
		case 'deu': locale = 'de'; break;
		case 'fra': locale = 'fr'; break;
		case 'spa': locale = 'es'; break;
		case 'por': locale = 'pt'; break;
		case 'ell': locale = 'el'; break;
		case 'zha': locale = 'zh'; break;
		case 'fin': locale = 'fi'; break;
		case 'ita': locale = 'it'; break;
		default: locale = 'en'; break;
	}

	return locale;
};
