/**
 * Copyright 2016 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

if (!TAF) { var TAF = {}; }
TAF.DAO = TAF.DAO || {};

TAF.DAO.SavedReportDAO = function SavedReportDAO() {
    TAF.DAO.BaseDAO.call(this);
    this.name = 'SavedReportDAO';
    this.reportName = '';
    this.reportId = '';
    this.reportSettings = null;
};

TAF.DAO.SavedReportDAO.prototype = Object.create(TAF.DAO.BaseDAO.prototype);

TAF.DAO.SavedReportDAO.prototype.initialize = function initialize(params) {
    if (!this.reportName) {
        throw nlapiCreateError('MISSING_REPORT_NAME', 'Please provide the name of the Saved Report.');
    }
    
    if (!params.periodFrom || !params.periodTo) {
        throw nlapiCreateError('MISSING_REQ_PARAM', 'Please provide the reporting period range.');
    }
    
    this.reportSettings = new nlobjReportSettings(params.periodFrom.toString(), params.periodTo.toString());
    this.reportId = this.getReportId();
    
    if (!this.reportId) {
        throw nlapiCreateError('INVALID_SAVED_REPORT', 'The Saved Report does not exist.');
    }
    
    if (params.subsidiary) {
        this.reportSettings.setSubsidiary(params.group == 'T' ? (-params.subsidiary).toString() : params.subsidiary.toString());
    }
    
    if (params.bookId) {
        this.reportSettings.setAccountingBookId(params.bookId.toString());
    }
};

TAF.DAO.SavedReportDAO.prototype.search = function search() {
    try {
        return nlapiRunReport(this.reportId, this.reportSettings);
    } catch (ex) {
        nlapiLogExecution('ERROR', 'SavedReportDAO.search', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'Error in running saved report');
    }
};

TAF.DAO.SavedReportDAO.prototype.processList = function processList(pivotReport) {
    return this.rowToObject(pivotReport);
};

TAF.DAO.SavedReportDAO.prototype.rowToObject = function rowToObject(pivotReport) {
    try {
    	var rows = this.getRows(pivotReport);
    	var columns = this.getColumnMetadata(pivotReport);
    	
    	for (var i = 0; rows && i < rows.length; i++) {
    	    this.extractValues(rows[i], columns);
    	}
    } catch(ex) {
        nlapiLogExecution('ERROR', 'SavedReportDAO.search', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'Error in parsing saved report data');
    }
    
    return this.list;
};

TAF.DAO.SavedReportDAO.prototype.extractValues = function extractValues(row, columns) {
    var object = {};
    
    for (var col in columns) {
        object[col] = this.getValue(row.getValue(columns[col])).toString();
    }
    
    this.list.push(object);
};

TAF.DAO.SavedReportDAO.prototype.getReportId = function getReportId() {
    var reportId = '';
    var sr = nlapiSearchGlobal(this.reportName);
    
    for (var i = 0; sr && i < sr.length; i++) {
        if (sr[i].getValue('name').toLowerCase().trim() == this.reportName.toLowerCase().trim()) {
            reportId = sr[i].getId().replace(/REPO_/, '');
            break;
        }
    }
    
    return reportId;
};

TAF.DAO.SavedReportDAO.prototype.getRows = function getRows(pivotReport) {
    return pivotReport.getRowHierarchy().getChildren();
};

TAF.DAO.SavedReportDAO.prototype.getColumns = function getColumns(pivotReport) {
    return pivotReport.getColumnHierarchy().getVisibleChildren();
};

TAF.DAO.SavedReportDAO.prototype.getColumnMetadata = function getColumnMetadata(pivotReport) {
    return this.getColumns(pivotReport);
};

TAF.DAO.SavedReportDAO.prototype.getValue = function getValue(value) {
    if (value === null || value === undefined) {
        return '';
    }
    
    return value;
};
