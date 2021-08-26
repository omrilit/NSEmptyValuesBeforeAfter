/**
 * Copyright © 2017, 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.ES = TAF.ES || {};
TAF.ES.Adapter = TAF.ES.Adapter || {};

TAF.ES.Adapter.CompanyInformationAdapter = function _CompanyInformationAdapter() {
	this.Name = 'CompanyInformationAdapter';
	this.isOneWorld = nlapiGetContext().getFeature('SUBSIDIARIES');
};
TAF.ES.Adapter.CompanyInformationAdapter.prototype = Object.create(TAF.ES.Adapter.ESTransactionAdapter.prototype);

TAF.ES.Adapter.CompanyInformationAdapter.prototype.getIssuedInvoiceHeader = function _getIssuedInvoiceHeader (rawData, submissionType) {
	if (!rawData) {
		throw nlapiCreateError('MISSING_PARAMETER', 'TAF.ES.Adapter.CompanyInformationAdapter.getIssuedInvoiceHeader: rawData is a required parameter');
	}

	var data = {
		version: TAF.SII.CONSTANTS.VERSION,
        submissionType: submissionType ? submissionType : TAF.SII.CONSTANTS.SUBMISSION_TYPE.REGISTRATION
	};

	if (this.isOneWorld) {
        data.companyName = rawData.getLegalName() || rawData.getName();
        data.vatNo = this.getVATNo(rawData.getFederalIdNumber());
        data.address1 = rawData.getAddress1();
        data.address2 = rawData.getAddress2();
        data.city = rawData.getCity();
        data.state = rawData.getState();
        data.zip = rawData.getZip();
        data.countryCode = rawData.getCountryCode();
        data.country = rawData.getCountry();
	} else {
        data.companyName = rawData.legalName || rawData.companyName;
        data.vatNo = this.getVATNo(rawData.taxNumber || rawData.taxId || rawData.employerId);
        data.address1 = rawData.address1;
        data.address2 = rawData.address2;
        data.city = rawData.city;
        data.state = rawData.state;
        data.zip = rawData.zip;
        data.countryCode = rawData.country;
        data.country = rawData.countryText;
	}

	return data;
};
