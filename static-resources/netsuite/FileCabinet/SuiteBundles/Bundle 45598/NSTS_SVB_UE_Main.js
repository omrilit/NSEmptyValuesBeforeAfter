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
* @author Jaime Villafuerte III
* @version 1.0
* 
* This shared vendor bill solution supports distribution of the amounts 
* for the expense lines or for item lines (such as service items) across either 
*     a) Multiple subsidiaries, in the intercompany scenario or 
*     b) Multiple departments within a subsidiary. 
* The journal entries is created in accordance with this distribution 
* and the journal entry for each of these distribution lines will be linked back to the vendor bill.
* 
*/
var ITEM             = 1;
var EXPENSE          = 2;
var PENDING_APPROVAL = 'pendingApproval';
var APPROVED         = 'open';
var APPROVE_FLD      = 'statusRef';
var IS_INTERCO       = false;

//**********************************************************************USER EVENT SCRIPTS DEPLOYED ON VENDOR BILL - STARTS HERE**********************************************//

function afterSubmit_SharedVendorBill_Main(type)
{
    //allow only create, edit, delete and cancel
    if(type!='create'  && 
       type!='edit'    && 
       type!='delete'  && 
       type!='approve' && 
       type!='cancel')
    {
        return;
    }
    
    //do not execute suitelet and scheduled script for this script
    var stExecType = nlapiGetContext().getExecutionContext();
    if(stExecType=='suitelet' || stExecType=='scheduled')
    {
        return;
    }
    
    var stMainLog = 'afterSubmit_SharedVendorBill_Main';
    var recBill   = (type=='delete') ? nlapiGetOldRecord() : nlapiLoadRecord(nlapiGetRecordType(),nlapiGetRecordId());
    var stBDS     = (type=='delete') ? recBill.getFieldValue('custbody_svb_vb_to_bell_dist_sched') : nlapiGetFieldValue('custbody_svb_vb_to_bell_dist_sched');
    
    //check on the vendor bill if something has been changed to retrigger the allocation
    var isVBChanged = (type=='edit') ? hasFieldChanges(null) : false;
    
    //get the current and previous status of the vendor bill
    var stPrevStatus = (type=='edit') ? nlapiGetOldRecord().getFieldValue(APPROVE_FLD) : null;
    var stCurrentStatus = recBill.getFieldValue(APPROVE_FLD);
    
    //consider the action cancel as delete
    if(stCurrentStatus=='cancelled') type = 'delete';
    
    //set the limit usage fields
    var USAGE_ESTIMATE = 0;
    var LIMIT = 900;
    var bTriggerAllocation = false;
    
    //usage variable declaration
    var CREATE_DISTRIBUTION_USAGE     = 0;
    var DELETE_DISTRIBUTION_USAGE     = 0;
    var CREATE_ALLOCATION_JE_USAGE    = 0;
    var REVERSE_ALLOCATION_JE_USAGE   = 0;
    var UPDATE_VB_ALLOCATION_JE_USAGE = 0;
    
    if(stBDS && (type!='delete'))
    {
        //enter this condition if the bill is on create or on edit (with a change that affects the allocation) or on approve
        var intAllLineCount = getAllLinesForAllocation(recBill);//item + expense
        var arrDSL          = getDistributionScheduleLine(stBDS); // 10 usage units
        var intSubsCount    = arrDSL.length;
        
        //set the values for the usage for each action
        CREATE_DISTRIBUTION_USAGE     = intSubsCount * intAllLineCount * 6; //create api = 2 + submit api = 4 = 6
        DELETE_DISTRIBUTION_USAGE     = intSubsCount * intAllLineCount * 4; //delete api = 4
        CREATE_ALLOCATION_JE_USAGE    = intSubsCount * 30; // create api = 10 + submit api = 20
        REVERSE_ALLOCATION_JE_USAGE   = intSubsCount * 10; // update api = 10
        UPDATE_VB_ALLOCATION_JE_USAGE = 10;
        
        if(type=='create')
        {
            USAGE_ESTIMATE = (stCurrentStatus==APPROVED) ? CREATE_DISTRIBUTION_USAGE + CREATE_ALLOCATION_JE_USAGE + UPDATE_VB_ALLOCATION_JE_USAGE :
                                                           CREATE_DISTRIBUTION_USAGE;
            bTriggerAllocation = true;
            nlapiLogExecution('DEBUG',stMainLog,'Executing on Create');
        }
        else if((type=='edit' || type=='approve') && stPrevStatus!=APPROVED && stCurrentStatus==APPROVED)
        {
            USAGE_ESTIMATE = (isVBChanged) ? CREATE_DISTRIBUTION_USAGE  + DELETE_DISTRIBUTION_USAGE + CREATE_ALLOCATION_JE_USAGE + REVERSE_ALLOCATION_JE_USAGE + UPDATE_VB_ALLOCATION_JE_USAGE :
                                             CREATE_ALLOCATION_JE_USAGE + UPDATE_VB_ALLOCATION_JE_USAGE;
            bTriggerAllocation = true;
            type = 'approve';
            nlapiLogExecution('DEBUG',stMainLog,'Executing on Approve');
        }
        else if(type=='edit' && nlapiGetOldRecord().getFieldValue('custbody_svb_vb_to_bell_dist_sched') && nlapiGetOldRecord().getFieldValue('custbody_svb_vb_to_bell_dist_sched') != recBill.getFieldValue('custbody_svb_vb_to_bell_dist_sched'))
        {            
            var arrDistDetails = getBillDistributionDetails(recBill.getId());
            var arrOldAllocJE = nlapiGetOldRecord().getFieldValues('custbody_svb_allocation_journal');
            var arrJECount = (arrOldAllocJE) ? arrOldAllocJE.length : 0;
            
            //override the calculation of distribution details
            DELETE_DISTRIBUTION_USAGE = (arrDistDetails) ? arrDistDetails.length * 4 : 0;
            REVERSE_ALLOCATION_JE_USAGE = arrJECount * 10;
            
            USAGE_ESTIMATE = (stCurrentStatus==APPROVED) ? CREATE_DISTRIBUTION_USAGE + DELETE_DISTRIBUTION_USAGE + CREATE_ALLOCATION_JE_USAGE + REVERSE_ALLOCATION_JE_USAGE + UPDATE_VB_ALLOCATION_JE_USAGE:
                                                           CREATE_DISTRIBUTION_USAGE + DELETE_DISTRIBUTION_USAGE;
            bTriggerAllocation = true;
            nlapiLogExecution('DEBUG',stMainLog,'Executing on Change of Bill Distribution Schedule');
        }
        else if(type=='edit' && isVBChanged)
        {
            USAGE_ESTIMATE = (stCurrentStatus==APPROVED) ? CREATE_DISTRIBUTION_USAGE + DELETE_DISTRIBUTION_USAGE + CREATE_ALLOCATION_JE_USAGE + REVERSE_ALLOCATION_JE_USAGE + UPDATE_VB_ALLOCATION_JE_USAGE :
                                                           CREATE_DISTRIBUTION_USAGE + DELETE_DISTRIBUTION_USAGE;
            bTriggerAllocation = true;
            nlapiLogExecution('DEBUG',stMainLog,'Executing on Change');
        }
    }
    else if(type=='edit' && (nlapiGetOldRecord().getFieldValue('custbody_svb_vb_to_bell_dist_sched') && !stBDS))
    {
        //enter this condition when the bill distribution schedule header field has been nulled out.
        stBDS = nlapiGetOldRecord().getFieldValue('custbody_svb_vb_to_bell_dist_sched');
        var arrDSL = recBill.getFieldValues('custbody_svb_allocation_journal');
        var arrDistDetails = getBillDistributionDetails(recBill.getId());
        
        DELETE_DISTRIBUTION_USAGE     = (arrDistDetails) ? arrDistDetails.length * 4 : 0;
        REVERSE_ALLOCATION_JE_USAGE   = (arrDSL) ? arrDSL.length * 10 : 0;
        UPDATE_VB_ALLOCATION_JE_USAGE = 10;
        
        USAGE_ESTIMATE = DELETE_DISTRIBUTION_USAGE + REVERSE_ALLOCATION_JE_USAGE + UPDATE_VB_ALLOCATION_JE_USAGE;
        bTriggerAllocation = true;
        nlapiLogExecution('DEBUG',stMainLog,'Executing on remove of Bill Distribution Schedule');
    }
    else if((type=='delete') && stBDS)
    {
        //enter this condition if the bill is on delete or cancel
        var arrDSL = nlapiGetOldRecord().getFieldValues('custbody_svb_allocation_journal');// 10 usage units
        var arrDistDetails = getBillDistributionDetails(recBill.getId());
        
        DELETE_DISTRIBUTION_USAGE     = (arrDistDetails) ? arrDistDetails.length * 4 : 0;
        REVERSE_ALLOCATION_JE_USAGE   = (arrDSL) ? arrDSL.length * 10 : 0;
        UPDATE_VB_ALLOCATION_JE_USAGE = 10;
        
        USAGE_ESTIMATE = DELETE_DISTRIBUTION_USAGE + REVERSE_ALLOCATION_JE_USAGE + UPDATE_VB_ALLOCATION_JE_USAGE;
        bTriggerAllocation = true;
        nlapiLogExecution('DEBUG',stMainLog,'Executing on Delete or Cancel');
    }
    nlapiLogExecution('DEBUG',stMainLog,'bTriggerAllocation=' + bTriggerAllocation + ' USAGE_ESTIMATE=' + USAGE_ESTIMATE);
    
    //get the current allocation JE on the vendor bill
    var arrAllocJE = recBill.getFieldValues('custbody_svb_allocation_journal');
    nlapiLogExecution('DEBUG',stMainLog,'arrAllocJE=' + arrAllocJE);
    
    //forward the processing to scheduled script based on this condition
    if(bTriggerAllocation && USAGE_ESTIMATE > LIMIT)
    {
       if(type!='delete') nlapiSubmitField('vendorbill',recBill.getId(),'custbody_svb_sched_in_process','T');
       
       var stAllocJE = (arrAllocJE) ? JSON.stringify(arrAllocJE) : null;
       nlapiLogExecution('DEBUG',stMainLog,'stAllocJE=' + stAllocJE);
       
       var arrParam = [];
           arrParam['custscript_svb_opt_type']       = type;
           arrParam['custscript_svb_internal_id']    = recBill.getId();
           arrParam['custscript_svb_is_changed']     = isVBChanged;
           arrParam['custscript_svb_prev_status']    = stPrevStatus;
           arrParam['custscript_svb_alloc_je_on_vb'] = stAllocJE;
       
       var status = nlapiScheduleScript('customscript_svb_bill_main_schedule','customdeploy_svb_bill_main_schedule',arrParam);
       nlapiLogExecution('DEBUG','Scheduled Script Called','Scheduled Script Queue Status= ' + status);
       
       var arrParam = [];
           arrParam['custscript_svb_vb_id'] = recBill.getId();
           arrParam['custscript_svb_oper_type'] = type;
       nlapiSetRedirectURL('SUITELET','customscript_svb_sched_proc_info_page','customdeploy_svb_sched_proc_info_page',null,arrParam);
    }
    else if(bTriggerAllocation)
    {
        mainSVBProcess('userinterface',type,recBill.getId(),recBill,isVBChanged,stPrevStatus,arrAllocJE);
    }
    else
    {
        nlapiLogExecution('DEBUG',stMainLog,'No  Shared Vendor Bill Distribution Allocation ');
    }
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
* This script is deployed on Vendor Bill record. 
* This script set line numbers to link the distribution details line numbers 
* and prevent inventory items and amortization schedule lines to be set when bill distribution schedule is set.
* 
* @author Jaime Villafuerte III
* @version 1.0
* 
*/
function beforeSubmit_SetLineNos(type)
{
    nlapiLogExecution('DEBUG','Operation Type','type=' + type);
    
    if(type!='create' && type!='edit')
    {
        return true;
    }
    
    var stExecType = nlapiGetContext().getExecutionContext();
    
    if(stExecType=='suitelet')
    {
        return;
    }
    
    var recVB            = nlapiGetNewRecord();
    var recOldVB         = nlapiGetOldRecord();
    var intItemLines     = recVB.getLineItemCount('item');
    var intExpLines      = recVB.getLineItemCount('expense');
    var stBillDistribtn  = recVB.getFieldValue('custbody_svb_vb_to_bell_dist_sched');
    var hasInvtyItems    = false;
    var hasAmortize      = false;
    var arrAmortItmLines = [];
    var arrInvtyLines    = [];
    var arrAmortExpLines = [];
    var stErrMessage     = 'This record cannot be saved.\n';
        stErrMessage    += 'If bill distribution is entered, item and expense lines should not include inventory items or amortization schedule.\n';
    var hasError         = false;
    var isChanged        = (recOldVB && (recVB.getFieldValue('custbody_svb_vb_to_bell_dist_sched') != recOldVB.getFieldValue('custbody_svb_vb_to_bell_dist_sched'))) ? true : false;
    
    for(var i=1; i<=intItemLines; i++)
    {
        recVB.setLineItemValue('item','custcol_svb_vend_bill_lineno',i,i);
        var stAmortize = recVB.getLineItemValue('item','amortizationsched',i);
        var stItemType = recVB.getLineItemValue('item','itemtype',i);
        
        //push the value to inventory array
        if(stItemType=='InvtPart') arrInvtyLines.push(i);
        
        //push the value to amortization array
        if(stAmortize) arrAmortItmLines.push(i);
        
        //remove the recently adjusted lines if there is a change from intercompany to non-intercompany
        if(isChanged) recVB.setLineItemValue('item','custcol_svb_dist_alloc_det_hidden',i,'');
    }
    
    for(var i=1; i<=intExpLines; i++)
    {
        recVB.setLineItemValue('expense','custcol_svb_vend_bill_lineno',i,i);
        var stAmortize = recVB.getLineItemValue('expense','amortizationsched',i);
        
        //push the value to amortization array
        if(stAmortize) arrAmortExpLines.push(i);
        
        //remove the recently adjusted lines if there is a change from interco to non-interco
        if(isChanged) recVB.setLineItemValue('expense','custcol_svb_dist_alloc_det_hidden',i,'');
    }
    
    var stExecType = nlapiGetContext().getExecutionContext();
    
    if(stBillDistribtn) //&& stExecType!='userinterface')
    {
        //check if there are inventory items and amortization templates on item and expense lines
        if(arrInvtyLines.length > 0)
        {
            stErrMessage += 'Item Line nos : ' + arrInvtyLines.join(', ') + ' is/are Inventory Item.\n';
            hasError = true;
        }
        
        if(arrAmortItmLines.length > 0)
        {
            stErrMessage += 'Item Line nos : ' + arrAmortItmLines.join(', ') + ' has/have Amortization Schedule.\n';
            hasError = true;
        }
        
        if(arrAmortExpLines.length > 0)
        {
            stErrMessage += 'Expense Line nos : ' + arrAmortExpLines.join(', ') + ' has Amortization Schedule.\n';
            hasError = true;
        }
        
        if(hasError)
        {
            throw nlapiCreateError('Error',stErrMessage,true);
        }
    }
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
* This script is deployed on Vendor Bill record. 
* This script reset the field value to blank on make copy of vendorbill
* 
* @author Jaime Villafuerte III
* @version 1.0
* 
*/
function beforeLoad_AdjustDistributionRecord(type,form,request)
{
    nlapiLogExecution('DEBUG','beforeLoad_AdjustDistributionRecord','type=' + type);
    
    if(type!='view' && type!='copy')
    {
        return;
    }
    
    if(type=='copy')
    {
        var intItemCount = nlapiGetLineItemCount('item');
        var intExpCount  = nlapiGetLineItemCount('expense');
        
        for(var i=1; i<=intItemCount; i++)
        {
            nlapiSetLineItemValue('item','custcol_svb_dist_alloc_det_hidden',i,'');
        }
        
        for(var i=1; i<=intExpCount; i++)
        {
            nlapiSetLineItemValue('expense','custcol_svb_dist_alloc_det_hidden',i,'');
        }
    }
    else
    {
        var bIsSchedule = nlapiGetFieldValue('custbody_svb_sched_in_process');
        
        if(bIsSchedule=='T')
        {
            return;
        }
        
        //create Recreate Allocation JE button when there is an error
        var stErrLogs = nlapiGetFieldValue('custbody_svb_error_logs');
        
        if(stErrLogs)
        {
            var RECREATE_ALLOCJE_URL = nlapiResolveURL('SUITELET', 'customscript_svb_recreate_alloc_je', 'customdeploy_svb_recreate_alloc_je') + '&custpage_svb_id=' + nlapiGetRecordId();
            form.addButton("custpage_recreate_allocje", "Re-Create Allocation JE", "document.location='" + RECREATE_ALLOCJE_URL + "'");
        }
        //else
        //{
        var stStatus    = nlapiGetFieldValue(APPROVE_FLD);
        var stBDS       = nlapiGetFieldValue('custbody_svb_vb_to_bell_dist_sched');
        var stBillRefId = nlapiGetFieldValue('transactionnumber');
        var stPeriod    = nlapiGetFieldValue('postingperiod');
        
        if(stStatus!=APPROVED && stStatus!=PENDING_APPROVAL)
        {
            return;
        }
        
        if(!stBDS)
        {
            return;
        }
        
        var arrColumn = [new nlobjSearchColumn('closed')];
        var arrFilter = [new nlobjSearchFilter('internalid',null,'anyof',stPeriod)];
        var arrResult = nlapiSearchRecord('accountingperiod',null,arrFilter,arrColumn);
        
        if(!arrResult)
        {
            return;
        }
        
        var isClosedPeriod = arrResult[0].getValue('closed');
        nlapiLogExecution('DEBUG','beforeLoad_AdjustDistributionRecord','isClosedPeriod=' + isClosedPeriod);
        
        if(isClosedPeriod=='T')
        {
            return;
        }
        
        var arrDistDetails = getBillDistributionDetails(nlapiGetRecordId());
        
        if(!arrDistDetails)
        {
            return;
        }
        
        var ADJUST_DISTR_URL = nlapiResolveURL('SUITELET', 'customscript_svb_adj_distr_suitelet', 'customdeploy_svb_adj_distr_suitelet') + '&custpage_svb_id=' + nlapiGetRecordId() + '&custpage_svb_ref_id=' + stBillRefId;
        form.addButton("custpage_adjust_distr", "Adjust Distribution", "window.open('" + ADJUST_DISTR_URL + "', 'adjust', 'resizable=1,scrollbars=1,menubar=0,location=0,status=1,toolbar=0,width=2500,height=800');win.focus();");
        //}
    }
}

//**********************************************************************USER EVENT SCRIPTS DEPLOYED ON VENDOR BILL - ENDS HERE**********************************************//