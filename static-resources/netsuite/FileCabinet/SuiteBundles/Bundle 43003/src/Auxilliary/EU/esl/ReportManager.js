/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.EU = VAT.EU || {};
VAT.EU.ESL = VAT.EU.ESL || {};

VAT.EU.ESL.ReportManager = function _ReportManager() {
};

VAT.EU.ESL.ReportManager.prototype.getCountryForms = function _getCountryForms(nexusList) {
    var countryForms = [];

    if (!nexusList || nexusList.length == 0) {
        return countryForms;
    }

    // Get all EU Nexuses
    var taxReportMapperDAO = new VAT.EU.DAO.TaxReportMapperDAO();
    var taxReportMapperList = taxReportMapperDAO.getList({
        mapType: 'NEXUS',
        isEUCountry: 'T'
    });

    // Filter the EU nexuses 
    var subsidiaryEUNexusList = [];
    var nexusMap = {};
    for (var n = 0; n < taxReportMapperList.length; n++) {
        var nexus = taxReportMapperList[n];
        if (nexusList.indexOf(nexus.name) > -1 || nexusList.indexOf(nexus.alternateCode) > -1) {
            subsidiaryEUNexusList.push(nexus.id);

            nexusMap[nexus.id] = { 
                text: nexus.countryNameText, 
                code: nexusList.indexOf(nexus.name) > -1 ? nexus.name : nexus.alternateCode
            };
        }
    }

    if (subsidiaryEUNexusList.length == 0) {
        return countryForms;
    }

    // Get all TaxReportMapperDetails (country forms) based on subsidiaryEUNexusList
    var taxReportMapperDetailsDAO = new VAT.EU.DAO.TaxReportMapperDetailsDAO();
    var taxreportMapperDetailsList = taxReportMapperDetailsDAO.getList({
        type: 'ESL',
        taxReportMap: subsidiaryEUNexusList
    });

    // Get the generic country form
    var genericReport = this.getTaxReportMapperDetails(CONSTANTS.MAP_DETAILS.GENERIC_REPORT);

    for (var i = 0; i < subsidiaryEUNexusList.length; i++) {
        var taxreportMapperDetails = taxreportMapperDetailsList.filter(function(countryForm) {
            return countryForm.taxReportMap == subsidiaryEUNexusList[i];
        });

        if (taxreportMapperDetails.length == 0) { // If the nexus does not have a country-specific report, use generic
            if (genericReport) {
                var nexusObj = nexusMap[subsidiaryEUNexusList[i]];
                countryForms.push({
                    id: genericReport.detailInternalId + '_' + nexusObj.code,
                    text: nexusObj.text + ' ' + genericReport.label
                });
            }
        } else { // use the country-specific report
            for (var j = 0; j < taxreportMapperDetails.length; j++) {
                countryForms.push({
                    id: taxreportMapperDetails[j].detailInternalId,
                    text: taxreportMapperDetails[j].label
                });
            }
        }
    }

    return countryForms;
};

VAT.EU.ESL.ReportManager.prototype.getReport = function _getReport(selectedCountryFormId) {

    if (!selectedCountryFormId) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'VAT.EU.ESL.ReportManager.getReport: Please provide the required selectedCountryFormId paramter.');
    }
    
    var splittedCountryFormId = selectedCountryFormId.split('_');
    var countryFormId = splittedCountryFormId[0];
    var nexus = splittedCountryFormId[1];

    // Get base details
    var baseMapperDetails = this.getTaxReportMapperDetails(CONSTANTS.MAP_DETAILS.BASE_REPORT);

    // Get country-specific details
    var countryMapperDetails = this.getTaxReportMapperDetails(countryFormId.toUpperCase());
    
    var reportDataConverter = new VAT.EU.ESL.ReportDataConverter();
    var baseDetails = reportDataConverter.convertToBaseDetails(baseMapperDetails);
    var countryDetails = reportDataConverter.convertToCountryDetails(countryMapperDetails);
    
    // For setup tax filing
    countryDetails.metadata = {template:{}};
    
    // Replace template file name with actual template
    // TODO: Not all templates should be loaded
    for (var t in countryDetails.meta.templates) {
    	var template = countryDetails.meta.templates[t];
    	countryDetails.metadata.template[t] = template;
    	countryDetails.meta.templates[t] = template ? this.getTaxTemplate(template) : '';
    }
    
    if (nexus) {
    	countryDetails.meta.nexus = nexus;
    }

    var className = countryDetails.meta.reportClass;

    return this.findReportClass(className, baseDetails, countryDetails);
};

VAT.EU.ESL.ReportManager.prototype.getTaxReportMapperDetails = function _getTaxReportMapperDetails(detailInternalId) {

    if (!detailInternalId) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'VAT.EU.ESL.ReportManager.getTaxReportMapperDetails: Please provide the required detailInternalId paramter.');
    }

    var taxReportMapperDetailsDAO = new VAT.EU.DAO.TaxReportMapperDetailsDAO();
    var taxReportMapperDetailsList = taxReportMapperDetailsDAO.getList({
        type: 'ESL',
        detailInternalId: detailInternalId
    });

    return taxReportMapperDetailsList.length > 0 ? taxReportMapperDetailsList[0] : null;
};

VAT.EU.ESL.ReportManager.prototype.getTaxTemplate = function _getTaxTemplate(templateName) {

    if (!templateName) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'VAT.EU.ESL.ReportManager.getTaxTemplate: Please provide the required templateName paramter.');
    }

    var taxReportTemplateDAO = new VAT.EU.DAO.TaxReportTemplateDAO();
    var taxTemplateList = taxReportTemplateDAO.getList({
        name: templateName,
        isInactive: 'F'
    });

    return (taxTemplateList && taxTemplateList.length > 0) ? taxTemplateList[0].short : '';
};

// Copied from DataCollector
VAT.EU.ESL.ReportManager.prototype.findReportClass = function _findReportClass(name, baseDetails, countryDetails) {

    if (!name) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'VAT.EU.ESL.ReportManager.findReportClass: Please provide the required name paramter.');
    }

    if (!baseDetails) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'VAT.EU.ESL.ReportManager.findReportClass: Please provide the required baseDetails paramter.');
    }

    if (!countryDetails) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'VAT.EU.ESL.ReportManager.findReportClass: Please provide the required countryDetails paramter.');
    }

    var Class = VAT;

    try {
        var path = name.split('.');
        
        for (var i = 1; i < path.length; i++) {
            Class = Class[path[i]];
        }
    } catch(e) {
        throw e;
    }

    return new Class(baseDetails, countryDetails);
};
