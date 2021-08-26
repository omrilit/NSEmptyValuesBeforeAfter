/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax = Tax || {};
Tax.DAO = Tax.DAO || {};

//Parent Record
Tax.DAO.TaxReportMapperDAO = function _TaxReportMapperDAO() {
	Tax.DAO.RecordDAO.call(this);
	this.Name = 'TaxReportMapperDAO';
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
		extSchema: 'custrecord_ext_schema',
		isInactive: 'isinactive'
	};
};
Tax.DAO.TaxReportMapperDAO.prototype = Object.create(Tax.DAO.RecordDAO.prototype);

Tax.DAO.TaxReportMapperDAO.prototype.prepareSearch = function prepareSearch(params) {
	this.columns = [];
	for (var field in this.fields) {
		this.columns.push(new nlobjSearchColumn(this.fields[field]));
	}
	
	if (params && params.name) {
		this.filters.push(new nlobjSearchFilter(this.fields.name, null, 'is', params.name));
	}
	
	if (params && params.mapType) {
		this.filters.push(new nlobjSearchFilter(this.fields.mapType, null, 'is', params.mapType));
	}
	
	if (params && params.isEUCountry) {
		this.filters.push(new nlobjSearchFilter(this.fields.isEUCountry, null, 'is', params.isEUCountry));
	}
	
	if (params && params.isInactive) {
		this.filters.push(new nlobjSearchFilter(this.fields.isInactive, null, 'is', params.isInactive));
	}
};

Tax.DAO.TaxReportMapperDAO.prototype.ListObject = function _listObject(id) {
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

Tax.DAO.TaxReportMapperDAO.prototype.rowToObject = function _rowToObject(row) {
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

//Child Record
Tax.DAO.TaxReportMapperDetailsDAO = function _TaxReportMapperDetailsDAO() {
	Tax.DAO.RecordDAO.call(this);
	this.Name = 'TaxReportMapperDetailsDAO';
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

Tax.DAO.TaxReportMapperDetailsDAO.prototype = Object.create(Tax.DAO.RecordDAO.prototype);

Tax.DAO.TaxReportMapperDetailsDAO.prototype.prepareSearch = function prepareSearch(params) {
	this.columns = [];
	for (var field in this.fields) {
		this.columns.push(new nlobjSearchColumn(this.fields[field]));
	}
	this.columns[0].setSort();
	this.columns[1].setSort();
	
	if (params && params.name) {
		this.filters.push(new nlobjSearchFilter(this.fields.name, null, 'is', params.name));
	}

	if (params && params.type) {
		this.filters.push(new nlobjSearchFilter(this.fields.type, null, 'is', params.type));
	}

	if (params && params.taxReportMap) {
		this.filters.push(new nlobjSearchFilter(this.fields.taxReportMap, null, 'anyof', params.taxReportMap));
	}

	if (params && params.detailInternalId) {
		this.filters.push(new nlobjSearchFilter(this.fields.detailInternalId, null, 'is', params.detailInternalId));
	}
	
	if (params && params.countryCode) {
		this.filters.push(new nlobjSearchFilter(this.fields.name, 'custrecord_tax_report_map', 'is', params.countryCode));
	}
	
	if (params && params.languageCode) {
		this.filters.push(new nlobjSearchFilter(this.fields.language, null, 'is', params.languageCode));
	}
	
	if (params && params.subType) {
	    if (params.subType.operator) {
	        this.filters.push(new nlobjSearchFilter(this.fields.subType, null, params.subType.operator, params.subType.value));
	    } else {
	        this.filters.push(new nlobjSearchFilter(this.fields.subType, null, 'is', params.subType));
	    }
	}
};

Tax.DAO.TaxReportMapperDetailsDAO.prototype.ListObject = function _listObject(id) {
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

Tax.DAO.TaxReportMapperDetailsDAO.prototype.rowToObject = function _rowToObject(row) {
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

Tax.DAO.TaxReportMapperDetailsDAO.prototype.getActiveForms = function _getActiveForms(params) {
    if (!params) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params is required!');
    }

    var activeForms = [];

    try {
        var list = this.getList(params);
        var periodTo = params.periodTo;
        var mapperDetail = null;
        var validUntil = null;
        var effectiveFrom = null;

        for (var i = 0; i < list.length; i++) {
            mapperDetail = list[i];

            validUntil = mapperDetail.validUntil ? nlapiStringToDate(mapperDetail.validUntil) : new Date(2100, 0, 1);
            effectiveFrom = mapperDetail.effectiveFrom ? nlapiStringToDate(mapperDetail.effectiveFrom) : new Date(1970, 0, 1);
            
            if (periodTo.getTime() <= validUntil.getTime() && periodTo.getTime() >= effectiveFrom.getTime()) {
                activeForms.push(mapperDetail);
            }
        }
    } catch(e) {
        logException(e, 'Tax.DAO.TaxReportMapperDetailsDAO.getActiveForms');
        throw e;
    }

    return activeForms;
};
