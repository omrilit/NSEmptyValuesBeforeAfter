/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 */

VAT.ReportWrapper = function(reportClass) {
    this.report = new reportClass();
    
    this.metadata = this.report.metadata;
    this.CountryCode = this.report.CountryCode;
    this.LanguageCode = this.report.LanguageCode;
    this.Name = this.report.Name;
    this.isHandleBars = this.report.isHandleBars;
    this.Actions = this.report.Actions;
    this.IsSubmittable = this.report.IsSubmittable;
    this.IsExportable = this.report.IsExportable;
    this.isAdjustable = this.report.isAdjustable;
    this.SchemaId = this.report.SchemaId;
    this.ReportName = this.report.ReportName;
    this.ClassName = this.report.ClassName;
    this.HelpURL = this.report.HelpURL;
    this.HelpLabel = this.report.HelpLabel;
    this.Type = this.report.Type;
    this.ReportType = this.report.ReportType;
    this.EffectiveFrom = this.report.EffectiveFrom;
    this.ValidUntil = this.report.ValidUntil;
    this.IsMultibookReport = this.report.isMultibookReport;
    this.ReportingPeriod = this.report.ReportingPeriod;
};

// Template related methods
VAT.ReportWrapper.prototype.GetPrintTemplate = function(params) {
    if (this.IsMultibookReport) {
        return this.report.GetPrintTemplate(params); // do not remove the params, it's needed for PH
    } else {
        return this.report.GetPrintTemplate(params.periodFrom, params.periodTo);
    }
};

VAT.ReportWrapper.prototype.GetReportTemplate = function(params) {
    if (this.IsMultibookReport) {
        return this.report.GetReportTemplate(params); // do not remove the params, it's needed for PH
    } else {
        return this.report.GetReportTemplate(params.periodFrom, params.periodTo);
    }
};

VAT.ReportWrapper.prototype.GetOnlineFilingTemplate = function() {
    return this.report.GetOnlineFilingTemplate();
};

VAT.ReportWrapper.prototype.GetExportContext = function(params) {
    if (this.IsMultibookReport) {
        return this.report.GetExportContext();
    } else {
        return this.report.GetExportContext(params.periodFrom, params.periodTo, params.subId, params.isConsolidated);
    }
};

// Data related methods 
VAT.ReportWrapper.prototype.GetAdjustmentMetaData = function(params) {
    if (this.IsMultibookReport) {
        var reportData = this.CreateReportData(params);
        return reportData.GetAdjustmentMetaData();
    } else {
        return this.report.GetAdjustmentMetaData(params.periodFrom, params.periodTo, params.subId, params.isConsolidated);
    }
};

VAT.ReportWrapper.prototype.GetData = function(params) {
    if (this.IsMultibookReport) {
        var reportData = this.CreateReportData(params);
        return reportData.GetReportData();
    } else {
        return this.report.GetData(params.periodFrom, params.periodTo, params.subId, params.isConsolidated);
    }
};

VAT.ReportWrapper.prototype.GetRGLData = function(params) {
    var reportData = this.CreateReportData(params);
    return reportData.GetRGLData();
};

VAT.ReportWrapper.prototype.GetDrilldownData = function(params) {
    if (this.IsMultibookReport) {
        var reportData = this.CreateReportData(params);
        return reportData.GetDrilldownData(params.boxNum, params.isSysNotes);
    } else {
        return this.report.GetDrilldownData(params.boxNum, params.periodFrom, params.periodTo, params.subId, params.isConsolidated, params.saleCacheId, params.purchaseCacheId);
    }
};

VAT.ReportWrapper.prototype.GetPrintData = function(params) {
    if (this.IsMultibookReport) {
        var reportData = this.CreateReportData(params);
        return reportData.GetPrintData();
    } else {
        return this.report.GetPrintData(params.periodFrom, params.periodTo, params.subId, params.isConsolidated, params.userInfo, params.otherParams);  
    }
};

VAT.ReportWrapper.prototype.GetExportData = function(params) {
    if (this.IsMultibookReport) {
        var reportData = this.CreateReportData(params);
        return reportData.GetExportData(params);
    } else {
        return this.report.GetExportData(params.periodFrom, params.periodTo, params.subId, params.isConsolidated, params.userInfo, params.otherParams);
    }
};

VAT.ReportWrapper.prototype.GetSupplementaryData = function(params) {
    var reportData = this.CreateReportData(params);
    return reportData.GetSupplementaryData(params.isSales);
};

VAT.ReportWrapper.prototype.GetHeaderData = function(params) {
    var reportData = this.CreateReportData(params);
    return reportData.GetHeaderData();
};

VAT.ReportWrapper.prototype.CreateReportData = function(params) {
    try {
        params.languageCode = this.LanguageCode;
        params.className = this.ClassName;
        var dataClass = VAT[this.CountryCode][this.ReportType].Data;
        return new dataClass(params);
    } catch (ex) {
        logException(ex, 'VAT.ReportWrapper.CreateReportData');
    }
}

