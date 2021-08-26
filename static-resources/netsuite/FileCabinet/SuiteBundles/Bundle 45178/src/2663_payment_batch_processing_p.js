/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * @author mcadano
 *
 * include list: 2663_date_util.js, 2663_edition_control_lib.js, 2663_payment_batch_processing_lib.js
 */

/**
 * Revision History:
 * 
 * Date        Fixed Issue    Broken in QA Bundle     Issue Fix Summary
 * =============================================================================================
 * 2012/08/01  227868         2.00.1       			  Portlet for viewing/editing Payment Batches
 * 2012/08/13  227868         2.00.1       			  Modify to show Batch Summary per Bank
 * 2012/08/14  227868         2.00.1       			  Retrieve only Bank Accounts with Batches with statuses
 * 													  Open/Closed/Updating
 * 2012/09/05  232785         2.00.1       			  Set totalAmount to 0 if summary column value is null
 * 2012/09/05  232781         2.00.1       			  Set alignment of column headers to LEFT
 * 2013/02/28  243634         2.00.6                  Populate rows only if transCount > 0
 * 2013/09/26  263190 		  3.00.00				  Get total values from Batch record
 * 2013/10/05  265406 		  3.00.00				  Refactor code to use Payment File Administration record instead of Payment Batch
 */
var psg_ep;

if (!psg_ep)
    psg_ep = {};

function main(portlet, column) {
	var batchProcessor = new psg_ep.BatchProcessor();
	
	portlet.setTitle("Payment Batch List");
	portlet.addColumn('bank_account','text', 'Bank Account', 'LEFT');
	portlet.addColumn('batch_count','text', 'Number of Batches', 'LEFT');
	portlet.addColumn('trans_count','text', 'Number of Transactions', 'LEFT');
	portlet.addColumn('total_amount','currency', 'Total Amount', 'LEFT');
	portlet.addColumn('view', 'text', 'View Details', 'LEFT');
	
	var batchSearch = new _2663.Search('customrecord_2663_file_admin');
	batchSearch.addFilter('custrecord_2663_status', null, 'anyof', [BATCH_OPEN, BATCH_UPDATING, BATCH_PENDINGAPPROVAL]);
	batchSearch.addColumn('custrecord_2663_bank_account', null, 'group');

	var results = batchSearch.getAllResults();
	results.forEach(function(res) {
		var bankAccountId = res.getValue('custrecord_2663_bank_account', null, 'group');
		var batchResults = batchProcessor.getBatches(bankAccountId);
		if (batchResults.length > 0) {
			var bankURL = nlapiResolveURL('record', 'customrecord_2663_bank_details', bankAccountId);
			var url = nlapiResolveURL('suitelet', 'customscript_2663_batch_selection_main_s', 'customdeploy_2663_batch_selection_main_s');
			var transCount = 0;
			var totalAmount = 0;
	        batchResults.forEach(function(batch) {
        		transCount += parseInt(batch.getValue('custrecord_2663_total_transactions'), 10);
	        	totalAmount += parseFloat(batch.getValue('custrecord_2663_total_amount')) || 0;	
	        });
	        if (transCount > 0) {
	        	var row = {
    				bank_account: ['<a class="dottedlink" href="', bankURL, '">', res.getText('custrecord_2663_bank_account', null, 'group'), '</a>'].join(''),
    				batch_count: batchResults.length + '',
    				trans_count: transCount + '',
    				total_amount: nlapiFormatCurrency(totalAmount),
    				view: ['<a class="dottedlink" href="', url, '&custpage_2663_bank_acct_id=', bankAccountId,'">', 'View Details', '</a>'].join('')
    			};
    			portlet.addRow(row);	
	        }
		}
	});
}