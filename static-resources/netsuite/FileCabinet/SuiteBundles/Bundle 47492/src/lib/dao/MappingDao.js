/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

if (!TAF) { var TAF = {}; }
TAF.DAO = TAF.DAO || {};

TAF.DAO.MappingDao = function _MappingDao() {
	this.cache = {};
	this.MAX_RESULTS = 1000;
};

TAF.DAO.TaxCodes = function _TaxCodes(key) {
    return {
		key	: key,
		name : '',
		key_text : '',
		standardTaxCode : '',
		standardTaxCodeDescription : '',
		subsidiary : ''

    };
};

TAF.DAO.MappingDao.prototype.getList = function _GetList(filters, daoFilters) {
	var category_id = this.getCategory(filters);
	if (category_id == '') { return {}; }

	var mapping_category_list = new TAF.DAO.MappingCategoryDao().getList();
	var key_dao = mapping_category_list[category_id].dao;
	var daoList = key_dao.split(',');

	for (var i=0; i<daoList.length; i++) {
		var dao = daoList[i].trim();
		this.getKeys(category_id, false, dao, daoFilters);
	}

	this.getMappings(category_id, filters);
	return this.cache;
};

TAF.DAO.MappingDao.prototype.getStandardAccountList = function _GetStandardAccountList(filters, daoFilters, key) {
	var category_id = '';
	if(filters && filters[key] && (filters[key].length > 1)) {
		category_id = filters[key][1];
	}
	if (category_id == '') { return {}; }
	var mapping_category_list = new TAF.DAO.MappingCategoryDao().getList();
	var key_dao = mapping_category_list[category_id].dao;
	var daoList = key_dao.split(',');

	for (var i=0; i<daoList.length; i++) {
		var dao = daoList[i].trim();
		this.getStandardAccountKeys(category_id, dao, daoFilters);
	}

	if(key == 'custrecord_no_2digit_mapping_category') {
		this.get2DigitStandardAccountMappings(category_id, filters);
	}
	if(key == 'custrecord_no_4digit_mapping_category') {
		this.get4DigitStandardAccountMappings(category_id, filters);
	}
	return this.cache;
};
TAF.DAO.MappingDao.prototype.getIncomeStatementList = function _GetIncomeStatementList(category_id, daoFilters, selectedCategory) {
	if (category_id == '') { return {}; }
	var mapping_category_list = new TAF.DAO.MappingCategoryDao().getList();
	var key_dao = mapping_category_list[category_id].dao;
	var daoList = key_dao.split(',');

	for (var i=0; i<daoList.length; i++) {
		var dao = daoList[i].trim();
		this.getStandardAccountKeys(category_id, dao, daoFilters);
	}
	 this.getIncomeStatementMappings(category_id, selectedCategory);
	
	return this.cache;
};

TAF.DAO.MappingDao.prototype.getStandardTaxCodeList = function _GetStandardTaxCodeList(countryCode, selectedSubsidiary) {
	try {
		this.isOneWorld = SFC.Context.IsOneWorld();
		this.getStandardTaxCodesKeys(countryCode);
		this.getStandardTaxCodesMappings(selectedSubsidiary);	
		return this.cache;	
	} catch(e) {
	var errorMsg = e.getCode ? e.getCode() + ': ' + e.getDetails() : 'Error: ' + (e.message ? e.message : e);
	nlapiLogExecution('ERROR', 'TAF.DAO.MappingDao.getStandardTaxCodeList', errorMsg);
}	
};

TAF.DAO.MappingDao.prototype.mxGetMappings = function _mxGetMappings(code) {
	var search = nlapiLoadSearch('customrecord_mx_mapper_keyvalue', 'customsearch_mx_mapping_search');
    if (code === 'MX_ACCOUNT_GROUPING') {
        var filters = [
            new nlobjSearchFilter( 'scriptid', 'custrecord_mx_mapper_keyvalue_category', 'is', ['sat_account_grouping']),
            new nlobjSearchFilter( 'custrecord_mx_mapper_keyvalue_rectype', null, 'is', ['account'])
        ];
    } else if (code === 'MX_BANK') {
    	var filters = [
			new nlobjSearchFilter( 'scriptid', 'custrecord_mx_mapper_keyvalue_category', 'is', ['sat_bank']),
			new nlobjSearchFilter( 'custrecord_mx_mapper_keyvalue_rectype', null, 'is', 'account', null, 1, 0, false, true),
			new nlobjSearchFilter( 'custrecord_mx_mapper_keyvalue_rectype', null, 'is', 'customrecord_psg_mx_bank_info', null, 0, 1)
		];
    } else if (code === 'MX_PAYMENTMETHOD') {
    	var filters = [
            new nlobjSearchFilter( 'scriptid', 'custrecord_mx_mapper_keyvalue_category', 'is', ['sat_payment_method']),
            new nlobjSearchFilter( 'custrecord_mx_mapper_keyvalue_rectype', null, 'is', ['paymentmethod'])
      	];
    } else {
		var filters = [];
    }
	search.addFilters(filters)
	var resultSet = search.runSearch();

	var index = 0;
	do {
		var mappings = resultSet.getResults(index, index + this.MAX_RESULTS);
		for (var i = 0; mappings && i < mappings.length; i++) {
			var key = mappings[i].getValue('custrecord_mx_mapper_keyvalue_key');
			var recType = mappings[i].getValue('custrecord_mx_mapper_keyvalue_rectype');
						
			this.cache[key] = new TAF.DAO.Mapping('');
			this.cache[key].id = mappings[i].getId();
			this.cache[key].category = mappings[i].getValue('custrecord_mx_mapper_keyvalue_category');
			this.cache[key].key = key;
			this.cache[key].value = mappings[i].getValue('custrecord_mx_mapper_keyvalue_value');
			this.cache[key].value_text = mappings[i].getValue('custrecord_mx_mapper_value_inreport', 'custrecord_mx_mapper_keyvalue_value');
			this.cache[key].value_name = mappings[i].getText('custrecord_mx_mapper_keyvalue_value');
		}
		index += this.MAX_RESULTS;
	} while (mappings && mappings.length >= this.MAX_RESULTS);
	return this.cache;
};

TAF.DAO.MappingDao.prototype.getListWithDefault = function _GetListWithDefault(filters, values) {
	var category_id = this.getCategory(filters);
	if (category_id == '') { return {}; }

	var mapping_category_list = new TAF.DAO.MappingCategoryDao().getList();
	var key_dao = mapping_category_list[category_id].dao;
	var daoFilters = this.getMappingDaoFilters(new TAF.DAO.MappingFilterDao().getMappingFilterByIds(mapping_category_list[category_id].filters), values);
	this.getKeys(category_id, true, key_dao, daoFilters);
	this.getMappings(category_id, filters);
	return this.cache;
};

TAF.DAO.MappingDao.prototype.deleteMapping = function _DeleteMapping(id) {
	try {
		nlapiDeleteRecord('customrecord_mapper_keyvalue', id);
	} catch(e) {
		var errorMsg = e.getCode ? e.getCode() + ': ' + e.getDetails() : 'Error: ' + (e.message ? e.message : e);
		nlapiLogExecution('ERROR', 'TAF.DAO.MappingDao.deleteMapping', errorMsg);
	}
};

TAF.DAO.MappingDao.prototype.deleteStandardTaxCodesMapping = function _DeleteStandardTaxCodesMapping(id) {
	try {
		nlapiDeleteRecord('customrecord_no_std_tax_keyvalue', id);
	} catch(e) {
		var errorMsg = e.getCode ? e.getCode() + ': ' + e.getDetails() : 'Error: ' + (e.message ? e.message : e);
		nlapiLogExecution('ERROR', 'TAF.DAO.MappingDao.deleteStandardTaxCodesMapping', errorMsg);
	}
};

TAF.DAO.MappingDao.prototype.deleteNorwayMapping = function _DeleteNorwayMapping(id, selectedCategory) {
	try {
		switch (selectedCategory) {
			case 'NO-SAFT: 4 Digit Standard Accounts':
				nlapiDeleteRecord('customrecord_no_4digit_mapping', id);
				break;
			case 'NO-SAFT: 2 Digit Standard Accounts':
				nlapiDeleteRecord('customrecord_no_2digit_mapping', id);
				break;
		}
	} catch(e) {
		var errorMsg = e.getCode ? e.getCode() + ': ' + e.getDetails() : 'Error: ' + (e.message ? e.message : e);
		nlapiLogExecution('ERROR', 'TAF.DAO.MappingDao.deleteNorwayMapping', errorMsg);
	}
};
TAF.DAO.MappingDao.prototype.deleteIncomeStatementMapping = function _deleteIncomeStatementMapping(id, selectedCategory) {
	try {
		var recordID = '';
		switch (selectedCategory) {
			case 'NO-SAFT: Income Statement RF-1167':
				recordID = 'customrecord_no_in_mapper_1167_keyvalue';
				break;
			case 'NO-SAFT: Income Statement RF-1175':
				recordID = 'customrecord_no_in_mapper_1175_keyvalue';
				break;
			case 'NO-SAFT: Income Statement RF-1323':
				recordID = 'customrecord_no_in_mapper_1323_keyvalue';
				break;
		}		
		nlapiDeleteRecord(recordID, id);
	} catch(e) {
		var errorMsg = e.getCode ? e.getCode() + ': ' + e.getDetails() : 'Error: ' + (e.message ? e.message : e);
		nlapiLogExecution('ERROR', 'TAF.DAO.MappingDao.deleteIncomeStatementMapping', errorMsg);
	}
};

TAF.DAO.MappingDao.prototype.deleteNorwayValidationMapping = function _DeleteNorwayValidationMapping(key, selectedCategory) {
	try {
		var columns = [
			new nlobjSearchColumn('internalid')
		];
		var filters = [
			new nlobjSearchFilter("custrecord_norway_mapper_keyvalue_key", null, "is", key),
			new nlobjSearchFilter("custrecord_norway_mapper_keyvalue_cat", null, "is", selectedCategory)
		];
		var searchResult = nlapiSearchRecord("customrecord_norway_mapper_keyvalue", null, filters, columns);
		if (searchResult && searchResult.length > 0) {
			nlapiDeleteRecord('customrecord_norway_mapper_keyvalue', searchResult[0].getId());
		}

	} catch (e) {
		var errorMsg = e.getCode ? e.getCode() + ': ' + e.getDetails() : 'Error: ' + (e.message ? e.message : e);
		nlapiLogExecution('ERROR', 'TAF.DAO.MappingDao.deleteNorwayValidationMapping', errorMsg);
		
	}

};

TAF.DAO.MappingDao.prototype.getCategory = function _GetCategory(filters) {
	var key = 'custrecord_mapper_keyvalue_category';
	return 	filters && filters[key] && filters[key].length > 1 ?
			filters[key][1]: '';
};

TAF.DAO.MappingDao.prototype.getKeys = function _GetKeys(category_id, with_default, key_dao, daoFilters) {
	var default_value = with_default ? new TAF.DAO.MappingValueDao().getDefaultValue(category_id) : '';
	var key_list = new TAF.DAO[key_dao]().getList(daoFilters);

	if (Object.keys(key_list).length > 0) {
		for (var key in key_list) {
			this.cache[key] = new TAF.DAO.Mapping('');
			this.cache[key].category = category_id;
			this.cache[key].key = key;
			this.cache[key].key_text = key_list[key].getName ? key_list[key].getName() : key_list[key].name;
			this.cache[key].value = default_value ? default_value.id : '';
			this.cache[key].value_text = default_value ? default_value.inreport : '';
			this.cache[key].value_name = default_value ? default_value.name : '';
		}
	}
};

TAF.DAO.MappingDao.prototype.getStandardAccountKeys = function _GetStandardAccountKeys(category_id, key_dao, daoFilters) {
	var key_list = new TAF.DAO[key_dao]().getList(daoFilters);

	if (Object.keys(key_list).length > 0) {
		for (var key in key_list) {
			this.cache[key] = new TAF.DAO.Mapping('');
			this.cache[key].category = category_id;
			this.cache[key].key = key;
			this.cache[key].key_text = key_list[key].getName ? key_list[key].getName() : key_list[key].name;
			this.cache[key].value = '';
			this.cache[key].value_text = '';
			this.cache[key].value_name = '';
		}
	}
};

TAF.DAO.MappingDao.prototype.getStandardTaxCodesKeys = function _GetStandardTaxCodesKeys(countryCode) {
	try {		
			var columns = [		
				new nlobjSearchColumn("internalid"),
				new nlobjSearchColumn("itemid"),
				new nlobjSearchColumn("description")
				
			];
			var filter = [
				new nlobjSearchFilter('country', null, 'is', countryCode)
				];
			var searchResult = nlapiSearchRecord('salestaxitem', null, filter, columns);
			for (var i =0; i < searchResult.length; i++){
				var key = searchResult[i].getValue("internalid");
				this.cache[key] = new TAF.DAO.TaxCodes(key);
				this.cache[key].name =  searchResult[i].getValue("itemid");
				this.cache[key].key_text = this.cache[key].name;
				this.cache[key].key_text +=' ';
				this.cache[key].key_text +=  searchResult[i].getValue("description");
				this.cache[key].standardTaxCode =  '';
				this.cache[key].standardTaxCodeDescription =  '';
				this.cache[key].subsidiary =  '';
			}
	} catch(e) {
			var errorMsg = e.getCode ? e.getCode() + ': ' + e.getDetails() : 'Error: ' + (e.message ? e.message : e);
			nlapiLogExecution('ERROR', 'TAF.DAO.MappingDao.getStandardTaxCodesKeys', errorMsg);
	 	}	
};

TAF.DAO.MappingDao.prototype.getMappings = function _GetMappings(category_id, filters) {
	if (!category_id) {
		throw nlapiCreateError('INVALID_PARAMETER', 'Category id is null.');
	}

	if (!filters || !filters['custrecord_mapper_keyvalue_category']) {
		throw nlapiCreateError('INVALID_PARAMETER', 'Filter parameter is null or custrecord_mapper_keyvalue_category not defined in Filter parameter.');
	}

	if (!filters['custrecord_mapper_keyvalue_category'][0] || !filters['custrecord_mapper_keyvalue_category'][1]) {
		throw nlapiCreateError('INVALID_PARAMETER', 'Operator is not defined in Filter parameter.');
	}

	var values = new TAF.DAO.MappingValueDao().getList({'custrecord_mapper_value_category': ['anyof', category_id]});

	var searchColumns = [
		new nlobjSearchColumn('custrecord_mapper_keyvalue_category'),
		new nlobjSearchColumn('custrecord_mapper_keyvalue_key'),
		new nlobjSearchColumn('custrecord_mapper_keyvalue_value'),
		new nlobjSearchColumn('custrecord_mapper_keyvalue_inputvalue'),
		new nlobjSearchColumn('custrecord_mapper_keyvalue_grouping_code')
	];
	var searchFilters = [new nlobjSearchFilter('custrecord_mapper_keyvalue_category', null, filters['custrecord_mapper_keyvalue_category'][0], filters['custrecord_mapper_keyvalue_category'][1])];

	var search = nlapiCreateSearch('customrecord_mapper_keyvalue', searchFilters, searchColumns);
	var resultSet = search.runSearch();
	var index = 0;

	do {
		var mappings = resultSet.getResults(index, index + this.MAX_RESULTS);
		this.setMappings(mappings, values);
		index += this.MAX_RESULTS;
	} while (mappings && mappings.length >= this.MAX_RESULTS);
};

TAF.DAO.MappingDao.prototype.get2DigitStandardAccountMappings = function _Get2DigitStandardAccountMappings(category_id, filters) {
	if (!category_id) {
		throw nlapiCreateError('INVALID_PARAMETER', 'Category id is null.');
	}

	if (!filters || !filters['custrecord_no_2digit_mapping_category']) {
		throw nlapiCreateError('INVALID_PARAMETER', 'Filter parameter is null or custrecord_no_2digit_mapping_category not defined in Filter parameter.');
	}

	if (!filters['custrecord_no_2digit_mapping_category'][0] || !filters['custrecord_no_2digit_mapping_category'][1]) {
		throw nlapiCreateError('INVALID_PARAMETER', 'Operator is not defined in Filter parameter.');
	}

	var values = new TAF.DAO.MappingValueDao().get2DigitStandardAccount();

	var searchColumns = [
		new nlobjSearchColumn('custrecord_no_2digit_mapping_category'),
		new nlobjSearchColumn('custrecord_no_2digit_mapping_key'),
		new nlobjSearchColumn('custrecord_no_2digit_mapping_value'),
	];
	var searchFilters = [new nlobjSearchFilter('custrecord_no_2digit_mapping_category', null, filters['custrecord_no_2digit_mapping_category'][0], filters['custrecord_no_2digit_mapping_category'][1])];

	var search = nlapiCreateSearch('customrecord_no_2digit_mapping', searchFilters, searchColumns);
	var resultSet = search.runSearch();
	var index = 0;

	do {
		var mappings = resultSet.getResults(index, index + this.MAX_RESULTS);
		this.set2DigitStandardAccountMappings(mappings, values);
		index += this.MAX_RESULTS;
	} while (mappings && mappings.length >= this.MAX_RESULTS);
};

TAF.DAO.MappingDao.prototype.get4DigitStandardAccountMappings = function _Get4DigitStandardAccountMappings(category_id, filters) {
	if (!category_id) {
		throw nlapiCreateError('INVALID_PARAMETER', 'Category id is null.');
	}

	if (!filters || !filters['custrecord_no_4digit_mapping_category']) {
		throw nlapiCreateError('INVALID_PARAMETER', 'Filter parameter is null or custrecord_no_4digit_mapping_category not defined in Filter parameter.');
	}

	if (!filters['custrecord_no_4digit_mapping_category'][0] || !filters['custrecord_no_4digit_mapping_category'][1]) {
		throw nlapiCreateError('INVALID_PARAMETER', 'Operator is not defined in Filter parameter.');
	}

	var values = new TAF.DAO.MappingValueDao().get4DigitStandardAccount();

	var searchColumns = [
		new nlobjSearchColumn('custrecord_no_4digit_mapping_category'),
		new nlobjSearchColumn('custrecord_no_4digit_mapping_key'),
		new nlobjSearchColumn('custrecord_no_4digit_mapping_value'),
	];
	var searchFilters = [new nlobjSearchFilter('custrecord_no_4digit_mapping_category', null, filters['custrecord_no_4digit_mapping_category'][0], filters['custrecord_no_4digit_mapping_category'][1])];

	var search = nlapiCreateSearch('customrecord_no_4digit_mapping', searchFilters, searchColumns);
	var resultSet = search.runSearch();
	var index = 0;

	do {
		var mappings = resultSet.getResults(index, index + this.MAX_RESULTS);
		this.set4DigitStandardAccountMappings(mappings, values);
		index += this.MAX_RESULTS;
	} while (mappings && mappings.length >= this.MAX_RESULTS);
};

TAF.DAO.MappingDao.prototype.getIncomeStatementMappings = function _GetIncomeStatementMappings(category_id, selectedCategory) {
	if (!category_id) {
		throw nlapiCreateError('INVALID_PARAMETER', 'Category id is null.');
	}
	var values = new TAF.DAO.MappingValueDao().getIncomeStatementGroupingCode(selectedCategory);
	var recordID = '';
	var recordKey = '';
	var recordValue = '';
	switch (selectedCategory) {
		case 'NO-SAFT: Income Statement RF-1167':
			recordID = 'customrecord_no_in_mapper_1167_keyvalue';
			recordKey = 'custrecord_no_mapper_1167_keyvalue_key';
			recordValue = 'custrecord_no_mapper_1167_keyvalue_value';
			break;
		case 'NO-SAFT: Income Statement RF-1175':
			recordID = 'customrecord_no_in_mapper_1175_keyvalue';
			recordKey = 'custrecord_no_mapper_1175_keyvalue_key';
			recordValue = 'custrecord_no_mapper_1175_keyvalue_value';
			break;
		case 'NO-SAFT: Income Statement RF-1323':
			recordID = 'customrecord_no_in_mapper_1323_keyvalue';
			recordKey = 'custrecord_no_mapper_1323_keyvalue_key';
			recordValue = 'custrecord_no_mapper_1323_keyvalue_value';
			break;
	}

	var searchColumns = [
		new nlobjSearchColumn(recordKey),
		new nlobjSearchColumn(recordValue),
	];
	var searchFilters = [];

	var search = nlapiCreateSearch(recordID, searchFilters, searchColumns);
	var resultSet = search.runSearch();
	var index = 0;

	do {
		var mappings = resultSet.getResults(index, index + this.MAX_RESULTS);
		this.setIncomeStatementMappings(mappings, values, selectedCategory, category_id);
		index += this.MAX_RESULTS;
	} while (mappings && mappings.length >= this.MAX_RESULTS);
};

TAF.DAO.MappingDao.prototype.getStandardTaxCodesMappings = function _GetStandardTaxCodesMappings(selectedSubsidiary) {
	
	var values = new TAF.DAO.MappingValueDao().getStandardTaxCodes();
	var recordID = 'customrecord_no_std_tax_keyvalue';
	var recordKey = 'custrecord_no_std_tax_keyvalue_key';
	var recordValue = 'custrecord_no_std_tax_keyvalue_value';
	var subsidiary = 'custrecord_std_tax_keyvalue_subsidiary';
	var searchColumns = [
		new nlobjSearchColumn(recordKey),
		new nlobjSearchColumn(recordValue),
	];
	var searchFilters = [];
	if(this.isOneWorld){
		searchFilters.push(new nlobjSearchFilter(subsidiary, null, 'is', selectedSubsidiary));
	}

	var search = nlapiCreateSearch(recordID, searchFilters, searchColumns);
	var resultSet = search.runSearch();
	var index = 0;

	do {
		var mappings = resultSet.getResults(index, index + this.MAX_RESULTS);
		this.setStandardTaxCodesMappings(mappings, values);
		index += this.MAX_RESULTS;
	} while (mappings && mappings.length >= this.MAX_RESULTS);
};

TAF.DAO.MappingDao.prototype.setMappings = function _setMappings(mappings, values) {
	for (var i = 0; i < mappings.length; i++) {
		var key = mappings[i].getValue('custrecord_mapper_keyvalue_key');
		var object = this.cache[key];

		if (!object) {
			continue;
		}

		object.id = mappings[i].getId();
		object.category = mappings[i].getValue('custrecord_mapper_keyvalue_category');
		object.value = mappings[i].getValue('custrecord_mapper_keyvalue_value');
		object.grouping_code = mappings[i].getValue('custrecord_mapper_keyvalue_grouping_code');


		if(object.value){
			object.value_text = values[object.value].inreport;
			object.value_name = values[object.value].name;
		}else{
			var inputvalue = mappings[i].getValue('custrecord_mapper_keyvalue_inputvalue');
			object.value = object.value_text = inputvalue;
			object.value_name = '';
		}
	}
};

TAF.DAO.MappingDao.prototype.set2DigitStandardAccountMappings = function _set2DigitStandardAccountMappings(mappings, values) {
	for (var i = 0; i < mappings.length; i++) {
		var key = mappings[i].getValue('custrecord_no_2digit_mapping_key');
		var object = this.cache[key];

		if (!object) {
			continue;
		}

		object.id = mappings[i].getId();
		object.category = mappings[i].getValue('custrecord_no_2digit_mapping_category');
		object.value = mappings[i].getValue('custrecord_no_2digit_mapping_value');
		if(object.value){
			object.value_name = values[object.value].name;
		}
	}
};

TAF.DAO.MappingDao.prototype.set4DigitStandardAccountMappings = function _set4DigitStandardAccountMappings(mappings, values) {
	for (var i = 0; i < mappings.length; i++) {
		var key = mappings[i].getValue('custrecord_no_4digit_mapping_key');
		var object = this.cache[key];

		if (!object) {
			continue;
		}

		object.id = mappings[i].getId();
		object.category = mappings[i].getValue('custrecord_no_4digit_mapping_category');
		object.value = mappings[i].getValue('custrecord_no_4digit_mapping_value');
		if(object.value){
			object.value_name = values[object.value].name;
		}
	}
};
TAF.DAO.MappingDao.prototype.setIncomeStatementMappings = function _setIncomeStatementMappings(mappings, values, selectedCategory) {
	var recordKey = '';
	var recordValue = '';
	switch (selectedCategory) {
		case 'NO-SAFT: Income Statement RF-1167':
			recordKey = 'custrecord_no_mapper_1167_keyvalue_key';
			recordValue = 'custrecord_no_mapper_1167_keyvalue_value';
			break;
		case 'NO-SAFT: Income Statement RF-1175':
			recordKey = 'custrecord_no_mapper_1175_keyvalue_key';
			recordValue = 'custrecord_no_mapper_1175_keyvalue_value';
			break;
		case 'NO-SAFT: Income Statement RF-1323':
			recordKey = 'custrecord_no_mapper_1323_keyvalue_key';
			recordValue = 'custrecord_no_mapper_1323_keyvalue_value';
			break;
	}
	for (var i = 0; i < mappings.length; i++) {
		var key = mappings[i].getValue(recordKey);
		var object = this.cache[key];

		if (!object) {
			continue;
		}

		object.id = mappings[i].getId();
		object.value = mappings[i].getValue(recordValue);
		if (object.value) {
			object.value_name = values[object.value].name;
		}
	}
};

TAF.DAO.MappingDao.prototype.setStandardTaxCodesMappings = function _SetStandardTaxCodesMappings(mappings, values) {
	var recordKey = 'custrecord_no_std_tax_keyvalue_key';
	var recordValue = 'custrecord_no_std_tax_keyvalue_value';
	var subsidiary = 'custrecord_std_tax_keyvalue_subsidiary';
	
	for (var i = 0; i < mappings.length; i++) {
		var key = mappings[i].getValue(recordKey);
		var object = this.cache[key];

		if (!object) {
			continue;
		}

		object.id = mappings[i].getId();
		object.value = mappings[i].getValue(recordValue);
		if(this.isOneWorld){
			object.subsidiary = mappings[i].getValue(subsidiary);
		}		
		if (object.value) {
			object.value_name = values[object.value].name;
		}
	}
};

TAF.DAO.MappingDao.prototype.update = function _Update(mappings) {
	var message = {result: 'pass'};
	var policyNumCategory = new TAF.DAO.MappingCategoryDao().getByCode('MX_POLICY_NUMBER');
	var valuefield = null;

	try {
		var record = {};
		var mapping_id = '';
		for (var mapping in mappings) {
			mapping_id = mappings[mapping].id;
			if (!mappings[mapping].value) {
				this.deleteMapping(mapping_id);
			} else {
				if (mapping_id) {
					record = nlapiLoadRecord('customrecord_mapper_keyvalue', mapping_id);
				} else {
					record = nlapiCreateRecord('customrecord_mapper_keyvalue');
				}

				record.setFieldValue('custrecord_mapper_keyvalue_category', mappings[mapping].category);
				record.setFieldValue('custrecord_mapper_keyvalue_key', mappings[mapping].key);
				valuefield = valuefield ||
					((mappings[mapping].category == policyNumCategory.id) ?
						'custrecord_mapper_keyvalue_inputvalue' : 'custrecord_mapper_keyvalue_value');
				record.setFieldValue(valuefield, mappings[mapping].value);
				record.setFieldValue('custrecord_mapper_keyvalue_grouping_code', mappings[mapping].grouping_code);
				nlapiSubmitRecord(record);
			}
		}
		return message;
	} catch(e) {
		var errorMsg = e.getCode ? e.getCode() + ': ' + e.getDetails() : 'Error: ' + (e.message ? e.message : e);
		nlapiLogExecution('ERROR', 'TAF.DAO.MappingDao.Update', errorMsg);
		message = { result: 'fail', error: errorMsg };
		return message;
	}
};

TAF.DAO.MappingDao.prototype.update2DigitStandardAccount = function _UpdateStandardAccount(mappings, selectedCategory) {
	var message = {result: 'pass'};
	try {
		var record = {};
		var mapping_id = '';
		for (var mapping in mappings) {
			mapping_id = mappings[mapping].id;
			if (!mappings[mapping].value) {
				this.deleteNorwayValidationMapping(mappings[mapping].key, selectedCategory);
				this.deleteNorwayMapping(mapping_id, selectedCategory);
			} else {
				if (mapping_id) {
					record = nlapiLoadRecord('customrecord_no_2digit_mapping', mapping_id);
				} else {
					record = nlapiCreateRecord('customrecord_no_2digit_mapping');
					var mapperRecord = nlapiCreateRecord('customrecord_norway_mapper_keyvalue');
					mapperRecord.setFieldValue('custrecord_norway_mapper_keyvalue_key', mappings[mapping].key);
					mapperRecord.setFieldValue('custrecord_norway_mapper_keyvalue_cat', selectedCategory);
					nlapiSubmitRecord(mapperRecord);
				}

				record.setFieldValue('custrecord_no_2digit_mapping_category', mappings[mapping].category);
				record.setFieldValue('custrecord_no_2digit_mapping_key', mappings[mapping].key);
				record.setFieldValue('custrecord_no_2digit_mapping_value', mappings[mapping].value);
				nlapiSubmitRecord(record);
			}
		}
		return message;
	} catch(e) {
		var errorMsg = e.getCode ? e.getCode() + ': ' + e.getDetails() : 'Error: ' + (e.message ? e.message : e);
		nlapiLogExecution('ERROR', 'TAF.DAO.MappingDao.update2DigitStandardAccount', errorMsg);
		message = { result: 'fail', error: errorMsg };
		return message;
	}
};

TAF.DAO.MappingDao.prototype.update4DigitStandardAccount = function _UpdateStandardAccount(mappings, selectedCategory) {
	var message = {result: 'pass'};
	try {
		var record = {};
		var mapping_id = '';
		for (var mapping in mappings) {
			mapping_id = mappings[mapping].id;
			if (!mappings[mapping].value) {
				this.deleteNorwayValidationMapping(mappings[mapping].key, selectedCategory);
				this.deleteNorwayMapping(mapping_id, selectedCategory);
			} else {
				if (mapping_id) {
					record = nlapiLoadRecord('customrecord_no_4digit_mapping', mapping_id);
				} else {
					record = nlapiCreateRecord('customrecord_no_4digit_mapping');
					var mapperRecord = nlapiCreateRecord('customrecord_norway_mapper_keyvalue');
					mapperRecord.setFieldValue('custrecord_norway_mapper_keyvalue_key', mappings[mapping].key);
					mapperRecord.setFieldValue('custrecord_norway_mapper_keyvalue_cat', selectedCategory);
					nlapiSubmitRecord(mapperRecord);
				}

				record.setFieldValue('custrecord_no_4digit_mapping_category', mappings[mapping].category);
				record.setFieldValue('custrecord_no_4digit_mapping_key', mappings[mapping].key);
				record.setFieldValue('custrecord_no_4digit_mapping_value', mappings[mapping].value);
				nlapiSubmitRecord(record);
			}
		}
		return message;
	} catch(e) {
		var errorMsg = e.getCode ? e.getCode() + ': ' + e.getDetails() : 'Error: ' + (e.message ? e.message : e);
		nlapiLogExecution('ERROR', 'TAF.DAO.MappingDao.update4DigitStandardAccount', errorMsg);
		message = { result: 'fail', error: errorMsg };
		return message;
	}
};

TAF.DAO.MappingDao.prototype.updateIncomeStatementGroupingCode = function _UpdateIncomeStatementGroupingCode(mappings, selectedCategory) {
	var message = {result: 'pass'};
	try {
		var record = {};
		var mapping_id = '';
		var recordID = '';
		var recordKey = '';
		var recordValue = '';
		switch (selectedCategory) {
			case 'NO-SAFT: Income Statement RF-1167':
				recordID = 'customrecord_no_in_mapper_1167_keyvalue';
				recordKey = 'custrecord_no_mapper_1167_keyvalue_key';
				recordValue = 'custrecord_no_mapper_1167_keyvalue_value';
				break;
			case 'NO-SAFT: Income Statement RF-1175':
				recordID = 'customrecord_no_in_mapper_1175_keyvalue';
				recordKey = 'custrecord_no_mapper_1175_keyvalue_key';
				recordValue = 'custrecord_no_mapper_1175_keyvalue_value';
				break;
			case 'NO-SAFT: Income Statement RF-1323':
				recordID = 'customrecord_no_in_mapper_1323_keyvalue';
				recordKey = 'custrecord_no_mapper_1323_keyvalue_key';
				recordValue = 'custrecord_no_mapper_1323_keyvalue_value';
				break;
		}
		for (var mapping in mappings) {
			mapping_id = mappings[mapping].id;
			if (!mappings[mapping].value) {
				this.deleteNorwayValidationMapping(mappings[mapping].key, selectedCategory);
				this.deleteIncomeStatementMapping(mapping_id, selectedCategory);
			} else {
				if (mapping_id) {
					record = nlapiLoadRecord(recordID, mapping_id);
				} else {
					record = nlapiCreateRecord(recordID);
					var mapperRecord = nlapiCreateRecord('customrecord_norway_mapper_keyvalue');
					mapperRecord.setFieldValue('custrecord_norway_mapper_keyvalue_key', mappings[mapping].key);
					mapperRecord.setFieldValue('custrecord_norway_mapper_keyvalue_cat', selectedCategory);
					nlapiSubmitRecord(mapperRecord);
				}

				record.setFieldValue(recordKey, mappings[mapping].key);
				record.setFieldValue(recordValue, mappings[mapping].value);
				nlapiSubmitRecord(record);
			}
		}
		return message;
	} catch(e) {
		var errorMsg = e.getCode ? e.getCode() + ': ' + e.getDetails() : 'Error: ' + (e.message ? e.message : e);
		nlapiLogExecution('ERROR', 'TAF.DAO.MappingDao.updateIncomeStatementGroupingCode', errorMsg);
		message = { result: 'fail', error: errorMsg };
		return message;
	}
};

TAF.DAO.MappingDao.prototype.updateStandardTaxCode = function _UpdateStandardTaxCode(mappings) {
	var message = {result: 'pass'};
	try {
		var record = {};
		var mapping_id = '';
		var recordID = 'customrecord_no_std_tax_keyvalue';
		var recordKey = 'custrecord_no_std_tax_keyvalue_key';
		var recordValue = 'custrecord_no_std_tax_keyvalue_value';
		var subsidiary = 'custrecord_std_tax_keyvalue_subsidiary';
		this.isOneWorld = SFC.Context.IsOneWorld();
		
		for (var mapping in mappings) {
			mapping_id = mappings[mapping].id;
			if (!mappings[mapping].value) {
				this.deleteStandardTaxCodesMapping(mapping_id);
			} else {
				if (mapping_id) {
					record = nlapiLoadRecord(recordID, mapping_id);
				} else {
					record = nlapiCreateRecord(recordID);					
				}
				if(this.isOneWorld) {
					record.setFieldValue(subsidiary, mappings[mapping].subsidiary);
				}
				record.setFieldValue(recordKey, mappings[mapping].key);
				record.setFieldValue(recordValue, mappings[mapping].value);
				nlapiSubmitRecord(record);
			}
		}
		return message;
	} catch(e) {
		var errorMsg = e.getCode ? e.getCode() + ': ' + e.getDetails() : 'Error: ' + (e.message ? e.message : e);
		nlapiLogExecution('ERROR', 'TAF.DAO.MappingDao.updateStandardTaxCode', errorMsg);
		message = { result: 'fail', error: errorMsg };
		return message;
	}
};

TAF.DAO.MappingDao.prototype.getMappingDaoFilters = function getMappingDaoFilters(filters, values) {
	var mappingDaoFilters = {};
	for (var filter in filters) {
		var currentFilter = filters[filter];
		if (currentFilter.isUi) {
			continue;
		}

		var mappingFilters =  currentFilter.mappingFilters;
		for (var mf in mappingFilters) {
			mappingDaoFilters[mf] = mappingFilters[mf];
		}
	}

	if (values){
		for (var mdf in mappingDaoFilters) {
			if(values[mdf]) {
				mappingDaoFilters[mdf][1] = values[mdf];
			}
		}
	}

	return mappingDaoFilters;
};
