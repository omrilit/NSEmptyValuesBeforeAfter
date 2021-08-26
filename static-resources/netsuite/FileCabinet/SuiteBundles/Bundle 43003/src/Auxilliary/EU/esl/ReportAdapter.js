/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.EU = VAT.EU || {};
VAT.EU.ESL = VAT.EU.ESL || {};

VAT.EU.ESL.ReportAdapter = function _ReportAdapter() {
};

VAT.EU.ESL.ReportAdapter.prototype.getViewData = function _getViewData(params) {

	if (!params) {
		throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'VAT.EU.ESL.ReportAdapter.getViewData: Please provide the required params paramter.');
	}

	var viewData = {};
	var report = params.report;

	viewData.cs = params.script;
	viewData.data = this.convertToData(params);
	viewData.fields = this.convertToFields(params);
	viewData.buttons = this.convertToButtons(params);
	viewData.templates = report.templates;
	viewData.error = {
        code: params.error.code || '',
        message: params.error.message || ''
	};

	return viewData;
};

VAT.EU.ESL.ReportAdapter.prototype.convertToFields = function _convertToFields(params) {

	if (!params) {
		throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'VAT.EU.ESL.ReportAdapter.convertToFields: Please provide the required params paramter.');
	}

	if (!params.report) {
		throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'VAT.EU.ESL.ReportAdapter.convertToFields: Please provide the required params.report paramter.');
	}

	if (!params.report.fields) {
		throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'VAT.EU.ESL.ReportAdapter.convertToFields: Please provide the required params.report.fields paramter.');
	}

	var report = params.report;
	var fields = report.fields;
	var context = nlapiGetContext();
	var isOneWorld = context.getFeature('SUBSIDIARIES');
	var isMBA = context.getFeature('MULTIBOOK');
	var validFields = [];

	for (var i = 0; i < fields.length; i++) {
		var field = fields[i];

		if ((!isOneWorld && (field.id == 'subsidiary' || field.id == 'group' || field.id == 'bookid')) || !isMBA && field.id == 'bookid') {
			continue;
		}

		switch(field.id) {
			case 'subsidiary':
				field.value = params.subsidiary;
				field.data = [];

				for (var j = 0; j < params.subsidiarylist.length; j++) {
					field.data.push({
						id: params.subsidiarylist[j].id,
						text: params.subsidiarylist[j].name
					});
				}
				break;
			case 'group':
				field.data = params.group;
				field.value = params.group;
				break;
			case 'countryform':
				field.data = params.countryformslist;
				field.value = params.countryform;
				break;
			case 'periodfrom':
				field.data = params.taxperiodlist;
				field.value = params.periodfrom;
				break;
			case 'periodto':
				field.data = params.taxperiodlist;
				field.value = params.periodto;
				break;
			case 'constants':
				field.data = JSON.stringify(params.constants);
				break;
			case 'bookid':
				field.value = params.bookid;
				field.data = [];
				for (var book in params.books) {
					field.data.push({
						id: book,
						text: params.books[book].name
					});
				}
				break;
			case 'help':
				// do nothing
				break;
			case 'refreshflag':
			    // do nothing
			    break;
			default:
				nlapiLogExecution('AUDIT', 'VAT.EU.ESL.ReportAdapter.convertToFields: Unsupported field', field.id);
		}

		validFields.push(field);
	}

	return validFields;
};

VAT.EU.ESL.ReportAdapter.prototype.convertToData = function _convertToData(params) {

	if (!params) {
		throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'VAT.EU.ESL.ReportAdapter.convertToData: Please provide the required params paramter.');
	}

	var data = {};

	data.header = this.convertToHeader(params);

	data.body = {
		pageSize: Number(nlapiGetContext().getPreference('LISTSEGMENTSIZE')),
		cacheName: params.cacheName,
		url: nlapiResolveURL('SUITELET', 'customscript_new_ec_sales_listdisp', 'customdeploy_new_ec_sales_listdisp') + '&actiontype=esl_getdata',
		columns: this.convertToColumns(params.report.columns, data.header)
	};

	return data;
};

VAT.EU.ESL.ReportAdapter.prototype.convertToHeader = function _convertToHeader(params) {

	if (!params) {
		throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'VAT.EU.ESL.ReportAdapter.convertToHeader: Please provide the required params paramter.');
	}

	if (!params.report) {
		throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'VAT.EU.ESL.ReportAdapter.convertToHeader: Please provide the required params.report paramter.');
	}

	if (!params.report.data.header) {
		throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'VAT.EU.ESL.ReportAdapter.convertToHeader: Please provide the required params.report.data.header paramter.');
	}

	if (!params.headerdata) {
		throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'VAT.EU.ESL.ReportAdapter.convertToHeader: Please provide the required params.headerdata paramter.');
	}

	var header = {};
	var headerData = params.headerdata;
	var report = params.report;
	var reportHeader = report.data.header;

	header = report.data.header;
	header.vatNo = headerData.vatNo;
	header.company = headerData.company;
	header.startPeriod = headerData.startPeriod;
	header.endPeriod = headerData.endPeriod;
	header.logoWidth = reportHeader.logoWidth,
	header.logoHeight = reportHeader.logoHeight,
	header.imgURL = headerData.imgurl;
	header.legend = report.data.legend;

	var configOverrides = new VAT.Configuration().getHeaderConfigOverrides(params.subsidiary, params.report.nexus);

	for (var config in configOverrides) {
		if (config == 'vatno') {
			header.vatNo = configOverrides.vatno ? configOverrides.vatno : header.vatNo;
		} else {
			header[config] = configOverrides[config] ? configOverrides[config] : header[config];
		}
	}

	return header;
};

VAT.EU.ESL.ReportAdapter.prototype.convertToColumns = function _convertToColumns(columns) {

	if (!columns) {
		throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'VAT.EU.ESL.ReportAdapter.convertToButtons: Please provide the required columns paramter.');
	}

	return columns;
};


VAT.EU.ESL.ReportAdapter.prototype.convertToButtons = function _convertToButtons(params) {

	if (!params) {
		throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'VAT.EU.ESL.ReportAdapter.convertToButtons: Please provide the required params paramter.');
	}

	return params.report.buttons;
};