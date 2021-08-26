/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.EU = VAT.EU || {};
VAT.EU.ESL = VAT.EU.ESL || {};

VAT.EU.ESL.BaseReport = function _BaseReport() {
	this.label = '';
	this.subsidiary = '';
	this.format = '';
	this.language = '';
	this.nexus = '';
	this.reportClass = '';
	this.reportAdapter = '';
	this.reportHeaderParams = {
		daos: [],
		dataAdapter: '',
		dataFormatter: ''
	};
	this.reportDataParams = {
		daos: [],
		dataAdapter: '',
		dataFormatter: ''
	};
	this.fields = [];
		/*
		 * [{id: '', type: '', label: '', data: ''}, ...]
		 */
	this.buttons = [];
		/*
		 * [{id: '', label: '', script: ''}, ...]
		 */
	this.templates = {};
		/*
		 * {header: '', body: '', print: '', legent: ''}
		 */
	this.data = {
		header: {},
		/*
		 * {formWidth: '', logoWidth: '', ...}
		 */
		body: {},
		legend: {}
		/*
		 * {title: {value: '', color: ''}, sameCountry: {value: '', color: ''}, nonEUCountry: {value: '', color: ''}, invalidVAT: {value: '', color: ''}}
		 */
	};
	this.columns = [];
		/*
		 * [{id: '', type: '', label: '', display: '', alignment: '', options: {0: '', 1: ''}}, ...]
		 */
	this.indicatorMap = {};
		/*
		 * {services: '0', good: '2', ...}
		 */
};

VAT.EU.ESL.BaseReport.prototype.initializeBaseDetails = function _initializeBaseDetails(baseDetails) {
	if (!baseDetails) {
		throw nlapiCreateError('MISSING_ARGUMENT', 'Base Report Details are required');
	}
	
	if (baseDetails && !baseDetails.meta) {
		throw nlapiCreateError('MISSING_ARGUMENT', 'Base Report Details meta is required');
	}
	
	this.email = baseDetails.meta.email;       
	this.reportHeaderParams.daos = baseDetails.meta.reportHeaderParams.daos;
	this.reportHeaderParams.dataAdapter = baseDetails.meta.reportHeaderParams.dataAdapter;
	this.reportHeaderParams.dataFormatter = baseDetails.meta.reportHeaderParams.dataFormatter;
	this.fields = baseDetails.meta.fields;
	this.buttons = baseDetails.meta.buttons;
	this.data.legend = baseDetails.meta.legend;
};

VAT.EU.ESL.BaseReport.prototype.supplementCountryDetails = function _supplementCountryDetails(countryDetails) {
	if (!countryDetails) {
		throw nlapiCreateError('MISSING_ARGUMENT', 'Country Report Details are required');
	}
	
	if (countryDetails && !countryDetails.meta) {
		throw nlapiCreateError('MISSING_ARGUMENT', 'Country Report Details meta is required');
	}
	
	this.label = countryDetails.label;
	this.subsidiary = countryDetails.subsidiary;
	this.format = countryDetails.format;
	this.language = countryDetails.language;
	this.nexus = countryDetails.meta.nexus;
	this.reportClass = countryDetails.meta.reportClass;
	this.reportAdapter = countryDetails.meta.reportAdapter;
	this.reportDataParams.daos = countryDetails.meta.reportDataParams.daos;
	this.reportDataParams.dataAdapter = countryDetails.meta.reportDataParams.dataAdapter;
	this.reportDataParams.dataFormatter = countryDetails.meta.reportDataParams.dataFormatter;
	this.exportDataParams = countryDetails.meta.exportDataParams;
	this.fields = countryDetails.meta.fields ? this.fields.concat(countryDetails.meta.fields) : this.fields;
	this.buttons = countryDetails.meta.buttons ? this.buttons.concat(countryDetails.meta.buttons) : this.buttons;
	this.templates = countryDetails.meta.templates;
	this.metadata = countryDetails.metadata;
	this.data.header = countryDetails.meta.data.header;
	this.columns = countryDetails.meta.columns;
	this.indicatorMap = countryDetails.meta.indicatorMap;

	if (countryDetails.meta.legend) {
		this.data.legend = countryDetails.meta.legend;
	}
};

VAT.EU.ESL.BaseReport.prototype.getReportHeaderParams = function _getReportHeaderParams() {
	try {
		return {
			daos: this.reportHeaderParams.daos,
			dataAdapter: this.reportHeaderParams.dataAdapter,
			dataFormatter: this.reportHeaderParams.dataFormatter
		};
	} catch(e) {
		logException(e, 'VAT.EU.ESL.BaseReport.getReportHeaderParams');
		throw e;
	}    
};

VAT.EU.ESL.BaseReport.prototype.getReportDataParams = function _getReportDataParams() {
	try {
		return {
			daos: this.reportDataParams.daos,
			dataAdapter: this.reportDataParams.dataAdapter,
			dataFormatter: this.reportDataParams.dataFormatter,
			nexus: this.nexus,
			columns: this.columns,
			indicatorMap: this.indicatorMap
		};
	} catch(e) {
		logException(e, 'VAT.EU.ESL.BaseReport.getReportDataParams');
		throw e;
	}
};

VAT.EU.ESL.BaseReport.prototype.GetOnlineFilingTemplate = function() {
	return this.templates.online;
};