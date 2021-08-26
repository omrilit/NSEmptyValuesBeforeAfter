/**
 * Copyright (c) 1998-2016 NetSuite, Inc.
 * 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
 * All Rights Reserved.
 * 
 * This software is the confidential and proprietary information of
 * NetSuite, Inc. ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with NetSuite.
 * 
 * Disabled editing of the due date and term fields if there is a CI associated
 * to the invoice
 * 
 * 
 * Version    Date            Author           Remarks
 * 1.00       11 Mar 2016     pdeleon	Initial version.
 * 
 */

/**
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @return {void}
 */
function consolidatedInvoicing_beforeLoad(type, form, request) {
    var context = nlapiGetContext();
    if(context.getExecutionContext()!='userinterface')
    {
        return;
    }
    
    if (type == 'edit') {
        var objCISetup = getCISetup(true);
        var stCINum = nlapiGetFieldValue(FLD_CUSTBODY_NSTS_CI_NUMBER);
        
        if (!isEmpty(objCISetup) && objCISetup.updateDueDate == 'T' && !isEmpty(stCINum)) {
            form.getField('duedate').setDisplayType('disabled');
            form.getField('terms').setDisplayType('disabled');
        }
    } if (type == 'copy') {
        nlapiSetFieldValue(FLD_CUSTBODY_NSTS_CI_NUMBER, "");
    }
}

/**
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @return {void}
 */
function consolidatedInvoicing_beforeSubmit(type) {
    var context = nlapiGetContext();
    if(context.getExecutionContext()!='userinterface')
    {
        return;
    }
    
    
    if ((type == 'edit' || type == 'xedit')) {
        var objCISetup = getCISetup(true);
        var stCINum = nlapiGetFieldValue(FLD_CUSTBODY_NSTS_CI_NUMBER);
        var recNew = nlapiGetNewRecord();
        var recOld = nlapiGetOldRecord();
        var stNewDueDate = recNew.getFieldValue('duedate');
        var stNewTerm = recNew.getFieldValue('terms');
        
        var blCINumCheck = false;
        if (type == 'xedit') {
            recOld = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
            var stOldCINum = recOld.getFieldValue(FLD_CUSTBODY_NSTS_CI_NUMBER);
            
            if ((stCINum == null && !isEmpty(stOldCINum)) ||
                    (stCINum != null && !isEmpty(stOldCINum) && stCINum != stOldCINum)) {
                blCINumCheck = true;
            }
        } else {
            var stOldCINum = recOld.getFieldValue(FLD_CUSTBODY_NSTS_CI_NUMBER);
            if (!isEmpty(stOldCINum) && !isEmpty(stCINum)) {
                blCINumCheck = true;
            }
        }
        
        if (!(type == 'xedit' && stNewDueDate == null && stNewTerm == null) && 
                !isEmpty(objCISetup) && objCISetup.updateDueDate == 'T' && blCINumCheck) {
            var stOldDueDate = recOld.getFieldValue('duedate');
            var stOldTerm = recOld.getFieldValue('terms');
            
            if (stOldDueDate != stNewDueDate || stOldTerm != stNewTerm) {
                throw nlapiCreateError("Error", "Due date and Terms is not allowed for Invoices that have been consolidated.", true);
            }
        }
    }
}
