/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * @author alaurito
 *
 * include list : 2663_lib.js
 *                2663_payment_file_data.js
 */

/**
 * Revision History:
 * 
 * Date        Fixed Issue    Broken in QA Bundle     Issue Fix Summary
 * =============================================================================================
 * 2011/06/10  198180         1.00.2011.06.10.02      Client side processing for e-mail notes
 * 2011/07/19  201840         1.04.2011.07.22.01      Set Amount Selected to total of Amount
 *                                                    (Foreign Currency) when Multiple Currencies
 *                                                    feature is on
 * 2011/08/12  203530         1.07.2011.08.11.01      Fix for 1000 record limit
 */

/**
 * Validate on entry that
 * a). there are no other eft payment pending processing.
 * b). what the last eft file was.
 *
 * Additionally, recalculate totals.
 */
function pageInit(type){
	// set the custom submit button classes
	if (!isNullorEmpty(document.getElementById("tr_custpage_submitter"))){
		document.getElementById("tr_custpage_submitter").className = 'pgBntY';
	}
	if (!isNullorEmpty(document.getElementById("tr_secondarycustpage_submitter"))) {
		document.getElementById("tr_secondarycustpage_submitter").className = 'pgBntY';
	}
	
    // Get the last ABA file then check it's status.
    var dataSource = new _2663.PaymentFileDataSrc();
    var searchResults = dataSource.GetFileListDescendingOrder();
    
    // Ensure that there are payments.
    if (searchResults != null) {
        // Establish the last ABA value.
        var paymentFileRes = searchResults[0];
        nlapiSetFieldValue('custpage_2663_last_eft_id', paymentFileRes.getValue('internalid'), false);
        
        // Set the abort flag if a process is pending.
        // Finished states are: Cancelled, Processed, Failed, and Error
        if (paymentFileRes.getValue('custrecord_2663_file_processed') != PAYPROCESSED &&
        paymentFileRes.getValue('custrecord_2663_file_processed') != PAYCANCELLED &&
        paymentFileRes.getValue('custrecord_2663_file_processed') != PAYFAILED &&
        paymentFileRes.getValue('custrecord_2663_file_processed') != PAYERROR) {
            nlapiSetFieldValue('custpage_2663_abort', 'T', false);
            
            // Alert the user that they should abort the process as it will not be allowed.
            alert('Another EFT process is currently in progress.' + '\n\n' +
            'File reference : ' +
            paymentFileRes.getValue('name') +
            '\n' +
            'Processing state : ' +
            paymentFileRes.getText('custrecord_2663_file_processed') +
            '\n\n' +
            'Please exit and retry at a later time.');
        }
        else {
            //Retrieve the unprocessed ABA entries.
            var unprocessedFiles = dataSource.GetUnprocessedFileList();
            
            // If there are any unprocessed payments, throw an error and set abort.
            if (unprocessedFiles != null) {
                nlapiSetFieldValue('custpage_2663_abort', 'T', false);
                
                // Alert the user that they should abort the process as it will not be allowed.
                alert('Another ' + unprocessedFiles.length + ' EFT process(s) are currently in progress.' + '\n\n' +
                'Please exit and retry at a later time.');
            }
        }
    }
    
    // Calculate the line totals.
    recalcLines();
    
}

function submitForm() {
    if (!document.forms['main_form'].onsubmit || document.forms['main_form'].onsubmit()) { 
        document.forms['main_form'].submit(); 
    };
	
    return false;
}

/**
 * Ensure that;
 * 1. the abort flag isn't set.
 * 2. the last eft file is the same as that saved in the initpage.
 */
function saveRecord(){
    var lReturn = true;
    var dataSource = new _2663.PaymentFileDataSrc();
    
    // Ensure that no other ABA process has commenced, or was in process prior to entering this process.
    // 1st - check whether the user has previously been told to abort.
    if (lReturn && nlapiGetFieldValue('custpage_2663_abort') == 'T') {
        lReturn = false;
    }
    
    // 2nd - determine if the last ABA has changed.
    if (lReturn) {
        // Get the last ABA file then check it's status.
        var searchResults = dataSource.GetFileListDescendingOrder();
        
        // Ensure that there are payments.
        if (searchResults != null) {
            // Establish the last ABA value.
            var paymentFileRes = searchResults[0];
            if (nlapiGetFieldValue('custpage_2663_last_eft_id') != paymentFileRes.getValue('internalid')) {
                nlapiSetFieldValue('custpage_2663_abort', 'T', false);
                lReturn = false;
            }
        }
    }
    
    // 3rd - establish whether there are any unprocessed ABA processes.
    if (lReturn) {
        //Retrieve the unprocessed ABA entries.
        var unprocessedFiles = dataSource.GetUnprocessedFileList()
        
        // If there are any unprocessed payments, throw an error and set abort.
        if (unprocessedFiles != null) {
            nlapiSetFieldValue('custpage_2663_abort', 'T', false);
            lReturn = false;
        }
    }
    
    // Check to see if any lines have been selected.
    if (nlapiGetFieldValue('custpage_2663_payment_lines') <= 0) {
        lReturn = false;
        alert('Please ensure that payments are selected for processing.');
    }
    else {
        // Alter the user if the abort is checked.
        if (!lReturn) {
            alert('Another EFT process is currently in progress or has been processed since you commenced.' + '\n\n' +
            'Please exit and retry at a later time.');
        }
    }

    return lReturn;
}


/**
 * Calculate the total lines selected, the amount available and the amount selected.
 */
function recalcLines(type, fldname){
    // Get the total field.
	var totalFld = 'total';
	if (isMultiCurrency()) {
		totalFld = 'fxamount';
	}
	
    // Reset the total to 0.
    var nLineCount = nlapiGetLineItemCount('custpage_2663_payment_sublist');
    var nTotalSelected = 0;
	var nTotalLines = 0;
    for (var i = 1; i <= nLineCount; i++) {
        if (nlapiGetLineItemValue('custpage_2663_payment_sublist', 'custpage_2663_select', i) == 'T') {
	        var nAmount = parseFloat(nlapiGetLineItemValue('custpage_2663_payment_sublist', totalFld, i));
            nTotalSelected += nAmount;
            nTotalLines++;
        }
    }
    
    // Ensure that a number is returned. Ensure that there are no rounding issues.
    nTotalSelected = (isNaN(nTotalSelected)) ? 0 : nTotalSelected.toFixed(2);
    
    // Set the lines for display.
    nlapiSetFieldValue('custpage_2663_payment_lines', nTotalLines, false);
    nlapiSetFieldValue('custpage_2663_total_selected', nTotalSelected, false);
}

/**
 * Check the select box when custom e-mail notes are set on text area;
 * unset e-mail notes when select box is unchecked
 * 
 * @param {Object} type
 * @param {Object} name
 * @param {Object} i
 */
function fieldChanged(type, name, i) {
    // Set the flag if an e-mail body text has been entered.
    if (name == 'custpage_2663_email_body') {
        var emailBodyStr = nlapiGetLineItemValue('custpage_2663_payment_sublist', 'custpage_2663_email_body', i);
        if (emailBodyStr) {
            nlapiSetLineItemValue('custpage_2663_payment_sublist', 'custpage_2663_select', i, 'T', false);
        }
        else {
            nlapiSetLineItemValue('custpage_2663_payment_sublist', 'custpage_2663_select', i, 'F', false);
        }

        // Calculate the line totals.
        recalcLines();
    }
    
    // Unset the e-mail body text if box is not checked
    if (name == 'custpage_2663_select') {
        if (nlapiGetLineItemValue('custpage_2663_payment_sublist', 'custpage_2663_select', i) == 'F') {
            nlapiSetLineItemValue('custpage_2663_payment_sublist', 'custpage_2663_email_body', i, '', false);
		}
		
        // Calculate the line totals.
        recalcLines();
    }

}

/**
 * Mark All.
 */
function eftMarkAll(){
    var nlineCount = nlapiGetLineItemCount('custpage_2663_payment_sublist');
    for (var i = 1; i <= nlineCount; i++) {
        nlapiSetLineItemValue('custpage_2663_payment_sublist', 'custpage_2663_select', i, 'T', false);
    }
    
    // Calculate the line totals.
    recalcLines();
}


/**
 * Unmark All.
 */
function eftUnmarkAll(){
    var nlineCount = nlapiGetLineItemCount('custpage_2663_payment_sublist');
    for (var i = 1; i <= nlineCount; i++) {
        nlapiSetLineItemValue('custpage_2663_payment_sublist', 'custpage_2663_select', i, 'F', false);
        nlapiSetLineItemValue('custpage_2663_payment_sublist', 'custpage_2663_email_body', i, '', false);
    }
    
    // Calculate the line totals.
    recalcLines();
}