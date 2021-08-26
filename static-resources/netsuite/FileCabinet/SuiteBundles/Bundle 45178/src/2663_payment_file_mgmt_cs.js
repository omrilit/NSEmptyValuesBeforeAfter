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
 * 2011/08/25  204379         1.08.2011.08.25.02      Support for large volume processing
 * 2011/09/19  205014         1.10                    Set flags for making DCL fields mandatory
 * 2011/09/20  205014         1.10                    Set mandatory option in non-OW accounts
 *             205911         1.14.2011.09.22.2       Remove error for DCL when creating new record;
 *                                                    Use correct error message for mandatory fields
 * 2011/11/04  208589         1.15.2011.11.10.2       Get current date/time and assign to timestamp field
 * 2013/06/18  254201         2.00.18				  Add warning message when Reprocess is clicked and 
 * 													  another PFA is queued for processing for same
 * 													  format, account and subsidiary                                               
 * 2013/07/10  255518         2.00.19				  Add warning message when Reprocess is clicked and 
 * 													  another PFA is queued for Reprocessing for same
 * 													  format, account and subsidiary
 */

//PFA Statuses
var PAYQUEUED = 1;
var PAYMARKPAYMENTS = 5;
var PAYPROCESSING = 2;
var PAYCREATINGFILE = 3;
var PAYPROCESSED = 4;
var PAYREVERSAL = 6;
var PAYNOTIFICATION = 7;
var PAYERROR = 8;
var PAYFAILED = 9;
var PAYCANCELLED = 10;
var PAYDELETINGFILE = 11;
var REQUEUED = 12;

//EP Processes
var EP_PROCESSPAYMENTS = '1';
var EP_REPROCESS = '2';
var EP_ROLLBACK = '3';
var EP_REVERSEPAYMENTS = '4';
var EP_EMAILNOTIFICATION = '5';
var EP_CREATEFILE = '6';

/**
 * 1) Get the posting period from the process date
 * 2) Set the actual posting period field based on input posting period field
 * 3) Set the actual dcl fields based on input dcl fields
 * 
 * @param {Object} type
 * @param {Object} name
 * @param {Object} linenum
 */
function fieldChanged(type, name, linenum) {
	if (name == 'custrecord_2663_process_date') {
	    if (!isNullorEmpty(nlapiGetFieldValue('custrecord_2663_process_date'))) {
			var accountingPeriod = getAccountingPeriod(nlapiGetFieldValue('custrecord_2663_process_date'));
			nlapiSetFieldValue('custpage_2663_posting_period', accountingPeriod, false);
	        nlapiSetFieldValue('custrecord_2663_posting_period', accountingPeriod, false);
	    }
	}
    else if (name == 'custpage_2663_posting_period') {
        nlapiSetFieldValue('custrecord_2663_posting_period', nlapiGetFieldValue('custpage_2663_posting_period'), false);
    }
    else if (name == 'custpage_2663_department') {
        nlapiSetFieldValue('custrecord_2663_department', nlapiGetFieldValue('custpage_2663_department'), false);
    }
    else if (name == 'custpage_2663_class') {
        nlapiSetFieldValue('custrecord_2663_class', nlapiGetFieldValue('custpage_2663_class'), false);
    }
    else if (name == 'custpage_2663_location') {
        nlapiSetFieldValue('custrecord_2663_location', nlapiGetFieldValue('custpage_2663_location'), false);
    }
    
}

/**
 * 1) Check if the processing date is within the accounting period
 * 2) Check if the DCL is set according to accounting preferences on classifications
 * 
 */
function saveRecord() {
	var res = true;
    var accountingPeriod = getAccountingPeriod(nlapiGetFieldValue('custrecord_2663_process_date'));
    if (accountingPeriod != nlapiGetFieldValue('custrecord_2663_posting_period')) {
        alert('The transaction date you specified is not within the date range of your accounting period.');
		res = false;
    }
	
    // check if the DCL is set according to accounting preferences
    var prefix = isOneWorld() ? 'custpage' : 'custrecord';
    var deptFld = prefix + '_2663_department';
    var classFld = prefix + '_2663_class';
    var locFld = prefix + '_2663_location';
    
    var dclSettings = getDCLSettings();
    var dclToSet = [];
    // to display error when dcl field is changed to mandatory in acctg preferences, field is displayed and mandatory, and field is blank
    if (dclSettings.deptField.isMandatory && nlapiGetField(deptFld) && !nlapiGetField(deptFld).isMandatory() && !nlapiGetFieldValue(deptFld)) {
        dclToSet.push(nlapiGetContext().getPreference('NAMING_DEPARTMENT'));
    }
    if (dclSettings.classField.isMandatory && nlapiGetField(classFld) && !nlapiGetField(classFld).isMandatory() && !nlapiGetFieldValue(classFld)) {
        dclToSet.push(nlapiGetContext().getPreference('NAMING_CLASS'));
    }
    if (dclSettings.locField.isMandatory && nlapiGetField(locFld) && !nlapiGetField(locFld).isMandatory() && !nlapiGetFieldValue(locFld)) {
        dclToSet.push(nlapiGetContext().getPreference('NAMING_LOCATION'));
    }
    if (dclToSet.length > 0) {
        res = false;
        alert('Accounting preferences for classifications were modified. Please enter value(s) for: ' + dclToSet.join(', '));
    }
    
	return res;
}

function updateTimestamp() {
    try {
        var timestampVal = new Date();
        var timestamp = getdatetimetzstring(timestampVal);
        nlapiSubmitField('customrecord_2663_file_admin', nlapiGetRecordId(), 'custrecord_2663_file_creation_timestamp', timestamp);
    }
    catch(e) {
    }
}

/**
 * Workaround to get the accounting period
 * 
 * @param {Object} strDate
 */
function getAccountingPeriod(strDate) {
    var accountingPeriod = '';

    if (!isNullorEmpty(strDate)) {
        var procDate = nlapiStringToDate(strDate);
        var startDateObj = JSON.parse(nlapiGetFieldValue('custpage_2663_ppstart'));
        var endDateObj = JSON.parse(nlapiGetFieldValue('custpage_2663_ppend'));
        if (startDateObj && endDateObj) {
            for (var i in startDateObj) {
                var startDateStr = startDateObj[i];
                var endDateStr = endDateObj[i];
                
                if (startDateStr && endDateStr) {
                    var startDate = nlapiStringToDate(startDateStr);
                    var endDate = nlapiStringToDate(endDateStr);
                    if (startDate <= procDate && endDate >= procDate) {
                        accountingPeriod = i;
                        break;
                    }
                }
            }
        }
    }
    
    return accountingPeriod;
}

function reprocessPFA() {
	var oneWorldFlag = nlapiGetContext().getFeature('SUBSIDIARIES');
	var recId = nlapiGetRecordId();
    var paymentType = nlapiGetFieldValue('custrecord_2663_payment_type');
    if (!(paymentType == '1' || paymentType == '2')) {
    	alert('Invalid payment type: ' + paymentType + ' for Reprocess.');
    }
    
    // get the format of the assigned Bank Account
    var bankAcctId = nlapiGetFieldValue('custrecord_2663_bank_account');
    var fileFormatId = nlapiLookupField('customrecord_2663_bank_details', bankAcctId, 'custrecord_2663_' + (paymentType == '2' ? 'dd' : 'eft')  + '_template');
    var accountId = nlapiGetFieldValue('custrecord_2663_account');
    var subsidiaryId = oneWorldFlag ? nlapiGetFieldValue('custrecord_2663_payment_subsidiary') : '';
    var reqUrl = nlapiResolveURL('SUITELET', 'customscript_2663_jumplet_s', 'customdeploy_2663_jumplet_s') + "&custparam_srid=" + recId;
    if (!canStartPaymentProcessing(fileFormatId, accountId, subsidiaryId)) {
    	var subsidiaryIdText = oneWorldFlag ? nlapiLookupField('subsidiary', subsidiaryId, 'name') : '';
        var fileFormatText = nlapiLookupField('customrecord_2663_payment_file_format', fileFormatId, 'name');
        var accountText = nlapiLookupField('account', accountId, 'name');
        
        var confirmMessage = 'Payment processing is queued for the selected filters:\n\n';
        confirmMessage += 'File Format: ' + fileFormatText + '\n';
        if (accountText) {
            confirmMessage += 'Account: ' + accountText + '\n';
        }
        if (subsidiaryIdText) {
            confirmMessage += 'Subsidiary: ' + subsidiaryIdText + '\n';
        }
        confirmMessage += '\nThis may contain transactions from this PFA record. Would you like to continue?';
        if (confirm(confirmMessage)) {
        	updateTimestamp();
        	document.location = reqUrl + '&custparam_jumpaction=reprocess';
        }
    } else {
    	updateTimestamp();
    	document.location = reqUrl + '&custparam_jumpaction=reprocess';
    }
}

/**
 * Returns true when the payment processing can start for a PFA with specified file format, account, and subsidiary
 * 
 * @param fileFormat
 * @param account
 * @param subsidiaryId
 * @returns {Boolean}
 */
function canStartPaymentProcessing(fileFormat, account, subsidiaryId) {
    var result = false;
    var oneWorldFlag = nlapiGetContext().getFeature('SUBSIDIARIES');
    if ((oneWorldFlag && subsidiaryId && fileFormat) || (!oneWorldFlag && fileFormat)) {
        var searchResults = getProcessingPFARecords([PAYPROCESSED, PAYFAILED, PAYERROR, PAYCANCELLED], [EP_PROCESSPAYMENTS, EP_REPROCESS]);
        if (searchResults) {
            var sameSetFromFiltersFound = false;
            for (var i = 0; i < searchResults.length; i++) {
                var subValue = searchResults[i].getValue('custrecord_2663_payment_subsidiary');
                var eftTemplate = searchResults[i].getValue('custrecord_2663_eft_template', 'custrecord_2663_bank_account');
                var ddTemplate = searchResults[i].getValue('custrecord_2663_dd_template', 'custrecord_2663_bank_account');
                var ppTemplate = searchResults[i].getValue('custrecord_2663_pp_template', 'custrecord_2663_bank_account');
                var accountValue = searchResults[i].getValue('custrecord_2663_account');
                
                //check if PFA with same subsidiary, file format and  
                // check sub
                var subFlag = false;
                if (oneWorldFlag == false) {
                    subFlag = true;
                }
                else if (subsidiaryId && subsidiaryId == subValue) {
                    subFlag = true; 
                }
                
                // check file format
                var fileFormatFlag = false;
                if (fileFormat == eftTemplate || fileFormat == ddTemplate || fileFormat == ppTemplate) {
                    fileFormatFlag = true;
                }
                
                // check account
                var acctFlag = false;
                if (!account) {
                    acctFlag = true;
                }
                else if (account == accountValue) {
                    acctFlag = true; // no account specified
                }
                
                if (subFlag && fileFormatFlag && acctFlag) {
                    sameSetFromFiltersFound = true;
                    break;
                }
            }
            
            if (!sameSetFromFiltersFound) {
                result = true;
            }
        }
        else {
            result = true;
        }
    }
    return result;
}

/**
 * Gets the currently processing PFA records
 * 
 * @param {Array} statuses
 * @param {Array} processes
 * @param {Array} pdaIds
 */
function getProcessingPFARecords(statuses, processes, pfaIds) {
    if (statuses && statuses.length > 0) {
    	var filters = [];
        var columns = [];
        // filter for queued/processing payment file admin records
    	filters.push(new nlobjSearchFilter('custrecord_2663_file_processed', null, 'noneof', statuses));
    	if (processes && processes.length > 0) {
    		filters.push(new nlobjSearchFilter('custrecord_2663_last_process', null, 'anyof', processes));	
    	}
    	if (pfaIds && pfaIds.length > 0) {
    		filters.push(new nlobjSearchFilter('internalid', null, 'noneof', pfaIds));
    	}
    	columns.push(new nlobjSearchColumn('name'));
        columns.push(new nlobjSearchColumn('custrecord_2663_file_processed'));
        columns.push(new nlobjSearchColumn('custrecord_2663_last_process'));
        columns.push(new nlobjSearchColumn('custrecord_2663_payment_subsidiary'));
        columns.push(new nlobjSearchColumn('custrecord_2663_bank_account'));
        columns.push(new nlobjSearchColumn('custrecord_2663_account'));
        columns.push(new nlobjSearchColumn('custrecord_2663_eft_template', 'custrecord_2663_bank_account'));
        columns.push(new nlobjSearchColumn('custrecord_2663_dd_template', 'custrecord_2663_bank_account'));
        columns.push(new nlobjSearchColumn('custrecord_2663_pp_template', 'custrecord_2663_bank_account'));
        
        return nlapiSearchRecord('customrecord_2663_file_admin', null, filters, columns);	
    }
    return null;
}