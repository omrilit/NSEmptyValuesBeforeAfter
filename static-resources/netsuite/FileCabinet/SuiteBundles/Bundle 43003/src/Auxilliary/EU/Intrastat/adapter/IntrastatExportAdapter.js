/**
 * Copyright © 2016, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax.EU = Tax.EU || {};
Tax.EU.Intrastat = Tax.EU.Intrastat || {};

Tax.EU.Intrastat.ExportAdapter = function ExportAdapter() {
    Tax.Adapter.BaseAdapter.call(this);
    this.Name = 'ExportAdapter';
};
Tax.EU.Intrastat.ExportAdapter.prototype = Object.create(Tax.Adapter.BaseAdapter.prototype);

Tax.EU.Intrastat.ExportAdapter.prototype.process = function _process(result, params) {
	this.data = result.adapter;
	
	return {adapter: this.transform(params)};
};

Tax.EU.Intrastat.ExportAdapter.prototype.transform = function _transform(params) {
    if (!params) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params argument is required');
    }

	var excludeCache = JSON.parse(params.excludeCache || '{}');
	var exportData = [];
	var lineNumber = -1;
	
	for (var i = 0; i < this.data.length; i++) {
		lineNumber = this.data[i].lineNumber;
		
		if ((excludeCache[lineNumber] == undefined && !this.data[i].exclude) || (excludeCache[lineNumber] != undefined && !excludeCache[lineNumber])) {
		    var line = this.getLineData(this.data[i]);
			exportData.push(line);
		}
	}
	
	var result = {};
	result[this.Name] = exportData;
	
	return result;
};

Tax.EU.Intrastat.ExportAdapter.prototype.getLineData = function _getLineData(line) {
    return line;
};
