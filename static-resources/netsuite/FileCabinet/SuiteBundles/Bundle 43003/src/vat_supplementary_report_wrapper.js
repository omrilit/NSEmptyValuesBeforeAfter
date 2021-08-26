/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */
var VAT = VAT || {};
VAT.SupplementaryReport = function() {
	this.countryCode = '';
	this.languageCode = '';
	this.reportType = '';
	this.supplementaryType = '';
	this.supplementaryFormat = '';
	this.savedReport = '';
	this.isHandleBars = '';
	this.fileName = '';
	this.template = '';
};


VAT.SupplementaryReportWrapper = function(params) {
	if (!params) {
		throw nlapiCreateError('MISSING_REQUIRED_PARAM', 'The params object is required.');
	}

	this.supplementaryReport = {};

	try {
		this.isPluginImplementation = !!params.plugin;

		if (this.isPluginImplementation) {
			this.supplementaryReport = new SupplementaryReport(params.plugin);
		} else {
			this.supplementaryReport = new VAT[params.countryCode][params.supplementaryType][params.languageCode][params.supplementaryFormat.toUpperCase()]();
		}
	} catch(e) {
		logException(e, 'VAT.SupplementaryReportWrapper.constructor');
	}

	this.params = params;
	this.appParams = params.appParams;
	this.countryCode = this.supplementaryReport.countryCode;
	this.languageCode = this.supplementaryReport.languageCode;
	this.reportType = this.supplementaryReport.reportType;
	this.supplementaryType = this.supplementaryReport.supplementaryType;
	this.supplementaryFormat = this.supplementaryReport.supplementaryFormat;
	this.savedReport = this.supplementaryReport.savedReport;
	this.isHandleBars = this.supplementaryReport.isHandleBars;
	this.fileName = this.supplementaryReport.fileName;
	this.template = this.supplementaryReport.template;
};


VAT.SupplementaryReportWrapper.prototype.GetSupplementaryData = function(params) {
	if (!params) {
		throw nlapiCreateError('MISSING_REQUIRED_PARAM', 'The params object is required.');
	}

	var supplementaryData = {};

	try {
		var mbaParams = {
			subId: params.appParams.subid,
			isConsolidated: params.appParams.isconsolidated == 'T',
			periodFrom: params.appParams.periodfrom,
			periodTo: params.appParams.periodto,
			bookId: params.appParams.bookid
		};
		if (this.isPluginImplementation) {
			supplementaryData = this.supplementaryReport.GetSupplementaryData(params.saleCacheId, params.purchaseCacheId, mbaParams);
		} else {
			var dataClass = this.CreateReportData(mbaParams);
			params.report = this.supplementaryReport;
			supplementaryData = dataClass.GetSupplementaryData(params);
		}
	} catch(e) {
		logException(e, 'VAT.SupplementaryReportWrapper.GetSupplementaryData');
	}

	return supplementaryData;
};


VAT.SupplementaryReportWrapper.prototype.CreateReportData = function(mbaParams) {
	try {
		var dataClass = VAT[this.countryCode][this.reportType].Data;
		var data = new dataClass(mbaParams);
		data.template = this.template;

		return data;
	} catch (ex) {
		logException(ex, 'VAT.SupplementaryReportWrapper.CreateReportData');
	}
};
