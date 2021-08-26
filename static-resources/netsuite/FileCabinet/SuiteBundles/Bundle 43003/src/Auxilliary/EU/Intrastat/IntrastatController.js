 /**
 * Copyright (c) 2016, 2019 Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax.EU = Tax.EU || {};
Tax.EU.Intrastat = Tax.EU.Intrastat || {};

Tax.EU.Intrastat.IntrastatController = function IntrastatController() {};

Tax.EU.Intrastat.IntrastatController.prototype.runSequence = function _runSequence(params) {
	if (!params) {
		throw nlapiCreateError('INVALID_PARAMETER', 'Invalid parameter');
	}

	try {
		var reportParams = this.initializeNexusDetails(params);
		reportParams = this.initializeReport(reportParams);
		nlapiLogExecution('DEBUG', 'Report Name', reportParams.report.name);

		var sequence = this.getReportSequence(reportParams);
		var sequenceBuilder = new Tax.SequenceBuilder(sequence);
		var errorHandler = new Tax.ErrorHandler();
		var reportEngine = new Tax.ReportEngine();
		var sequenceResult = reportEngine.run(sequenceBuilder, reportParams, errorHandler);
		return sequenceResult;
	} catch (ex) {
		logException(ex, 'IntrastatController.runSequence');
		throw ex;
	}
};

// Initial Load
// Changed subsidiary
// Changed report type
// Action Type = Form
Tax.EU.Intrastat.IntrastatController.prototype.initializeNexusDetails = function _initializeNexusDetails(params) {
	if (!params) {
		throw nlapiCreateError('INVALID_PARAMETER', 'Invalid parameter');
	}

	try {
		params.context = nlapiGetContext();
		params.isOneWorld = params.context.getFeature('SUBSIDIARIES');
		params.isMBA = params.context.getFeature('MULTIBOOK');
        var resMgr = new ResourceMgr(params.context.getPreference('LANGUAGE'));

		if (params[CONSTANTS.FIELD.ACTION_TYPE] &&
			(params[CONSTANTS.FIELD.COUNTRY_FORM])) {
			return params;
		}

		params.completeEuNexusList = this.getCompleteEuNexusList();
		params.completeEuNexusCodeList = this.getCompleteEuNexusCodeList(params.completeEuNexusList);

		// Set nexusList
		if (params.isOneWorld) {
			params.euSubsidiaries = this.getEuSubsidiariesInAccount(params);
			params.subsidiary = params.subsidiary || (params.euSubsidiaries[0] && params.euSubsidiaries[0].id);
			params.nexusList = params.subsidiary && this.getNexusListBySub(params.subsidiary);
		} else {
			var nexusList = this.getNexusList();
			params.nexusList = nexusList.map(function (nexus) {
				return nexus.country;
			});
		}

		if (params.isMBA) {
			params.books = new VAT.DAO.AccountingBookDAO().getBySubsidiary(params.subsidiary);
			if (!params.bookid) {
				for (var book in this.books) {
					if (params.books[book].isprimary == 'T') {
						params.bookid = this.books[book].id;
						break;
					}
				}
			}
		}

		if (params.nexusList) {
	        params.euNexusList = (params.completeEuNexusCodeList && params.nexusList) && this.filterEuNexusList(params.completeEuNexusCodeList, params.nexusList);
	        params.countryCode = params[CONSTANTS.FIELD.COUNTRY_CODE] || (params.euNexusList && params.euNexusList[0]);
		} else {
		    params.error = {
		        message: resMgr.GetString('ERR_COUNTRYFORM_NOT_SUPPORTED')
		    };
		}

		return params;
	} catch (ex) {
		logException(ex, 'IntrastatController.initializeNexusDetails');
		throw ex;
	}
};

Tax.EU.Intrastat.IntrastatController.prototype.filterEuNexusList = function _filterEuNexusList(completeEuNexusCodeList, nexusList) {
	if (!completeEuNexusCodeList|| !nexusList) {
		throw nlapiCreateError('INVALID_PARAMETER', 'Invalid parameter');
	}

	try {
		var euNexusList = [];
		for (var i = 0; i < nexusList.length; i++) {
			if (this.isNexusInEu(completeEuNexusCodeList, nexusList[i])) {
				euNexusList.push(nexusList[i]);
			}
		}
		return euNexusList;
	} catch (ex) {
		logException(ex, 'IntrastatController.filterEuNexusList');
		throw ex;
	}
};


Tax.EU.Intrastat.IntrastatController.prototype.getCompleteEuNexusList = function _getCompleteEuNexusList() {
	try {
		var mapperDao = new Tax.DAO.TaxReportMapperDAO();
		var completeEuNexusList = mapperDao.getList({ mapType: 'NEXUS', isEUCountry: 'T' });
		return completeEuNexusList;
	} catch (ex) {
		logException(ex, 'IntrastatController.getCompleteEuNexusList');
		throw nlapiCreateError('INCOMPLETE_BUNDLE', 'Please verify the contents of Tax Report Mapper Details.');
	}
};

Tax.EU.Intrastat.IntrastatController.prototype.getCompleteEuNexusCodeList = function _getCompleteEuNexusCodeList(euNexusList) {
	var codeList = [];
	for (var i = 0; i < euNexusList.length; i++) {
		var nexus = euNexusList[i];
		codeList.push(nexus.name);
		if (nexus.alternateCode) {
			codeList.push(nexus.alternateCode);
		}
	}
	return codeList;
};

Tax.EU.Intrastat.IntrastatController.prototype.getEuSubsidiariesInAccount = function _getEuSubsidiariesInAccount(params) {
	if (!params) {
		throw nlapiCreateError('INVALID_PARAMETER', 'Invalid parameter');
	}

	try {
		var subDao = new Tax.DAO.SubsidiaryDAO();
		var roleSubList = subDao.getSubsidiaryIdsByRole(params.context.getRole());
		var allSubs = subDao.getList({isInactive:false});
		var euSubs = []; 

		for (var i = 0; i < allSubs.length; i++) {
			var sub = allSubs[i];

			if (roleSubList.length > 0 && roleSubList.indexOf(sub.id) === -1) {
			    continue;
			}

			if (this.isNexusInEu(params.completeEuNexusCodeList, sub.countryCode)) {
				euSubs.push(sub);
				continue;
			}

			var nexusList = this.getNexusListBySub(sub.id);
			for (var j = 0; j < nexusList.length; j++) {
				if (this.isNexusInEu(params.completeEuNexusCodeList, nexusList[j])) {
					euSubs.push(sub);
					break;
				}
			}
		}

		return euSubs;
	} catch (ex) {
		logException(ex, 'IntrastatController.getEuSubsidiariesInAccount');
		throw ex;
	}
};

Tax.EU.Intrastat.IntrastatController.prototype.getNexusListBySub = function _getNexusListBySub(subId) {
	if (!subId) {
		throw nlapiCreateError('INVALID_PARAMETER', 'Invalid parameter');
	}

	var subDao = new VAT.EU.DAO.SubsidiaryDAO();
	var subObj = subDao.getByID(subId);
	var nexusList = subObj.nexusList;
	return nexusList;
};

Tax.EU.Intrastat.IntrastatController.prototype.getNexusList = function _getNexusList() {
	var nexusDao = new Tax.DAO.NexusDAO();
	var allNexusObj = nexusDao.getList({});
	return allNexusObj;
};

Tax.EU.Intrastat.IntrastatController.prototype.isNexusInEu = function _isNexusInEu(euNexusList, nexus) {
	var isEu = (euNexusList.indexOf(nexus) > -1);
	return isEu;
};

Tax.EU.Intrastat.IntrastatController.prototype.initializeReport = function _initializeReport(params) {
	if (!params) {
		throw nlapiCreateError('INVALID_PARAMETER', 'Invalid parameter');
	}

	try {
		params.genericReport = this.getGenericReport(params);
		params.report = this.getStandardReport(params);

		if (!params.report) {
			params.report = params.genericReport;
		}

		params.format = params.report.format;
		params.reportType = params.report.subType;
		params.languageCode = params.report.language;
		params.meta = JSON.parse(params.report.meta);
		params.countryCode = params[CONSTANTS.FIELD.COUNTRY_FORM] ? params[CONSTANTS.FIELD.COUNTRY_FORM].split('-')[1] : params.countryCode;
		params[CONSTANTS.FIELD.COUNTRY_FORM] = [params.report.detailInternalId, params.countryCode, params.languageCode].join('-');

		return params;
	} catch (ex) {
		logException(ex, 'IntrastatController.initializeReport');
		throw nlapiCreateError('INCOMPLETE_BUNDLE', 'Please verify the contents of Tax Report Mapper Details.');
	}
};

Tax.EU.Intrastat.IntrastatController.prototype.getGenericReport = function _getGenericReport(params) {
	if (!params) {
		throw nlapiCreateError('INVALID_PARAMETER', 'Invalid parameter');
	}

    var validActionType = [CONSTANTS.ACTION_TYPE.GET_FORM, CONSTANTS.ACTION_TYPE.GET_DATA, CONSTANTS.ACTION_TYPE.EXPORT];
	if ((params[CONSTANTS.FIELD.ACTION_TYPE]) &&
		(validActionType.indexOf(params[CONSTANTS.FIELD.ACTION_TYPE]) < 0)) {
		// No need for generic report
		return {};
	}

	// Generic report is always needed for form
	var reportType = params[CONSTANTS.FIELD.REPORT_TYPE] || CONSTANTS.REPORT_TYPE.SALE.id;
	var daoParams =  {
		type : CONSTANTS.INTRASTAT,
		name : CONSTANTS.REPORT_TYPE[reportType].report
	};
	var reportList = this.getReportList(daoParams);
	var report = reportList[0];
	report.isGeneric = true;
	return report;
};

Tax.EU.Intrastat.IntrastatController.prototype.getStandardReport = function _getStandardReport(params) {
	if (!params) {
		throw nlapiCreateError('INVALID_PARAMETER', 'Invalid parameter');
	}
	var daoParams = this.getReportDaoParams(params);
	var reportList = this.getReportList(daoParams);
	var reportFilteredByPeriodList = this.filterReportByPeriod({
	    reportList: reportList,
	    periodFrom: params[CONSTANTS.FIELD.FROM_DATE],
	    periodTo: params[CONSTANTS.FIELD.TO_DATE]
	});
    return this.filterReportByLanguage(reportFilteredByPeriodList, params[CONSTANTS.FIELD.LANGUAGE_CODE]);
};

Tax.EU.Intrastat.IntrastatController.prototype.filterReportByPeriod = function _filterReportByPeriod(params) {
    var reportList = params.reportList;
    if (reportList.length === 1) {
        return reportList;
    }

    var currentPeriod = new SFC.System.TaxPeriod().GetCurrentPeriod();
    var fromPeriod = params.periodFrom ? new SFC.System.TaxPeriod(params.periodFrom).GetStartDate() : currentPeriod.GetStartDate();
    var toPeriod = params.periodTo ? new SFC.System.TaxPeriod(params.periodTo).GetEndDate() : currentPeriod.GetEndDate();
    var selectedPeriod = Math.max(fromPeriod.getTime(), toPeriod.getTime());

    var effectiveFrom;
    var validUntil;
    var filteredList =  reportList.filter(function(report) {
        effectiveFrom = report.effectiveFrom ? nlapiStringToDate(report.effectiveFrom).getTime() : CONSTANTS.DATE.MIN;
        validUntil = report.validUntil ? nlapiStringToDate(report.validUntil).getTime() : CONSTANTS.DATE.MAX;
        return selectedPeriod >= effectiveFrom && selectedPeriod <= validUntil;
    });

    return filteredList.length > 0 ? filteredList : reportList;
};

Tax.EU.Intrastat.IntrastatController.prototype.filterReportByLanguage = function _filterReportByLanguage(reportList, languageCode) {
	if (!reportList) {
		return null;
	}

	for (var i = 0; i < reportList.length; i++) {
		if (reportList[i].language == languageCode) {
			return reportList[i];
		}
	}

	return reportList[0];
};


Tax.EU.Intrastat.IntrastatController.prototype.getReportDaoParams = function _getReportDaoParams(params) {
	if (!params) {
		throw nlapiCreateError('INVALID_PARAMETER', 'Invalid parameter');
	}

	var countryFormList;
	var daoParams = {
		type : CONSTANTS.INTRASTAT
	};
	if (params.actiontype === CONSTANTS.ACTION_TYPE.GET_DATA || params.actiontype === CONSTANTS.ACTION_TYPE.EXPORT) {
	    countryFormList = params[CONSTANTS.FIELD.COUNTRY_FORM].split('-');
	    daoParams.name = countryFormList[0];
	} else if (params[CONSTANTS.FIELD.COUNTRY_FORM]) {
		countryFormList = params[CONSTANTS.FIELD.COUNTRY_FORM].split('-');
		daoParams.languageCode = countryFormList[2];
    }
	
    daoParams.countryCode = params.countryCode || params.countrycode;
    daoParams.subType = params[CONSTANTS.FIELD.REPORT_TYPE] || CONSTANTS.REPORT_TYPE.SALE.id;
        
	return daoParams;
};


Tax.EU.Intrastat.IntrastatController.prototype.getReportList = function _getReportList(daoParams) {
	if (!daoParams) {
		throw nlapiCreateError('INVALID_PARAMETER', 'Invalid parameter');
	}

	try {
		var dao = new Tax.DAO.TaxReportMapperDetailsDAO();
		var reportList = dao.getList(daoParams);
		return reportList;
	} catch (ex) {
		logException(ex, 'IntrastatController.getReportList');
		throw ex;
	}
};

Tax.EU.Intrastat.IntrastatController.prototype.getReportSequence = function _getReportSequence(params) {
	if (!params) {
		throw nlapiCreateError('INVALID_PARAMETER', 'Invalid parameter');
	}

	try {
		var metaName = '';

		switch (params[CONSTANTS.FIELD.ACTION_TYPE]) {
			case CONSTANTS.ACTION_TYPE.GET_DATA:
				if (params[CONSTANTS.FIELD.RELOAD_CACHE] == 'T') {
					metaName = CONSTANTS.ACTION_TYPE.GET_DATA;
				} else {
					metaName = CONSTANTS.ACTION_TYPE.CACHE;
				}
				break;
			case CONSTANTS.ACTION_TYPE.EXPORT:
				metaName = params[CONSTANTS.FIELD.FILE_TYPE];
				break;
			default:
				metaName = CONSTANTS.ACTION_TYPE.GET_FORM;
				break;
		}

		var meta = params.meta.sequence[metaName];
		return meta;
	} catch (ex) {
		logException(ex, 'IntrastatController.getReportSequence');
		throw nlapiCreateError('INCOMPLETE_BUNDLE', 'Please verify the contents of Tax Report Mapper Details.');
	}
};
