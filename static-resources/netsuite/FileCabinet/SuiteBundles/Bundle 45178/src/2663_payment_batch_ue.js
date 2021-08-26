/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * Revision History:
 * 
 * Date        Fixed Issue    Broken in QA Bundle     Issue Fix Summary
 * =============================================================================================
 * 2013/09/19  263190 		  3.00.00				  Initial version
 * 2013/09/27  263190 		  3.00.00				  Add custpage_2663_edit_mode parameter
 */

var _2663 = _2663 || {};

function beforeLoad(type) {
	var params = {'custpage_2663_batchid': nlapiGetRecordId(), 'custpage_2663_edit_mode': type == 'edit' ? 'T' : 'F'};
	nlapiSetRedirectURL('SUITELET', 'customscript_2663_batch_selection_ap_s', 'customdeploy_2663_batch_selection_ap_s', false, params);
}