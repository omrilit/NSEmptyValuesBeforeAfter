/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */

/*
UE script before Load
Script to Grey out Delete button on following transactions

ESL Audit Trail Summary
ESL Audit Trail Detail
*/
function beforeLoadScript(type, form, request)
{
    var externalCall = false;
    var exempted = false;
    var str = "To maintain the information needed to audit this ESL submission, you cannot edit the ESL submission. For more information contact your accounting group or NetSuite Administrator.";

    if ((type == 'webservices') || ( type == 'csvimport') || ( type == 'scheduled') || ( type == 'suitelet') || (type == 'scriptdebugger') || (type == 'client')) { externalCall = true; }
    if ((type == 'copy') || ( type == 'print' ) || (type == 'email')) { exempted = true; }
    
    // Run this code when in view or edit... create is now included
    if ((!exempted)) 
	{
		if (request != null && request != undefined) 
		{
			//nlapiLogExecution('DEBUG', 'Pumasok sa !exempted');
			var rectypeid = request.getParameter('rectype');
			var parentid = request.getParameter('pi');
			if (type == "view") {
				// view
				if (form.getButton('new') != null) {
					form.removeButton('new');
				}
				if (form.getButton('edit') != null) {
					form.removeButton('edit');
				}
				if (form.getButton('copy') != null) {
					form.removeButton('copy');
				}
				form.setScript('customscript_esl_prevent_edit_cs');
			}
			if (type == "edit" || type == "create") {
				nlapiSetRedirectURL('SUITELET', 'customscript_eslauditlock_error', 'customdeploy_eslauditlock_error', null, {
					custpagerectypeid: rectypeid,
					custpageparentid: parentid
				});
			}
			var sublistObj = form.getSubList('recmachcustrecord_esl_reference_fld'); // remove the sublist buttons...
			if (sublistObj != null) {
				if (sublistObj.getButton('attach') != null) {
					sublistObj.removeButton('attach');
				}
				if (sublistObj.getButton('customize') != null) {
					sublistObj.removeButton('customize');
				}
				if (sublistObj.getButton('newrecrecmachcustrecord_esl_reference_fld') != null) {
					sublistObj.removeButton('newrecrecmachcustrecord_esl_reference_fld');
				}
			}
		}
	}
	//else {
		//nlapiLogExecution('DEBUG', 'Pumasok sa exempted');
		//nlapiLogExecution('DEBUG', 'request object => #'+request+'#');
	//}
    
    // If call from WS/SSS etc.
    if (externalCall)
    {
        var error = nlapiCreateError('1000', str);
        throw error;
    }

}

function beforeSubmitDLE(type)
{
    if (type == 'xedit')
    {
        // Determine if the transaction is of german or israeli sub
        var str = "To maintain the information needed to audit this ESL submission, you cannot edit the ESL submission. For more information contact your accounting group or NetSuite Administrator.";
        var error = nlapiCreateError('1000', str);
        throw error;
    }
}

function nsForm(request, response)
{
    var str = "<b>Warning :</b>To maintain the information needed to audit this ESL submission, you cannot edit the ESL submission. For more information contact your accounting group or NetSuite Administrator.";
    if (request.getMethod() == 'GET')
    {
        var rectypeid = request.getParameter('custpagerectypeid');
        var parentid = request.getParameter('custpageparentid');
        var context = nlapiGetContext();
        context.setSessionObject('custpagerectypeid', rectypeid);
        context.setSessionObject('custpageparentid', parentid);

        var form = nlapiCreateForm('NetSuite Info');
        var warning = form.addField('massupdatetypefield', 'longtext', ' ');
        warning.setDefaultValue(str);
        warning.setDisplayType('inline');

        var submitButton = form.addSubmitButton('Go Back');
        response.writePage(form);
    }
    else
    {
        var context = nlapiGetContext();
        var rectypeid = context.getSessionObject('custpagerectypeid');
        var parentid = context.getSessionObject('custpageparentid');
        if ( parentid != null && parentid != ''){ nlapiSetRedirectURL('record', 'customrecord_ecsl_audit_trail_hdr', parentid, false  ); }
        else { nlapiSetRedirectURL('tasklink', "LIST_CUST_"+rectypeid ); }
    }
}

function recmachcustrecord_esl_reference_fld_remove_record() { return false; }