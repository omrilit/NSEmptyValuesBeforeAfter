
//**********************************************************************CLIENT SIDE SCRIPTS DEPLOYED ON VENDOR BILL - STARTS HERE**********************************************//

//GLOBAL DECLARATIONS
var ITEM                     = 1;
var EXPENSE                  = 2;
var PENDING_APPROVAL         = 'pendingApproval';
var APPROVED                 = 'open';
var APPROVE_FLD              = 'statusRef';
var HEADER_CHANGE_FLDS       = objContext.getSetting('SCRIPT','custscript_svb_headerfld_changed');
var LINE_CHANGE_FLDS         = objContext.getSetting('SCRIPT','custscript_svb_linefld_changed');
var INTERCO_MANDATORY_FLDS   = objContext.getSetting('SCRIPT','custscript_svb_intco_mandatory_flds');
var NON_INTCO_MANDATORY_FLDS = objContext.getSetting('SCRIPT','custscript_svb_notintco_mandatory_flds');

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
* This script is deployed on the vendor bill record. 
* This script reset the field value to blank on make copy of vendorbill
* 
* @author Jaime Villafuerte III
* @version 1.0
*   
*/
function pageInit_SharedVendorBill_Client(type)
{
    if(type=='copy')
    {
        nlapiSetFieldValue('custbody_svb_vb_to_bell_dist_sched','',false,true);
        nlapiSetFieldValue('custbody_svb_allocation_journal','',false,true);
        nlapiSetFieldValue('custbody_svb_schedule_is_intercompany','F',false,true);
        nlapiSetFieldValue('custbody_svb_error_logs','',false,true);
        nlapiSetFieldValue('custbody_svb_sched_in_process','F',false,true);
    }
    
    return true;
}


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
* This script is deployed on the vendor bill record* 
* and prevent inventory items and amortization schedule lines to be set when bill distribution schedule is set.
*  
* @author Jaime Villafuerte III
* @version 1.0
* 
*/
function validateLine_CheckVBLineType(type)
{
    if(type!='item' && type!='expense')
    {
        return true;
    }
    
    var stBillDistribtn = nlapiGetFieldValue('custbody_svb_vb_to_bell_dist_sched'); 
       
    if(!stBillDistribtn)
    {
        return true;
    }
        
    var stItemAmortize = nlapiGetCurrentLineItemValue('item','amortizationsched');
    var stItemType     = nlapiGetCurrentLineItemValue('item','itemtype');
    var stExpAmortize  = nlapiGetCurrentLineItemValue('expense','amortizationsched');
    
    if(stItemType=='InvtPart')
    {
        alert('Inventory Item is not allowed to be entered if Bill Distribution Schedule is selected');
        return false;
    }
    
    if(stItemAmortize)
    {
        alert('Amortization Schedule is not allowed to be entered on the item line if Bill Distribution Schedule is selected');
        return false;
    }
    
    if(stExpAmortize)
    {
         alert('Amortization Schedule is not allowed to be entered on the expense line if Bill Distribution Schedule is selected');
         return false;
    }
    
    return true;
}



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
* This function is deployed to the vendor bill record
* This script is used to warn the user about the consequence of the recent changes on the line
* 
* @author Jaime Villafuerte III
* @version 1.0
* 
*/
function fieldChanged_WarnUserLineChange(type,name,line)
{
    if(name=='custbody_svb_schedule_is_intercompany')
    {
        var stBDS = nlapiGetFieldValue('custbody_svb_vb_to_bell_dist_sched');
        if(!stBDS) nlapiSetFieldValue('custbody_svb_schedule_is_intercompany','F',false,true);
    }
    
    if(name=='custcol_svb_bill_distr_exclude')
    {
        var isExclude = nlapiGetCurrentLineItemValue(type,name);
        var stAdjDetails = nlapiGetCurrentLineItemValue(type,'custcol_svb_dist_alloc_det_hidden');
        
        if(isExclude=='T' && stAdjDetails)
        {
            var isConfirmed = confirm("This line has recently adjusted its allocation.\n Excluding this line will remove the recently adjusted allocation and remove this from the allocation distribution.\n Click Ok to confirm \n Click Cancel to abort the changes'");
            (isConfirmed) ? nlapiSetCurrentLineItemValue(type,'custcol_svb_dist_alloc_det_hidden','',false,true) :
                            nlapiSetCurrentLineItemValue(type,'custcol_svb_bill_distr_exclude','F',false,true);        
        }
    }
    
    
    
    return true;
}



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
* This script is deployed on the vendor bill record
* This client side script is used to validate the adjust distribution suitelet
* 
* @author Jaime Villafuerte III
* @version 1.0
* 
*/
function validateField_BillDistributionChange(type,name,line)
{    
    if(name!='custbody_svb_vb_to_bell_dist_sched')
    {
        return true;
    }
    
    if(type=='item' || type=='expense')
    {
        return true;
    }
    
    var stBillDistribtn = nlapiGetFieldValue('custbody_svb_vb_to_bell_dist_sched'); 
    
    if(!stBillDistribtn)
    {
        return true;
    }
    
    var intItemCount = nlapiGetLineItemCount('item');
    var intExpCount = nlapiGetLineItemCount('expense');
    var isValid = true;
    
    for(var i=1; i<=intItemCount; i++)
    {
        var stItemType = nlapiGetLineItemValue('item','itemtype',i);
        var stItemAmortize = nlapiGetLineItemValue('item','amortizationsched',i);
        
        if(stItemType=='InvtPart' || stItemAmortize)
        {
            isValid = false;
            break;
        }
    }
    
    for(var i=1; isValid && i<=intExpCount; i++)
    {
        var stExpAmortize = nlapiGetLineItemValue('expense','amortizationsched',i);
        
        if(stExpAmortize)
        {
            isValid = false;
            break;
        }
    }
    
    if(!isValid)
    {
        alert('Bill Distribution Schedule cannot be set. Either the lines has inventory item type or amortization schedule is set');        
    }
    
    return isValid;
}



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
* This script is deployed on the vendor bill record
* This client side script alert the user to confirm the change in bill distribution and allocation journal entry
* 
* @author Jaime Villafuerte III
* @version 1.0
* 
*/
function saveRecord_ConfirmVBDistributionChange()
{
    if(nlapiGetRecordId())
    {
        var recBill      = nlapiLoadRecord(nlapiGetRecordType(),nlapiGetRecordId());
        var isChanged    = hasFieldChanges(recBill);        
        var stBDSIdOld   = recBill.getFieldValue('custbody_svb_vb_to_bell_dist_sched');
        var stBDSIdNew   = nlapiGetFieldValue('custbody_svb_vb_to_bell_dist_sched');
        var isBDSNullOut = false;
        
        //no need to show confirmation if bill distribution is changed from empty to a value
        if(!stBDSIdOld && stBDSIdNew)
        {
            return true;
        }
        
        //if bill distribution remains blank then no need to validate
        if(!stBDSIdOld && !stBDSIdNew)
        {
            return true;
        }
        
        //bill distribution is changed from a value to null
        if(stBDSIdOld && !stBDSIdNew)
        {
            isBDSNullOut = true;
        }
        
        if(isChanged)
        {
            var stAllocJrnl = nlapiGetFieldValue('custbody_svb_allocation_journal');
            var bProceed = null;
            
            if(stAllocJrnl)
            {
                bProceed = (isBDSNullOut) ? confirm('Warning : Removing the Bill Distribution Schedule will delete all the current distribution details and reverse the current alloction journal entry.\n Click Ok to confirm \n Click Cancel to abort the changes') :
                                            confirm('Warning : The changes on the transaction will trigger an update on the Bill Distribution Details and reverse the current alloction journal entry.\n Click Ok to confirm \n Click Cancel to abort the changes');                
            }
            else
            {
                bProceed = (isBDSNullOut) ? confirm('Warning : Removing the Bill Distribution Schedule will delete all the current distribution details.\n Click Ok to confirm \n Click Cancel to abort the changes') : 
                                            confirm('Warning: The changes on the transaction will trigger an update on the Bill Distribution Details.\n Click Ok to confirm \n Click Cancel to abort the changes');                      
            }            
            return bProceed;
        }
    }
    return true;
}

//**********************************************************************CLIENT SIDE SCRIPTS DEPLOYED ON VENDOR BILL - ENDS HERE**********************************************//