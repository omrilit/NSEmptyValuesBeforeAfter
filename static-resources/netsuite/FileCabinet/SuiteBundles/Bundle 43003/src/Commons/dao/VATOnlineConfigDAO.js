/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */
var Tax = Tax || {};
Tax.DAO = Tax.DAO || {};

Tax.DAO.VATOnlineConfigDAO =  function VATOnlineConfigDAO() {
	Tax.DAO.RecordDAO.call(this);
	this.Name = 'VATOnlineConfigDAO';
	this.recordType = 'customrecord_tax_return_setup_item';
	this.columns = [];
	this.filters = [];
	this.fields = {
		countryCode: 'custrecord_vat_cfg_country',
		subsidiaryId: 'custrecord_vat_cfg_subsidiary',
		name: 'custrecord_vat_cfg_name',
		type: 'custrecord_vat_cfg_type',
		value: 'custrecord_vat_cfg_value',
		tabOrder: 'custrecord_vat_cfg_taborder',
		label: 'custrecord_vat_cfg_label',
		isVisible: 'custrecord_vat_cfg_isvisible',
		isMandatory: 'custrecord_vat_cfg_ismandatory',
		help: 'custrecord_vat_cfg_helptext',
		product: 'custrecord_vat_cfg_product',
		isNondeductible: 'custrecord_vat_cfg_nondeductible',
		isNewTaxFiling: 'custrecord_vat_cfg_newtaxfiling',
		isInactive: 'isinactive'
	};
};
Tax.DAO.VATOnlineConfigDAO.prototype = Object.create(Tax.DAO.RecordDAO.prototype);

Tax.DAO.VATOnlineConfigDAO.prototype.prepareSearch = function prepareSearch(params) {
	for (var field in this.fields) {
		this.columns.push(new nlobjSearchColumn(this.fields[field]));
	}

	if (params.countryCode) {
		this.filters.push(new nlobjSearchFilter(this.fields.countryCode, null, 'is', params.countryCode));
	}

	if (params.subsidiary) {
		this.filters.push(new nlobjSearchFilter(this.fields.subsidiaryId, null, 'is', params.subsidiary));
	}

	if (params.isInactive) {
		this.filters.push(new nlobjSearchFilter(this.fields.isInactive, null, 'is', params.isInactive));
	}
};

Tax.DAO.VATOnlineConfigDAO.prototype.ListObject = function listObject(row) {

	return {
		countryCode: row.getValue('custrecord_vat_cfg_country'),
		subsidiaryId: row.getValue('custrecord_vat_cfg_subsidiary'),
		name: row.getValue('custrecord_vat_cfg_name'),
		type: row.getValue('custrecord_vat_cfg_type'),
		value: row.getValue('custrecord_vat_cfg_value'),
		tabOrder: row.getValue('custrecord_vat_cfg_taborder'),
		label: row.getValue('custrecord_vat_cfg_label'),
		isVisible: row.getValue('custrecord_vat_cfg_isvisible'),
		isMandatory: row.getValue('custrecord_vat_cfg_ismandatory'),
		help: row.getValue('custrecord_vat_cfg_helptext'),
		product: row.getValue('custrecord_vat_cfg_product'),
		isNondeductible: row.getValue('custrecord_vat_cfg_nondeductible'),
		isNewTaxFiling: row.getValue('custrecord_vat_cfg_newtaxfiling'),
		isInactive: row.getValue('isinactive')
	};
};