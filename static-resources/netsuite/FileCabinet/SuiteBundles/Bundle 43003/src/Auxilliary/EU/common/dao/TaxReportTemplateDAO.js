/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.EU = VAT.EU || {};
VAT.EU.DAO = VAT.EU.DAO || {};

VAT.EU.DAO.TaxReportTemplateDAO = function _TaxReportTemplateDAO() {
    VAT.EU.DAO.RecordSearchDAO.call(this);
    this.daoName = 'TaxReportTemplateDAO';
    this.recordType = 'customrecord_tax_template';
    this.fields = {
        name: 'name',
        taxTemplateNote: 'custrecord_tax_template_note',
        taxTemplateCountry: 'custrecord_tax_template_country',
        taxFormSchema: 'custrecord_tax_form_schema',
        templateFormat: 'custrecord_template_format',
        templateLanguage: 'custrecord_template_language',
        isHandleBars: 'custrecord_isHandleBars',
        taxTemplateShort: 'custrecord_tax_template_short',
        isInactive: 'isinactive'
    };
};

VAT.EU.DAO.TaxReportTemplateDAO.prototype = Object.create(VAT.EU.DAO.RecordSearchDAO.prototype);

VAT.EU.DAO.TaxReportTemplateDAO.prototype.prepareSearch = function prepareSearch(params) {
    this.columns = [
        new nlobjSearchColumn(this.fields.name),
        new nlobjSearchColumn(this.fields.taxTemplateNote),
        new nlobjSearchColumn(this.fields.taxTemplateCountry),
        new nlobjSearchColumn(this.fields.taxFormSchema),
        new nlobjSearchColumn(this.fields.templateFormat),
        new nlobjSearchColumn(this.fields.templateLanguage),
        new nlobjSearchColumn(this.fields.isHandleBars),
        new nlobjSearchColumn(this.fields.taxTemplateShort),
        new nlobjSearchColumn(this.fields.isInactive)
    ];

    if (params.name) {
        this.filters.push(new nlobjSearchFilter(this.fields.name, null, 'is', params.name));
    }

    if (params.isInactive) {
        this.filters.push(new nlobjSearchFilter(this.fields.isInactive, null, 'is', params.isInactive));
    }

};

VAT.EU.DAO.TaxReportTemplateDAO.prototype.ListObject = function _listObject(id) {
    return {
        id: id,
        name: '',
        note: '',
        country: '',
        taxFormSchema: '',
        format: '',
        language: '',
        isHandleBars: '',
        short: '',
        isInactive: ''
    };
};

VAT.EU.DAO.TaxReportTemplateDAO.prototype.rowToObject = function _rowToObject(row) {
    var template = new this.ListObject(row.getId());
    template.name = row.getValue(this.fields.name);
    template.note = row.getValue(this.fields.taxTemplateNote);
    template.country = row.getValue(this.fields.taxTemplateCountry);
    template.taxFormSchema = row.getValue(this.fields.taxFormSchema);
    template.format = row.getValue(this.fields.templateFormat);
    template.language = row.getValue(this.fields.templateLanguage);
    template.isHandleBars = row.getValue(this.fields.isHandleBars);
    template.short = row.getValue(this.fields.taxTemplateShort);
    template.isInactive = row.getValue(this.fields.isInactive);

    return template;
};
