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
 * 1.00       17 Jan 2014     ieugenio
 * 
 */

    var FLD_DT_ORIGN    = 'custrecord_ie_origin';
    var PARAM_ORIGIN    = 'custpage_origin';
    
    var SCRIPT_SUITELET_WIN_CLOSE = 'customscript_ie_window_closer_sl';
    var DEPLOY_SUITELET_WIN_CLOSE = 'customdeploy_ie_window_closer_sl';
/**
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @return {void}
 */
function setOriginBeforeLoad(type, form, request) {
    var sOrigin = request.getParameter(PARAM_ORIGIN);
    if (type == 'view' || type == 'edit') {
        if (sOrigin) {
            nlapiSetFieldValue(FLD_DT_ORIGN, sOrigin);
        }
    }
}

/**
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @return {void}
 */
function checkOriginAfterSubmit(type) {
    var sOrigin = nlapiGetFieldValue(FLD_DT_ORIGN);
    nlapiLogExecution('DEBUG', 'sOrigin', sOrigin);
    if (type == 'create' || type == 'edit') {
        if (sOrigin=='tile') {
            nlapiSetRedirectURL('SUITELET', SCRIPT_SUITELET_WIN_CLOSE, DEPLOY_SUITELET_WIN_CLOSE);
        }
    }
}
