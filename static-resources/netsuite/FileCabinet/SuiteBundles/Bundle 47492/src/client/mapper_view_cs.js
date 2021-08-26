/**
 * Copyright 2014, 2019 Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF ||{};
TAF.Mapper = TAF.Mapper || {};
TAF.Mapper.ViewClient = TAF.Mapper.ViewClient || {}; 
TAF.Mapper.ViewClient.StrMsgs = {};


TAF.Mapper.ViewClient.pageInit = function _pageInit(type){
	TAF.Mapper.ViewClient.StrMsgs = JSON.parse(nlapiGetFieldValue('custpage_cs_msgs'));
};

TAF.Mapper.ViewClient.saveRecord = function _saveRecord() {
    var action = nlapiGetFieldValue(ELEMENT_NAME.ACTION);
    
    switch (action) {
        case ACTION.EDIT:
            nlapiSetFieldValue(ELEMENT_NAME.ACTION, ACTION.SAVE);
            break;
        default:
            nlapiSetFieldValue(ELEMENT_NAME.ACTION, ACTION.EDIT);
            break;
    }
    
    return true;
};

// Called whenever the Category has been successfully changed
// Called whenever the Sublist values has been changed
TAF.Mapper.ViewClient.fieldChanged = function _fieldChanged(type, name, linenum) {
    var filterList = JSON.parse(nlapiGetFieldValue(ELEMENT_NAME.UI_FILTERS) || '[]');
	var validationFlag = true;
	var message = '';
	var fromId = nlapiGetLineItemValue(ELEMENT_NAME.SUBLIST, ELEMENT_NAME.FROM_ID, linenum);
	if (name == 'custpage_grouping_code') {
		var groupingCode = nlapiGetLineItemValue(ELEMENT_NAME.SUBLIST, 'custpage_grouping_code', linenum);
        var letters = /^[0-9a-zA-Z]+$/;
        if  (groupingCode && !groupingCode.match(letters)) {
			confirm(TAF.Mapper.ViewClient.StrMsgs['MAPPER_GROUPING_WARNING_MESSAGE']);
            nlapiSetLineItemValue(ELEMENT_NAME.SUBLIST, 'custpage_grouping_code',linenum, '');
        }
    }
	
    if (name == ELEMENT_NAME.TO_ID) {
        var selectedCategoryName = JSON.parse(nlapiGetFieldValue('custpage_selected_category') || '{}');
        switch (selectedCategoryName) {
            case 'NO-SAFT: Income Statement RF-1167':
            case 'NO-SAFT: Income Statement RF-1175':
            case 'NO-SAFT: Income Statement RF-1323':
            case 'NO-SAFT: 2 Digit Standard Accounts':
            case 'NO-SAFT: 4 Digit Standard Accounts':
                var columns = [
                    new nlobjSearchColumn('internalid'),
                    new nlobjSearchColumn('custrecord_norway_mapper_keyvalue_key'),
                    new nlobjSearchColumn('custrecord_norway_mapper_keyvalue_cat')
                ];
                var filters = [new nlobjSearchFilter("custrecord_norway_mapper_keyvalue_key", null, "is", fromId), new nlobjSearchFilter('custrecord_norway_mapper_keyvalue_cat', null, 'isnot', selectedCategoryName)];
                var searchResult = nlapiSearchRecord('customrecord_norway_mapper_keyvalue', null, filters, columns);
                var category = '';
                if (searchResult && searchResult.length > 0) {
                    category = searchResult[0].getValue("custrecord_norway_mapper_keyvalue_cat");
                    validationFlag = false;
                    accountRecord = nlapiLoadRecord('account', fromId);
                    acccountName = accountRecord.getFieldValue("acctname");
					acccountNumber = accountRecord.getFieldValue("acctnumber");
					if(acccountNumber){
						message = acccountNumber + ' ';
                    }
					message += acccountName + TAF.Mapper.ViewClient.StrMsgs['MAPPER_GROUPING_WARNING_MSG1'] + category + TAF.Mapper.ViewClient.StrMsgs['MAPPER_GROUPING_WARNING_MSG2'] + category + TAF.Mapper.ViewClient.StrMsgs['MAPPER_GROUPING_WARNING_MSG3'];
					confirm(message);
                    nlapiSetLineItemValue(ELEMENT_NAME.SUBLIST, ELEMENT_NAME.TO_ID, linenum, '');
                }
        }
    }
	
    if (validationFlag && (name == ELEMENT_NAME.TO_ID || name == 'custpage_grouping_code')) {
        // Update mappings hidden field
        var mappings = JSON.parse(nlapiGetFieldValue(ELEMENT_NAME.MAPPINGS) || '{}');
        
        mappings[fromId] = {
            id: nlapiGetLineItemValue(ELEMENT_NAME.SUBLIST, ELEMENT_NAME.MAP_ID, linenum),
            fromId: fromId,
            toId: nlapiGetLineItemValue(ELEMENT_NAME.SUBLIST, ELEMENT_NAME.TO_ID, linenum),
            grouping_code: nlapiGetLineItemValue(ELEMENT_NAME.SUBLIST, 'custpage_grouping_code', linenum)
        };
        
        if(mappings[fromId].grouping_code && !mappings[fromId].toId){
			confirm(TAF.Mapper.ViewClient.StrMsgs['MAPPER_VALUE_WARNING_MESSAGE']);
			nlapiSetLineItemValue(ELEMENT_NAME.SUBLIST, 'custpage_grouping_code',linenum, '');
			nlapiSetFieldValue(ELEMENT_NAME.MAPPINGS, JSON.stringify(mappings));          
        } else{
			nlapiSetFieldValue(ELEMENT_NAME.MAPPINGS, JSON.stringify(mappings));
      	  }
      
    } else if (name == ELEMENT_NAME.CATEGORY || (filterList.indexOf(name) > -1)) {
        var params = {};
        params[ELEMENT_NAME.CATEGORY] = nlapiGetFieldValue(ELEMENT_NAME.CATEGORY);
		params[ELEMENT_NAME.SUBSIDIARY] = nlapiGetFieldValue(ELEMENT_NAME.SUBSIDIARY);
        params[ELEMENT_NAME.ACTION] = nlapiGetFieldValue(ELEMENT_NAME.ACTION);
        
        if (filterList.length > 0){
            for (var f = 0; f < filterList.length; f++){
                var filter = filterList[f];
                params[filter] = nlapiGetFieldValue(filter);
            }
        }
        
        TAF.Mapper.ViewClient.reloadPage(params);
    }
    
    return;
};

// Called whenever the Category is changed
// Not triggered when changing Sublist values
TAF.Mapper.ViewClient.validateField = function _validateField(type, name, linenum) {
    var filterList = JSON.parse(nlapiGetFieldValue(ELEMENT_NAME.UI_FILTERS) || '[]');
    
    if (name == ELEMENT_NAME.CATEGORY || filterList.indexOf(name) > -1) {
        return TAF.Mapper.ViewClient.displayConfirmationMessage();
    }
    
    return true;
};

TAF.Mapper.ViewClient.cancel = function cancel() {
    var result = TAF.Mapper.ViewClient.displayConfirmationMessage();
    if (!result) {
        return;
    }
    
    nlapiSetFieldValue(ELEMENT_NAME.ACTION, ACTION.VIEW);
    
    var params = {};
    params[ELEMENT_NAME.ACTION] = nlapiGetFieldValue(ELEMENT_NAME.ACTION);
    
    TAF.Mapper.ViewClient.reloadPage(params);
};


TAF.Mapper.ViewClient.displayConfirmationMessage = function _displayConfirmationMessage() {
    var result = true;
    var mappings = nlapiGetFieldValue(ELEMENT_NAME.MAPPINGS);
    
    if (mappings) {
        var context = nlapiGetContext();
        result = confirm(TAF.Mapper.ViewClient.StrMsgs['MAPPER_RELOAD_WARNING_MESSAGE']);
    }
    
    return result;
    
};

TAF.Mapper.ViewClient.reloadPage = function _reloadPage(params) {
    var url = nlapiGetFieldValue(ELEMENT_NAME.URL);
    
    for (var key in params) {
        var p = '&' + key + '=' + params[key];
        url += p;
    }
    
    setWindowChanged(window, false);
    window.location = url;
};

TAF.Mapper.ViewClient.openNorwayRecord = function _openNorwayRecord(category) {
    try {
        var strWindowFeatures = "location=yes,resizable=yes,scrollbars=yes,status=yes";
        var url = '';
        switch(category)
		{
			case 1 : //category value 1 is passed for 'NO-SAFT: 2 Digit Standard Accounts' category
                url = nlapiResolveURL('RECORD','customrecord_2digit_account_values','','EDIT');                
			    break;
			case 2 : //category value 2 is passed for 'NO-SAFT: 4 Digit Standard Accounts' category
                url = nlapiResolveURL('RECORD','customrecord_4digit_account_values','','EDIT');
                break;
            case 3 : //category value 3 is passed for 'NO-SAFT: Income Statement RF-1167' category
                url = nlapiResolveURL('RECORD','customrecord_income_statement_1167','','EDIT');
                break;
            case 4 : //category value 4 is passed for 'NO-SAFT: Income Statement RF-1175' category
                url = nlapiResolveURL('RECORD','customrecord_income_statement_1175','','EDIT');
                break; 
            case 5 : //category value 5 is passed for 'NO-SAFT: Income Statement RF-1323' category
                url = nlapiResolveURL('RECORD','customrecord_income_statement_1323','','EDIT');
                break;
			case 6 : //category value 5 is passed for 'NO-SAFT: Standard Tax Codes' category
                url = nlapiResolveURL('RECORD','customrecord_no_standard_tax_codes','','EDIT');
                break; 
            default :
                break;             
        }   
        window.open(url, "DescriptiveWindowName", strWindowFeatures);     
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.Mapper.ViewClient.openNorwayRecord', ex.toString());
         
    } 
};

