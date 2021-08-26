/**
 * Copyright (c) 2016, 2019 Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax.EU = Tax.EU || {};
Tax.EU.Intrastat = Tax.EU.Intrastat || {};
Tax.EU.Intrastat.DAO = Tax.EU.Intrastat.DAO || {};

Tax.EU.Intrastat.DAO.OnlineDAO = function _OnlineDAO() {
	Tax.DAO.BaseDAO.call(this);
	this.Name = 'OnlineDAO';
};
Tax.EU.Intrastat.DAO.OnlineDAO.prototype = Object.create(Tax.DAO.BaseDAO.prototype);

Tax.EU.Intrastat.DAO.OnlineDAO.prototype.getList = function _getList(params) {
	if (!params) {
		throw nlapiCreateError('INVALID_PARAMETER', 'params argument is required');
	}

	try {
		var onlineObj = this.getTaxPeriodInfo(params);
		var taxPeriodDateRange = this.getTaxPeriodDateRange(onlineObj);
		onlineObj.countryFormMap = this.getCountryFormMap(params, taxPeriodDateRange);
		onlineObj.template = {
			header: this.loadTemplate(params.meta.templates.HTML.HEADER),
			body: this.loadTemplate(params.meta.templates.HTML.BODY)
		};

		return onlineObj;
	} catch(ex) {
		logException(ex, 'Tax.EU.Intrastat.DAO.OnlineDAO.getList');
		throw ex;
	}
};

Tax.EU.Intrastat.DAO.OnlineDAO.prototype.getTaxPeriodInfo = function _getTaxPeriodInfo(params) {
	if (!params) {
		throw nlapiCreateError('INVALID_PARAMETER', 'params argument is required');
	}

	try {
		var taxPeriod = new SFC.System.TaxPeriod();
		var currentTaxPeriodId = taxPeriod.GetCurrentPeriod().GetId();
		var subParam = params.isOneWorld ? params.subsidiary : null;
		var periodInfo = {
			taxPeriods: taxPeriod.GetStructuredTaxPeriods(subParam),
			fromTaxPeriod: params.fromperiod || currentTaxPeriodId,
			toTaxPeriod: params.toperiod || currentTaxPeriodId,
		};
		return periodInfo;
	} catch(ex) {
		logException(ex, 'Tax.EU.Intrastat.DAO.OnlineDAO.getTaxPeriodInfo');
		throw ex;
	}
};

Tax.EU.Intrastat.DAO.OnlineDAO.prototype.loadTemplate = function _loadTemplate(templateName) {
	if (!templateName) {
		throw nlapiCreateError('INVALID_PARAMETER', 'templateName argument is required');
	}

	try {
		var taxTemplateList = new VAT.EU.DAO.TaxReportTemplateDAO().getList({
			name: templateName,
			isInactive: 'F'
		});

		return (taxTemplateList && taxTemplateList.length > 0) ? taxTemplateList[0].short : '';
	} catch (ex) {
		logException(ex, 'OnlineDAO.loadTemplate');
		throw nlapiCreateError('INCOMPLETE_BUNDLE', 'Please verify the contents of Tax Report Template.');
	}
};

Tax.EU.Intrastat.DAO.OnlineDAO.prototype.getCountryFormMap = function _getCountryFormMap(params, taxPeriod) {
	if (!params) {
		throw nlapiCreateError('INVALID_PARAMETER', 'Invalid parameter');
	}

	try {
		var reportMap = {};
		var nexusList = params.euNexusList;
		for (var i = 0; nexusList && i < nexusList.length; i++) {
			reportMap[nexusList[i]] = this.getCountryForm(params, nexusList[i], taxPeriod);
		}
		return reportMap;
	} catch (ex) {
		logException(ex, 'OnlineDAO.getCountryFormMap');
		throw ex;
	}
};

Tax.EU.Intrastat.DAO.OnlineDAO.prototype.getCountryForm = function _getCountryForm(params, nexus, taxPeriod) {
	if (!params) {
		throw nlapiCreateError('INVALID_PARAMETER', 'Invalid parameter');
	}

	try {
		var daoParams = {
			type : CONSTANTS.INTRASTAT,
			subType : params.reportType,
			countryCode : nexus
		};
		var dao = new Tax.DAO.TaxReportMapperDetailsDAO();
		var reportList = dao.getList(daoParams);
		if (reportList && (reportList.length > 0)) {
		    if (taxPeriod) {
		        var selectedPeriod = Math.max(taxPeriod.from.getTime(), taxPeriod.to.getTime());
	            reportList = reportList.filter(function(report) {
	                var effectiveFrom = report.effectiveFrom ? nlapiStringToDate(report.effectiveFrom).getTime() : CONSTANTS.DATE.MIN;
	                var validUntil = report.validUntil ? nlapiStringToDate(report.validUntil).getTime() : CONSTANTS.DATE.MAX;
	                return selectedPeriod >= effectiveFrom && selectedPeriod <= validUntil;
	            });
		    }

			return reportList;
		}
		return [params.genericReport];
	} catch (ex) {
		logException(ex, 'OnlineDAO.getCountryForm');
		throw nlapiCreateError('INCOMPLETE_BUNDLE', 'Please verify the contents of Tax Report Mapper Details.');
	}
};

Tax.EU.Intrastat.DAO.OnlineDAO.prototype.getTaxPeriodDateRange = function _getTaxPeriodDateRange(taxPeriodInfo) {
    var findId = function(list, compareValue) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].id == compareValue) {
                return list[i]
            }
        }
        return null;
    };
    var taxPeriods = taxPeriodInfo.taxPeriods;
    var fromTaxPeriodId = taxPeriodInfo.fromTaxPeriod;
    var toTaxPeriodId = taxPeriodInfo.toTaxPeriod;
    
    var fromTaxPeriod = findId(taxPeriods, fromTaxPeriodId);
    var toTaxPeriod = findId(taxPeriods, toTaxPeriodId);

    return {
        from: fromTaxPeriod.GetStartDate(),
        to: toTaxPeriod.GetEndDate()
    };
};
