/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.AE = TAF.AE || {};
TAF.AE.Adapter = TAF.AE.Adapter || {};

TAF.AE.Adapter.CompanyInfoLine = function _CompanyInfoLine() {
	
	return {
		companyName : '',
		trn : '',
		periodStart : '',
		periodEnd : '',
		fafCreationDate : '',
		productVersion : '',
		fafVersion: ''
	};
};

TAF.AE.Adapter.CompanyInfoAdapter = function _CompanyInfoAdapter() {
    this.context = nlapiGetContext();
    this.isOneWorld = (this.context.getSetting('FEATURE', 'SUBSIDIARIES') === 'T');
    this.SIVersionPrefix = 'NetSuite ';
    this.OWVersionPrefix = 'NetSuite OneWorld ';
    this.fafVersion = 'FAFv1.0.0';
};

TAF.AE.Adapter.CompanyInfoAdapter.prototype.getCompanyInfoLine = function _getCompanyInfoLine(params) {

    var companyInfoLine = new TAF.AE.Adapter.CompanyInfoLine();
    companyInfoLine.periodStart = params.periodFrom;
    companyInfoLine.periodEnd = params.periodTo;
    companyInfoLine.fafCreationDate = params.dateCreated;
    companyInfoLine.fafVersion = this.fafVersion;

    var version = this.getNSVersion();
    
    if (this.isOneWorld) {
    	companyInfoLine.companyName = params.subsidiaryInfo.getLegalName() || params.subsidiaryInfo.getName();
        companyInfoLine.trn = this.getVATNo(params.subsidiaryInfo.getFederalIdNumber());
        companyInfoLine.productVersion = this.OWVersionPrefix + version;
    } else {
    	companyInfoLine.companyName = params.companyInfo.legalName || params.companyInfo.companyName;
        companyInfoLine.trn = params.companyInfo.employerId;
        companyInfoLine.productVersion = this.SIVersionPrefix + version;
    }
    
    return companyInfoLine;
};

TAF.AE.Adapter.CompanyInfoAdapter.prototype.getNSVersion = function _getNSVersion() {
	var editions = {
		'AU': '(Australia) ',
		'CA': '(Canada) ',
		'JP': '(Japan) ',
		'UK': '(United Kingdom) ',
		'XX': '(International) '
	}
	var ns_version = this.context.getVersion();
	var ed_key = SFC.Context.GetNetSuiteEdition();
	var version = (editions[ed_key] || '') + ns_version;
	
	return version;
};

TAF.AE.Adapter.CompanyInfoAdapter.prototype.getVATNo = function _getVATNo(vatNo) {
    if (!vatNo) {
        return '';
    }

    vatNo = vatNo.replace(/[^0-9]/g, '');
    return vatNo;
};

