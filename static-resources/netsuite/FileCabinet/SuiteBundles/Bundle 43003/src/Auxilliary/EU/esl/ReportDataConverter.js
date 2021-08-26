/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.EU = VAT.EU || {};
VAT.EU.ESL = VAT.EU.ESL || {};

VAT.EU.ESL.BaseDetails = function _baseDetails() {
    var baseDetails = {
        meta: {
            reportHeaderParams: {
                daos: [],
                dataAdapter: '',
                dataFormatter: ''
            },
            fields: [],
            buttons: []
        }
    };

    return baseDetails;
};

VAT.EU.ESL.CountryDetails = function _countryDetails() {
    var countryDetails = {
        label: '',
        subsidiary: '',
        format: '',
        language: '',
        meta: {
            nexus: '',
            reportClass: '',
            indicatorMap: {},
            reportDataParams: {
                daos: [],
                dataAdapter: '',
                dataFormatter: ''
            },
            reportAdapter: '',
            exportDataParams: {},
            fields: {},
            buttons: {},
            templates: {},
            data: {
                header: {},
                body: {},
                legend: {
                	title: {},
                	sameCountry: {},
                	nonEUCountry: {},
                	invalidVAT: {}
                }
            },
            columns: []
        }
    };

    return countryDetails;
};

VAT.EU.ESL.ReportDataConverter = function _ReportDataConverter() {
};

VAT.EU.ESL.ReportDataConverter.prototype.convertToBaseDetails = function _createBaseDetails(details) {

    if (!details) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'VAT.EU.ESL.ReportDataConverter.convertToBaseDetails: Please provide the required details paramter.');
    }

    var baseDetails = new VAT.EU.ESL.BaseDetails();

    try {
        if (details.meta) {
            var meta = JSON.parse(details.meta);
            
            if (meta.email) {
                baseDetails.meta.email = meta.email;
            }

            if (meta.reportHeaderParams) {
                var reportHeaderParams = meta.reportHeaderParams;
                baseDetails.meta.reportHeaderParams.daos = reportHeaderParams.daos;
                baseDetails.meta.reportHeaderParams.dataAdapter = reportHeaderParams.dataAdapter;
                baseDetails.meta.reportHeaderParams.dataFormatter = reportHeaderParams.dataFormatter;
            }
            baseDetails.meta.fields = meta.fields;
            baseDetails.meta.buttons = meta.buttons;
            baseDetails.meta.legend = meta.legend;
        }
    } catch (ex) {
        nlapiLogExecution('ERROR', 'VAT.EU.ESL.ReportDataConverter.convertToBaseDetails', 'Unable to parse report data');
        throw ex;
    }

    return baseDetails;
};

VAT.EU.ESL.ReportDataConverter.prototype.convertToCountryDetails = function _createCountryDetails(details) {

    if (!details) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'VAT.EU.ESL.ReportDataConverter.convertToCountryDetails: Please provide the required details paramter.');
    }

    var countryDetails = new VAT.EU.ESL.CountryDetails();

    try {
        countryDetails.label = details.label;
        countryDetails.subsidiary = '';
        countryDetails.format = details.format;
        countryDetails.language = details.language;

        if (details.meta) {
            var meta = JSON.parse(details.meta);

            countryDetails.meta.nexus = meta.nexus;
            countryDetails.meta.reportClass = meta.reportClass;
            countryDetails.meta.indicatorMap = meta.indicatorMap;

            if (meta.reportDataParams) {
                var reportDataParams = meta.reportDataParams;
                countryDetails.meta.reportDataParams.daos = reportDataParams.daos;
                countryDetails.meta.reportDataParams.dataAdapter = reportDataParams.dataAdapter;
                countryDetails.meta.reportDataParams.dataFormatter = reportDataParams.dataFormatter;
            }
            
            countryDetails.meta.reportAdapter = meta.reportAdapter;
            
            if (meta.exportDataParams) {
                countryDetails.meta.exportDataParams = meta.exportDataParams;
            }
            
            countryDetails.meta.fields = meta.fields;
            countryDetails.meta.buttons = meta.buttons;
            countryDetails.meta.templates = meta.templates;

            if (meta.data) {
                var data = meta.data;
                countryDetails.meta.data.header = data.header;
                countryDetails.meta.data.body = data.body;
            }
            countryDetails.meta.columns = meta.columns;
            countryDetails.meta.legend = meta.legend;
        }
    } catch (ex) {
        nlapiLogExecution('ERROR', 'VAT.EU.ESL.ReportDataConverter.convertToCountryDetails', 'Unable to parse report data');
        throw ex;
    }

    return countryDetails;
};