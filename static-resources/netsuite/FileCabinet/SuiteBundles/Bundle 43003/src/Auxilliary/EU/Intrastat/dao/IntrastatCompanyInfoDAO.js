/**
 * Copyright © 2016, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax.EU = Tax.EU || {};
Tax.EU.Intrastat = Tax.EU.Intrastat || {};
Tax.EU.Intrastat.DAO = Tax.EU.Intrastat.DAO || {};

Tax.EU.Intrastat.DAO.CompanyInformationDAO = function _CompanyInformationDAO() {
    Tax.DAO.BaseDAO.call(this);
    this.Name = 'CompanyInformationDAO';
};
Tax.EU.Intrastat.DAO.CompanyInformationDAO.prototype = Object.create(Tax.DAO.BaseDAO.prototype);

Tax.EU.Intrastat.DAO.CompanyInformationDAO.prototype.getList = function _getList(params) {
    if (!params || !params.meta || !params.meta.headerData) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params.meta.headerData argument is required');
    }

    try {
        var company = null;
        var subsidiary = null;

        if (params.isOneWorld) {
            subsidiary = params.subsidiary;
            company = new Tax.DAO.SubsidiaryDAO().getList({
                id: subsidiary,
                bookId: params.bookid
            });
        } else {
            company = new Tax.DAO.CompanyInformationDAO().getList();
        }

        var vatConfig = new Tax.DAO.VATOnlineConfigDAO().getList({
            subsidiary: subsidiary,
            countryCode: params.countryCode,
            isInactive: 'F'
        });

        this.cache('vatConfig', vatConfig);

        var fileResult = null;
        if (params.meta.headerData.logoFileName) {
        	fileResult = new VAT.EU.DAO.FileDAO().getList({ name: params.meta.headerData.logoFileName });
        }

        return {
            company: company,
            vatConfig: vatConfig,
            imgFile: fileResult
        };
    } catch (ex) {
        logException(ex, 'Tax.EU.Intrastat.DAO.CompanyInformationDAO.getList');
        throw ex;
    }
};
