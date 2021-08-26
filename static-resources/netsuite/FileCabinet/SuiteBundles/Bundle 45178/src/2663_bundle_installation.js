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
 * 2011/09/20  205347         1.10                    Set subsidiaries of older Payment File Admin
 *                                                    records (OW account only)
 * 2012/03/08  217041         GPM Beta - 1.19.2       Support selective update for payment file
 *                                                    formats
 * 2013/04/15  248888   	  2.00.12				  Run scheduled script to update Batch Processing settings
 * 2013/04/15  25432   	  	  2.00.12				  Remove scheduled script to update Batch Processing settings
 * 													  Run scheduled script to update Vendor/Employee records
 * 2013/08/23  260978   	  2.00.24				  Remove scheduled script to update Vendor/Employee records
 * 2013/08/29  250004   	  2.00.24				  Create queue settings record from exist xml settings
 * 2013/09/03  262132     	  2.00.25				  Update parent deployment on default queue setting
 * 2013/12/18  273283    	  2.01.00				  Remove function updateQueueSettings
 * 2014/05/19  273487         3.00.3       			  Remove function updatePaymentFileAdminSubs
 * 													  Update queue setting with batch processing deployment
 */

/**
 * 1) Store inactive format ids in temporary file
 *  
 * @param {Object} fromversion
 * @param {Object} toversion
 */
function beforeUpdate(fromversion, toversion) {
    nlapiLogExecution('debug', '[ep] Bundle Installation-beforeUpdate', 'Initialize inactive format list...');
    var tempFileId = (new _2663.FormatUpdater()).StoreInactiveFormats(fromversion);
    nlapiLogExecution('debug', '[ep] Bundle Installation-beforeUpdate', 'Created inactive format temp file: ' + tempFileId);
}

/**
 * 1) Update Payment File Administration record subsidiaries
 * 2) Initialize native and non-native file formats
 * 3) Set previously inactive formats as inactive in updated version
 * 
 * @param {Object} fromversion
 * @param {Object} toversion
 */
function afterUpdate(fromversion, toversion) {
    nlapiLogExecution('debug', '[ep] Bundle Installation-afterUpdate', 'Initialize payment file formats...');
    var formatUpdater = new _2663.FormatUpdater();
    var numFormatsInitialized = formatUpdater.InitializeFileFormats();
    nlapiLogExecution('debug', '[ep] Bundle Installation-afterUpdate', 'Number of initialized formats: ' + numFormatsInitialized);
    nlapiLogExecution('debug', '[ep] Bundle Installation-afterUpdate', 'Reset inactive formats...');
    var updatedInactiveFormatCount = formatUpdater.ResetInactiveFormats(fromversion);
    nlapiLogExecution('debug', '[ep] Bundle Installation-afterUpdate', 'Number of updated inactive formats: ' + updatedInactiveFormatCount);
    
    // update default queue mangagement settings
    var defaultQueueSetting = (nlapiSearchRecord('customrecord_2663_queue_settings', null, new nlobjSearchFilter('custrecord_2663_qs_default', null, 'is', 'T')) || [])[0];
    if (defaultQueueSetting) {
    	nlapiSubmitField('customrecord_2663_queue_settings', defaultQueueSetting.getId(), 'custrecord_2663_qs_batch_deployment', EP_ONDEMANDBATCH_DEPLOY);
    }
}