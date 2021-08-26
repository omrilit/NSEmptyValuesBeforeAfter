/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.EU = VAT.EU || {};
VAT.EU.DAO = VAT.EU.DAO || {};

VAT.EU.DAO.TaxReportMapperDetailsDAO = function _TaxReportMapperDetailsDAO() {
    VAT.EU.DAO.RecordSearchDAO.call(this);
    this.daoName = 'TaxReportMapperDetailsDAO';
    this.recordType = 'customrecord_tax_report_map_details';
    this.fields = {
        name: 'name',
        type: 'custrecord_type',
        format: 'custrecord_format',
        language: 'custrecord_language',
        taxReportTemplate: 'custrecord_tax_report_template',
        taxReportMap: 'custrecord_tax_report_map',
        plugin: 'custrecord_plugin',
        detailInternalId: 'custrecord_detail_internalid',
        detailLabel: 'custrecord_detail_label',
        subType: 'custrecord_subType',
        validUntil: 'custrecord_valid_until',
        effectiveFrom: 'custrecord_effective_from',
        meta: 'custrecord_meta',
        schema: 'custrecord_schema'
    };
};

VAT.EU.DAO.TaxReportMapperDetailsDAO.prototype = Object.create(VAT.EU.DAO.RecordSearchDAO.prototype);

VAT.EU.DAO.TaxReportMapperDetailsDAO.prototype.prepareSearch = function prepareSearch(params) {
    this.columns = [
        new nlobjSearchColumn(this.fields.name).setSort(),
        new nlobjSearchColumn(this.fields.type).setSort(),
        new nlobjSearchColumn(this.fields.format),
        new nlobjSearchColumn(this.fields.language),
        new nlobjSearchColumn(this.fields.taxReportTemplate),
        new nlobjSearchColumn(this.fields.taxReportMap),
        new nlobjSearchColumn(this.fields.plugin),
        new nlobjSearchColumn(this.fields.detailInternalId),
        new nlobjSearchColumn(this.fields.detailLabel),
        new nlobjSearchColumn(this.fields.subType),
        new nlobjSearchColumn(this.fields.validUntil),
        new nlobjSearchColumn(this.fields.effectiveFrom),
        new nlobjSearchColumn(this.fields.meta),
        new nlobjSearchColumn(this.fields.schema),
    ];
    
    if (params.name) {
        this.filters.push(new nlobjSearchFilter(this.fields.name, null, 'is', params.name));
    }

    if (params.type) {
        this.filters.push(new nlobjSearchFilter(this.fields.type, null, 'is', params.type));
    }

    if (params.subType) {
        this.filters.push(new nlobjSearchFilter(this.fields.subType, null, 'is', params.subType));
    }

    if (params.taxReportMap) {
        this.filters.push(new nlobjSearchFilter(this.fields.taxReportMap, null, 'anyof', params.taxReportMap));
    }

    if (params.detailInternalId) {
        this.filters.push(new nlobjSearchFilter(this.fields.detailInternalId, null, 'is', params.detailInternalId));
    }
    
    if (params.countryCode) {
        this.filters.push(new nlobjSearchFilter(this.fields.name, 'custrecord_tax_report_map', 'is', params.countryCode));
    }
    
    if (params.languageCode) {
        this.filters.push(new nlobjSearchFilter(this.fields.language, null, 'is', params.languageCode));
    }
};

VAT.EU.DAO.TaxReportMapperDetailsDAO.prototype.ListObject = function _listObject(id) {
    return {
        id: id,
        name: '',
        type: '',
        format: '',
        language: '',
        taxReportTemplate: '',
        taxReportMap: '',
        plugin: '',
        detailInternalId: '',
        label: '',
        subType: '',
        validUntil: '',
        effectiveFrom: '',
        meta: '',
        taxFormSchema: ''
    };
};

VAT.EU.DAO.TaxReportMapperDetailsDAO.prototype.rowToObject = function _rowToObject(row) {
    var details = new this.ListObject(row.getId());
    details.name = row.getValue(this.fields.name);
    details.type = row.getValue(this.fields.type);
    details.format = row.getValue(this.fields.format);
    details.language = row.getValue(this.fields.language);
    details.taxReportTemplate = row.getValue(this.fields.taxReportTemplate);
    details.taxReportMap = row.getValue(this.fields.taxReportMap);
    details.plugin = row.getValue(this.fields.plugin);
    details.detailInternalId = row.getValue(this.fields.detailInternalId);
    details.label = row.getValue(this.fields.detailLabel);
    details.subType = row.getValue(this.fields.subType);
    details.validUntil = row.getValue(this.fields.validUntil);
    details.effectiveFrom = row.getValue(this.fields.effectiveFrom);
    details.meta = row.getValue(this.fields.meta);
    details.taxFormSchema = row.getValue(this.fields.schema);

    return details;
};
