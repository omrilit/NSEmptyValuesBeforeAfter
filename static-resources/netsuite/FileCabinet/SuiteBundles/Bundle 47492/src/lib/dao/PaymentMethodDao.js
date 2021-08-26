/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

if (!TAF) { var TAF = {}; }
TAF.DAO = TAF.DAO || {};


TAF.PaymentMethodDao = function _PaymentMethodDao() {
    this.getList = _GetList;    
    this.convertRowToObject = _ConvertRowToObject;
   
    function _GetList(filters) {
    	var result = {};
        var nlColumns = [new nlobjSearchColumn('name')];
        var nlFilters = [];
        
        for (var key in filters) {
        	var filter = filters[key];
        	if(	filter.length < 2 || 
				filter[0] === undefined || 
				filter[1] === undefined){
        		throw nlapiCreateError('INVALID_PARAMETER', 
					'filters[\'' + key+ '\']' + 
					' is not an array or has less than 2 entries');
        	}
        	nlFilters.push(new nlobjSearchFilter(key, null, filter[0], filter[1]));
        }
        
        var payment_methods = nlapiSearchRecord('paymentmethod', null, nlFilters, nlColumns);
        
        for (var i = 0; payment_methods && i < payment_methods.length; i++) {
        	var paymentMethod = payment_methods[i];
        	result[paymentMethod.getId()] = this.convertRowToObject(paymentMethod);
        }
        
        return result;
    }
    
    function _ConvertRowToObject(row) {
        var obj = new TAF.DAO.PaymentMethod(row.getId());
        obj.name = row.getValue('name');
        return obj;
    }
};

TAF.DAO.PaymentMethodDao = TAF.PaymentMethodDao;