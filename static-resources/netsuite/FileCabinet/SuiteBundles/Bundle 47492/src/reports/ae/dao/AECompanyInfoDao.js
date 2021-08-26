/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.AE = TAF.AE || {};
TAF.AE.DAO = TAF.AE.DAO || {};

TAF.AE.DAO.CompanyInfo = function _CompanyInfo() {
	
	return {
		companyName : '',
		legalName : '',
		employerId : '',
		trn : '',
		country : ''
	};
};

TAF.AE.DAO.CompanyInfoDao = function _CompanyInfoDao() {
    var context = nlapiGetContext();
    this.isMulticurrency = context.getFeature('MULTICURRENCY');
	this.companyInfo = nlapiLoadConfiguration('companyinformation');	
};
    
TAF.AE.DAO.CompanyInfoDao.prototype.getCompanyInfo = function _getCompanyInfo() {
	
	var companyInfo = new TAF.AE.DAO.CompanyInfo();
	try {
		companyInfo.companyName = this.companyInfo.getFieldValue('companyname') || '';
		companyInfo.legalName = this.companyInfo.getFieldValue('legalname') || '';
		companyInfo.employerId = this.companyInfo.getFieldValue('employerid') || '';
		companyInfo.trn = this.companyInfo.getFieldValue('federalidnumber') || '';
		companyInfo.country = this.companyInfo.getFieldText('country') || '';
	} catch (ex) {
		nlapiLogExecution('ERROR', 'TAF.AE.DAO.CompanyInfoDao.prototype.getCompanyInfo()', ex.toString());
	}
	
	return companyInfo;
};

TAF.AE.DAO.CompanyInfoDao.prototype.getBaseCurrency = function _getBaseCurrency() {
    var baseCurrency = '';
    
    try {
        if (this.isMulticurrency) {
            baseCurrency = this.companyInfo.getFieldValue('basecurrency');
        }
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.AE.DAO.CompanyInfoDao.getBaseCurrency()', ex.toString());
    }
    
    return baseCurrency;
};

