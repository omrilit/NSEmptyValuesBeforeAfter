/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax = Tax || {};
Tax.DAO = Tax.DAO || {};

Tax.DAO.CompanyInformationDAO = function _CompanyInformationDAO() {
    Tax.DAO.SubsidiaryDAO.call(this);
    this.Name = 'CompanyInformationDAO';
};

Tax.DAO.CompanyInformationDAO.prototype = Object.create(Tax.DAO.SubsidiaryDAO.prototype);

Tax.DAO.CompanyInformationDAO.prototype.prepareSearch = function prepareSearch(params) {
    //override Tax.DAO.SubsidiaryDAO.prepareSearch with a blank implementation
};

Tax.DAO.CompanyInformationDAO.prototype.search = function search(params) {
    return [nlapiLoadConfiguration('companyinformation')];
};

Tax.DAO.CompanyInformationDAO.prototype.rowToObject = function rowToObject(row) {
    if (!row) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'A configuration object is required.');
    }
    var company = new this.ListObject();
    company.name = row.getFieldValue('companyname') || '';
    company.nameNoHierarchy = row.getFieldValue('companyname') || '';
    company.vrn = row.getFieldValue('employerid') || row.getFieldValue('taxnumber') || row.getFieldValue('taxid') || '';
    company.legalName = row.getFieldValue('legalname') || '';
    company.zip = row.getFieldValue('zip') || '';
    company.telephone = row.getFieldValue('phone') || '';
    company.address1 = row.getFieldValue('address1') || '';
    company.address2 = row.getFieldValue('address2') || '';
    company.state = row.getFieldValue('state') || '';
    company.city = row.getFieldValue('city') || '';
    company.country = row.getFieldText('country') || '';
    company.countryCode = row.getFieldValue('country') || '';
    company.email = row.getFieldValue('email') || '';
    company.currency = row.getFieldText('basecurrency') || '';
    company.currencyId = row.getFieldValue('basecurrency') || '';
    company.fiscalCalendar = this.isMultiCalendar ? row.getFieldValue('taxfiscalcalendar') : '';
    
    return company;
};
