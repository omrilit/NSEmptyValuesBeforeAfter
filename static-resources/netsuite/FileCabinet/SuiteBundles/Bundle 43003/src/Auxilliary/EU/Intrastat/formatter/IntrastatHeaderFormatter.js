/**
 * Copyright © 2016, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax.EU = Tax.EU || {};
Tax.EU.Intrastat = Tax.EU.Intrastat || {};

Tax.EU.Intrastat.IntrastatHeaderFormatter = function _IntrastatHeaderFormatter() {
    Tax.Processor.call(this);
	this.Name = 'IntrastatHeaderFormatter';
};
Tax.EU.Intrastat.IntrastatHeaderFormatter.prototype = Object.create(Tax.EU.Intrastat.IntrastatFormatter.prototype);

Tax.EU.Intrastat.IntrastatHeaderFormatter.prototype.getColumnDefinition = function _getColumnDefinition(params) {
    if (!params) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params argument is required');
    }
    if (!params.meta || !params.meta.columns) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params.meta.columns argument is required');
    }

    try {
    	var adapterColumns = params.meta.columns['CompanyInfoAdapter'];
    	if (adapterColumns) {
    		if (adapterColumns[params.filetype]) {
    			return adapterColumns[params.filetype];
    		} else {
    			var keys = Object.keys(adapterColumns);
    			return adapterColumns[keys[0]] || null;
    		}
    	}
    	return null;
    } catch (ex) {
        logException(ex, 'IntrastatHeaderFormatter.getColumnDefinition');
        throw ex;
    }	
};
