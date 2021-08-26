/**
 * Copyright NetSuite, Inc. 2014 All rights reserved. 
 * The following code is a demo prototype. Due to time constraints of a demo,
 * the code may contain bugs, may not accurately reflect user requirements 
 * and may not be the best approach. Actual implementation should not reuse 
 * this code without due verification.
 * 
 * (Module description here. Whole header length should not exceed 
 * 100 characters in width. Use another line if needed.)
 * 
 * Version    Date            Author           Remarks
 * 1.00       27 Jan 2014     ieugenio
 * 
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @return {void}
 */
function sampleRunnerScheduled(type) {
    var oContext = nlapiGetContext();
    var sScriptParam = oContext.getSetting('SCRIPT', 'custscript_ie_dashboard_tile');
    nlapiLogExecution('DEBUG', 'sScriptParam', sScriptParam);
}
