/**
 * Copyright © 2015, 2019, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.DAO = VAT.DAO || {};
VAT.EU = VAT.EU || {};
VAT.EU.ESL = VAT.EU.ESL || {};

VAT.EU.ESL.ReportController = function _ReportController(paramObj) {
	if (!paramObj) {
		throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'ReportController.constructor: object parameter is null or undefined');
	}

	this.params = paramObj;
	this.reportManager = null;
	this.dataManager = null;
	this.reportAdapter = null;
	this.euSubsidiaryList = null;
	this.taxPeriodList = null;
	this.books = null;
	this.context = nlapiGetContext();
	this.isOneWorld = this.context.getFeature('SUBSIDIARIES');
	this.euNexusList = null;
	this.country = null;
//  this.messageMgr = new VAT.MessageManager(this.context.getPreference('LANGUAGE'));
	this.resMgr = new ResourceMgr(this.context.getPreference('LANGUAGE'));
};

VAT.EU.ESL.ReportController.prototype.getForm = function _getForm(view) {
	try {
		if (!view) {
			throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'ReportController.getForm: view is null or undefined');
		}

		if (!this.reportManager) {
			this.reportManager = new VAT.EU.ESL.ReportManager();
		}

		if (!this.reportAdapter) {
			this.reportAdapter = new VAT.EU.ESL.ReportAdapter();
		}

		if (!this.euSubsidiaryList && this.isOneWorld) {
            var subsidiariesOfRole = new VAT.EU.DAO.SubsidiaryDAO().getSubsidiaryIdsByRole(this.context.getRole());
			this.euSubsidiaryList = getEUSubsidiaries(subsidiariesOfRole);
		}

		if (!this.euNexusList && !this.isOneWorld) {
			this.country = new VAT.EU.DAO.CompanyDAO().search();
			this.euNexusList = [];
			var euNexusObjList = new VAT.EU.DAO.TaxReportMapperDAO().getList({mapType: 'NEXUS', isEUCountry: 'T'});
			var euNexusObj = null;
			for (var index=0; index < (euNexusObjList && euNexusObjList.length); index++) {
				euNexusObj = euNexusObjList[index];
				this.euNexusList.push(euNexusObj.name);
			}
		}

		var countryFormsList = null;
		var getViewDataParams = {};
		var headerData = null;
		var report = null;
		var reportForm = null;
		var selectedCountryForm = null;
		var selectedSubsidiaryId = null;
		var script = 'customscript_new_ec_sales_csscript';
		var viewData = null;
		var periodFromObj = null;
		var periodToObj = null;

		getViewDataParams.error = this.checkFilterValues();

		if (!this.params.periodfrom || !this.params.periodto) {
			var currentPeriod = new SFC.System.TaxPeriod().GetCurrentPeriod();
			if (currentPeriod != null) {
				periodFromObj = currentPeriod;
				periodToObj = currentPeriod;
			}
		} else {
			periodFromObj = new SFC.System.TaxPeriod(this.params.periodfrom);
			periodToObj = new SFC.System.TaxPeriod(this.params.periodto);
			if (periodToObj.GetEndDate() < periodFromObj.GetStartDate()) {
				periodToObj = periodFromObj;
			}
		}

		if (!getViewDataParams.error.message) {
			if (this.isOneWorld) {
				selectedSubsidiaryId = this.params.subsidiary || this.euSubsidiaryList[0].id;
				this.country = new VAT.EU.DAO.SubsidiaryDAO().getByID(selectedSubsidiaryId);
				this.euNexusList = this.country.nexusList;
			}

			if (!this.taxPeriodList) {
				this.taxPeriodList = new SFC.System.TaxPeriod().GetStructuredTaxPeriods(selectedSubsidiaryId);
			}

			countryFormsList = this.reportManager.getCountryForms(this.euNexusList);
			selectedCountryForm = this.params.countryform || countryFormsList[0].id;
			report = this.reportManager.getReport(selectedCountryForm) || {};
			headerData = this.getHeaderData({country: this.country, report: report, periodFrom: periodFromObj, periodTo: periodToObj});

			if (this.context.getFeature('MULTIBOOK')) {
                this.books = new VAT.DAO.AccountingBookDAO().getBySubsidiary(selectedSubsidiaryId);
				
				if (!this.params.bookid) {
					for (var book in this.books) {
						if (this.books[book].isprimary == 'T') {
							this.params.bookid = this.books[book].id;
							break;
						}
					}
				}
			}
		}

		getViewDataParams.report = report || { data: { header: {} }, fields: {}, buttons: {}, columns: {} };
		getViewDataParams.script = script;
		getViewDataParams.subsidiarylist = this.euSubsidiaryList;
		getViewDataParams.countryformslist = countryFormsList;
		getViewDataParams.taxperiodlist = this.taxPeriodList;
		getViewDataParams.subsidiary = selectedSubsidiaryId;
		getViewDataParams.countryform = selectedCountryForm;
		getViewDataParams.group = this.params.group || 'F';
		getViewDataParams.periodfrom = periodFromObj.id;
		getViewDataParams.periodto = periodToObj.id;
		getViewDataParams.headerdata = headerData || {};
		getViewDataParams.cacheName = report && this.getCacheName(report.nexus);
		getViewDataParams.constants = CONSTANTS;
		getViewDataParams.bookid = this.params.bookid;
		getViewDataParams.books = this.books;

		if (this.params.clearcache == 'T' || !this.params.subsidiary) {
			new VAT.TaxCache().CleanupCacheRecord(getViewDataParams.cacheName);
		}

		if (report && report.reportAdapter) {
			this.reportAdapter = findClass(VAT, report.reportAdapter, null);
		}

		viewData = this.reportAdapter.getViewData(getViewDataParams);
		reportForm = view.render(viewData);
		return reportForm;

	} catch(exception) {
		logException(exception, 'ReportController.getForm');
		throw exception;
	}
};

VAT.EU.ESL.ReportController.prototype.getCacheName = function _getCacheName(nexus) {
	return this.params.cachename || ['esl', nexus, this.context.getUser()].join('-');
};

VAT.EU.ESL.ReportController.prototype.checkFilterValues = function _checkFilterValues() {
	var error = {code: '', message: ''};

	if (this.isOneWorld) {
		if (this.params.subsidiary == undefined && (!this.euSubsidiaryList || this.euSubsidiaryList.length <= 0)) {
			error.message = this.resMgr.GetString('ERR_COUNTRYFORM_NOT_SUPPORTED');
		} else {
			var selectedSubsidiary = this.params.subsidiary || this.euSubsidiaryList[0].id;
			var nexusList = new VAT.EU.DAO.SubsidiaryDAO().getByID(selectedSubsidiary).nexusList;
			error.message = (!nexusList || nexusList.length <= 0) ? this.resMgr.GetString('ERR_COUNTRYFORM_NOT_SUPPORTED') : '';
		}

	} else {
		if (!this.euNexusList || this.euNexusList.length <= 0) {
			error.message = this.resMgr.GetString('ERR_COUNTRYFORM_NOT_SUPPORTED');
		}
	}

	return error;
};

VAT.EU.ESL.ReportController.prototype.getPageData = function _getPageData() {
	try {
		if (!this.reportManager) {
			this.reportManager = new VAT.EU.ESL.ReportManager();
		}

		var countryform = this.params.countryform;
		var report = this.reportManager.getReport(countryform);
		var pageData = null;

		if (!this.dataManager) {
			this.dataManager = new VAT.EU.DataManager(report.getReportDataParams(), this.params);
		}

		pageData = this.dataManager.getPageData();

		return pageData;
	} catch(exception) {
		logException(exception, 'ReportController.getPageData');
		throw exception;
	}
};

VAT.EU.ESL.ReportController.prototype.getHeaderData = function _getHeaderData(params) {

	if (!params) {
		throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'ReportController.getHeaderData: params is null or undefined');
	}

	if (!params.country) {
		throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'ReportController.getHeaderData: country is null or undefined');
	}

	if (!params.report) {
		throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'ReportController.getHeaderData: report is null or undefined');
	}

	if (!params.periodFrom) {
		throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'ReportController.getHeaderData: periodFrom is null or undefined');
	}

	if (!params.periodTo) {
		throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'ReportController.getHeaderData: periodTo is null or undefined');
	}

	var fileDAOSearchResult = new VAT.EU.DAO.FileDAO().getList({name: params.report.data.header.logoFileName});
	var headerData = {};
	headerData.company = params.country.name;
	headerData.vatNo = this.formatVATNumber(params.country.vatNumber);
	headerData.group = this.params.group == 'T' ? 'This is a consolidated report.' : '';
	headerData.printMessage = [
		'Printed by',
		this.context.getName(),
		'(' + this.context.getUser() + ')',
		'on',
		new Date().toString("MMMM d, yyyy")
	].join(" ");
	headerData.endYear = params.periodTo.GetEndDate().toString('yyyy');
	headerData.endMonth = params.periodTo.GetEndDate().toString('MM');
	headerData.name = this.context.getName();

	var nexusConfig = new Tax.Returns.Configuration(params.report.nexus, params.subsidiary);
	headerData.branchNo = nexusConfig.GetValue(CONSTANTS.SETUP.ESL_BRANCH_NO);
	headerData.currency = nexusConfig.GetValue(CONSTANTS.SETUP.ESL_STERLING);

	// Set language of date
	var translator = new VAT.Translation(params.report.language);
	var cultureInfo = translator.getCultureInfo();
	if (cultureInfo) {
		Date.CultureInfo = cultureInfo; //override;
	}
	headerData.startPeriod = params.periodFrom.GetStartDate().toString('MMMM yyyy');
	headerData.endPeriod = params.periodTo.GetEndDate().toString('MMMM yyyy');

	headerData.imgurl =  (fileDAOSearchResult && fileDAOSearchResult.length > 0) ? fileDAOSearchResult[0].url : '';
	return headerData;
};

VAT.EU.ESL.ReportController.prototype.getExport = function _getExport(request) {
	var userId = this.context.getUser();
	var report = {};
	var adapter = {};
	var result = {url: '', content: '', message: '', fileId: ''};

	try {
		this.params.fileFormat = this.params.filetype;
		if (!this.params.fileFormat) {
			throw nlapiCreateError('ERR_EU_INCORRECT_FILE', 'Incorrect file type');
		}

		if (!this.reportManager) {
			this.reportManager = new VAT.EU.ESL.ReportManager();
		}

		var countryform = this.params.countryform;
		report = this.reportManager.getReport(countryform);
		this.params.cachename = this.getCacheName(report.nexus);
		if (!this.dataManager) {
			this.dataManager = new VAT.EU.DataManager(report.getReportDataParams(), this.params);
		}
		var adapterName = report.exportDataParams[this.params.fileFormat].adapter;
		adapter = findClass(VAT, adapterName);

		// Get data
		var rawData = this.dataManager.getAllData();
		var periodFromObj = new SFC.System.TaxPeriod(this.params.periodfrom);
		var periodToObj = new SFC.System.TaxPeriod(this.params.periodto);
		report.data.body = rawData.data;
		report.period = { from: periodFromObj, to: periodToObj };
		this.params.folderId = this.getFolderId(report, this.params);
		var country = this.isOneWorld ? new VAT.EU.DAO.SubsidiaryDAO().getByID(this.params.subsidiary) : new VAT.EU.DAO.CompanyDAO().search();
		var headerData = this.getHeaderData({country: country, report: report, periodFrom: periodFromObj, periodTo: periodToObj});
		var fileData = adapter.getFileData(report, headerData, this.params);

		if (fileData.hasMissingVatNo) {
			result.message = this.resMgr.GetString('INFO_MSG_ESL_MISSING_VATNO');
		}

		// Render the file
		var template = report.templates[this.params.fileFormat];
		fileData.content = new VAT.EU.ESL.View.ExportView().render(template, fileData);

		// Create file
		var fileDao = new VAT.EU.DAO.FileDAO();
		var fileId = fileDao.createFile(fileData);
		var fileObj = fileDao.getFileById(fileId);

		// Send email notification
		this.sendEmail({
			isSuccess: true,
			request: request,
			report: report,
			adapter: adapter,
			userId: userId,
			fileFormat: this.params.filetype,
			file: fileObj
		});

		result.url = fileObj.url;
		result.content = fileData.data;
		result.fileId = fileId;

		return result;
	} catch (ex) {
		this.sendEmail({
			isSuccess: false,
			request: request,
			report: report,
			adapter: adapter,
			userId: userId,
			fileFormat: this.params.filetype
		});

		logException(ex, 'ReportController.getExport');
		result.message = this.resMgr.GetString('INFO_MSG_ESL_UNABLE_TO_GENERATE_FILE');
		return result;
	}
};

VAT.EU.ESL.ReportController.prototype.sendEmail = function _sendEmail(params) {
	if (!params || !params.report || !params.adapter || !params.userId) {
		nlapiLogExecution('ERROR', 'ReportController.sendEmail', 'Unable to send email.');
		return;
	}

	try {
		var emailMessage = params.isSuccess ? params.report.email.success : params.report.email.fail;
		var emailParams = {
			userId: params.userId,
			subject: emailMessage.subject,
			body: emailMessage.message,
			fileFormat: params.fileFormat,
			accountId: this.context.getCompany(),
			url: params.isSuccess ? request.getURL().split('/app')[0] + params.file.url : '',
			fileName: params.isSuccess ? params.file.name : ''
		};

		var email = params.adapter.getEmailData(emailParams);
		new VAT.EU.EmailSender().sendEmail(email);
	} catch(e) {
		logException(e, 'ReportController.sendEmail');
	}
};

VAT.EU.ESL.ReportController.prototype.getFolderId = function _getFolderId(report, params) {
	var nexusConfig = new Tax.Returns.Configuration(report.nexus, params.subsidiary);
	var rootFolder = nexusConfig.GetValue(CONSTANTS.FOLDER.ESL_CONFIG_NAME);
	if (!rootFolder) {
		rootFolder = CONSTANTS.FOLDER.ESL_DEFAULT;
	}
	return ECSALES.createOutputFolder(rootFolder);
};

VAT.EU.ESL.ReportController.prototype.formatVATNumber = function _formatVATNumber(vatNumber) {
	var regexEU = new RegExp("[^0-9A-Za-z]", "g");
	var formattedvalue = vatNumber.replace(regexEU, "");
	var prefix = formattedvalue.substring(0, 2);

	var result = "";
	if (isNaN(parseInt(prefix.charAt(0))) && isNaN(parseInt(prefix.charAt(1))) && CONSTANTS.EU_NEXUSES[prefix]) {
		result = formattedvalue.substring(2);
	} else {
		var regexNonEU = new RegExp("[^0-9]", "g");
		result = vatNumber.replace(regexNonEU, "");
	}

	if (result) {
		return result;
	} else {
		return vatNumber;
	}
};

VAT.EU.ESL.ReportController.prototype.submitHMRC = function _submitHMRC(url) {
	var result = {message: ''};

	try {
		this.params.fileFormat = this.params.filetype;
		if (!this.params.fileFormat) {
			throw nlapiCreateError('ERR_EU_INCORRECT_FILE', 'Incorrect file type');
		}

		if (!this.reportManager) {
			this.reportManager = new VAT.EU.ESL.ReportManager();
		}

		var countryform = this.params.countryform;
		var report = this.reportManager.getReport(countryform);
		this.params.cachename = this.getCacheName(report.nexus);

		if (!this.dataManager) {
			this.dataManager = new VAT.EU.DataManager(report.getReportDataParams(), this.params);
		}

		var rawData = this.dataManager.getAllData();
		var adapterName = report.exportDataParams[this.params.fileFormat].adapter;
		var exportAdapter = findClass(VAT, adapterName);
		var submitData = exportAdapter.prepareExportData(rawData.data, report, this.params);

		if (submitData.data.length <= 0) {
            result.message = this.resMgr.GetString('INFO_MSG_ESL_NO_LINE_SELECTED');
		} else {
			if (!submitData.hasMissingVatNo) {
				var schedScriptParams = {};
				var periodFrom = new SFC.System.TaxPeriod(this.params.periodfrom);
				var periodTo = new SFC.System.TaxPeriod(this.params.periodto);

				if (periodFrom.GetType() == 'month') {
					schedScriptParams.custscript_4873_reportingperiodid = 1;
					nlapiLogExecution("Audit", "ECSALES.Class.SubmitHMRC: period type", "monthly");
				} else if (periodFrom.GetType() == 'quarter') {
					schedScriptParams.custscript_4873_reportingperiodid = 2;
					nlapiLogExecution("Audit", "ECSALES.Class.SubmitHMRC: period type", "quarter");
				} else {
					nlapiLogExecution("Audit", "ECSALES.Class.SubmitHMRC: period type", periodFrom.GetType());
					return;
				}

				schedScriptParams.custscript_4873_ecdata = JSON.stringify(submitData.data);
				schedScriptParams.custscript_4873_subsidiaryid = this.params.subsidiary;
				schedScriptParams.custscript_4873_fromperiodid = this.params.periodfrom;
				schedScriptParams.custscript_4873_toperiodid = this.params.periodto;
				schedScriptParams.custscript_4873_resched_counter = 0;
				schedScriptParams.custscript_4873_fromperiodtxt = periodFrom.GetName();
				schedScriptParams.custscript_4873_toperiodtxt = periodTo.GetName();
				schedScriptParams.custscript_4873_ecurl = url;
				schedScriptParams.custscript_4873_logxml = 1;
				schedScriptParams.custscript_4873_ecsales_poll_body = null;
				schedScriptParams.custscript_4873_ecsales_poll_code = null;
				schedScriptParams.custscript_4873_ecsales_poll_error = null;

				var paramLog = [];
				for(var iSchedParam in schedScriptParams) {
					paramLog.push(iSchedParam + ":" + schedScriptParams[iSchedParam]);
				}

				nlapiLogExecution("Audit", "ECSALES.Class.SubmitHMRC:param", paramLog.join("<br/>"));

				var queueStatus = nlapiScheduleScript('customscript_new_ecsales_submithmrc', 'customdeploy_new_ecsales_submithmrc', schedScriptParams);

				if (queueStatus == 'QUEUED') {
					result.message = this.resMgr.GetString('INFO_MSG_ESL_QUEUE_SUCCESS');
				} else {
                    result.message = this.resMgr.GetString('INFO_MSG_ESL_QUEUE_FAIL');
				}
			} else {
                result.message = this.resMgr.GetString('INFO_MSG_ESL_MISSING_VATNO');
			}
		}

		return result;
	} catch(exception) {
		logException(exception, 'ReportController.submitHMRC');
        result.message = this.resMgr.GetString('INFO_MSG_ESL_UNEXPECTED_FAILURE');
		return result;
	}
};

var _App = new SFC.System.Application("e5775970-8e28-40ff-ad4a-956e88304834");
