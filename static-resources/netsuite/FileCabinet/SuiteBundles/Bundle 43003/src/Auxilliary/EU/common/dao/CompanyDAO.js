/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.EU = VAT.EU || {};
VAT.EU.DAO = VAT.EU.DAO || {};

VAT.EU.DAO.CompanyDAO = function _CompanyDAO() {
    VAT.EU.DAO.BaseDAO.call(this);
    this.daoName = 'CompanyDAO';
	this.isMulticurrency = nlapiGetContext().getFeature('MULTICURRENCY');
	this.fields = {
		companyname: 'companyname',
		legalname: 'legalname',
		employerid: 'employerid',
		taxnumber: 'taxnumber',
		taxid: 'taxid',
		country: 'country',
		basecurrency: 'basecurrency',
		addr1: 'address1',
		addr2: 'address2',
		city: 'city',
		zip: 'zip',
		phone: 'phone',
		email: 'email'
	};
};

VAT.EU.DAO.CompanyDAO.prototype = Object.create(VAT.EU.DAO.BaseDAO.prototype);

VAT.EU.DAO.CompanyDAO.prototype.search = function search() {
    try {
        return this.rowToObject(nlapiLoadConfiguration('companyinformation'));
    } catch (ex) {
        throw ex;
    } 
};

VAT.EU.DAO.CompanyDAO.prototype.ListObject = function _listObject() {
	return {
		name: '',
		legalName: '',
		vatNumber: '',
		country: '',
		countryCode: '',
		currency: '',
		currencyId: '',
	};
};

VAT.EU.DAO.CompanyDAO.prototype.rowToObject = function rowToObject(searchObject) {    
    var company = new this.ListObject();
    company.name = searchObject.getFieldValue(this.fields.companyname) || '';
    company.legalName = searchObject.getFieldValue(this.fields.legalname) || '';
    company.vatNumber = searchObject.getFieldValue(this.fields.employerid) 
                        || searchObject.getFieldValue(this.fields.taxnumber) 
                        || searchObject.getFieldValue(this.fields.taxid)
                        || '';
    company.country = searchObject.getFieldText(this.fields.country) || ''; 
    company.countryCode = searchObject.getFieldValue(this.fields.country) || '';
    company.addr1 = searchObject.getFieldValue(this.fields.addr1) || '';
    company.addr2 = searchObject.getFieldValue(this.fields.addr2) || '';
    company.city = searchObject.getFieldValue(this.fields.city) || '';
    company.zip = searchObject.getFieldValue(this.fields.zip) || '';
    company.phone = searchObject.getFieldValue(this.fields.phone) || '';
    company.email = searchObject.getFieldValue(this.fields.email) || '';
    
    if (this.isMulticurrency) {
        company.currency = searchObject.getFieldText(this.fields.basecurrency) || '';  
        company.currencyId = searchObject.getFieldValue(this.fields.basecurrency) || '';
    }
    
    return company;
};
