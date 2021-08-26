/**
 * Copyright 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.DAO = TAF.DAO || {};

TAF.DAO.ParentDao = function _ParentDao() {
    this.context = nlapiGetContext();
	
    this.isOneWorld = this.context.getFeature('SUBSIDIARIES');
	this.multicurrency = this.context.getFeature('MULTICURRENCY');
	this.glAuditNumbering = this.context.getFeature('GLAUDITNUMBERING');
	this.classes = this.context.getFeature('CLASSES');
	this.department = this.context.getFeature('DEPARTMENTS');
	this.locations = this.context.getFeature('LOCATIONS');
	
    // Backwards compatibility
    this.IS_ONEWORLD = this.isOneWorld;
    this.IS_ADVANCEDTAXES = this.context.getFeature('ADVTAXENGINE');

    this.id = '';
	this.recordType = '';
	this.report = null;
	this.searchResult = null;
};

TAF.DAO.ParentDao.prototype.findReportId = function _findReportId(reportName) {
	if (!reportName) {
		throw nlapiCreateError('INVALID_REPORT', 'Invalid Report Name: ' + reportName);
	}

	var sr = nlapiSearchGlobal(reportName);
	for (var isr = 0; sr && isr < sr.length; ++isr) {
		if (String(sr[isr].getValue('name').toLowerCase()).trim() == String(reportName.toLowerCase()).trim()) {
			var reportId = sr[isr].getId().replace(/REPO_/, '');
			return parseInt(reportId);
		}
	}
	throw nlapiCreateError('REPORT_NOT_FOUND', 'Report Name: ' + reportName);
};

TAF.DAO.ParentDao.prototype.runReport = function _runReport(reportSettings) {
	if (!reportSettings) {
		throw nlapiCreateError('MISSING_PARAMETER', 'reportSettings argument is required');
	}

	try {
		this.report = nlapiRunReport(this.id, reportSettings);
	} catch (ex) {
		var exception = this.logException(ex, 'runReport');
		throw nlapiCreateError(exception.code, exception.details);
	}
};

TAF.DAO.ParentDao.prototype.getReportData = function _getReportData() {
	if (!this.report) {
		throw nlapiCreateError('INVALID_REPORT', 'Unable to extract report data');
	}

	try {
		var reportData = [];
		var columns = this.report.getColumnHierarchy().getVisibleChildren();
		if (!columns || columns.length == 0) {
			throw nlapiCreateError('INVALID_REPORT', 'Invalid report columns');
		}

		var rows = this.report.getRowHierarchy().getChildren();
		if (rows) {
			reportData = this.getSubData(0, rows, columns);
		}
		return reportData;
	} catch (ex) {
		var exception = this.logException(ex, 'getReportData');
		throw nlapiCreateError(exception.code, exception.details);
	}
};

TAF.DAO.ParentDao.prototype.getSubData = function _getSubData(startIndex, rows, columns) {
	if (startIndex === null || startIndex === undefined) {
		throw nlapiCreateError('MISSING_PARAMETER', 'startIndex is required');
	}
	if (!rows) {
		throw nlapiCreateError('MISSING_PARAMETER', 'rows is required');
	}
	if (!columns) {
		throw nlapiCreateError('MISSING_PARAMETER', 'columns is required');
	}
	
	var subData = [];
	try {
		for (var i = startIndex; i < rows.length; i++) {
			var row = this.convertRowToObject(rows[i], columns);
			subData.push(row);

			if (row.children.length > 1) {
				var subList = this.getSubData(1, row.children, columns);
				subData = subData.concat(subList);
			}
		}
	} catch (ex) {
		this.logException(ex, 'getSubData');
	}
	return subData;
};

TAF.DAO.ParentDao.prototype.getSummaryLine = function _getSummaryLine() {
	if (!this.report) {
		throw nlapiCreateError('INVALID_REPORT', 'Unable to extract report data');
	}

	var summaryLine = {};
	try {
		var row = this.report.getRowHierarchy().getSummaryLine();
		var columns = this.report.getColumnHierarchy().getVisibleChildren();
		summaryLine = this.convertSummaryLineToObject(row, columns);
	} catch (ex) {
		var exception = this.logException(ex, 'getSummaryLine');
		throw nlapiCreateError(exception.code, exception.details);
	}
	return summaryLine;
};

TAF.DAO.ParentDao.prototype.getOpeningLine = function _getOpeningLine() {
	if (!this.report) {
		throw nlapiCreateError('INVALID_REPORT', 'Unable to extract report data');
	}
	
	var openingLine = {};
	try {
		var line = this.report.getRowHierarchy().getOpeningLine();
		openingLine = this.convertOpeningLineToObject(line);
	} catch (ex) {
		var exception = this.logException(ex, 'getOpeningLine');
		throw nlapiCreateError(exception.code, exception.details);
	}
	return openingLine;
};

TAF.DAO.ParentDao.prototype.search = function _search(filters, columns) {
	try {
		var search = nlapiLoadSearch(this.recordType, this.id);
		if (filters) {
			search.addFilters(filters);
		}
		if (columns) {
			search.addColumns(columns);
		}
		this.searchResult = search.runSearch();
	} catch (ex) {
	    var exception = this.logException(ex, 'search');
		throw nlapiCreateError(exception.code, exception.details);
	}
};

TAF.DAO.ParentDao.prototype.getList = function _getList(startIndex, endIndex) {
	if (!this.searchResult) {
		throw nlapiCreateError('INVALID_SEARCH', 'Unable to extract report data');
	}

	try {
		var list = [];
		var sr = this.searchResult.getResults(startIndex, endIndex);
		for (var isr = 0; sr && isr < sr.length; isr++) {
			list.push(this.convertRowToObject(sr[isr]));
		}
	} catch (ex) {
		var exception = this.logException(ex, 'getList');
		throw nlapiCreateError(exception.code, exception.details);
	}
	return list;
};

TAF.DAO.ParentDao.prototype.forEachResult = function _forEachResult() {
	if (!this.searchResult) {
		throw nlapiCreateError('INVALID_SEARCH', 'Unable to extract report data');
	}

	try {
		var resultList = [];
		this.searchResult.forEachResult(function(sr) {
			resultList.push(this.convertRowToObject(sr[i]));
		});
	} catch (ex) {
		var exception = this.logException(ex, 'forEachResult');
		throw nlapiCreateError(exception.code, exception.details);
	}
	return resultList;
};

TAF.DAO.ParentDao.prototype.find = function _find(filters, columns) {
	try {
		var resultList = [];
		this.searchResult = nlapiSearchRecord(this.recordType, this.id, filters, columns);
		for (var i = 0; this.searchResult && i < this.searchResult.length; i++) {
			resultList.push(this.convertRowToObject(this.searchResult[i]));
		}
	} catch (ex) {
		var exception = this.logException(ex, 'find');
		throw nlapiCreateError(exception.code, exception.details);
	}
	return resultList;
};

TAF.DAO.ParentDao.prototype.map = function _map(filters, columns) {
	try {
		var resultMap = {};
		this.searchResult = nlapiSearchRecord(this.recordType, this.id, filters, columns);
		for (var i = 0; this.searchResult && i < this.searchResult.length; i++) {
			resultMap[this.searchResult[i].getId()] = this.convertRowToObject(this.searchResult[i]);
		}
	} catch (ex) {
		var exception = this.logException(ex, 'map');
		throw nlapiCreateError(exception.code, exception.details);
	}
	return resultMap;
};

TAF.DAO.ParentDao.prototype.logException = function _logException(ex, name) {
	var code = ex.getCode ? ex.getCode() : 'ERROR';
	var details = ex.getDetails ? ex.getDetails() : 'Error: ' + (ex.message ? ex.message : ex.toString());
	var message = code + ' :: ' +  details;

	nlapiLogExecution('ERROR', 'TAF.DAO.ParentDao.' + name, message);
	return {
		code: code,
		details: details,
		message: message
	};
};