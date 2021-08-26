/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.EU = VAT.EU || {};
VAT.EU.DAO = VAT.EU.DAO || {};

VAT.EU.DAO.SavedReportDAO = function SavedReportDAO() {
    VAT.EU.DAO.BaseDAO.call(this);
    this.daoName = 'SavedReportDAO';
    this.reportName = '';
    this.reportId = '';
    this.reportSettings = null;
};

VAT.EU.DAO.SavedReportDAO.prototype = Object.create(VAT.EU.DAO.BaseDAO.prototype);

VAT.EU.DAO.SavedReportDAO.prototype.prepareSearch = function prepareSearch(params) {
    if (!this.reportName) {
        throw nlapiCreateError('MISSING_REPORT_NAME', 'Please provide the name of the Saved Report.');
    }
    
    if (!params.periodfrom || !params.periodto) {
        throw nlapiCreateError('MISSING_REQ_PARAM', 'Please provide the reporting period range.');
    }
    
    this.reportSettings = new nlobjReportSettings(params.periodfrom.toString(), params.periodto.toString());
    this.reportId = this.getReportId();
    
    if (!this.reportId) {
        throw nlapiCreateError('INVALID_SAVED_REPORT', 'The provided Saved Report does not exist.');
    }
    
    if (params.subsidiary) {
        this.reportSettings.setSubsidiary(params.group == 'T' ? (-params.subsidiary).toString() : params.subsidiary.toString());
    }
    
    if (params.bookid) {
        this.reportSettings.setAccountingBookId(params.bookid.toString());
    }
};

VAT.EU.DAO.SavedReportDAO.prototype.search = function search() {
    try {
        return nlapiRunReport(this.reportId, this.reportSettings);
    } catch(e) {
        throw e;
    }
};

VAT.EU.DAO.SavedReportDAO.prototype.processList = function processList(pivotReport) {
    return this.rowToObject(pivotReport);
};

VAT.EU.DAO.SavedReportDAO.prototype.getReportId = function getReportId() {
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

VAT.EU.DAO.SavedReportDAO.prototype.getPivotRows = function getPivotRows(pivotReport) {
    return pivotReport.getRowHierarchy();
};

VAT.EU.DAO.SavedReportDAO.prototype.getColumns = function getColumns(pivotReport) {
    return pivotReport.getColumnHierarchy().getVisibleChildren();
};
