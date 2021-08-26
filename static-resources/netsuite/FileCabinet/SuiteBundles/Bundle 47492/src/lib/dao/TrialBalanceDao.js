/**
 * Copyright 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

if (!TAF) { var TAF = {}; }
TAF.DAO = TAF.DAO || {};

TAF.DAO.TrialBalance = function _TrialBalance(id) {
    return {
        id             : id,
        account        : '',
        openingBalance : 0,
        credit         : 0,
        debit          : 0,
        closingBalance : 0
    };
};

TAF.DAO.TrialBalanceDao = function _TrialBalanceDao() {
    this.REPORT_COLUMNS = 4;
};

TAF.DAO.TrialBalanceDao.prototype.findReportId = function _findReportId(reportName) {
    if (!reportName) {
        throw nlapiCreateError('INVALID_REPORT', 'Invalid Report Name: ' + reportName);
    }
    
    var searchResult = nlapiSearchGlobal(reportName);
    if (!searchResult) {
        return null;
    }

    for (var i = 0; i < searchResult.length; ++i) {
        if (String(searchResult[i].getValue('name').toLowerCase()).trim() == String(reportName.toLowerCase()).trim()) {
            var reportId = searchResult[i].getId().replace(/REPO_/, '');
            return parseInt(reportId);
        }
    }

    throw nlapiCreateError('REPORT_NOT_FOUND', 'Report Name: ' + reportName);
};

TAF.DAO.TrialBalanceDao.prototype.getTrialBalance = function _getTrialBalance(params) {
    nlapiLogExecution('DEBUG', 'TAF.DAO.TrialBalanceDao.getTrialBalance params', JSON.stringify(params));
    
    var reportData = {};

    try {
        var reportId = this.findReportId(params.reportName);
        var reportSettings = new nlobjReportSettings(params.periodFrom.toString(), params.periodTo.toString());
        if (params.subsidiary) {
            reportSettings.setSubsidiary(params.subsidiary);
        }
        if (params.bookId) {
            reportSettings.setAccountingBookId(params.bookId.toString());
        }
        var report = nlapiRunReport(reportId, reportSettings);
        reportData = this.getReportData(report);
    } catch (ex)  {
        nlapiLogExecution('ERROR', 'TAF.DAO.TrialBalanceDao.getTrialBalance', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'Error in TAF.DAO.TrialBalanceDao.getTrialBalance');
    }
    
    return reportData;
};

TAF.DAO.TrialBalanceDao.prototype.getReportData = function _getReportData(report) {
    if (!report) {
        throw nlapiCreateError('INVALID_REPORT', 'Unable to extract report data');
    }
    
    var columns = report.getColumnHierarchy().getVisibleChildren();
    if (!columns || columns.length != this.REPORT_COLUMNS) {
        throw nlapiCreateError('INVALID_REPORT', 'Invalid report columns');
    }
    
    var rows = report.getRowHierarchy().getChildren();
    if (!rows) {
        return [];
    }
    
    var reportData = this.getSubData(0, rows, columns);
    return reportData;
};

TAF.DAO.TrialBalanceDao.prototype.getSubData = function _getSubData(startIndex, rows, columns) {
    var subData = [];
    for (var i = startIndex; i < rows.length; i++) {
        var lineData = this.getLineData(rows[i], columns);
        subData.push(lineData.trialBalance);
        if (lineData.children && lineData.children.length > 1) {
            var subList = this.getSubData(1, lineData.children, columns);
            subData = subData.concat(subList);
        }
    }
    return subData;
};

TAF.DAO.TrialBalanceDao.prototype.getLineData = function _getLineData(line, columns) {
    var lineData = {
        children : line.getChildren()
    };
    lineData.trialBalance = new TAF.DAO.TrialBalance();
    lineData.trialBalance.account = line.getValue() || '';
    if (lineData.children && lineData.children.length > 0) {
        lineData.trialBalance.id      = lineData.children[0].getValue(columns[0]) || 0;
        lineData.trialBalance.credit  = lineData.children[0].getValue(columns[1]) || 0;
        lineData.trialBalance.debit   = lineData.children[0].getValue(columns[2]) || 0;
        lineData.trialBalance.amount  = lineData.children[0].getValue(columns[3]) || 0;
    }
    return lineData;
};

