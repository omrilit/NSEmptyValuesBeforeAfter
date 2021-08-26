/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

if (!TAF) { var TAF = {}; }
TAF.DAO = TAF.DAO || {};


TAF.DAO.MappingCategoryDao = function _MappingCategoryDao() {
	
};

TAF.DAO.MappingCategoryDao.prototype.getList = function _GetList(filters) {
	var cache = {};
	var columns = [new nlobjSearchColumn('name'),
	               new nlobjSearchColumn('custrecord_mapper_category_dao'),
                   new nlobjSearchColumn('custrecord_mapper_category_header'),
                   new nlobjSearchColumn('custrecord_mapper_category_code'),
                   new nlobjSearchColumn('custrecord_mapper_category_filter')];
     
	var _filters = [];
    for (var key in filters) {
    	if (typeof filters[key][0] == 'undefined' || typeof filters[key][1] == 'undefined') {
    		throw nlapiCreateError('INCOMPLETE_PARAMETER', 'Operator or Filter Value is undefined.');
    	}
    	_filters.push(new nlobjSearchFilter(key, null, filters[key][0], filters[key][1]));
    }
    	
    var mapper_categories = nlapiSearchRecord('customrecord_mapper_category', null, _filters, columns);    
    
    for (var i = 0; mapper_categories && i < mapper_categories.length; i++) {
    	cache[mapper_categories[i].getId()] = this.objectify(mapper_categories[i]);
    }
     
    return cache;
};

TAF.DAO.MappingCategoryDao.prototype.getByCode = function _GetByCode(code) {
	
	var categoryobj = {};
	var columns = [new nlobjSearchColumn('name'),
	               new nlobjSearchColumn('custrecord_mapper_category_dao'),
	               new nlobjSearchColumn('custrecord_mapper_category_header'),
	               new nlobjSearchColumn('custrecord_mapper_category_code'),
	               new nlobjSearchColumn('custrecord_mapper_category_filter')];
	var filter = [new nlobjSearchFilter('custrecord_mapper_category_code', null, 'is', code)];
	var categorysr = nlapiSearchRecord('customrecord_mapper_category', null, filter, columns);
	
	if(categorysr){
		categoryobj = this.objectify(categorysr[0]);
	} else {
		categoryobj = new TAF.DAO.MappingCategory('');
	}
	return categoryobj;
};

TAF.DAO.MappingCategoryDao.prototype.objectify = function _Objectify(row) {
	
	if (!row) {
		throw nlapiCreateError('UNDEFINED_PARAMETER', 'Parameter is null or undefined.');
	}

	try {
	    var obj = new TAF.DAO.MappingCategory(row.getId());
	    obj.name = row.getValue('name');
	    obj.dao = row.getValue('custrecord_mapper_category_dao');
	    obj.header = row.getValue('custrecord_mapper_category_header');
	    obj.code = row.getValue('custrecord_mapper_category_code');
	    obj.filters = row.getValue('custrecord_mapper_category_filter') ? row.getValue('custrecord_mapper_category_filter').split(',') : [];
	} catch (exception) {
		throw nlapiCreateError('INVALID_PARAMETER', 'Column name does not exists in the parameter object.');
	}
    return obj;
};

