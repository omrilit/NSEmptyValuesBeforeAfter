/**
 * Copyright © 2016, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax.EU = Tax.EU || {};
Tax.EU.Intrastat = Tax.EU.Intrastat || {};

Tax.EU.Intrastat.ReportManager = function ReportManager() {
};

Tax.EU.Intrastat.ReportManager.prototype.getSetupWindowReport = function getSetupWindowReport(formName) {
    try {
        var report = this.getReportFromName(formName);
        return this.transformForSetupWindow(report);
    } catch(ex) {
        logException(ex, 'Tax.EU.Intrastat.ReportManager.getSetupWindowReport');
        throw ex;
    }
};

Tax.EU.Intrastat.ReportManager.prototype.getReportFromName = function getReportFromName(formName) {
    if (!formName) {
        throw nlapiCreateError('INVALID_PARAMETER', 'A result object is required.');
    }
    
    try {
        var countryFormList = formName.split('-');
        var daoParams = {
            type : 'intrastat',
            name : countryFormList[0]
        };
        
        var dao = new Tax.DAO.TaxReportMapperDetailsDAO();
        var reportList = dao.getList(daoParams);
        return reportList[0];  
    } catch(ex) {
        logException(ex, 'Tax.EU.Intrastat.ReportManager.getReportFromName');
        throw nlapiCreateError('INCOMPLETE_BUNDLE', 'Please verify the contents of Tax Report Mapper Details.');
    }
};

Tax.EU.Intrastat.ReportManager.prototype.transformForSetupWindow = function transformForSetupWindow(rawReport) {
    try {
        var report = rawReport;
        report.meta = JSON.parse(report.meta);
        
        var template = report.meta.templates.online;
        report.GetOnlineFilingTemplate = function() {
            return getTaxTemplate(template).short;
        };
        
        report.isHandleBars = true;
        report.metadata = report.meta;
        report.metadata.template = {online: template};
        report.CountryCode = report.name ? report.name.split('.')[3] : '';
        
        return report;
    } catch(ex) {
        logException(ex, 'Tax.EU.Intrastat.ReportManager.transformForSetupWindow');
        throw nlapiCreateError('INCOMPLETE_BUNDLE', 'Please verify the contents of Tax Report Mapper Details.');
    }
};

var _App = new SFC.System.Application("e5775970-8e28-40ff-ad4a-956e88304834");
