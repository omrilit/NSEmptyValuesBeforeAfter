/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */

VAT.Report = function() {
    this.isMultibookReport = true;

    if (this.isNewFramework) {
        this.SetFieldsFromConfig();
    } else {
        this.SetDefaultFields();
    }
};

VAT.Report.prototype.SetFieldsFromConfig = function() {
    try {
        var form = new VAT.Configuration().getReportForms(this.CountryCode, this.LanguageCode, this.Type, this.Subtype);
        var details = form[this.CountryCode][this.Type][this.Subtype] || form[this.CountryCode][this.Type];
        this.Name = details.label;
        this.ClassName = details.internalId;
        this.HelpURL = details.property.HelpURL;
        this.EffectiveFrom = details.effectiveFrom;
        this.SchemaId = details.schemaId;
        this.ValidUntil = details.validUntil;
        this.HelpLabel = details.property.HelpLabel;
        this.isAdjustable = details.property.isAdjustable;
        this.isHandleBars = details.property.isHandlebars;
        this.IsExportable = details.property.isExportable;
    } catch (ex) {
        logException(ex, 'VAT.Report.SetFieldsFromConfig');
    }
};

VAT.Report.prototype.SetDefaultFields = function() {
    this.Name = '';
    this.ClassName = '';
    this.HelpURL = '';
    this.EffectiveFrom = '';
    this.SchemaId = '';
    this.ValidUntil = '';
    this.HelpLabel = '';
    this.isAdjustable = '';
    this.isHandleBars = '';
    this.IsExportable = '';   
};

VAT.Report.prototype.GetPrintTemplate = function() {
    var template = getTaxTemplate(this.metadata.template.pdf);
    return _App.RenderTemplate(template.short, {
        imgurl : nlapiEscapeXML(template.imgurl),
        koodak : nlapiEscapeXML(template.koodak)});    
};

VAT.Report.prototype.GetReportTemplate = function() {
    var template = getTaxTemplate(this.metadata.template.html);
     
    return _App.RenderTemplate(template.short, {imgurl:template.imgurl, hover:template.hover});
};

VAT.Report.prototype.GetExportContext = function() {
    return this.contextList;
};

VAT.Report.prototype.GetOnlineFilingTemplate = function() {
    var template = getTaxTemplate(this.metadata.template.online);
    return _App.RenderTemplate(template.short, {imgurl : template.imgurl});    
};
