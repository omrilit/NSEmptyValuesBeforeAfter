/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.DAO = TAF.DAO || {};

TAF.CompanyInfo = function _CompanyInfo(){
	return {
		companyName: '',
		legalName: '',
		employerId: '', // VAT Registration Number
		taxNumber: '',
		taxId: '',
		currency: '',
		currencyCode: '',
		currencyLocale: '',
		country: ''		    
	};
};

TAF.DAO.CompanyDao = function _CompanyDao(){
	this.config = nlapiLoadConfiguration('companyinformation');
};

TAF.DAO.CompanyDao.prototype.getInfo = function _getInfo(){
	var info = new TAF.CompanyInfo();
	try {
		info.companyName = this.config.getFieldValue('companyname') || '';
		info.legalName = this.config.getFieldValue('legalname') || '';
		info.employerId = this.config.getFieldValue('employerid') || '';
		info.taxNumber = this.config.getFieldValue('taxnumber') || '';
		info.taxId = this.config.getFieldValue('taxid') || '';
		info.country = this.config.getFieldValue('country') || '';
		info.brn = this.config.getFieldValue('custrecord_company_brn') || '';
		
		if (nlapiGetContext().getFeature('MULTICURRENCY')) {
		    info.currency = this.config.getFieldValue('basecurrency') || '';
		    info.currencyCode = this.config.getFieldText('basecurrency') || '';
		} else {
		    info.currencyLocale = this.config.getFieldValue('locale') || '';
		}

		info.address1 = this.config.getFieldValue('address1');
        info.address2 = this.config.getFieldValue('address2');
        info.city = this.config.getFieldValue('city');
        info.state = this.config.getFieldValue('state');
        info.zip = this.config.getFieldValue('zip');
        info.countryText = this.config.getFieldValue('country');
        
	} catch (ex) {
		nlapiLogExecution('ERROR', 'TAF.DAO.CompanyDao.prototype.getInfo()', ex.toString());
	}
	
	return info;
};

