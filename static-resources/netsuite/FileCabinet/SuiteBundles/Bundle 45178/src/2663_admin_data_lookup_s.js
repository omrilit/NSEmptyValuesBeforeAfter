/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * @author mcadano
 */

/**
 * Revision History:
 * 
 * Date        Fixed Issue    Broken in QA Bundle     Issue Fix Summary
 * =============================================================================================
 * 2014/03/26  219964         3.00.00                 Initial version
 */

/**
 * Executes nlapiLookupField as Administrator.
 * Supports only single field lookup.
 * 
 * @param request
 * @param response
 */
function main(request, response) {
	// restrict supported types based on EP requirements
	var supportedTypes = ['partner'];
	var recType = request.getParameter('custparam_2663_rec_type');
	var recId = request.getParameter('custparam_2663_rec_id');
	var fldName = request.getParameter('custparam_2663_fld_name');
	var isText = request.getParameter('custparam_2663_is_text') == 'true'; 
	
	if (supportedTypes.indexOf(recType) > -1) {
		var returnVal = nlapiLookupField(recType, recId, fldName, isText);
	} else {
		throw nlapiCreateError('EP_INVALID_RECORD_TYPE', ['custparam_ep_rec_type parameter', recType, 'is not supported.' ].join(' '), true);
	}
	
    response.write(returnVal || '');
}