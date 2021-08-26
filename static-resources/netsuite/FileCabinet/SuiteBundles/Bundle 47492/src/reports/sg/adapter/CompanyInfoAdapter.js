/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.SG = TAF.SG || {};
TAF.SG.Adapter = TAF.SG.Adapter || {};

TAF.SG.Adapter.CompanyInfoLine = function _CompanyInfoLine() {
	
	return {
		companyName : '',
		companyUEN : '',
		gstNo : '',
		periodStart : '',
		periodEnd : '',
		iafCreationDate : '',
		productVersion : '',
		iafVersion : ''
	};
};

TAF.SG.Adapter.CompanyInfoAdapter = function _CompanyInfoAdapter() {
	
    this.context = nlapiGetContext();
    this.isOneWorld = (this.context.getSetting('FEATURE', 'SUBSIDIARIES') === 'T');
    this.SIVersionPrefix = 'NetSuite ';
    this.OWVersionPrefix = 'NetSuite OneWorld ';
    this.iafVersion = 'IAFv2.0.0';
};

TAF.SG.Adapter.CompanyInfoAdapter.prototype.getCompanyInfoLine = function _getCompanyInfoLine(params) {

    var companyInfoLine = new TAF.SG.Adapter.CompanyInfoLine();
    companyInfoLine.periodStart = params.periodFrom;
    companyInfoLine.periodEnd = params.periodTo;
    companyInfoLine.iafCreationDate = params.dateCreated;
    companyInfoLine.iafVersion = this.iafVersion;
    
    var version = this.context.getVersion().substring(0, 4);
    
    if (this.isOneWorld) {
    	companyInfoLine.companyName = params.subsidiaryInfo.getLegalName() || params.subsidiaryInfo.getName();
        companyInfoLine.companyUEN = params.subsidiaryInfo.getCustRecCompanyUEN() || params.subsidiaryInfo.getFederalIdNumber();
        companyInfoLine.gstNo = params.subsidiaryInfo.getFederalIdNumber();
        companyInfoLine.productVersion = this.OWVersionPrefix + version;
    } else {
    	companyInfoLine.companyName = params.companyInfo.legalName || params.companyInfo.companyName;
        companyInfoLine.companyUEN = params.companyInfo.custRecCompanyUEN || params.companyInfo.employerId;
        companyInfoLine.gstNo = params.companyInfo.employerId;
        companyInfoLine.productVersion = this.SIVersionPrefix + version;
    }
    
    return companyInfoLine;
};

