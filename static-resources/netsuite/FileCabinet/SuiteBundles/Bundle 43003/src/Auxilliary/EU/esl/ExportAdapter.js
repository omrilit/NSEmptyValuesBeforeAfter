/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.EU = VAT.EU || {};
VAT.EU.ESL = VAT.EU.ESL || {};

VAT.EU.ESL.ExportAdapter = function ExportAdapter() {
};

VAT.EU.ESL.ExportAdapter.prototype.getFileData = function getFileData(report, header, params) {
	if (!report) {
		throw nlapiCreateError('MISSING_REQ_PARAMETER', 'A report object is requried.');
	}
	
	if (!report.data) {
		throw nlapiCreateError('MISSING_REQ_PARAMETER', 'A report.data object is requried.');
	}
	
	if (!header) {
		throw nlapiCreateError('MISSING_REQ_PARAMETER', 'A header object is requried.');
	}
	
	if (!params) {
		throw nlapiCreateError('MISSING_REQ_PARAMETER', 'A params object is requried.');
	}
	
	var data = report.data.body;
	var exportData = this.prepareExportData(data, report, params);
	
	return {
		fileFormat: params.fileFormat,
		fileType: this.getFileType(params.fileFormat),
		fileName: this.getFileName(report, params),
		folderId: params.folderId,
		header: this.prepareHeaderData(header, params.subsidiary, report.nexus),
		data: exportData.data,
		totalAmount: exportData.totalAmount,
		totalTransactions: exportData.totalTransactions,
		hasMissingVatNo: exportData.hasMissingVatNo
	};
};

VAT.EU.ESL.ExportAdapter.prototype.prepareHeaderData = function prepareHeaderData(header, subsidiary, nexus) {
	if (!header) {
		throw nlapiCreateError('MISSING_REQ_PARAMETER', 'A header object is requried.');
	}
	
	var configOverrides = new VAT.Configuration().getHeaderConfigOverrides(subsidiary, nexus);
	for (var config in configOverrides) {
		if (config == 'vatno') {
			header.vatNo = configOverrides.vatno ? configOverrides.vatno : header.vatNo;
		} else {
			header[config] = configOverrides[config] ? configOverrides[config] : header[config];
		}
	}
	
	header.name = header.name ? header.name.replace(/&/g, 'and').substr(0, 35) : '';
	header.branchNo = header.branchNo || '000';
	header.currency = header.currency || 'GBP';
	return header;
};

VAT.EU.ESL.ExportAdapter.prototype.prepareExportData = function prepareExportData(data, report, params) {
	if (!data) {
		throw nlapiCreateError('MISSING_REQ_PARAMETER', 'A data object is requried.');
	}
	
	if (!report) {
		throw nlapiCreateError('MISSING_REQ_PARAMETER', 'A report object is requried.');
	}
	
	if (!params) {
		throw nlapiCreateError('MISSING_REQ_PARAMETER', 'A params object is requried.');
	}
	
	var totalAmount = 0;
	var totalTransactions = 0;
	var excludeCache = JSON.parse(params.excludeCache || '{}');
	var indicatorCache = JSON.parse(params.indicatorCache || '{}');
	var cancelCache = JSON.parse(params.cancelCache || '{}');
	var indicatorMap = this.getIndicatorMap(report);
	var lineNumber = '';
	var exportData = [];
	var hasMissingVatNo = false;
	
	for (var i = 0; i < data.length; i++) {
		lineNumber = data[i].lineNumber.value;
		
		if ((excludeCache[lineNumber] == undefined && !data[i].exclude.value) || (excludeCache[lineNumber] != undefined && !excludeCache[lineNumber])) {
			if (!data[i].vatNumber.value) {
				hasMissingVatNo = true;
			}
			
			data[i].indicator.value = indicatorCache[lineNumber] != undefined ? indicatorCache[lineNumber] : data[i].indicator.value;
			data[i].indicator.text = indicatorMap[data[i].indicator.value];
			data[i].cancel.value = cancelCache[lineNumber] != undefined ? cancelCache[lineNumber] : data[i].cancel.value;
			data[i].pageNumber.value = Math.ceil(lineNumber / 20);
			totalAmount += parseFloat(data[i].amount.value);
			totalTransactions += (data[i].transactionCount.value || 0);
			exportData.push(data[i]);
		}
	}
	
	return {
		data: exportData,
		totalAmount: totalAmount,
		hasMissingVatNo: hasMissingVatNo,
		totalTransactions: totalTransactions
	};
};

VAT.EU.ESL.ExportAdapter.prototype.getEmailData = function getEmailData(params) {
	if (!params) {
		throw nlapiCreateError('MISSING_REQ_PARAMETER', 'A params object is requried.');
	}
	
	var subject = params.subject ? this.replaceTags(params.subject, params) : '';
	var body = params.body ? this.replaceTags(params.body, params) : '';
	
	return {
		sender: params.userId,
		recipient: params.userId,
		subject: subject,
		body: body
	};
};

VAT.EU.ESL.ExportAdapter.prototype.getFileType = function getFileType(format) {
	var fileType = '';
	format = format || '';
	
	switch (format.toLowerCase()) {
		case 'csv':
			fileType = 'CSV';
			break;
		case 'pdf':
			fileType = 'PDF';
			break;
		case 'xml':
			fileType = 'XMLDOC';
			break;
		default:
			fileType = 'PLAINTEXT';
			break;
	}
	
	return fileType;
};

VAT.EU.ESL.ExportAdapter.prototype.getFileName = function getFileName(report, params) {
	if (!report) {
		throw nlapiCreateError('MISSING_REQ_PARAMETER', 'A report object is requried.');
	}
	
	if (!params) {
		throw nlapiCreateError('MISSING_REQ_PARAMETER', 'A params object is requried.');
	}
	
	Date.CultureInfo = Date.CultureInfo_en;
	var fileName = [report.nexus, 'EUSales'];
	
	if (params.group == 'T') {
		fileName.push('(Group)');
	}
	
	var from = report.period.from.GetStartDate().toString("MMMyy");
	var to = report.period.to.GetEndDate().toString("MMMyy");
	
	if (from == to) {
		fileName.push(from);
	} else {
		fileName.push(from);
		fileName.push(to);
	}
	
	fileName.push(new Date().toString("MMddyyHHmmss"));
	
	return fileName.join('_') + '.' + params.fileFormat.toLowerCase();
};

VAT.EU.ESL.ExportAdapter.prototype.getIndicatorMap = function getIndicatorMap(report) {
	if (!report) {
		throw nlapiCreateError('MISSING_REQ_PARAMETER', 'A report object is requried.');
	}
	
	var map = {};
	
	for (var i = 0; i < report.columns.length; i++) {
		if (report.columns[i].id == 'indicator') {
			var indicatorColumn = report.columns[i];
			
			for (var j = 0; j < indicatorColumn.data.length; j++) {
				map[indicatorColumn.data[j].id] = indicatorColumn.data[j].text;
			}
			
			break;
		}
	}
	
	return map;
};

VAT.EU.ESL.ExportAdapter.prototype.replaceTags = function replaceTags(template, tags) {
	var template = template || '';
	var pattern = '';
	
	for (tag in tags) {
		pattern = new RegExp('{' + tag + '}', 'g');
		template = template.replace(pattern, tags[tag]);
	}
	
	return template;
};

