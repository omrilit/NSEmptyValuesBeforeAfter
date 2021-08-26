/**
* Copyright (c) 1998-2014 NetSuite, Inc.
* 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
* All Rights Reserved.
* 
* This software is the confidential and proprietary information of
* NetSuite, Inc. ("Confidential Information"). You shall not
* disclose such Confidential Information and shall use it only in
* accordance with the terms of the license agreement you entered into
* with NetSuite.
* 
* This script is deployed as a scheduled script 
* This script is used to process shared vendor bill allocation when the usage is greater than its limit
* 
* @author Jaime Villafuerte III
* @version 1.0
* 
*/
function scheduled_SharedVendorBill_Main()
{
    nlapiLogExecution('DEBUG','scheduled_SharedVendorBill_Main','******************************SCHEDULE STARTED********************************');
    
    var type         = nlapiGetContext().getSetting('SCRIPT','custscript_svb_opt_type');
    var stVBId       = nlapiGetContext().getSetting('SCRIPT','custscript_svb_internal_id');
    var isVBChanged  = nlapiGetContext().getSetting('SCRIPT','custscript_svb_internal_id');
    var stPrevStatus = nlapiGetContext().getSetting('SCRIPT','custscript_svb_prev_status');
    var arrAllocJE   = nlapiGetContext().getSetting('SCRIPT','custscript_svb_alloc_je_on_vb');
        arrAllocJE   = (arrAllocJE) ? JSON.parse(arrAllocJE) : null;
    nlapiLogExecution('DEBUG','Scheduled Script Parameters','stVBId=' + stVBId + ' isVBChanged=' + isVBChanged + ' stPrevStatus=' + stPrevStatus + ' arrAllocJE=' + arrAllocJE);    
    
    var recBill = (type!='delete') ? nlapiLoadRecord('vendorbill',stVBId) : null;
    mainSVBProcess('scheduled',type,stVBId,recBill,isVBChanged,stPrevStatus,arrAllocJE);
    
    nlapiLogExecution('DEBUG','scheduled_SharedVendorBill_Main','******************************SCHEDULE FINISHED********************************');
}