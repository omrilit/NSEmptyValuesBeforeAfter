/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.EU = VAT.EU || {};
VAT.EU.DAO = VAT.EU.DAO || {};

VAT.EU.DAO.TaxReportMapperDAO = function _TaxReportMapperDAO() {
    VAT.EU.DAO.RecordSearchDAO.call(this);
    this.daoName = 'TaxReportMapperDAO';
    this.recordType = 'customrecord_tax_report_map';
    this.fields = {
        name: 'name',
        countryName: 'custrecord_country_name',
        transactionName: 'custrecord_transaction_name',
        mapType: 'custrecord_map_type',
        isEUCountry: 'custrecord_is_eu_country',
        altCode: 'custrecord_alt_code',
        internalid: 'custrecord_internal_id',
        isTaxFilingConfig: 'custrecord_is_tax_filing_config',
        isNonDeductible: 'custrecord_is_nondeductible',
        executionContext: 'custrecord_execution_context',
        enableFeature: 'custrecord_enable_feature',
        isFilterByLocation: 'custrecord_is_filter_by_location',
        vatClass: 'custrecord_vat_class',
        location: 'custrecord_location',
        formatSupplementary: 'custrecord_format_supplementary',
        extSchema: 'custrecord_ext_schema'
    };
};
VAT.EU.DAO.TaxReportMapperDAO.prototype = Object.create(VAT.EU.DAO.RecordSearchDAO.prototype);

VAT.EU.DAO.TaxReportMapperDAO.prototype.prepareSearch = function prepareSearch(params) {
    this.columns = [
        new nlobjSearchColumn(this.fields.name),
        new nlobjSearchColumn(this.fields.countryName),
        new nlobjSearchColumn(this.fields.transactionName),
        new nlobjSearchColumn(this.fields.mapType),
        new nlobjSearchColumn(this.fields.isEUCountry),
        new nlobjSearchColumn(this.fields.altCode),
        new nlobjSearchColumn(this.fields.internalid),
        new nlobjSearchColumn(this.fields.isTaxFilingConfig),
        new nlobjSearchColumn(this.fields.isNonDeductible),
        new nlobjSearchColumn(this.fields.executionContext),
        new nlobjSearchColumn(this.fields.enableFeature),
        new nlobjSearchColumn(this.fields.isFilterByLocation),
        new nlobjSearchColumn(this.fields.vatClass),
        new nlobjSearchColumn(this.fields.location),
        new nlobjSearchColumn(this.fields.formatSupplementary),
        new nlobjSearchColumn(this.fields.extSchema)
    ];
    
    if (params.name) {
        this.filters.push(new nlobjSearchFilter(this.fields.name, null, 'is', params.name));
    }
    
    if (params.mapType) {
        this.filters.push(new nlobjSearchFilter(this.fields.mapType, null, 'is', params.mapType));
    }
    
    if (params.isEUCountry) {
        this.filters.push(new nlobjSearchFilter(this.fields.isEUCountry, null, 'is', params.isEUCountry));
    }
};

VAT.EU.DAO.TaxReportMapperDAO.prototype.ListObject = function _listObject(id) {
    return {
        id: id,
        text: '',
        name: '',
        countryName: '',
        countryNameText: '',
        transactionName: '',
        mapType: '',
        isEUCountry: '',
        alternateCode:'',
        internalId: '',
        isTaxFiling: '',
        isNonDeductible: '',
        executionContext: '',
        enableFeature: '',
        isFilterByLocation: '',
        vatClass: '',
        location: '',
        formatSupplementary: '',
        extensionSchema: ''
    };
};

VAT.EU.DAO.TaxReportMapperDAO.prototype.rowToObject = function _rowToObject(row) {
    var details = new this.ListObject(row.getId());
    details.text = row.getValue(this.fields.name);
    details.name = row.getValue(this.fields.name);
    details.countryName = row.getValue(this.fields.countryName);
    details.countryNameText = row.getText(this.fields.countryName);
    details.transactionName = row.getValue(this.fields.transactionName);
    details.mapType = row.getValue(this.fields.mapType);
    details.isEUCountry = row.getValue(this.fields.isEUCountry);
    details.alternateCode = row.getValue(this.fields.altCode);
    details.internalId = row.getValue(this.fields.internalid);
    details.isTaxFiling = row.getValue(this.fields.isTaxFilingConfig);
    details.isNonDeductible = row.getValue(this.fields.isNonDeductible);
    details.executionContext = row.getValue(this.fields.executionContext);
    details.enableFeature = row.getValue(this.fields.enableFeature);
    details.isFilterByLocation = row.getValue(this.fields.isFilterByLocation);
    details.vatClass = row.getValue(this.fields.vatClass);
    details.location = row.getValue(this.fields.location);
    details.formatSupplementary = row.getValue(this.fields.formatSupplementary);
    details.extensionSchema = row.getValue(this.fields.extSchema);

    return details;
};
