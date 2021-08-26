/**
 * Copyright 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.MY = TAF.MY || {};
TAF.MY.Adapter = TAF.MY.Adapter || {};

TAF.MY.Adapter.Company = function _Company() {
    return {
        companyName: '',
        companyBRN: '',
        companyGSTNumber: '',
        periodStart: '',
        periodEnd: '',
        fileCreationDate: '',
        productVersion: '',
        gafVersion: '',
    };
};

TAF.MY.Adapter.CompanyAdapter = function _CompanyAdapter() {
    this.PRODUCT_VERSION_SI = 'NetSuite ';
    this.PRODUCT_VERSION_OW = 'NetSuite OneWorld ';
    this.GAF_VERSION = 'GAFv1.0.0';
};

TAF.MY.Adapter.CompanyAdapter.prototype.getCompany = function _getCompany(companyParams) {
    if (!companyParams) {
        throw nlapiCreateError('DATA_ERROR', 'TAF.MY.Adapter.CompanyAdapter.getCompany: Parameter is invalid');
    }
    
    var company = new TAF.MY.Adapter.Company();
    try {
        if (companyParams.isOneWorld) {
            company.companyName = companyParams.subsidiary.legalName || companyParams.subsidiary.name;
            company.companyBRN = companyParams.subsidiary.brn;
            company.companyGSTNumber = companyParams.subsidiary.vatNumber;
            company.productVersion = this.PRODUCT_VERSION_OW;
        } else {
            company.companyName = companyParams.company.legalName || companyParams.company.companyName;
            company.companyBRN = companyParams.company.brn;
            company.companyGSTNumber = companyParams.company.employerId;
            company.productVersion = this.PRODUCT_VERSION_SI;
        }
        
        company.periodStart = companyParams.startPeriod.startDate;
        company.periodEnd = companyParams.endPeriod.endDate;
        company.fileCreationDate = companyParams.createdDate;
        company.productVersion += companyParams.netsuiteVersion;
        company.gafVersion = this.GAF_VERSION;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.MY.Adapter.CompanyAdapter.getCompany', ex.toString());
        throw nlapiCreateError('DATA_ERROR', 'TAF.MY.Adapter.CompanyAdapter.getCompany');
    }

    return company;
};