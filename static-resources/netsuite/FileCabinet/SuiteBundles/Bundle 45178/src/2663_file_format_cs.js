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
 * 2012/03/08  217041         GPM Beta - 1.19.2       Support selective update for payment file
 *                                                    formats
 * 2012/11/20  237873         2.00.3                  Set selected currencies to currency field
 * 2013/01/04  238979         2.00.6                  Added used functions from 2663_multicurrency_lib.js
 * 2013/01/08  239643         2.00.6                  Add checking on Include All Currencies field
 * 2013/01/08  239660         2.00.6                  Disable Include All Currencies field when payment type is not eft or dd
 * 2013/09/23  255091		  2.00.18				  Disable Update Entity Bank Details when payment type is not dd
 * 2014/05/05  288775  		                          Add support for free marker template engine
 * 2014/06/11  293691  		  3.02.4                  Update alert message due to change in field label
 * 2014/07/02  296137  		  3.02.5                  Add header warning message for transition to FreeMarker
 */

 

function initRecord(){

    // set up header warning message for transition from XML File Fields to FreeMarker
    var headerMessage = '';
    headerMessage += 'By the first quarter of 2017, users will not be able to generate payment files using XML payment file templates.<br><br> ';
	headerMessage += 'For more information, see the Payment File Template Changes in NetSuite Electronic Payments 4.0 topic in the Help Center.';
    showAlertBox('div__alert','Important', headerMessage, NLAlertDialog.TYPE_MEDIUM_PRIORITY,  '100%', null, null, null);    
    
}

function saveRecord() {
    var result = true;
    if ((new _2663.FormatValidator()).IsExistingFormat(nlapiGetFieldValue('name'), nlapiGetFieldValue('custrecord_2663_payment_file_type'), nlapiGetRecordId()) == true) {
        alert('Format with the same name and type already exists. Please save this format with a different name.');
        result = false;
    }
    
    // check that template engine to be used has content
    if (result){
        var templateEngine = "";
        var isFreeMarkerUsed = nlapiGetFieldValue("custrecord_2663_use_free_marker") == "T" ? true : false;
        if (isFreeMarkerUsed){
            templateEngine = nlapiGetFieldValue("custrecord_2663_free_marker_body");
            if (!templateEngine){
                alert("Please enter a value for Advanced Template");
                result = false;
            }            
        }
        else{
            templateEngine = nlapiGetFieldValue("custrecord_2663_file_fields");
            if (!templateEngine){
                alert("Please enter a value for File Fields");
                result = false;
            }
        }
    }
    
    
    if (result == true) {
        var selectedCurrenciesArr = nlapiGetFieldValues('custpage_2663_format_currency');
        var selectedCurrenciesText = nlapiGetFieldValue('custrecord_2663_format_currency');
        if (selectedCurrenciesArr && selectedCurrenciesArr.length > 0 && (!selectedCurrenciesText || selectedCurrenciesText == '[]')) {
            var setMultiCurrencyMsg = 'The Payment File Type and Currencies set will no longer be editable. Are you sure you want to continue?';
            if (confirm(setMultiCurrencyMsg)) {
                _2663.SetMulticurrencyField(selectedCurrenciesArr);
            }
            else {
                result = false;
            }
        }
    }
    
    return result;
}

/**
 * Field changed function
 * 
 * @param type
 * @param name
 * @param line
 */
function fieldChanged(type, name, line) {
    if (name == 'custrecord_2663_payment_file_type') {
        _2663.ToggleDisableMulticurrencyField();
        _2663.ToggleUpdateEntityDetailsField();
    }
    else if (name == 'custrecord_2663_include_all_currencies') {
        _2663.ToggleDisableMulticurrencyField();
    }
    else if (name == 'custrecord_2663_use_free_marker'){    
        // toggle fields depending on which template engine is used
        var isFreeMarkerUsed = nlapiGetFieldValue("custrecord_2663_use_free_marker") == "T" ? true : false;
        if (isFreeMarkerUsed){
            nlapiDisableField("custrecord_2663_free_marker_body",false);
            nlapiDisableField("custrecord_2663_output_file_extension",false);
            nlapiDisableField("custrecord_2663_output_file_encoding",false);
        }
        else{
            nlapiDisableField("custrecord_2663_free_marker_body",true);
            nlapiDisableField("custrecord_2663_output_file_extension",true);
            nlapiDisableField("custrecord_2663_output_file_encoding",true);            
        }
    }
}

var _2663;

if (!_2663) 
    _2663 = {};

_2663.FormatValidator = function() {
    /**
     * Check if format with the same name already exists
     * 
     * @param fileFormatName
     * @param fileFormatType
     * @param fileFormatId
     * @returns {Boolean}
     */
    function isExistingFormat(fileFormatName, fileFormatType, fileFormatId) {
        var result = false;
        if (fileFormatName && fileFormatType) {
            // search for each record to ensure that the file format name corresponds to the type
            var filters = [];
            filters.push(new nlobjSearchFilter('name', null, 'is', fileFormatName));
            filters.push(new nlobjSearchFilter('custrecord_2663_payment_file_type', null, 'anyof', fileFormatType));
            if (fileFormatId) {
                filters.push(new nlobjSearchFilter('internalid', null, 'noneof', fileFormatId));
            }
            var searchRes = nlapiSearchRecord('customrecord_2663_payment_file_format', null, filters);
            if (searchRes) {
                result = true;
            }
        }
        nlapiLogExecution('debug', '[ep] Format Validator:isExistingFormat', 'result: ' + result);
        return result;
    }
    
    this.IsExistingFormat = isExistingFormat;
};

/**
 * Function to set multicurrency field
 * 
 * @param {Array} selectedCurrenciesArr
 */
_2663.SetMulticurrencyField = function(selectedCurrenciesArr) {
    if (selectedCurrenciesArr && selectedCurrenciesArr.length > 0) {
        var currencyMap = _2663.BuildCurrencyMap();
        var currToSet = [];
        for (var i = 0; i < selectedCurrenciesArr.length; i++) {
            if (currencyMap[selectedCurrenciesArr[i] + '']) {
                currToSet.push(currencyMap[selectedCurrenciesArr[i] + ''].symbol);
            }
        }
        nlapiSetFieldValue('custrecord_2663_format_currency', JSON.stringify(currToSet), false);
    }
};

/**
 * Toggle disabling of multicurrency field
 */
_2663.ToggleDisableMulticurrencyField = function() {
    if (nlapiGetContext().getSetting('FEATURE', 'MULTICURRENCY') == 'T' && nlapiGetField('custrecord_2663_payment_file_type')) {
        var formatType = nlapiGetFieldValue('custrecord_2663_payment_file_type');
        var includeAllCurrencies = nlapiGetFieldValue('custrecord_2663_include_all_currencies') == 'T';
        var disableFlag = (formatType != '1' && formatType != '2');
        if (disableFlag || includeAllCurrencies) {
        	nlapiSetFieldValue('custpage_2663_format_currency', '');
        	if (disableFlag && includeAllCurrencies) {
        		nlapiSetFieldValue('custrecord_2663_include_all_currencies', 'F');
        	}
        }
        nlapiDisableField('custpage_2663_format_currency', disableFlag  || includeAllCurrencies);
        nlapiDisableField('custrecord_2663_include_all_currencies', disableFlag);
    }
};

/**
 * Toggle disabling of update entity bank details field
 */
_2663.ToggleUpdateEntityDetailsField = function() {
    var formatType = nlapiGetFieldValue('custrecord_2663_payment_file_type');
    var disableFlag = (formatType != '2') ? true : false;
    nlapiSetFieldValue('custrecord_2663_update_entity_details','');
    nlapiDisableField('custrecord_2663_update_entity_details', disableFlag);
};

/**
 * Build the currency map
 * 
 * @returns {Array} selectedCurrencyArr
 */
_2663.BuildCurrencyMap = function(selectedCurrencyArr) {
    var currencyMap = {};
    
    var filters = [];
    var columns = [];
    if (selectedCurrencyArr && selectedCurrencyArr.length > 0) {
        for (var i = 0; i < selectedCurrencyArr.length; i++) {
            var currSymbolFilter = new nlobjSearchFilter('symbol', null, 'is', selectedCurrencyArr[i]);
            if (selectedCurrencyArr.length > 1 && i < selectedCurrencyArr.length - 1) {
                currSymbolFilter.setOr(true);
            }
            filters.push(currSymbolFilter);
        }
    }
    
    columns.push(new nlobjSearchColumn('name'));
    columns.push(new nlobjSearchColumn('symbol'));
    
    var searchResults = nlapiSearchRecord('currency', null, filters, columns);
    
    if (searchResults) {
        for (var i = 0; i < searchResults.length; i++) {
            currencyMap[searchResults[i].getId() + ''] = {
                name: searchResults[i].getValue('name'),
                symbol: searchResults[i].getValue('symbol')
            };
        }
    }
    
    return currencyMap;
};