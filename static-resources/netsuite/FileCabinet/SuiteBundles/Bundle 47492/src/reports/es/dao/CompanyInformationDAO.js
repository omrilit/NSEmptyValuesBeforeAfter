/**
 * Copyright 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.ES = TAF.ES || {};
TAF.ES.DAO = TAF.ES.DAO || {};

TAF.ES.DAO.CompanyInformationDAO = function _CompanyInformationDAO(params) {
	TAF.DAO.SearchDAO.call(this, params);
};
TAF.ES.DAO.CompanyInformationDAO.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.ES.DAO.CompanyInformationDAO.prototype.getList = function _getList(params) {
    if (!params) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'params is required.');
    }

    var company;

    if (this.isOneWorld) {
        company = new TAF.SubsidiaryDao().getSubsidiaryInfo({
            subsidiary: params.subsidiary,
            bookId: params.bookid
        });
    } else {
        company = new TAF.DAO.CompanyDao().getInfo();
    }

    return company;
};
