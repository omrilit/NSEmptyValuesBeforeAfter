/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.SG = TAF.SG || {};
TAF.SG.DAO = TAF.SG.DAO || {};

TAF.SG.DAO.CompanyInfo = function _CompanyInfo() {
	
	return {
		companyName : '',
		legalName : '',
		employerId : '',
		custRecCompanyUEN : '',
		country : ''
	};
};

TAF.SG.DAO.CompanyInfoDao = function _CompanyInfoDao() {
    var context = nlapiGetContext();
    this.isMulticurrency = context.getFeature('MULTICURRENCY');
	this.companyInfo = nlapiLoadConfiguration('companyinformation');	
};
    
TAF.SG.DAO.CompanyInfoDao.prototype.getCompanyInfo = function _getCompanyInfo() {
	
	var companyInfo = new TAF.SG.DAO.CompanyInfo();
	try {
		companyInfo.companyName = this.companyInfo.getFieldValue('companyname') || '';
		companyInfo.legalName = this.companyInfo.getFieldValue('legalname') || '';
		companyInfo.employerId = this.companyInfo.getFieldValue('employerid') || '';
		companyInfo.custRecCompanyUEN = this.companyInfo.getFieldValue('custrecord_company_uen') || '';
		companyInfo.country = this.companyInfo.getFieldText('country') || '';
	} catch (ex) {
		nlapiLogExecution('ERROR', 'TAF.SG.DAO.CompanyInfoDao.prototype.getCompanyInfo()', ex.toString());
	}
	
	return companyInfo;
};

TAF.SG.DAO.CompanyInfoDao.prototype.getBaseCurrency = function _getBaseCurrency() {
    var baseCurrency = '';
    
    try {
        if (this.isMulticurrency) {
            baseCurrency = this.companyInfo.getFieldValue('basecurrency');
        }
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.SG.DAO.CompanyInfoDao.getBaseCurrency()', ex.toString());
    }
    
    return baseCurrency;
};

