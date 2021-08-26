/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * @author mcadano
 * includes:  
 */

/**
 * Revision History:
 * 
 * Date        Fixed Issue    Broken in QA Bundle     Issue Fix Summary
 * =============================================================================================
 * 2013/04/15  248888   	  2.00.12				  Initital version
 * 2013/04/16  248888   	  2.00.12				  Add fieldChanged function
 * 2013/04/17  249096   	  2.00.12				  Fix alert message when Batches are closed
 * 2013/04/17  249247   	  2.00.13				  Add alert message when batches are being updated
 * 2013/09/26  263190 		  3.00.00				  Use a Restlet instead of a Scheduled Script
 * 													  for Reresh Batch
 * 2013/09/27  263190 		  3.00.00				  Revert back to Scheduled Script 
 * 2013/09/30  264794 		  3.00.00				  Remove setting of approval level
 * 2013/10/05  265406 		  3.00.00				  Refactor code to use Payment File Administration record instead of Payment Batch
 * 2013/10/07  265406 		  3.00.00				  Add checking for batch record value
 * 2014/05/19  273487         3.00.3       			  Support parallel processing for batch processing
 */

var psg_ep = psg_ep || {};

psg_ep.closeBatches = function() {
	var batchesBeingUpdated = [];
	var batchesClosed = 0;
	var batchesSelected = 0;
	var message = '';
	var batchNames = [];
	var lineCount = nlapiGetLineItemCount('open_payment_batch');
	for (var i = 1; i <= lineCount; i++) {
		if (nlapiGetLineItemValue('open_payment_batch', 'select', i) == 'T') {
			var batchId = nlapiGetLineItemValue('open_payment_batch', 'id', i);
			if (batchId) {
				var currBatch = nlapiLoadRecord('customrecord_2663_file_admin', batchId);
				if (currBatch) {
					var currStatus = currBatch.getFieldValue('custrecord_2663_status');
					if (currStatus != BATCH_OPEN) {
						if (currStatus == BATCH_UPDATING) {
							batchesBeingUpdated.push(nlapiGetLineItemValue('open_payment_batch', 'batch_name', i));			
						}
					} else {
						if (currBatch.getFieldValue('custrecord_2663_ref_note')) {
							currBatch.setFieldValue('custrecord_2663_status', BATCH_PENDINGAPPROVAL);
							nlapiSubmitRecord(currBatch);
							batchesClosed ++;	
						} else {
							if (!message ) {
								message = 'Please enter value for EFT file reference note for Payment Batch/es: ';
							}
							batchNames.push(currBatch.getFieldValue('altname'));
						}
						batchesSelected++;				
					}	
				}
			}
		}
	}
	
	
	if (batchesClosed) {
		message = 'Selected Batches submitted for approval.';	
	}
	if (batchesBeingUpdated.length > 0) {
		message = message ? message + '\n' : '';
		message += ['One or more selected batches are currently being updated and were not closed:', batchesBeingUpdated.join('\n')].join('\n');
	} else if (!lineCount) {
		message = 'There are no Open batches to submit.';
	} else if (lineCount && !batchesSelected) {
		message = 'Please select Open batches to submit.';
	} else if (batchesSelected) {
		message += batchNames.join(', ');
	}
	if (message) {
		alert(message);	
	}
	
	if (batchesClosed) {
		// suppress the alert
	    setWindowChanged(window, false);
	    // refresh page
	    document.location.reload(true);
	}
};


psg_ep.refreshBatch = function() {
	var bankAcctId = nlapiGetFieldValue('bank_acct');
	if (bankAcctId) {
		var url = nlapiResolveURL('suitelet', 'customscript_2663_batch_updater_s', 'customdeploy_2663_batch_updater_s');
		if (!document.forms['main_form'].onsubmit || document.forms['main_form'].onsubmit()) {
			document.forms.main_form.action = url;
			// suppress the alert
		    setWindowChanged(window, false);
		    document.forms['main_form'].submit(); 
		}
	} else {
		alert('Please select Bank Account.');
	}
};


psg_ep.markAll = function() {
	var lineCount = nlapiGetLineItemCount('open_payment_batch');
	for (var i = 1; i <= lineCount; i++) {
		if (nlapiGetLineItemValue('open_payment_batch', 'status', i) == 'Open') {
			nlapiSetLineItemValue('open_payment_batch', 'select', i, 'T');
		}
	}
};

psg_ep.unMarkAll = function() {
	var lineCount = nlapiGetLineItemCount('open_payment_batch');
	for (var i = 1; i <= lineCount; i++) {
		nlapiSetLineItemValue('open_payment_batch', 'select', i, 'F');
	}
};

psg_ep.fieldChanged = function(type, name) {
	if (name == 'bank_acct') {
		var newURL = document.location.href;
        setWindowChanged(window, false);
        var paramIndex = newURL.indexOf('custpage_2663_bank_acct_id') - 1; 
        if (paramIndex > -1) {
            newURL = newURL.substring(0, paramIndex);
        }
        newURL += ['&custpage_2663_bank_acct_id=', nlapiGetFieldValue('bank_acct')].join('');
        document.location.assign(newURL);
	} 
};

psg_ep.isApprovalRoutingEnabled = function () {
	var preference = (nlapiSearchRecord('customrecord_ep_preference', null, null, new nlobjSearchColumn('custrecord_ep_eft_approval_routing')) || [])[0];
	if (preference) {
		return preference.getValue('custrecord_ep_eft_approval_routing') == 'T'; 
	}
	return false;
};