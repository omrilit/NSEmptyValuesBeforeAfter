/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

if (!TAF) { var TAF = {}; }
TAF.DAO = TAF.DAO || {};

TAF.DAO.StandardAccount = function _StandardAccount(id) {
    return {
        id: id,
		name: '',
		standardAccountId: '',
		accountDescription: ''
    };
};
TAF.DAO.IncomeStatement = function _IncomeStatement(id) {
    return {
		id	: id,
		name : '',
		groupingCode	: '',
		groupingCodeDescription: ''
    };
};
TAF.DAO.StandardTaxCode = function _StandardTaxCode(id) {
    return {
		id	: id,
		name : '',
		standardTaxCode	: '',
		standardTaxCodeDescription: ''
    };
};


TAF.MappingValueDao = function _MappingValueDao() {

	this.getList = _GetList;
	this.getDefaultValue = _GetDefaultValue;
	this.convertRowToObject = _ConvertRowToObject;
	this.convertRowToObject2 = _ConvertRowToObject2;
	this.convertRowToObject3 = _ConvertRowToObject3;
	this.get2DigitStandardAccount = _Get2DigitStandardAccount;
	this.get4DigitStandardAccount = _Get4DigitStandardAccount;
	this.convertIncomeStatementRowToObject = _ConvertIncomeStatementRowToObject;
	this.getIncomeStatementGroupingCode = _GetIncomeStatementGroupingCode;
	this.getStandardTaxCodes = _GetStandardTaxCodes;
	this.convertTaxCodeRowToObject = _ConvertTaxCodeRowToObject;


	this.RECORD_NAME = 'customrecord_mapper_values';
	this.FIELDS = {
        NAME            : 'name',
        CATEGORY        : 'custrecord_mapper_value_category',
        INREPORT        : 'custrecord_mapper_value_inreport',
        ISDEFAULT       : 'custrecord_mapper_value_isdefault'
	};
	this.MAX_RESULTS = 1000; 


	function _GetList(filters) {
		var result = {};
		try {
			var nlColumns = [
				new nlobjSearchColumn(this.FIELDS.NAME),
				new nlobjSearchColumn(this.FIELDS.CATEGORY),
				new nlobjSearchColumn(this.FIELDS.INREPORT),
				new nlobjSearchColumn(this.FIELDS.ISDEFAULT)
			];
			var nlFilters = [];
	
			for (var key in filters) {
				var filter = filters[key];
				if (filter.length < 2 ||
					filter[0] === undefined ||
					filter[1] === undefined) {
					throw nlapiCreateError('INVALID_PARAMETER',
						'filters[\'' + key + '\']' +
						' is not an array or has less than 2 entries');
				}
				nlFilters.push(new nlobjSearchFilter(key, null, filter[0], filter[1]));
			}
	
			var search = nlapiCreateSearch(this.RECORD_NAME, nlFilters, nlColumns);
			var resultSet = search.runSearch();
			var index = 0;
			do {
				var mapper_values = resultSet.getResults(index, index + this.MAX_RESULTS);
				for (var i = 0; mapper_values && i < mapper_values.length; i++) {
					var mapperValue = mapper_values[i];
					result[mapperValue.getId()] = this.convertRowToObject(mapperValue);
				}
				index += this.MAX_RESULTS;
			} while (mapper_values && mapper_values.length >= this.MAX_RESULTS);
		} catch (ex) {
			var errorMsg = ex.getCode ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message ? ex.message : ex);
			nlapiLogExecution('ERROR', 'TAF.DAO.MappingValueDao.GetList', errorMsg);
		}
		return result;
	}

	function _Get2DigitStandardAccount() {
		var result = {};
		try {
			var nlColumns = [
				new nlobjSearchColumn('custrecord_2d_standard_account_id').setSort(),
				new nlobjSearchColumn('custrecord_2d_account_description')
			];
			var nlFilters = [];
	
			var search = nlapiCreateSearch('customrecord_2digit_account_values', nlFilters, nlColumns);
			var resultSet = search.runSearch();
			var index = 0;
			do {
				var mapper_values = resultSet.getResults(index, index + this.MAX_RESULTS);
				for (var i = 0; mapper_values && i < mapper_values.length; i++) {
					var mapperValue = mapper_values[i];
					result[mapperValue.getId()] = this.convertRowToObject2(mapperValue);
				}
				index += this.MAX_RESULTS;
			} while (mapper_values && mapper_values.length >= this.MAX_RESULTS);
		} catch (ex) {
			var errorMsg = ex.getCode ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message ? ex.message : ex);
			nlapiLogExecution('ERROR', 'TAF.DAO.MappingValueDao.Get2DigitStandardAccount', errorMsg);
		}
		return result;
	}

	function _Get4DigitStandardAccount() {
		var result = {};
		try {
			var nlColumns = [
				new nlobjSearchColumn('custrecord_4d_standard_account_id').setSort(),
				new nlobjSearchColumn('custrecord_4d_account_description')
			];
			var nlFilters = [];
	
			var search = nlapiCreateSearch('customrecord_4digit_account_values', nlFilters, nlColumns);
			var resultSet = search.runSearch();
			var index = 0;
			do {
				var mapper_values = resultSet.getResults(index, index + this.MAX_RESULTS);
				for (var i = 0; mapper_values && i < mapper_values.length; i++) {
					var mapperValue = mapper_values[i];
					result[mapperValue.getId()] = this.convertRowToObject3(mapperValue);
				}
				index += this.MAX_RESULTS;
			} while (mapper_values && mapper_values.length >= this.MAX_RESULTS);
		} catch (ex) {
			var errorMsg = ex.getCode ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message ? ex.message : ex);
			nlapiLogExecution('ERROR', 'TAF.DAO.MappingValueDao.Get4DigitStandardAccount', errorMsg);
		}
		return result;
	}

	function _GetIncomeStatementGroupingCode(incomeStatementType) {
		var groupingCodeID = '';
		var groupingCodeDescriptionID = '';
		var groupingRecordID = '';
		switch (incomeStatementType) {
			case 'NO-SAFT: Income Statement RF-1167' :
				groupingRecordID = 'customrecord_income_statement_1167';
				groupingCodeID = 'custrecord_income_stat_1167_grouping_cod';
				groupingCodeDescriptionID = 'custrecord_income_stat_1167_grouping_des';				
				break;
			case 'NO-SAFT: Income Statement RF-1175':
				groupingRecordID = 'customrecord_income_statement_1175';
				groupingCodeID = 'custrecord_income_stat_1175_grouping_cod';
				groupingCodeDescriptionID = 'custrecord_income_stat_1175_grouping_des';
				break;
			case 'NO-SAFT: Income Statement RF-1323':
				groupingRecordID = 'customrecord_income_statement_1323';
				groupingCodeID = 'custrecord_income_stat_1323_grouping_cod';
				groupingCodeDescriptionID = 'custrecord_income_stat_1323_grouping_des';
				break;
		}
		var result = {};
		try {
			var nlColumns = [				
				new nlobjSearchColumn(groupingCodeID).setSort(),
				new nlobjSearchColumn(groupingCodeDescriptionID)
			];
			var nlFilters = [];
	
			var search = nlapiCreateSearch(groupingRecordID, nlFilters, nlColumns);
			var resultSet = search.runSearch();
			var index = 0;
			do {
				var mapper_values = resultSet.getResults(index, index + this.MAX_RESULTS);
				for (var i = 0; mapper_values && i < mapper_values.length; i++) {
					var mapperValue = mapper_values[i];
					result[mapperValue.getId()] = this.convertIncomeStatementRowToObject(mapperValue,incomeStatementType);
				}
				index += this.MAX_RESULTS;
			} while (mapper_values && mapper_values.length >= this.MAX_RESULTS);
		} catch (ex) {
			var errorMsg = ex.getCode ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message ? ex.message : ex);
			nlapiLogExecution('ERROR', 'TAF.DAO.MappingValueDao.GetIncomeStatementGroupingCode', errorMsg);
		}
		return result;
	}

	function _GetStandardTaxCodes(countryCode) {
		var result = {};
		try {
			var nlColumns = [
				new nlobjSearchColumn('custrecord_no_standard_tax_codes_id').setSort(),
				new nlobjSearchColumn('custrecord_no_standard_tax_codes_desc')
			];
			var nlFilters = [];
	
			var search = nlapiCreateSearch('customrecord_no_standard_tax_codes', nlFilters, nlColumns);
			var resultSet = search.runSearch();
			var index = 0;
			do {
				var mapper_values = resultSet.getResults(index, index + this.MAX_RESULTS);
				for (var i = 0; mapper_values && i < mapper_values.length; i++) {
					var mapperValue = mapper_values[i];
					result[mapperValue.getId()] = this.convertTaxCodeRowToObject(mapperValue);
				}
				index += this.MAX_RESULTS;
			} while (mapper_values && mapper_values.length >= this.MAX_RESULTS);
		} catch (ex) {
			var errorMsg = ex.getCode ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message ? ex.message : ex);
			nlapiLogExecution('ERROR', 'TAF.DAO.MappingValueDao.GetStandardTaxCodes', errorMsg);
		}
		return result;
	}

	function _GetDefaultValue(category) {
		var nlColumns = [
			new nlobjSearchColumn(this.FIELDS.NAME),
			new nlobjSearchColumn(this.FIELDS.CATEGORY),
			new nlobjSearchColumn(this.FIELDS.INREPORT),
			new nlobjSearchColumn(this.FIELDS.ISDEFAULT)
		];

		var nlFilter = [
			new nlobjSearchFilter(this.FIELDS.CATEGORY, null, 'anyof', category),
			new nlobjSearchFilter(this.FIELDS.ISDEFAULT, null, 'is', 'T')
		];
		var mapper_values = nlapiSearchRecord(this.RECORD_NAME, null, nlFilter, nlColumns);

		return mapper_values ? this.convertRowToObject(mapper_values[0]) : null;
	}


	function _ConvertRowToObject(row) {
		var obj = new TAF.DAO.MappingValue(row.getId());
		obj.name = row.getValue(this.FIELDS.NAME);
		obj.category = row.getValue(this.FIELDS.CATEGORY);
		obj.inreport = row.getValue(this.FIELDS.INREPORT);
		obj.isdefault = row.getValue(this.FIELDS.ISDEFAULT);
		return obj;
	}

	function _ConvertRowToObject2(row) {
		var obj = new TAF.DAO.StandardAccount(row.getId());
		obj.standardAccountId = row.getValue('custrecord_2d_standard_account_id');
		obj.accountDescription = row.getValue('custrecord_2d_account_description');
		obj.name = obj.standardAccountId + ' '+'-'+' '+ obj.accountDescription;
		return obj;
	}

	function _ConvertRowToObject3(row) {
		var obj = new TAF.DAO.StandardAccount(row.getId());
		obj.standardAccountId = row.getValue('custrecord_4d_standard_account_id');
		obj.accountDescription = row.getValue('custrecord_4d_account_description');
		obj.name = obj.standardAccountId + ' '+'-'+' '+ obj.accountDescription;
		return obj;
	}
	
	function _ConvertIncomeStatementRowToObject(row,incomeStatementType) {
		var obj = new TAF.DAO.IncomeStatement(row.getId());
		var groupingCodeID = '';
		var groupingCodeDescriptionID = '';
		switch (incomeStatementType) {
			case 'NO-SAFT: Income Statement RF-1167' :
				groupingCodeID = 'custrecord_income_stat_1167_grouping_cod';
				groupingCodeDescriptionID = 'custrecord_income_stat_1167_grouping_des';				
				break;
			case 'NO-SAFT: Income Statement RF-1175':
				groupingCodeID = 'custrecord_income_stat_1175_grouping_cod';
				groupingCodeDescriptionID = 'custrecord_income_stat_1175_grouping_des';
				break;
			case 'NO-SAFT: Income Statement RF-1323':
				groupingCodeID = 'custrecord_income_stat_1323_grouping_cod';
				groupingCodeDescriptionID = 'custrecord_income_stat_1323_grouping_des';
				break;
		}		
		
		obj.groupingCode = row.getValue(groupingCodeID);
		obj.groupingCodeDescription = row.getValue(groupingCodeDescriptionID);
		obj.name = obj.groupingCode +' '+'-'+' '+obj.groupingCodeDescription;
		return obj;
	}
	
	function _ConvertTaxCodeRowToObject(row) {
		var obj = new TAF.DAO.StandardTaxCode(row.getId());
		obj.standardTaxCode = row.getValue('custrecord_no_standard_tax_codes_id');
		obj.standardTaxCodeDescription = row.getValue('custrecord_no_standard_tax_codes_desc');
		obj.name = obj.standardTaxCode + ' '+'-'+' '+ obj.standardTaxCodeDescription;
		return obj;
	}
};	

TAF.DAO.MappingValueDao = TAF.MappingValueDao;