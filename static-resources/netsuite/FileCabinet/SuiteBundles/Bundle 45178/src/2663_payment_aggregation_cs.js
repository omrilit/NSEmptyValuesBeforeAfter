/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * @author alaurito
 */

/**
 * Revision History:
 * 
 * Date        Fixed Issue    Broken in QA Bundle     Issue Fix Summary
 * =============================================================================================
 * 2011/09/05  204716         1.09                    Initial revision; to validate Payment
 *                                                    Aggregation Records
 * 2011/09/06  204893         1.11.2011.09.08.02      Get expense report fields
 * 2011/09/12  205263         1.11.2011.09.15.01      Remove indexOf call for array to avoid
 *                                                    errors in IE8
 */

/**
 * 1) Check if name and field id are unique
 * 2) Check if field id is a valid transaction field
 */
function saveRecord() {
	var res = true;
	
	if (nlapiGetFieldValue('name')) {
        res = isUniqueName(nlapiGetFieldValue('name'));
		if (!res) {
			alert('Name already exists.');
		}
	}
	
    if (res && nlapiGetFieldValue('custrecord_2663_agg_field_id')) {
        res = isUniqueFieldId(nlapiGetFieldValue('custrecord_2663_agg_field_id'));
        if (!res) {
            alert('Field Id already exists.');
        }
    }
    
	if (res && nlapiGetFieldValue('custrecord_2663_agg_field_id')) {
		res = isValidTransactionField(nlapiGetFieldValue('custrecord_2663_agg_field_id'));
		if (!res) {
			alert('Field Id : [' + nlapiGetFieldValue('custrecord_2663_agg_field_id') + '] is not a valid transaction field.');
		}
	}
	
	return res;
}

/**
 * Check if the given name is unique
 * 
 * @param {Object} name
 */
function isUniqueName(name) {
	var res = true;
	
	if (name) {
		var filters = [];
		if (nlapiGetRecordId()) {
			filters.push(new nlobjSearchFilter('internalid', null, 'noneof', nlapiGetRecordId()));
		}
		var nameFilter = new nlobjSearchFilter('name', null, 'is', name);
		filters.push(nameFilter);
		
		var searchResults = nlapiSearchRecord('customrecord_2663_payment_aggregation', null, filters);
		
		if (searchResults) {
			res = false;
		}
	}
	
	return res;
}

/**
 * Check if the given field id is unique
 * 
 * @param {Object} fieldId
 */
function isUniqueFieldId(fieldId) {
    var res = true;
    
    if (fieldId) {
        var filters = [];
        if (nlapiGetRecordId()) {
            filters.push(new nlobjSearchFilter('internalid', null, 'noneof', nlapiGetRecordId()));
        }
        var fieldIdFilter = new nlobjSearchFilter('custrecord_2663_agg_field_id', null, 'is', fieldId);
        filters.push(fieldIdFilter);
        
        var searchResults = nlapiSearchRecord('customrecord_2663_payment_aggregation', null, filters);
        
        if (searchResults) {
            res = false;
        }
    }
    
    return res;
}

/**
 * Check if the field id is valid (in either vendor bill or expense report transaction type)
 * 
 * @param {Object} fieldId
 */
function isValidTransactionField(fieldId) {
	var res = false;
	
	// check if field is in either vendor bill/expense report records
    var vendorBill = nlapiCreateRecord('vendorbill', {recordmode: 'dynamic'}); 
    var expenseRept = nlapiCreateRecord('expensereport', {recordmode: 'dynamic'}); 
	
	// get all fields
	var vendorBillFields = vendorBill.getAllFields();
	var expenseReptFields = expenseRept.getAllFields();
	
	// check if field id is in any of the 2 transaction record type's fields
	if (vendorBillFields) {
		for (var i = 0; i < vendorBillFields.length; i++) {
			if (vendorBillFields[i] == fieldId) {
				res = true;
				break;
			}
		}
	}
    if (!res && expenseReptFields) {
        for (var i = 0; i < expenseReptFields.length; i++) {
            if (expenseReptFields[i] == fieldId) {
                res = true;
                break;
            }
        }
    }
	
	// check if reserved name ('entity' and '@NONE@')
	if (res && (fieldId == 'entity' || fieldId == '@NONE@')) {
        res = false;
	}
		
	return res;	
}