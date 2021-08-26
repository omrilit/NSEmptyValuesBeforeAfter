/**
 * Copyright © 2016, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax.EU = Tax.EU || {};
Tax.EU.Intrastat = Tax.EU.Intrastat || {};
Tax.EU.Intrastat.Adapter = Tax.EU.Intrastat.Adapter || {};

Tax.EU.Intrastat.Adapter.CompanyInfoAdapter = function _CompanyInfoAdapter() {
    Tax.Adapter.BaseAdapter.call(this);
    this.Name = 'CompanyInfoAdapter';
    this.daos = ['CompanyInformationDAO'];
};
Tax.EU.Intrastat.Adapter.CompanyInfoAdapter.prototype = Object.create(Tax.Adapter.BaseAdapter.prototype);

Tax.EU.Intrastat.Adapter.CompanyInfoAdapter.prototype.transform = function _transform(params) {
    if (!params) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params argument is required');
    }

    try {
        var companyInfoDAO = this.rawdata[0];
        
        this.companyInfo = companyInfoDAO.company[0];
        this.onlineDAO = Tax.Cache.MemoryCache.getInstance().load('OnlineDAO');
        this.configList = companyInfoDAO.vatConfig;
        this.imgURL = (companyInfoDAO.imgFile && companyInfoDAO.imgFile.length > 0) ? companyInfoDAO.imgFile[0].url : null;

        var headerData = this.getHeaderData(params);

        var result = {};
        result[this.Name] = [headerData];

        return result;
    } catch (ex) {
        logException(ex, 'Tax.EU.Intrastat.Adapter.CompanyInfoAdapter.transform');
        throw ex;
    }
};

Tax.EU.Intrastat.Adapter.CompanyInfoAdapter.prototype.getHeaderData = function _getHeaderData(params) {
    if (!params || !params.meta) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params.meta argument is required');
    }
    if (!params.meta.headerData) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params.meta.headerData argument is required');
    }

    try {
        var headerData = this.getTaxPeriod(params);
        headerData.company = this.companyInfo.nameNoHierarchy;
        headerData.vatNo = this.getCompanyVrn();
        headerData.intrastatBranchId = this.getVATConfigData('IntrastatBranchNo') || '';
        headerData.participantNo = this.getVATConfigData('ParticipantNo') || '';
        headerData.imgurl = this.imgURL;
        headerData.printMessage = this.getPrintMsg(params);

        for (var datum in params.meta.headerData) {
            headerData[datum] = params.meta.headerData[datum];
        }

        return headerData;
    } catch (ex) {
        logException(ex, 'Tax.EU.Intrastat.Adapter.CompanyInfoAdapter.getHeaderData');
        throw ex;
    }
};

Tax.EU.Intrastat.Adapter.CompanyInfoAdapter.prototype.getVATConfigData = function _getVATConfigData(name) {
    if (!name) {
        throw nlapiCreateError('MISSING_PARAMETER', 'name argument is required');
    }

    var configDao = null;

    for (var i = 0; this.configList && i < this.configList.length; i++) {
        configDao = this.configList[i];
        if (configDao.name == name) {
            return configDao.value;
        }
    }

    return null;
};

Tax.EU.Intrastat.Adapter.CompanyInfoAdapter.prototype.setCultureInfo = function _setCultureInfo(language) {
    if (!language) {
        throw nlapiCreateError('MISSING_PARAMETER', 'language argument is required');
    }

    try {
        var translator = new VAT.Translation(language.toLowerCase());
        var cultureInfo = translator.getCultureInfo();
        if (cultureInfo) {
            Date.CultureInfo = cultureInfo;
        }
    } catch (ex) {
        logException(ex, 'Tax.EU.Intrastat.Adapter.CompanyInfoAdapter.setCultureInfo');
        throw ex;
    }
};

Tax.EU.Intrastat.Adapter.CompanyInfoAdapter.prototype.getPrintMsg = function _getPrintMsg(params) {
    var context = params.context;

    this.setCultureInfo(params.languageCode);

    var defaultMsg = [];
    defaultMsg.push('Printed by');
    defaultMsg.push(context.getName());
    defaultMsg.push('(' + context.getUser() + ')');
    defaultMsg.push('on');
    defaultMsg.push(new Date().toString('MMMM dd, yyyy'));

    return defaultMsg.join(' ');
};

Tax.EU.Intrastat.Adapter.CompanyInfoAdapter.prototype.getCompanyVrn = function _getCompanyVrn() {
	var vrn = this.getVATConfigData('VATRegistration') || this.companyInfo.vrn;

	vrn = vrn ? vrn.replace(/[^A-Za-z0-9]/g, '').replace(/^[A-Za-z]{2}/, '') : '';

	return vrn;
};

Tax.EU.Intrastat.Adapter.CompanyInfoAdapter.prototype.getTaxPeriod = function _getTaxPeriod(params) {
	try {
	    var fromPeriod = new SFC.System.TaxPeriod(params.fromperiod || this.onlineDAO.fromTaxPeriod);
	    var toPeriod = new SFC.System.TaxPeriod(params.toperiod || this.onlineDAO.toTaxPeriod);
	    var taxPeriod = {};

	    taxPeriod.fromPeriod = fromPeriod.GetStartDate().toString('MM/dd/yyyy');
	    taxPeriod.toPeriod = fromPeriod.GetStartDate() > toPeriod.GetStartDate() ? taxPeriod.fromPeriod : toPeriod.GetEndDate().toString('MM/dd/yyyy');

	    return taxPeriod;
	} catch (ex) {
        logException(ex, 'Tax.EU.Intrastat.Adapter.CompanyInfoAdapter.getTaxPeriod');
        throw ex;
	}
};
