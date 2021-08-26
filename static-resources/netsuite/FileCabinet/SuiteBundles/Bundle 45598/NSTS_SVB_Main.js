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
var ITEM                     = 1;
var EXPENSE                  = 2;
var PENDING_APPROVAL         = 'pendingApproval';
var APPROVED                 = 'open';
var APPROVE_FLD              = 'statusRef';
var objContext               = nlapiGetContext();
var HEADER_CHANGE_FLDS       = objContext.getSetting('SCRIPT','custscript_svb_headerfld_changed');
var LINE_CHANGE_FLDS         = objContext.getSetting('SCRIPT','custscript_svb_linefld_changed');
var INTERCO_MANDATORY_FLDS   = objContext.getSetting('SCRIPT','custscript_svb_intco_mandatory_flds');
var NON_INTCO_MANDATORY_FLDS = objContext.getSetting('SCRIPT','custscript_svb_notintco_mandatory_flds');
var SUPPORTED_ITEM_TYPE      = objContext.getSetting('SCRIPT','custscript_svb_supp_item_type');
var IS_INTERCO               = false;

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
    var stCurrentStatus  = recBill.getFieldValue(APPROVE_FLD);
    //var stOrderStatus = recBill.getFieldValue('statusRef');
    
    //consider the action cancel as delete
    if(stCurrentStatus=='cancelled') type = 'delete';
    
    //set the limit usage fields
    var USAGE_ESTIMATE = 0;
    var LIMIT = 10;
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
            var stOldBDS = nlapiGetOldRecord().getFieldValue('custbody_svb_vb_to_bell_dist_sched');
            var arrDistDetails = getBillDistributionDetails(stOldBDS);
            
            //override the calculation of distribution details
            DELETE_DISTRIBUTION_USAGE = (arrDistDetails) ? arrDistDetails.length * 4 : 0;  
            
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
        stBDS = nlapiGetOldRecord().getFieldValue('custbody_svb_vb_to_bell_dist_sched');
        var arrDSL = getDistributionScheduleLine(stBDS);
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
        var arrDSL = getDistributionScheduleLine(stBDS); // 10 usage units
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


//main function to process distribution and allocation
function mainSVBProcess(trigger,type,stVBId,recBill,isVBChanged,stPrevStatus,arrAllocJE)
{
    try
    {
        nlapiLogExecution('DEBUG','mainSVBProcess','******************************STARTED********************************');
        
        //set to boolean if passed from scheduled script as string
        isVBChanged          = (isVBChanged=='true' || isVBChanged==true) ? true : false;
        var stBillId         = stVBId;
        var stCurrentStatus  = null;
        var stBDS            = null;
        var stSharedAllocJnl = null;
        var IS_INTERCO       = null;
        
        if(recBill)
        {
            stCurrentStatus  = recBill.getFieldValue(APPROVE_FLD);
            stBDS = recBill.getFieldValue('custbody_svb_vb_to_bell_dist_sched');                        
            IS_INTERCO = recBill.getFieldValue('custbody_svb_schedule_is_intercompany');
            nlapiLogExecution('DEBUG','mainSVBProcess','IS_INTERCO=' + IS_INTERCO);
        }
        
        //if operation type is on create, edit, delete and cancel
        if(type=='create' || type=='edit' || type=='delete' || type=='cancel' || type=='approve')
        {
            //delete if there are distribution details
            if(type!='approve') deleteDistributionDetails(stBillId,'delete'); //4 usage units
            
            //reverse allocation journal
            if (arrAllocJE)
            {
                if(type!='delete') nlapiSubmitField('vendorbill',stBillId,'custbody_svb_allocation_journal',''); //10 usage units
                var arrAllocJrnl = (type=='delete') ? arrAllocJE : recBill.getFieldValues('custbody_svb_allocation_journal');                
                reverseAllocJournalEntry(arrAllocJrnl);                
            }
            
            //exit right away if operation type is on delete or cancel
            if(type=='delete' || type=='cancel')
            {
                nlapiLogExecution('DEBUG','mainSVBProcess - Operation Delete','******************************FINISHED********************************');
                return;
            }
            
            //exit, if the value of the bill distribution schedule is nulled out.
            if (!stBDS)
            {
                nlapiSubmitField('vendorbill',stBillId,'custbody_svb_sched_in_process','F');
                nlapiLogExecution('DEBUG','NO Bill Distribution Scheduled Exists','******SCRIPT EXIT*****');
                return;
            }
            
            if(type!='approve')
            {
                var arrDSL = getDistributionScheduleLine(stBDS); // 10 usage units    
            
                //process each item line
                processBillDistribution(recBill,ITEM,arrDSL);
                
                //process each expense line
                processBillDistribution(recBill,EXPENSE,arrDSL);
            }            
        }
        
        //ACTION - APPROVE: create journal entry when vendor bill gets approved
        if((type=='create' && stCurrentStatus==APPROVED) || 
           (type=='edit'   && stCurrentStatus==APPROVED && stPrevStatus!=APPROVED) || 
           (type=='edit'   && stCurrentStatus==APPROVED) || 
           (type=='approve')
          )
        {
            if(!stBDS)
            {
                nlapiLogExecution('DEBUG','NO Bill Distribution Scheduled Exists','******SCRIPT EXIT*****');
                return;
            }
            
            //create journal entry
            createAllocJournalEntry(recBill,IS_INTERCO);
        }
        
        //reset the scheduled in process flag to false
        if(trigger=='scheduled') nlapiSubmitField('vendorbill',stBillId,'custbody_svb_sched_in_process','F'); //10 usage units
        
        nlapiLogExecution('DEBUG','User Event Script : After Submit ','******************************FINISHED********************************');
    }
    catch(error)
    {
        if(type!='delete') nlapiSubmitField('vendorbill',stBillId,'custbody_svb_sched_in_process','F'); //10 usage units        
       
        if (error.getDetails != undefined)
        {
            nlapiLogExecution('ERROR', 'Process Error', error.getCode() + ': ' + error.getDetails());
            throw error;
        }
        else
        {
            nlapiLogExecution('ERROR', 'Unexpected Error', error.toString());
            throw nlapiCreateError('99999', error.toString());
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
        else
        {
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
        }
    }
}

//**********************************************************************USER EVENT SCRIPTS DEPLOYED ON VENDOR BILL - ENDS HERE**********************************************//



//**********************************************************************CLIENT SIDE SCRIPTS DEPLOYED ON VENDOR BILL - STARTS HERE**********************************************//

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
    if(type!='item' && type!='expense')
    {
        return true;
    }
    
    if(name!='custcol_svb_bill_distr_exclude')
    {
        return true;
    }
    
    var isExclude = nlapiGetCurrentLineItemValue(type,name);
    var stAdjDetails = nlapiGetCurrentLineItemValue(type,'custcol_svb_dist_alloc_det_hidden');
    
    if(isExclude=='T' && stAdjDetails)
    {
        var isConfirmed = confirm("This line has recently adjusted its allocation.\n Excluding this line will remove the recently adjusted allocation and remove this from the allocation distribution.\n Click Ok to confirm \n Click Cancel to abort the changes'");
        (isConfirmed) ? nlapiSetCurrentLineItemValue(type,'custcol_svb_dist_alloc_det_hidden','',false,true) :
                        nlapiSetCurrentLineItemValue(type,'custcol_svb_bill_distr_exclude','F',false,true);        
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



//**********************************************************************USER EVENT SCRIPTS DEPLOYED ON BILL DISTRIBUTION LINES - STARTS HERE**********************************************//

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
* This script is deployed in Bill Distribution Schedule custom record
* to validate the allocation weight if within 100% distribution.
* 
* @author Jaime Villafuerte III
* @version 1.0
* 
*/
function beforeSubmit_CascadeChangesToSBDLines(type)
{
    if(type!='edit')
    {
        return;
    }
    
    var stBDSId = nlapiGetRecordId();
    var arrLines = getDistributionScheduleLine(stBDSId);
    var stParentSubs = nlapiGetFieldValue('custrecord_svb_source_subsidiary');
    var bNeedUpdates = false;
    
    for(var i=0; arrLines && i<arrLines.length; i++)
    {
        var stBDSLId = arrLines[i].getId();
        var bSourceAcct = nlapiGetFieldValue('custrecord_svb_use_source_accounts');
        var stLineSubs = arrLines[i].getValue('custrecord_svb_line_subsidiary');
        var bLineSourceSubs = arrLines[i].getValue('custrecord_svb_line_is_source_sub');
        var stSourceSubs = arrLines[i].getValue('custrecord_svb_source_subsidiary','custrecord_svb_line_parent_link');
        var bLineSourceAcct = arrLines[i].getValue('custrecord_svb_line_use_src_acct');
        
        if(stParentSubs==stLineSubs && bLineSourceSubs!='T')
        {
            bLineSourceSubs = 'T';
            bNeedUpdates = true;
        }
        
        if(stParentSubs!=stLineSubs && bLineSourceSubs=='T')
        {
            bLineSourceSubs = 'F';
            bNeedUpdates = true;
        }
        
        if(bLineSourceAcct!=bSourceAcct)
        {
            bNeedUpdates = true;
        }
        
        if(stParentSubs!=stSourceSubs)
        {
            bNeedUpdates = true;
        }
        
        if(bNeedUpdates) nlapiSubmitField('customrecord_svb_line_is_source_sub',stBDSLId,['custrecord_svb_line_is_source_sub','custrecord_svb_line_use_src_acct','custrecord_svb_source_subs_from_parent'],[bLineSourceSubs,bSourceAcct,stParentSubs]);
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
* This script is deployed as beforeSubmit on bill distribution schedule line custom record. 
* This script validate the bill distribution template
* 
* @author Jaime Villafuerte III
* @version 1.0
* 
*/
function beforeSubmit_BDSL_Validations(type)
{
    var stExecType = nlapiGetContext().getExecutionContext();
    
    if(stExecType!='csvimport')
    {
        return;
    }
    
    if(type!='create' && type!='edit')
    {
        return;
    }
    
    onSaveBDSLValidations('server');
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
* This script is deployed in Bill Distribution Schedule Line custom record
* This script load the custpage_<fields> on the form
* 
* @author Jaime Villafuerte III
* @version 1.0
* 
*/
function beforeLoad_AddTempFieldsOnBDSForm(type,form,request)
{
    if(type!='edit' && type!='view' && type!='copy' && type!='create')
    {
        return;
    }
    
    var fld = form.addField("custpage_svb_line_department","select","Destination Department","department");
    fld.setLayoutType('outsidebelow','startcol');
    fld = form.addField("custpage_svb_line_class","select","Destination Class","classification");
    fld.setLayoutType('outsidebelow','startrow');
    fld = form.addField("custpage_svb_line_location","select","Destination Location","location");
    fld.setLayoutType('outsidebelow','startrow');
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
* This script is deployed in Bill Distribution Schedule Line custom record
* to validate the allocation weight if within 100% distribution.
* 
* @author Jaime Villafuerte III
* @version 1.0
*  
*/
function afterSubmit_ValidateAllocationWeight(type)
{
    if(type!='create' && type!='edit' && type!='delete')
    {
        return;
    }
    
    var stBDS = (type=='delete') ? nlapiGetOldRecord().getFieldValue('custrecord_svb_line_parent_link') : 
                                   nlapiGetFieldValue('custrecord_svb_line_parent_link');
    
    var arrResult = (stBDS) ? getDistributionScheduleLine(stBDS) : null;    
    var fTotalWt  = 0.00;
    
    if(arrResult)
    {
        for(var i=0; i<arrResult.length; i++)
        {
            var fAllocWt = arrResult[i].getValue('custrecord_svb_line_allocation_weight');
                fAllocWt = parseFloat(fAllocWt);
            
            //add the current wt
            fTotalWt += fAllocWt;
        }        
        nlapiLogExecution('DEBUG','afterSubmit_ValidateAllocationWeight','fTotalWt=' + fTotalWt);
    
        var stParentID = arrResult[0].getValue('custrecord_svb_line_parent_link');
        
        if(fTotalWt < 100 && stParentID)
        {
            //alert("Warning: The sum of all distribution schedule line's allocation weight is still less than 100%");
            nlapiSubmitField('customrecord_svb_bill_dist_sched',stParentID,'custrecord_svb_is_alloc_wt_valid','F');
        }
        
        if(fTotalWt==100 && stParentID)
        {
            nlapiSubmitField('customrecord_svb_bill_dist_sched',stParentID,'custrecord_svb_is_alloc_wt_valid','T');
        }
    }
    else
    {
        //alert("Warning: The sum of all distribution schedule line's allocation weight is still less than 100%");
        nlapiSubmitField('customrecord_svb_bill_dist_sched',stBDS,'custrecord_svb_is_alloc_wt_valid','F');
    }
}

//**********************************************************************USER EVENT SCRIPTS DEPLOYED ON BILL DISTRIBUTION LINES - ENDS HERE**********************************************//



//**********************************************************************CLIENT SIDE SCRIPTS DEPLOYED ON BILL DISTRIBUTION LINES - STARTS HERE**********************************************//

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
* This script is deployed as client side on bill distribution schedule line custom record. 
* This script validate the bill distribution template for mandatory fields and allocation weight
* 
* @author Jaime Villafuerte III
* @version 1.0
* 
*/
function saveRecord_BDSL_Validations()
{
    var stSourceSubs = nlapiGetFieldValue('custrecord_svb_source_subs_from_parent');
    var stCurrSubs   = nlapiGetFieldValue('custrecord_svb_line_subsidiary');
    var stParentId   = nlapiGetFieldValue('custrecord_svb_line_parent_link');        
    var arrCol       = [new nlobjSearchColumn('custrecord_svb_line_subsidiary')];
    var arrFil       = [new nlobjSearchFilter('custrecord_svb_line_parent_link',null,'anyof',stParentId)];
    var arrRes       = nlapiSearchRecord('customrecord_svb_line_is_source_sub',null,arrFil,arrCol);
    var isValid      = false;
    var isInterCo    = nlapiGetFieldValue('custrecord_svb_line_is_intercompany');
    
    if(isInterCo=='T')
    {
        if(arrRes)
        {
            for(var i=0; i<arrRes.length; i++)
            {
                var stSubs = arrRes[i].getValue('custrecord_svb_line_subsidiary');
                
                if(nlapiGetRecordId()==arrRes[i].getId())
                {
                    continue;
                }
                
                if(stSourceSubs==stSubs)
                {
                    isValid = true;
                    break;
                }
            }
            
            if(!isValid && stSourceSubs==stCurrSubs)
            {
                isValid = true;
            }
            
            if(!isValid)
            {
                alert('You need first to create a distribution line record for the source subsidiary.');
                return false;
            }
        }
        else
        {
            if(stSourceSubs!=stCurrSubs)
            {
                alert('You need first to create a distribution line record for the source subsidiary.');
                return false;
            }
        }
        
        if(stSourceSubs==stCurrSubs)
        {
            var fAllocPct = nlapiGetFieldValue('custrecord_svb_line_allocation_weight');
                fAllocPct = parseFloat(fAllocPct);
            
            if(fAllocPct==100.00)
            {
                alert('100% allocation to source subsidiary is not allowed.');
                return false;
            }            
            isValid = true;
        }
    }
    
    return onSaveBDSLValidations('client');
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
* This script is deployed as client side on bill distribution schedule custom record
* to default the values on make copy of the schedule.
* 
* @author Jaime Villafuerte III
* @version 1.0
*  
*/
function pageInit_MakeCopy_Defaulting(type)
{
    //alert(type);
    
    if(type=='copy')
    {
        nlapiSetFieldValue('custrecord_svb_is_alloc_wt_valid','F',false,true);
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
* This script is deployed as client side on bill distribution schedule custom record
* to prevent duplicate name of bill distribution schedule
* 
* @author Jaime Villafuerte III
* @version 1.0
*  
*/
function saveRecord_PreventDuplicateScheduleName(type)
{
    var stBDSName = nlapiGetFieldValue('name');    
    var isValid = true;
    
    if(!nlapiGetRecordId())
    {        
        var arrBDS = getDuplicateBillDistributionSchedule(stBDSName);
        
        if(arrBDS)
        {
            alert('Error Duplicate Record. Details: There is already a Bill Distribution Schedule Name "' + stBDSName + '" that exists.');
            isValid = false;
        }
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
* This script is deployed as client side on bill distribution schedule line custom record. 
* This script will default the value on the bill distribution schedule line record.
* 
* @author Jaime Villafuerte III
* @version 1.0
*  
*/
function pageInit_BDSL_Defaulting(type)
{
    var stParentId = nlapiGetFieldValue('custrecord_svb_line_parent_link');
    
    if(!stParentId)
    {
        return true;
    }
    
    var arrParent    = nlapiLookupField('customrecord_svb_bill_dist_sched',stParentId,['custrecord_svb_source_subsidiary','custrecord_svb_use_source_accounts','custrecord_svb_parent_intercomany_alloc']);
    var stSourceAcct = arrParent.custrecord_svb_use_source_accounts;    
    var isInterCo    = arrParent.custrecord_svb_parent_intercomany_alloc;    
    var stDestSubs   = nlapiGetFieldValue('custrecord_svb_line_subsidiary');
    
    nlapiSetFieldValue('custrecord_svb_line_use_src_acct',stSourceAcct,false,true);
    
    if(isInterCo!='T')
    {
        nlapiDisableField('custrecord_svb_line_subsidiary',true);
        nlapiDisableField('custrecord_svb_line_intercomp_account',true);
        nlapiDisableField('custrecord_svb_line_intercomp_ap_account',true);
        nlapiDisableField('custrecord_svb_line_intercomp_customer',true);
        nlapiDisableField('custrecord_svb_line_intercomp_vendor',true);
        
        //nlapiSetFieldValue('custrecord_svb_line_subsidiary','',false,true);
        nlapiSetFieldValue('custrecord_svb_line_intercomp_account','',false,true);
        nlapiSetFieldValue('custrecord_svb_line_intercomp_ap_account','',false,true);
        nlapiSetFieldValue('custrecord_svb_line_intercomp_customer','',false,true);
        nlapiSetFieldValue('custrecord_svb_line_intercomp_vendor','',false,true);
    }
    else
    {
        nlapiDisableField('custrecord_svb_line_subsidiary',false);
        nlapiDisableField('custrecord_svb_line_intercomp_account',false);
        nlapiDisableField('custrecord_svb_line_intercomp_ap_account',false);
        nlapiDisableField('custrecord_svb_line_intercomp_customer',false);
        nlapiDisableField('custrecord_svb_line_intercomp_vendor',false);
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
* This script is deployed as client side on bill distribution schedule line custom record. 
* This script validate the bill distribution template
* 
* @author Jaime Villafuerte III
* @version 1.0
*  
*/
function validateField_BDSL_Validations(type,name,line)
{    
    return validateScheduleDistributionLine('customrecord',name);   
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
* This script is deployed as client side on bill distribution schedule line custom record. 
* This script will set the source subsidiary field on the line to check if it is equal to the source subsidiary on the parent record.
* 
* @author Jaime Villafuerte III
* @version 1.0
*  
*/
function fieldChange_BDSL_Defaulting(type,name,line)
{
    if(name!='custrecord_svb_line_subsidiary')
    {
        return true;
    }
    
    var stParentId = nlapiGetFieldValue('custrecord_svb_line_parent_link');
    var stLineSubs = nlapiGetFieldValue('custrecord_svb_line_subsidiary');
    
    if(stParentId)
    {
        var arrParent = nlapiLookupField('customrecord_svb_bill_dist_sched',stParentId,['custrecord_svb_use_source_accounts','custrecord_svb_source_subsidiary']);        
        var stSourceSubs  = arrParent.custrecord_svb_source_subsidiary;
        
        (stSourceSubs==stLineSubs && stSourceSubs && stLineSubs) ? nlapiSetFieldValue('custrecord_svb_line_is_source_sub','T',false,true) :
                                                                   nlapiSetFieldValue('custrecord_svb_line_is_source_sub','F',false,true);                                     
    }    
    return true;
}

//**********************************************************************CLIENT SIDE SCRIPTS DEPLOYED ON BILL DISTRIBUTION LINES -NDSSS HERE**********************************************//



//**********************************************************************SUITELET SCRIPTS - STARTS HERE**********************************************//

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
* This suitelet script will get triggered on click of Adjust Distribution custom button
* 
* @author Jaime Villafuerte III
* @version 1.0
* 
*/
function suitelet_AdjustDistribution(request,response)
{
    var stBillId = request.getParameter('custpage_svb_id');
    var stBillRefId = request.getParameter('custpage_svb_ref_id');
    var objForm = nlapiCreateForm('Adjust Distribution',true);
    
    if(request.getMethod()=='GET')
    {
        var arrVB = nlapiLookupField('vendorbill',stBillId,['exchangerate','custbody_svb_vb_to_bell_dist_sched']);        
        var fExchRate = arrVB.exchangerate;
        var stSchedule = arrVB.custbody_svb_vb_to_bell_dist_sched;
        var arrSched = nlapiLookupField('customrecord_svb_bill_dist_sched',stSchedule,['custrecord_svb_source_subsidiary','custrecord_svb_use_source_accounts','custrecord_svb_parent_intercomany_alloc']);
        var stSrcSubs = arrSched.custrecord_svb_source_subsidiary;
        var stSrcAcct = arrSched.custrecord_svb_use_source_accounts;
        var isInterco = arrSched.custrecord_svb_parent_intercomany_alloc;
        
        //set the validation script
        objForm.setScript('customscript_svb_adj_distr_client');
        
        //header fields
        var fld = objForm.addField('custpage_svb_ref_id','text','VB Number: ','vendorbill');
        fld.setDefaultValue(stBillRefId);
        fld.setDisplayType('inline');
        fld = objForm.addField('custpage_svb_id','text','Vendor Bill Internal ID: ');
        fld.setDefaultValue(stBillId);
        fld.setDisplayType('hidden');
        fld = objForm.addField('custpage_svb_details_line_no','integer','Line#:');
        fld.setDisplayType('inline');
        fld.setLayoutType('startrow','startcol');
        fld = objForm.addField('custpage_svb_details_sublist_type','select','Sublist Type:','customlist_svb_sublisttype');
        fld.setDisplayType('inline');                             
        fld = objForm.addField('custpage_svb_details_distr_total','currency','Distribution Total:');
        fld.setDisplayType('inline');
        fld = objForm.addField('custpage_svb_details_line_total','currency','Line Total:');
        fld.setDisplayType('inline');        
        fld = objForm.addField('custpage_svb_details_exchrate','float','');
        fld.setDisplayType('hidden');
        fld.setDefaultValue(fExchRate);
        fld = objForm.addField('custpage_svb_removed_bdsid','text','Removed SBD Id:');
        fld.setDisplayType('hidden');
        fld = objForm.addField('custpage_svb_changed_bdsid','text','Changed SBD Id:');
        fld.setDisplayType('hidden');
        fld = objForm.addField('custpage_svb_schedule_template','text','');
        fld.setDefaultValue(stSchedule);
        fld.setDisplayType('hidden');
        fld = objForm.addField('custpage_svb_schedule_src_subs','text','');
        fld.setDefaultValue(stSrcSubs);
        fld.setDisplayType('hidden');
        fld = objForm.addField('custpage_svb_schedule_src_acct','text','');
        fld.setDefaultValue(stSrcAcct);
        fld.setDisplayType('hidden');
        fld = objForm.addField('custpage_svb_schedule_is_interco','text','');
        fld.setDefaultValue(isInterco);
        fld.setDisplayType('hidden');
        
        //create a tab
        //var objTab1 = objForm.addTab('custpage_svb_tab1','Bill Distribution Details');
        //var objTab2 = objForm.addTab('custpage_svb_tab2','Test');
        //var objField2 = objForm.addField('custpage_svb_test','text','test',null,'custpage_svb_tab2');
        
        //line fields
        var objSublist = objForm.addSubList('custpage_svb_dist_details', 'inlineeditor', 'Distribution Details');
        var linefld = objSublist.addField('custpage_svb_details_id','text','BDS ID').setDisplayType('hidden');
        linefld = objSublist.addField('custpage_svb_line_allocwt_changed','checkbox','').setDisplayType('hidden');
        linefld = objSublist.addField('custpage_svb_details_line_number','integer','Line #').setDisplayType('disabled');
        linefld = objSublist.addField('custpage_svb_details_sublisttype','select','Sublist Type','customlist_svb_sublisttype').setDisplayType('disabled');
        linefld = objSublist.addField('custpage_svb_expense_account','select','Expense Account','account').setDisplayType('disabled');
        linefld = objSublist.addField('custpage_svb_expense_category','select','Expense Category','expensecategory').setDisplayType('disabled');
        linefld = objSublist.addField('custpage_svb_details_itemid','select','Item Id','item').setDisplayType('disabled');
        linefld = objSublist.addField('custpage_svb_details_quantity','float','Quantity').setDisplayType('disabled');
        linefld = objSublist.addField('custpage_svb_details_allocation_weight','percent','Change Allocation Weight').setDisplayType('entry');        
        linefld = objSublist.addField('custpage_svb_details_alloc_wt_orig','percent','').setDisplayType('hidden');        
        linefld = objSublist.addField('custpage_svb_details_amount_fx','currency','Change Txn Currency Amount').setDisplayType('entry');
        linefld = objSublist.addField('custpage_svb_details_amount','currency','Base Currency Amount').setDisplayType('disabled');        
        linefld = objSublist.addField('custpage_svb_details_amount_orig','currency','Allocated Amount').setDisplayType('hidden');
        linefld = objSublist.addField('custpage_svb_details_line_amount','currency','Total Line Amount').setDisplayType('hidden');
        
        var objDestSubs = objSublist.addField('custpage_svb_details_subsidiary','select','Destination Subsidiary','subsidiary');
        
        linefld = objSublist.addField('custpage_svb_details_department','select','Destination Department','department').setDisplayType('entry');            
        linefld = objSublist.addField('custpage_svb_details_account','select','Destination Account','account').setDisplayType('entry');            
        linefld = objSublist.addField('custpage_svb_details_class','select','Destination Class','classification').setDisplayType('entry');            
        linefld = objSublist.addField('custpage_svb_details_location','select','Destination Location','location').setDisplayType('entry');            
        
        var objICARFld   = objSublist.addField('custpage_svb_details_interco_ar_acct','select','Intercompany AR Account','account');
        var objICAPFld   = objSublist.addField('custpage_svb_details_interco_ap_acct','select','Intercompany AP Account','account');
        var objICCustFld = objSublist.addField('custpage_svb_details_intercompcustomer','select','Intercompany Customer','customer');
        var objICVendFld = objSublist.addField('custpage_svb_details_intercomp_vendor','select','Intercompany Vendor','vendor');
        
        if(isInterco!='T')
        {
            objDestSubs.setDisplayType('disabled');
            objICARFld.setDisplayType('disabled');
            objICAPFld.setDisplayType('disabled');
            objICCustFld.setDisplayType('disabled');
            objICVendFld.setDisplayType('disabled');
        }
        else
        {
            objDestSubs.setDisplayType('entry');
            objICARFld.setDisplayType('entry');
            objICAPFld.setDisplayType('entry');
            objICCustFld.setDisplayType('entry');
            objICVendFld.setDisplayType('entry');
        }
        
        var arrBDS = getBillDistributionDetails(stBillId);
        var arrValues = [];
        
        for(var i=0; arrBDS && i<arrBDS.length; i++)
        {
            var arrList = [];
            arrList['custpage_svb_details_id']                = arrBDS[i].getId();
            arrList['custpage_svb_details_line_number']       = arrBDS[i].getValue('custrecord_svb_details_line_number');
			arrList['custpage_svb_details_sublisttype']       = arrBDS[i].getValue('custrecord_svb_details_sublisttype');
			arrList['custpage_svb_expense_account']           = arrBDS[i].getValue('custrecord_svb_expense_account');
            arrList['custpage_svb_expense_category']          = arrBDS[i].getValue('custrecord_svb_expense_category');
			arrList['custpage_svb_details_itemid']            = arrBDS[i].getValue('custrecord_svb_details_itemid');
			arrList['custpage_svb_details_allocation_weight'] = arrBDS[i].getValue('custrecord_svb_details_allocation_weight');
            arrList['custpage_svb_details_alloc_wt_orig']     = arrBDS[i].getValue('custrecord_svb_details_allocation_weight');
            arrList['custpage_svb_details_quantity']          = arrBDS[i].getValue('custrecord_svb_details_quantity');
			arrList['custpage_svb_details_amount']            = arrBDS[i].getValue('custrecord_svb_details_amount');
            arrList['custpage_svb_details_amount_fx']         = arrBDS[i].getValue('custrecord_svb_details_foreign_amt');
            arrList['custpage_svb_details_amount_disp']       = arrBDS[i].getValue('custrecord_svb_details_amount');
            arrList['custpage_svb_details_line_disp']         = arrBDS[i].getValue('custrecord_svb_details_line_amount');
            arrList['custpage_svb_details_amount_orig']       = arrBDS[i].getValue('custrecord_svb_details_amount');
            arrList['custpage_svb_details_line_amount']       = arrBDS[i].getValue('custrecord_svb_details_line_amount');
			arrList['custpage_svb_details_subsidiary']        = arrBDS[i].getValue('custrecord_svb_details_subsidiary');
            arrList['custpage_svb_details_department']        = arrBDS[i].getValue('custrecord_svb_details_department');
			arrList['custpage_svb_details_account']           = arrBDS[i].getValue('custrecord_svb_details_account');
			arrList['custpage_svb_details_class']             = arrBDS[i].getValue('custrecord_svb_details_class');
            arrList['custpage_svb_details_location']          = arrBDS[i].getValue('custrecord_svb_details_location');
			arrList['custpage_svb_details_interco_ar_acct']   = arrBDS[i].getValue('custrecord_svb_details_interco_ar_acct');
            arrList['custpage_svb_details_interco_ap_acct']   = arrBDS[i].getValue('custrecord_svb_details_interco_ap_acct');
			arrList['custpage_svb_details_intercompcustomer'] = arrBDS[i].getValue('custrecord_svb_details_intercompcustomer');
            arrList['custpage_svb_details_intercomp_vendor']  = arrBDS[i].getValue('custrecord_svb_details_intercomp_vendor');
            
            arrValues.push(arrList);
        }
        
        objSublist.setLineItemValues(arrValues);
        objForm.addSubmitButton('Submit');
        objForm.addButton('custpage_svb_close','Close','window.close();');
        response.writePage(objForm);
    }
    else
    {
        var count = request.getLineItemCount('custpage_svb_dist_details');
        var hasChange = false;
        var arrAllocWtPerTranLine = [];
        var stChanged = request.getParameter('custpage_svb_changed_bdsid');
        var stRemovedBDSId = request.getParameter('custpage_svb_removed_bdsid');
        
        for(var i=1; i<=count; i++)
        {
            var objBDS = {};
            
            var stBDDId        = request.getLineItemValue('custpage_svb_dist_details','custpage_svb_details_id',i);
            objBDS.tranid      = request.getParameter('custpage_svb_id');
            objBDS.tranidtext  = request.getParameter('custpage_svb_id');
            objBDS.destdept    = request.getLineItemValue('custpage_svb_dist_details','custpage_svb_details_department',i);
            objBDS.sublist     = request.getLineItemValue('custpage_svb_dist_details','custpage_svb_details_sublisttype',i);
            objBDS.destsubs    = request.getLineItemValue('custpage_svb_dist_details','custpage_svb_details_subsidiary',i);
            objBDS.destloc     = request.getLineItemValue('custpage_svb_dist_details','custpage_svb_details_location',i);
            objBDS.interaracct = request.getLineItemValue('custpage_svb_dist_details','custpage_svb_details_interco_ar_acct',i);
            objBDS.interapacct = request.getLineItemValue('custpage_svb_dist_details','custpage_svb_details_interco_ap_acct',i);
            objBDS.destacct    = request.getLineItemValue('custpage_svb_dist_details','custpage_svb_details_account',i);
            objBDS.allocwt     = request.getLineItemValue('custpage_svb_dist_details','custpage_svb_details_allocation_weight',i);
            objBDS.intercust   = request.getLineItemValue('custpage_svb_dist_details','custpage_svb_details_intercompcustomer',i);
            objBDS.intervend   = request.getLineItemValue('custpage_svb_dist_details','custpage_svb_details_intercomp_vendor',i);
            objBDS.expcat      = request.getLineItemValue('custpage_svb_dist_details','custpage_svb_expense_category',i);
            objBDS.expacct     = request.getLineItemValue('custpage_svb_dist_details','custpage_svb_expense_account',i);
            objBDS.itemid      = request.getLineItemValue('custpage_svb_dist_details','custpage_svb_details_itemid',i);
            objBDS.destclass   = request.getLineItemValue('custpage_svb_dist_details','custpage_svb_details_class',i);
            objBDS.linenum     = request.getLineItemValue('custpage_svb_dist_details','custpage_svb_details_line_number',i);
            objBDS.lineamt     = request.getLineItemValue('custpage_svb_dist_details','custpage_svb_details_line_amount',i);
            objBDS.foramt      = request.getLineItemValue('custpage_svb_dist_details','custpage_svb_details_amount_fx',i);
            objBDS.amount      = request.getLineItemValue('custpage_svb_dist_details','custpage_svb_details_amount',i);
            objBDS.itemqty     = request.getLineItemValue('custpage_svb_dist_details','custpage_svb_details_quantity',i);
            
            if(arrAllocWtPerTranLine[objBDS.sublist + '-' + objBDS.linenum]==undefined || arrAllocWtPerTranLine[objBDS.sublist + '-' + objBDS.linenum]==null)
            {
                arrAllocWtPerTranLine[objBDS.sublist + '-' + objBDS.linenum] = [];
            }
            arrAllocWtPerTranLine[objBDS.sublist + '-' + objBDS.linenum].push(convertBDSObjectToArray(objBDS));
            
            //update the lines that gets changed
            if(stChanged && stChanged.indexOf(stBDDId)!=-1)
            {
                if(stBDDId)
                {
                    //nlapiSubmitField('customrecord_svb_bill_dist_details',stBDDId,['custrecord_svb_details_allocation_weight','custrecord_svb_details_amount','custrecord_svb_details_foreign_amt'],[objBDS.allocwt,objBDS.amount,objBDS.foramt]);
                    createUpdateBDSRecord(objBDS,stBDDId);
                }
                hasChange = true;
            }
            
            //create new record for new lines
            if(!stBDDId)
            {
                createUpdateBDSRecord(objBDS,null);
                hasChange = true;
            }
        }
        
        //delete the record with deleted lines
        if(stRemovedBDSId)
        {
            var arrRemovedBDSId = stRemovedBDSId.split(',');
            
            for(var i=0; i<arrRemovedBDSId.length; i++)
            {
                var stBDSId = arrRemovedBDSId[i];
                nlapiDeleteRecord('customrecord_svb_bill_dist_details',stBDSId);
                hasChange = true;
            }
        }
        
        if(hasChange)
        {
            var APPROVED = 'open';
            var APPROVE_FLD = 'statusRef';
            var recBill = nlapiLoadRecord('vendorbill',stBillId);
            var stAppStatus = recBill.getFieldValue(APPROVE_FLD);
            var stSharedAllocJnl = recBill.getFieldValue('custbody_svb_allocation_journal');
            var isInterCo = recBill.getFieldValue('custbody_svb_schedule_is_intercompany');
            
            //reverse allocation journal
            if (stSharedAllocJnl)
            {
                var arrAllocJrnl = recBill.getFieldValues('custbody_svb_allocation_journal');
                reverseAllocJournalEntry(arrAllocJrnl);
                //nlapiSubmitField('vendorbill',stBillId,'custbody_svb_allocation_journal','');
            }
            nlapiLogExecution('DEBUG','Adjust Distribution Submitted','count=' + count);
            
            if(!count || count==0 || count==-1)
            {
                nlapiLogExecution('DEBUG','Adjust Distribution Submitted','All Distribution Details has been removed');
                recBill.setFieldValue('custbody_svb_vb_to_bell_dist_sched','');
                recBill.setFieldValues('custbody_svb_allocation_journal',null);
                
                for(var i=1; i<=recBill.getLineItemCount('item'); i++)
                {
                    recBill.setLineItemValue('item','custcol_svb_dist_alloc_det_hidden',i,'');
                    //recBill.setLineItemValue('item','custcol_svb_bill_distr_exclude',i,'T');
                }
                
                for(var i=1; i<=recBill.getLineItemCount('expense'); i++)
                {
                    recBill.setLineItemValue('expense','custcol_svb_dist_alloc_det_hidden',i,'');
                    //recBill.setLineItemValue('expense','custcol_svb_bill_distr_exclude',i,'T');
                }
            }
            else
            {
                nlapiLogExecution('DEBUG','Adjust Distribution Submitted','Distribution Details has been changed');
                
                if(stAppStatus==APPROVED)
                {
                    //create allocation journal entry
                    recBill = createAllocJournalEntry(recBill,isInterCo,'suitelet');
                }
                
                //save the vendor bill updates
                for(line in arrAllocWtPerTranLine)
                {
                    var arrLine = line.split('-');
                    var stSubTabType = arrLine[0];
                        stSubTabType = (stSubTabType=='1') ? 'item' : 'expense';
                    var intTranLine = arrLine[1];
                    var stLineDet = JSON.stringify(arrAllocWtPerTranLine[line]);
                    recBill.setLineItemValue(stSubTabType,'custcol_svb_dist_alloc_det_hidden',intTranLine,stLineDet);
                }
            }
            
            //nlapiLogExecution('DEBUG','','');
            var stVBId = nlapiSubmitRecord(recBill,true,true);
            nlapiLogExecution('DEBUG','|---Vendor Bill successfully Updated---|','stVBId=' + stVBId);
        }
        closeAndRedirect(objForm, stBillId, 'vendorbill');
        response.writePage(objForm);
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
* This suitelet script will get triggered on click of Adjust Distribution custom button
* 
* @author Jaime Villafuerte III
* @version 1.0
* 
*/
function suitelet_ReCreateAllocJE(request, response)
{
    var stVBId   = request.getParameter('custpage_svb_id');
    var recBill  = nlapiLoadRecord('vendorbill',stVBId);
    var stBDS    = recBill.getFieldValue('custbody_svb_vb_to_bell_dist_sched');
    var stStatus = recBill.getFieldValue('statusRef');  
    var APPROVED = 'open';
    
    if(!stBDS)
    {
        throw nlapiCreateError('Error','No Bill Distribution template selected.');
    }
    
    var intAllLineCount = getAllLinesForAllocation(recBill); //item + expense
    var arrDSL = getDistributionScheduleLine(stBDS); // 10 usage units
    var intSubsCount = arrDSL.length;
    
    var CREATE_DISTRIBUTION_USAGE = intSubsCount * intAllLineCount * 6; //create api = 2 + submit api = 4 = 6
    var DELETE_DISTRIBUTION_USAGE = intSubsCount * intAllLineCount * 4; //delete api = 4
    var CREATE_ALLOCATION_JE_USAGE = intSubsCount * 30; // create api = 10 + submit api = 20 
    var REVERSE_ALLOCATION_JE_USAGE = intSubsCount * 10; // update api = 10
    var UPDATE_VB_ALLOCATION_JE_USAGE = 10;
    var LIMIT = 10;
    
    var USAGE_ESTIMATE = (stStatus==APPROVED) ? CREATE_DISTRIBUTION_USAGE + DELETE_DISTRIBUTION_USAGE + CREATE_ALLOCATION_JE_USAGE + REVERSE_ALLOCATION_JE_USAGE + UPDATE_VB_ALLOCATION_JE_USAGE :
                                                CREATE_DISTRIBUTION_USAGE + DELETE_DISTRIBUTION_USAGE;    
    
    if(USAGE_ESTIMATE > LIMIT)
    {
       var arrParam = [];
           arrParam['custscript_svb_opt_type']       = 'edit';
           arrParam['custscript_svb_internal_id']    = recBill.getId();
           arrParam['custscript_svb_is_changed']     = true;
           arrParam['custscript_svb_prev_status']    = null;
           arrParam['custscript_svb_alloc_je_on_vb'] = null;
       
       var status = nlapiScheduleScript('customscript_svb_bill_main_schedule','customdeploy_svb_bill_main_schedule',arrParam);
       nlapiLogExecution('DEBUG','Scheduled Script Called','Scheduled Script Queue Status= ' + status);
       
       var arrParam = [];
           arrParam['custscript_svb_vb_id'] = recBill.getId();
           arrParam['custscript_svb_oper_type'] = 'edit';
       nlapiSetRedirectURL('SUITELET','customscript_svb_sched_proc_info_page','customdeploy_svb_sched_proc_info_page',null,arrParam);
    }
    else
    {
        mainSVBProcess('userinterface','edit',recBill.getId(),recBill,true,null,null);
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
* This script is deployed as a suitelet.
* This script serve as an information page when the shared vendor bill main function 
* forwarded the process to a scheduled script
* 
* 
* @author Jaime Villafuerte III
* @version 1.0
* 
*/
function suitelet_ScheduleInfoPage(request,response)
{
    var stBillId = request.getParameter('custscript_svb_vb_id');
    var stOptType = request.getParameter('custscript_svb_oper_type');
    var stBillURL = (stOptType!='delete') ? nlapiResolveURL('RECORD','vendorbill',stBillId) : nlapiResolveURL('RECORD','vendorbill',null);
    nlapiLogExecution('DEBUG','suitelet_ScheduleInfoPage','stBillId=' + stBillId + ' stBillURL=' + stBillURL);
    
    var stSCScriptId = 'customscript_svb_bill_main_schedule ';
	var stMessage    =  'Your Shared Vendor Bill process request status is: <b>ON QUEUE</b> <br/>';
        stMessage   += '<b>Note:</b> The Vendor Bill will be locked for edit while the scheduled script is on process. <br/><br/>'
	    stMessage   += 'Please click <a href=\'/app/common/scripting/scriptstatus.nl?scripttype=' + stSCScriptId + '\' >here</a> to proceed to the Scheduled Script Status Page.';
        stMessage   += '<br><br>';
        stMessage   += 'Please click <a href='+ stBillURL +'>here</a> to go back to the vendor bill record';
	
    var objForm = nlapiCreateForm('Process Shared Vendor Bill Updates', true);
	var objHtml = objForm.addField('custpage_message', 'inlinehtml', '');
	objHtml.setDefaultValue(stMessage);
    response.writePage(objForm);
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
* This script is deployed as client side validator for the Suitelet.
* 
* 
* @author Jaime Villafuerte III
* @version 1.0
* 
*/
function validateField_CheckAdjustLineFields(type,name,line)
{
    var stLineNo = nlapiGetCurrentLineItemValue('custpage_svb_details_line_no');
    
    if(!stLineNo)
    {
        return true;
    }
    
    return validateScheduleDistributionLine('suitelet',name);
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
* This script is deployed as client side validator for the Suitelet. 
* This client side script is used to validate the adjust distribution suitelet
* 
* @author Jaime Villafuerte III
* @version 1.0
* 
*/
function fieldChange_SetCalculatedAmount(type,name,line)
{
    if(name!='custpage_svb_details_allocation_weight' && name!='custpage_svb_details_amount_fx' && name!='custpage_svb_details_subsidiary')
    {
        return true;
    }
    
    var fLineNo  = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_line_number');
    
    if(!fLineNo)
    {
        return true;
    }
    
    var fAllocWt    = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_allocation_weight');
        fAllocWt    = parseFloat(fAllocWt)/100
    var fLineAmount = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_line_amount');    
    var fFxAmount   = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_amount_fx');    
        fFxAmount   = parseFloat(fFxAmount);
    
    var fExchRate = nlapiGetFieldValue('custpage_svb_details_exchrate');
        fExchRate = parseFloat(fExchRate);
    
    if(name=='custpage_svb_details_allocation_weight')
    {
        var fCalcAmount = (fLineAmount) ? parseFloat(fLineAmount) * fAllocWt * fExchRate : 0.00;
        var fCalcFxAmt  = fCalcAmount/fExchRate;
        nlapiSetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_amount',fCalcAmount,false,true);
        nlapiSetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_amount_fx',fCalcFxAmt,false,true);             
    }
    else
    {
        var fCalcAmount = fFxAmount * fExchRate;
        var fNewAllocWt = ((fFxAmount/fLineAmount) * 100).toFixed(2);
        nlapiSetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_allocation_weight',fNewAllocWt,false,true);
        nlapiSetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_amount',fCalcAmount,false,true);    
    }
        
    var stSubtab = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_sublisttype');
    var arrSum      = sumLinePerSubtab('allocamt',line);
    var arrAllLines = arrSum[0];
    var fSumResult  = eval(arrAllLines[stSubtab + '-' + fLineNo + '-' + fLineAmount].join('+')) + fFxAmount;
    
    nlapiSetFieldValue('custpage_svb_details_distr_total',fSumResult,false,true);
    
    //disable intercompany fields if non intercompany or the parent subsidiary is the line subsidiary    
    disableIntercompanyFields();
    
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
* This script is deployed in the suitelet
* This client side script captures the details of distribution total, line total and line number and set it back on the header
* 
* @author Jaime Villafuerte III
* @version 1.0
*/
function lineInit_SetLineAmount(type)
{
    if(type!='custpage_svb_dist_details')
    {
        return true;
    }
        
    var line = nlapiGetCurrentLineItemIndex('custpage_svb_dist_details'); 
    var fLineNo = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_line_number');
    
    if(fLineNo)
    {        
        var fLineTotal  = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_line_amount');  
        var stSubtab    = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_sublisttype');        
        var arrSum      = sumLinePerSubtab('allocamt',line);
        var arrAllLines = arrSum[0];
        var fSumResult  = eval(arrAllLines[stSubtab + '-' + fLineNo + '-' + fLineTotal].join('+'));
        
        nlapiSetFieldValue('custpage_svb_details_line_no',fLineNo,false,true);
        nlapiSetFieldValue('custpage_svb_details_line_total',fLineTotal,false,true);
        nlapiSetFieldValue('custpage_svb_details_sublist_type',stSubtab,false,true);
        nlapiSetFieldValue('custpage_svb_details_distr_total',fSumResult,false,true);
    }
    else
    {
        nlapiSetFieldValue('custpage_svb_details_line_no','',false,true);
        nlapiSetFieldValue('custpage_svb_details_line_total','',false,true);
        nlapiSetFieldValue('custpage_svb_details_sublist_type','',false,true);
        nlapiSetFieldValue('custpage_svb_details_distr_total','',false,true);
    }
    
    if(arrMapFields)
    {
        for(var field in arrMapFields)
        {
            nlapiSetCurrentLineItemValue('custpage_svb_dist_details',field,arrMapFields[field],false,true);
        }
        
        //set it back to null
        arrMapFields = null;
    }
    
    //disableAllLineFields();
    
    //disable intercompany fields if non intercompany or the parent subsidiary is the line subsidiary    
    disableIntercompanyFields();
    
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
* This script is deployed on the suitelet
* This client side script append and store the distribution details record that is removed in the sublist
* 
* @author Jaime Villafuerte III
* @version 1.0
*/
function validateDelete_StoreRemovedLines(type)
{
    var stSBDId = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_id');
    var isConfirmed = true;
        
    if (stSBDId)
    {
        isConfirmed = confirm("Removing this line will delete the current distribution detail record on the vendor bill.\n Click Ok to confirm \n Click Cancel to Abort");
        
        if(isConfirmed)
        {
            var arrRemoved = [];
            var stRemoved = nlapiGetFieldValue('custpage_svb_removed_bdsid');
            
            if(stRemoved)
            {
                arrRemoved = stRemoved.split(',');
            }
            arrRemoved.push(stSBDId);
            nlapiSetFieldValue('custpage_svb_removed_bdsid',arrRemoved.join(','),false,true);
            
            /*check if the removed bill distribution details is also got changed, 
            if yes then remove it in the changed field*/   
            var stChanged = nlapiGetFieldValue('custpage_svb_changed_bdsid');
            var arrChanged = (stChanged) ? stChanged.split(',') : null;
            
            if(arrChanged)
            {
                var index = arrChanged.indexOf(stSBDId);
                arrChanged.splice(index,1);
                nlapiSetFieldValue('custpage_svb_changed_bdsid',arrChanged.join(','),false,true);
            }
        }
    }
    return isConfirmed;
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
* This script is deployed on the suitelet
* This client side script append and store the distribution details record that is changed in the sublist
* 
* @author Jaime Villafuerte III
* @version 1.0
*/
function validateLine_StoreChangedLines(type)
{
    var stLineNo = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_line_number');
    
    if(!stLineNo)
    {
        alert('Cannot add a new line that is not associated to any of the item or expense line. \n To add a new line, select the desired item or expense line and click "Insert"');
        return false;
    }
    
    var isSourceAcct = nlapiGetFieldValue('custpage_svb_schedule_src_acct');
    var stDestAcct = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_account');
    var stSourceSubs = nlapiGetFieldValue('custpage_svb_schedule_src_subs');
    var stDestSubs = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_subsidiary');    
    var arrErrorFlds = [];
    var hasError = false;    
    var isIntercoBillDistri = nlapiGetFieldValue('custpage_svb_schedule_is_interco');
    var arrFlds = (isIntercoBillDistri=='T') ? ['custpage_svb_details_subsidiary'] :
                                               ['custpage_svb_details_department','custpage_svb_details_class'];
    
    if(stSourceSubs && stDestSubs && stSourceSubs!=stDestSubs)
    {
        arrFlds.push('custpage_svb_details_interco_ar_acct');
        arrFlds.push('custpage_svb_details_intercompcustomer');
        arrFlds.push('custpage_svb_details_interco_ap_acct');
        arrFlds.push('custpage_svb_details_intercomp_vendor');
    }
    
    if(isSourceAcct!='T' && !stDestAcct)
    {
        arrErrorFlds.push('Destination Account');
        hasError = true;
    }
    
    for(var i=0; i<arrFlds.length; i++)
    {
        var stValue = nlapiGetCurrentLineItemValue('custpage_svb_dist_details',arrFlds[i]);
        
        if(!stValue || stValue=='')
        {
            var objFld  = nlapiGetLineItemField ('custpage_svb_dist_details',arrFlds[i]);            
            var stLabel = (objFld) ? objFld.getLabel() : arrFlds[i];                
            arrErrorFlds.push(stLabel);
            hasError = true;
        }
    }
    
    if(hasError)
    {
        alert("Please enter value for the following fields : \n\n " + arrErrorFlds.join('\n'));
        return false;
    }
    
    //start storing the changed distribution lines
    var stSBDId = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_id');
    
    if(!stSBDId)
    {
        return true;
    }
    
    var isChanged = nlapiIsLineItemChanged('custpage_svb_dist_details');
    
    if (isChanged)
    {
        var arrChanged = [];
        var stChanged = nlapiGetFieldValue('custpage_svb_changed_bdsid');
        
        if(stChanged)
        {
            if(stChanged.indexOf(stSBDId)!=-1)
            {
                return true;
            }
            arrChanged = stChanged.split(',');
        }
        arrChanged.push(stSBDId);
        nlapiSetFieldValue('custpage_svb_changed_bdsid',arrChanged.join(','),false,true);
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
* This script is deployed on the suitelet
* This client side script initiate the values on the mapping fields
* 
* @author Jaime Villafuerte III
* @version 1.0
*/
var arrMapFields = null;
function recalc_CopyLines(type,action)
{    
    if(action!='insert')
    {
        return true;
    }
    
    //get the current line
    var currentLine = parseInt(nlapiGetCurrentLineItemIndex('custpage_svb_dist_details'));
    
    arrMapFields = [];
    arrMapFields['custpage_svb_details_line_number']       = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_line_number');
    arrMapFields['custpage_svb_details_sublisttype']       = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_sublisttype');
    arrMapFields['custpage_svb_expense_account']           = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_expense_account');
    arrMapFields['custpage_svb_expense_category']          = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_expense_category');
    arrMapFields['custpage_svb_details_itemid']            = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_itemid');
    arrMapFields['custpage_svb_details_allocation_weight'] = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_allocation_weight');
    arrMapFields['custpage_svb_details_alloc_wt_orig']     = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_alloc_wt_orig');
    arrMapFields['custpage_svb_details_quantity']          = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_quantity');
    arrMapFields['custpage_svb_details_amount_fx']         = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_amount_fx');
    arrMapFields['custpage_svb_details_amount']            = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_amount');
    arrMapFields['custpage_svb_details_amount_orig']       = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_amount_orig');
    arrMapFields['custpage_svb_details_line_amount']       = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_line_amount');
    arrMapFields['custpage_svb_details_subsidiary']        = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_subsidiary');    
    arrMapFields['custpage_svb_details_department']        = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_department');      
    arrMapFields['custpage_svb_details_account']           = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_account');
    arrMapFields['custpage_svb_details_class']             = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_class');
    arrMapFields['custpage_svb_details_location']          = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_location');
    arrMapFields['custpage_svb_details_interco_ar_acct']   = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_interco_ar_acct');
    arrMapFields['custpage_svb_details_interco_ap_acct']   = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_interco_ap_acct');
    arrMapFields['custpage_svb_details_intercompcustomer'] = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_intercompcustomer');
    arrMapFields['custpage_svb_details_intercomp_vendor']  = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_intercomp_vendor');
    
    /*
    alert(arrMapFields['custpage_svb_details_sublisttype'] + ' currentLine' + currentLine);
    
    for(var field in arrMapFields
    {
        alert(field + ' ' + arrMapFields[field])
        nlapiSetCurrentLineItemValue('custpage_svb_dist_details',field,arrMapFields[field],false,true);
    }
    */
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
* This script is deployed on the suitelet
* pre-populate the sublist for dept, class and location
* 
* @author Jaime Villafuerte III
* @version 1.0
*/
function pageInit_StoreAllLines(type)
{
    var arrAllLines = [];
    
    for (var i = 1; count && i <= count; i++)
    {
        var intLineNo = nlapiGetLineItemValue('custpage_svb_dist_details','custpage_svb_details_line_number',i);
        var intTab = nlapiGetLineItemValue('custpage_svb_dist_details','custpage_svb_details_sublisttype',i);
        
        //array for subsidiaries
        if (arrAllLines[intTab + '-' + intLineNo] == null || arrAllLines[intTab + '-' + intLineNo] == undefined)
        {
            arrAllLines[intTab + '-' + intLineNo] = [];
        }
        
        if (stSubsidiary)
        {
            arrAllLines[intTab + '-' + intLineNo].push(stSubsidiary);
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
* This script is deployed as client side validator for the Suitelet. 
* This client side script is used to validate the adjust distribution suitelet
* 
* @author Jaime Villafuerte III
* @version 1.0
*  
*/
function saveRecord_CheckAllocWtPercent(type,name,line)
{
    var arrSum = sumLinePerSubtab('allocamt');
    var arrAmt = arrSum[0];
    var arrWt  = arrSum[1];
    var fDistrTotal = nlapiGetFieldValue('custpage_svb_details_distr_total');
    
    for(line in arrAmt)
    {
        var arrLine = line.split('-');
        var stLineNo = arrLine[1];
        var fTotalLineAmt = arrLine[2];
        var fAmount = eval(arrAmt[line].join('+'));
        var fWeight = eval(arrWt[line].join('+'));
        
        //alert(stLineNo + ' ' + fAmount + ' ' + fTotalLineAmt + ' ' + fWeight);        
        if(fAmount!=fTotalLineAmt) //&& fWeight!=1.0)
        {   var arrLine  = line.split('-');
            var stSubtab = arrLine[0];
                stSubtab = (stSubtab==1) ? 'Item' : 'Expense';
            var stLineNo = arrLine[1];
            alert("The sum of Allocation Weight for each line expense and line item must be 100% \n\nPlease check the total allocation weight for sublist type: " + stSubtab + " and Line#: " + stLineNo);
            return false;
        }
    }
    
    var arrSubsidiaries = getAllLineSubsidiariesPerItem();
    
    for(line in arrSubsidiaries)
    {
        var arrSubsPerItem = arrSubsidiaries[line];
            arrSubsPerItem = removeDuplicate(arrSubsPerItem);
        
        if(arrSubsPerItem.length==1)
        {
            var arrLine = line.split('-');
            var stSubtab = arrLine[0];
                stSubtab = (stSubtab==1) ? 'Item' : 'Expense';
            var stLineNo = arrLine[1];
            alert("Error on Sublist Type: "+ stSubtab +" and Line#: "+ stLineNo +". The allocation specified on the distribution details must have a source and destination subsidiary");
            return false;
        }
    }
    
    var count = nlapiGetLineItemCount('custpage_svb_dist_details');
    
    if(!count || count==0)
    {
        return confirm("Removing ALL the distribution details will reverse the current Allocation Journal and delete all the Distribution Details record. \nClick OK to Confirm \nClick Cancel to abort");
    }
    
    var isAcknowledge = confirm("Warning: Adjusting the allocation weight would reverse the current Allocation Journal and would trigger to create a new allocation. \nClick OK to Confirm \nClick Cancel to abort");
    
    return isAcknowledge;
}



//**********************************************************************SUITELET SCRIPTS - ENDS HERE**********************************************//



//**********************************************************************OTHER SUPPORTING FUNCTIONS - STARTS HERE**********************************************//

function processBillDistribution(recBill,subtab,arrDSL)
{
    try
    {
        var isSuccess = true;
        var intCount  = null;
        var MACHINE   = null;
        
        if (subtab == EXPENSE) 
        {
            intCount = recBill.getLineItemCount('expense');
            MACHINE = 'expense';
        }
        else
        {
            intCount = recBill.getLineItemCount('item');
            MACHINE = 'item';
        }
        nlapiLogExecution('DEBUG','processBillDistribution','intCount=' + intCount);
        
        var stVBSubs = recBill.getFieldValue('subsidiary');
        
        //loop the lines
        for(var i=1; i<=intCount; i++)
        {
            var isExclude = recBill.getLineItemValue(MACHINE,'custcol_svb_bill_distr_exclude',i);
            var stAllocToFollow = recBill.getLineItemValue(MACHINE,'custcol_svb_dist_alloc_det_hidden',i);
            
            //if item and expense exclude
            if(isExclude=='T')
            {
                continue;
            }
            
            if(stAllocToFollow)
            {
                createBillDistributionDetails(recBill,subtab,null,stAllocToFollow,i,null);
            }
            else
            {
                for(var x=0; x<arrDSL.length; x++)
                {
                    var stBDSLSubs  = arrDSL[x].getValue('custrecord_svb_line_subsidiary');
                    var IS_INTER_CO = arrDSL[x].getValue('custrecord_svb_parent_intercomany_alloc','custrecord_svb_line_parent_link');
                    nlapiLogExecution('DEBUG','processBillDistribution','stVBSubs=' + stVBSubs + ' stBDSLSubs=' + stBDSLSubs + ' IS_INTER_CO=' + IS_INTER_CO);
                    
                    (stVBSubs==stBDSLSubs && IS_INTER_CO=='T') ? createBillDistributionDetails(recBill,subtab,arrDSL[x],null,i,true) : 
                                                                 createBillDistributionDetails(recBill,subtab,arrDSL[x],null,i,false);
                }
            }
        }
    }
    catch(error)
    {
        deleteDistributionDetails(recBill.getId(),'delete');
        
        if (error.getDetails != undefined)
        {
            nlapiLogExecution('ERROR', 'Process Error', error.getCode() + ': ' + error.getDetails());
            throw error;
        }
        else
        {
            nlapiLogExecution('ERROR', 'Unexpected Error', error.toString());
            throw nlapiCreateError('99999', error.toString());
        }
    }
    //return isSuccess;
}



//this function create the bill distribution details record for the current vendor bill
function createBillDistributionDetails(recBill,subtab,arrBDSLines,stAllocToFollow,line,isParent)
{
    var objBDS       = {};      
    var isSuccess    = null;
    var fExchRate    = recBill.getFieldValue('exchangerate');
    var stParentSubs = recBill.getFieldValue('subsidiary');
    
    //check if the line is recently adjusted its scheduled distribution details
    if(stAllocToFollow)
    {
        var arrOldDetails = JSON.parse(stAllocToFollow); //TBD
                    
        for(var i=0; arrOldDetails && i<arrOldDetails.length; i++)
        {
            var arrDetails = arrOldDetails[i];
            var objOldDetails = convertBDSArrayToObject(arrDetails);
            
            var fOldAllocWt = objOldDetails.allocwt;
                fOldAllocWt = parseFloat(fOldAllocWt)/100;
            
            if(subtab == EXPENSE)
            {
                objOldDetails.expcat  = recBill.getLineItemValue('expense','category',line);
                objOldDetails.expacct = recBill.getLineItemValue('expense','account',line);
                objOldDetails.lineamt = recBill.getLineItemValue('expense','amount',line);      
            }
            else
            {
                objOldDetails.itemid  = recBill.getLineItemValue('item','item',line);
                objOldDetails.expacct = recBill.getLineItemValue('item','custcol_svb_item_exp_account',line);
                objOldDetails.itemqty = recBill.getLineItemValue('item','quantity',line);
                objOldDetails.lineamt = recBill.getLineItemValue('item','amount',line);                
            }
            
            objOldDetails.foramt  = fOldAllocWt * parseFloat(objOldDetails.lineamt);
            objOldDetails.amount  = (objOldDetails.foramt * fExchRate).toFixed(2);
            
            createUpdateBDSRecord(objOldDetails);
        }
    }
    else
    {
        objBDS.destsubs    = arrBDSLines.getValue('custrecord_svb_line_subsidiary');
        objBDS.tranid      = recBill.getId();
        objBDS.tranidtext  = recBill.getId();
        objBDS.sublist     = subtab;
        objBDS.linenum     = line;
        objBDS.parentlink  = arrBDSLines.getValue('custrecord_svb_line_parent_link');
        objBDS.destdept    = arrBDSLines.getValue('custrecord_svb_line_department');
        objBDS.destclass   = arrBDSLines.getValue('custrecord_svb_line_class');
        objBDS.destloc     = arrBDSLines.getValue('custrecord_svb_line_location');
        objBDS.interaracct = arrBDSLines.getValue('custrecord_svb_line_intercomp_account');
        objBDS.interapacct = arrBDSLines.getValue('custrecord_svb_line_intercomp_ap_account');
        objBDS.destacct    = arrBDSLines.getValue('custrecord_svb_line_account');
        objBDS.intercust   = arrBDSLines.getValue('custrecord_svb_line_intercomp_customer');
        objBDS.intervend   = arrBDSLines.getValue('custrecord_svb_line_intercomp_vendor');
        var fAllocWt       = arrBDSLines.getValue('custrecord_svb_line_allocation_weight');
            fAllocWt       = parseFloat(fAllocWt);
        objBDS.allocwt     = fAllocWt;
        
        var isSourceAcct    = arrBDSLines.getValue('custrecord_svb_use_source_accounts','custrecord_svb_line_parent_link');
        //nlapiLogExecution('DEBUG','createBillDistributionDetails','stBillId='   + stBillId   + ' stSVBParent='   + stSVBParent   + ' stDestSubs='    + stDestSubs    + ' stDept='        + stDept);
        //nlapiLogExecution('DEBUG','createBillDistributionDetails','stClass='    + stClass    + ' stLoc='         + stLoc         + ' stDestSubs='    + stDestSubs    + ' stInterCoAcct=' + stInterCoAcct);
        //nlapiLogExecution('DEBUG','createBillDistributionDetails','stDestAcct=' + stDestAcct + ' stInterCoCust=' + stInterCoCust + ' stInterCoVend=' + stInterCoVend + ' fAllocWt='      + fAllocWt);
        
        //vendor bill line
        var fAmount    = 0.00;
        var fAllocAmt  = 0.00;
        
        if(subtab == EXPENSE)
        {
            objBDS.expcat  = recBill.getLineItemValue('expense','category',line);
            objBDS.expacct = recBill.getLineItemValue('expense','account',line);
            objBDS.lineamt = recBill.getLineItemValue('expense','amount',line);
        }
        else
        {
            objBDS.itemid  = recBill.getLineItemValue('item','item',line);
            objBDS.expacct = recBill.getLineItemValue('item','custcol_svb_item_exp_account',line);
            objBDS.itemqty = recBill.getLineItemValue('item','quantity',line);
            objBDS.lineamt = recBill.getLineItemValue('item','amount',line);                
        }
        nlapiLogExecution('DEBUG','isParent','objBDS.destsubs=' + objBDS.destsubs + ' line=' + line + ' isParent=' + isParent);
        
        var stMachine = (subtab == EXPENSE) ? 'expense' : 'item';
        
        //department, class and location should be sourced on the line if subsidiary is parent
        if(isParent)
        {
            nlapiLogExecution('DEBUG','isParent','line=' + line);
            objBDS.destdept  = recBill.getLineItemValue(stMachine,'department',line);
            objBDS.destclass = recBill.getLineItemValue(stMachine,'class',line);
            objBDS.destloc   = recBill.getLineItemValue(stMachine,'location',line);
            nlapiLogExecution('DEBUG','isParent','objBDS.destdept=' + objBDS.destdept + ' objBDS.destclass=' + objBDS.destclass + ' objBDS.destloc=' + objBDS.destloc);
        }
        
        //if source account on the distribution is checked then get the account on the vendor bill line account
        var isSourceAcct = arrBDSLines.getValue('custrecord_svb_use_source_accounts','custrecord_svb_line_parent_link');
        if(isSourceAcct=='T')
        {
            objBDS.destacct = objBDS.expacct;
        }
        
        //calculate the allocated amount
        fAmount   = (objBDS.lineamt) ? parseFloat(objBDS.lineamt) : 0.00;
        fAllocAmt = (fAmount * fAllocWt/100);
        objBDS.foramt = fAllocAmt;
        objBDS.amount = (fAllocAmt * fExchRate).toFixed(2);
        
        //create the distribution details record    
        createUpdateBDSRecord(objBDS);
        //nlapiLogExecution('DEBUG','Bill Distribution Details Created','isSuccess=' + isSuccess);
    }
    return isSuccess;
}


//converts the object variable to array
function convertBDSObjectToArray(objBDS)
{
    var arrBDS = [];            
    arrBDS.push(objBDS.tranid);           //0
    arrBDS.push(objBDS.tranidtext);       //1
    arrBDS.push(objBDS.destdept);         //2
    arrBDS.push(objBDS.sublist);          //3
    arrBDS.push(objBDS.destsubs);         //4
    arrBDS.push(objBDS.destloc);          //5
    arrBDS.push(objBDS.interaracct);      //6
    arrBDS.push(objBDS.interapacct);      //7
    arrBDS.push(objBDS.destacct);         //8
    arrBDS.push(objBDS.allocwt);          //9
    arrBDS.push(objBDS.intercust);        //10
    arrBDS.push(objBDS.intervend);        //11
    arrBDS.push(objBDS.expcat);           //12
    arrBDS.push(objBDS.expacct);          //13
    arrBDS.push(objBDS.itemid);           //14
    arrBDS.push(objBDS.destclass);        //15
    arrBDS.push(objBDS.linenum);          //16
    arrBDS.push(objBDS.lineamt);          //17
    arrBDS.push(objBDS.foramt);           //18
    arrBDS.push(objBDS.amount);           //19
    arrBDS.push(objBDS.itemqty);          //20
    
    return arrBDS;
}


//converts the array variable to object
function convertBDSArrayToObject(arrBDS)
{
    var objBDS = {};
    objBDS.tranid      = arrBDS[0];
    objBDS.tranidtext  = arrBDS[1];
    objBDS.destdept    = arrBDS[2];
    objBDS.sublist     = arrBDS[3];
    objBDS.destsubs    = arrBDS[4];
    objBDS.destloc     = arrBDS[5];
    objBDS.interaracct = arrBDS[6];
    objBDS.interapacct = arrBDS[7];
    objBDS.destacct    = arrBDS[8];
    objBDS.allocwt     = arrBDS[9];
    objBDS.intercust   = arrBDS[10];
    objBDS.intervend   = arrBDS[11];
    objBDS.expcat      = arrBDS[12];
    objBDS.expacct     = arrBDS[13];
    objBDS.itemid      = arrBDS[14];
    objBDS.destclass   = arrBDS[15];
    objBDS.linenum     = arrBDS[16];
    objBDS.lineamt     = arrBDS[17];
    objBDS.foramt      = arrBDS[18];
    objBDS.amount      = arrBDS[19];
    objBDS.itemqty     = arrBDS[20];
    
    return objBDS;
}


//create or update the bill distribution details
function createUpdateBDSRecord(objBDS,stBDSId)
{
    var arrFields = ['custrecord_svb_details_tran_id_hidden',
                     'custrecord_svb_details_transaction_id',
                     //'custrecord_svb_details_parent_link',
                     'custrecord_svb_details_department',                     
                     'custrecord_svb_details_sublisttype',
                     'custrecord_svb_details_subsidiary',
                     'custrecord_svb_details_location',
                     'custrecord_svb_details_interco_ar_acct',
                     'custrecord_svb_details_interco_ap_acct',
                     'custrecord_svb_details_account',
                     'custrecord_svb_details_allocation_weight',
                     'custrecord_svb_details_intercompcustomer',
                     'custrecord_svb_details_intercomp_vendor',
                     'custrecord_svb_expense_category',
                     'custrecord_svb_expense_account',
                     'custrecord_svb_details_itemid',
                     'custrecord_svb_details_class',
                     'custrecord_svb_details_line_number',
                     'custrecord_svb_details_line_amount',
                     'custrecord_svb_details_foreign_amt',
                     'custrecord_svb_details_amount',
                     'custrecord_svb_details_quantity'];
    
    var arrValues = [setEmptyOnNull(objBDS.tranid),
                     setEmptyOnNull(objBDS.tranidtext),
                     //setEmptyOnNull(objBDS.parentlink),
                     setEmptyOnNull(objBDS.destdept),                     
                     setEmptyOnNull(objBDS.sublist),
                     setEmptyOnNull(objBDS.destsubs),
                     setEmptyOnNull(objBDS.destloc),
                     setEmptyOnNull(objBDS.interaracct),
                     setEmptyOnNull(objBDS.interapacct),
                     setEmptyOnNull(objBDS.destacct),
                     setEmptyOnNull(objBDS.allocwt),
                     setEmptyOnNull(objBDS.intercust),
                     setEmptyOnNull(objBDS.intervend),
                     setEmptyOnNull(objBDS.expcat),
                     setEmptyOnNull(objBDS.expacct),
                     setEmptyOnNull(objBDS.itemid),
                     setEmptyOnNull(objBDS.destclass),
                     setEmptyOnNull(objBDS.linenum),
                     setEmptyOnNull(objBDS.lineamt),
                     setEmptyOnNull(objBDS.foramt),
                     setEmptyOnNull(objBDS.amount),
                     setEmptyOnNull(objBDS.itemqty)];
    
    try
    {
        if (!stBDSId)
        {
            //create the distribution details record
            var recBDD = nlapiCreateRecord('customrecord_svb_bill_dist_details');
            
            //set the bill distribution details record
            for (var i = 0; i < arrFields.length; i++) 
            {
                //nlapiLogExecution('DEBUG','createUpdateBDSRecord',arrFields[i] + '=' + arrValues[i]);
                recBDD.setFieldValue(arrFields[i], arrValues[i]);
            }
            
            var stBDDId = nlapiSubmitRecord(recBDD, true, true);
            nlapiLogExecution('DEBUG', 'Bill Distribution Details Created', 'stBDDId=' + stBDDId);            
        }
        else
        {
            nlapiSubmitField('customrecord_svb_bill_dist_details', stBDSId, arrFields, arrValues);            
        }       
    }
    catch (e) 
    {
        nlapiLogExecution('DEBUG', 'Error Creating Bill Distribution Details', 'Error: ' + e.toString());
        throw nlapiCreateError('Error',e.toString(),false);        
    }
}



//this function delete the distribution details attached to the vendor bill
function deleteDistributionDetails(stVBId,action)
{
    var arrBDD = getBillDistributionDetails(stVBId);
    
    if(arrBDD)
    {
        if(action=='delete')
        {
            for(var i=0; i<arrBDD.length; i++)
            {
                nlapiDeleteRecord('customrecord_svb_bill_dist_details',arrBDD[i].getId());
            }
            nlapiLogExecution('DEBUG','deleteDistributionDetails','All Distribution Details record has been deleted.');
        }
        
        if(action=='inactivate')
        {
            for(var i=0; i<arrBDD.length; i++)
            {
                nlapiSubmitField('customrecord_svb_bill_dist_details',arrBDD[i].getId(),'isinactive','F');
            }
            nlapiLogExecution('DEBUG','deleteDistributionDetails','All Distribution Details record has been inactivated.');
        }
    }
}



//search the bill distribution details custom record that is attached to the transaction
function getBillDistributionDetails(stBillId)
{
    var col = [new nlobjSearchColumn('custrecord_svb_details_parent_link'),
               new nlobjSearchColumn('custrecord_svb_details_department'),
               new nlobjSearchColumn('custrecord_svb_details_transaction_id'),
               new nlobjSearchColumn('custrecord_svb_details_sublisttype').setSort(),
               new nlobjSearchColumn('custrecord_svb_details_subsidiary'),
               new nlobjSearchColumn('custrecord_svb_details_location'),
               new nlobjSearchColumn('custrecord_svb_details_interco_ar_acct'),
               new nlobjSearchColumn('custrecord_svb_details_interco_ap_acct'),
               new nlobjSearchColumn('custrecord_svb_details_account'),
               new nlobjSearchColumn('custrecord_svb_details_allocation_weight'),
               new nlobjSearchColumn('custrecord_svb_details_intercompcustomer'),
               new nlobjSearchColumn('custrecord_svb_details_intercomp_vendor'),
               new nlobjSearchColumn('custrecord_svb_expense_category'),
               new nlobjSearchColumn('custrecord_svb_expense_account'),
               new nlobjSearchColumn('custrecord_svb_details_itemid'),
               new nlobjSearchColumn('custrecord_svb_details_class'),
               new nlobjSearchColumn('custrecord_svb_details_line_number').setSort(),
               new nlobjSearchColumn('custrecord_svb_details_amount'),
               new nlobjSearchColumn('custrecord_svb_details_quantity'),
               new nlobjSearchColumn('custrecord_svb_details_line_amount'),
               new nlobjSearchColumn('custrecord_svb_details_foreign_amt')];
    var fil = [new nlobjSearchFilter('isinactive',null,'is','F'),
               new nlobjSearchFilter('custrecord_svb_details_tran_id_hidden',null,'is',stBillId)];
    //if(stToSubs) fil.push(new nlobjSearchFilter('custrecord_svb_details_subsidiary'),null,'anyof',stToSubs)    
    var res = nlapiSearchRecord('customrecord_svb_bill_dist_details',null,fil,col);
    
    return res;
}



//search the header bill distribution parent custom record
function getDuplicateBillDistributionSchedule(stBDSName)
{
    var col = [new nlobjSearchColumn('custrecord_svb_parent_intercomany_alloc'),
               new nlobjSearchColumn('name')];
    var fil = [new nlobjSearchFilter('name',null,'is',stBDSName)];       
    var res = nlapiSearchRecord('customrecord_svb_bill_dist_sched',null,fil,col);
    
    return res;
}



//search the line distribution template lines
function getDistributionScheduleLine(stBDS)
{
    var col = [new nlobjSearchColumn('custrecord_svb_line_parent_link'),
               new nlobjSearchColumn('custrecord_svb_line_subsidiary'),
               new nlobjSearchColumn('custrecord_svb_line_department'),
               new nlobjSearchColumn('custrecord_svb_line_class'),
               new nlobjSearchColumn('custrecord_svb_line_location'),
               new nlobjSearchColumn('custrecord_svb_line_intercomp_account'),
               new nlobjSearchColumn('custrecord_svb_line_intercomp_ap_account'),
               new nlobjSearchColumn('custrecord_svb_line_account'),
               new nlobjSearchColumn('custrecord_svb_line_allocation_weight'),
               new nlobjSearchColumn('custrecord_svb_line_intercomp_customer'),
               new nlobjSearchColumn('custrecord_svb_line_intercomp_vendor'),
               new nlobjSearchColumn('custrecord_svb_parent_intercomany_alloc','custrecord_svb_line_parent_link'),
               new nlobjSearchColumn('custrecord_svb_source_subsidiary','custrecord_svb_line_parent_link'),
               new nlobjSearchColumn('custrecord_svb_use_source_accounts','custrecord_svb_line_parent_link')];
    var fil = [new nlobjSearchFilter('internalid','custrecord_svb_line_parent_link','anyof',stBDS),
               new nlobjSearchFilter('isinactive',null,'is','F')];
    var res = nlapiSearchRecord('customrecord_svb_line_is_source_sub',null,fil,col);
    nlapiLogExecution('DEBUG','getDistributionScheduleLine','res=' + res);
    
    return res;
}



//this function create the journal entry allocation
function createAllocJournalEntry(recBill,IS_INTERCO,stTrigFrom)
{
    nlapiLogExecution('DEBUG','createAllocJournalEntry','BEGIN - Create Allocation Journal Entry');
    
    var stBillsSubs  = recBill.getFieldValue('subsidiary');   
    var intItemCount = recBill.getLineItemCount('item');
    var intExpCount  = recBill.getLineItemCount('expense');        
    var stJEId       = null;
    
    //search the newly created distribution details
    var arrBDD = getBillDistributionDetails(recBill.getId());
    
    if(!arrBDD)
    {
        return;
    }
    
    if(IS_INTERCO!='T')
    {
        //create the record
        var recJE = nlapiCreateRecord('journalentry');
        
        //set the journal header
        recJE.setFieldValue('subsidiary',stBillsSubs);
        recJE.setFieldValue('custbody_svb_vend_bill_link',recBill.getId());
        recJE.setFieldValue('approved','T');
        
         //set the credit based from item and expense tab
        recJE = setStandardJournalCreditLines(recBill,recJE);
        
        //set the debit based from distribution details
        recJE = setStandardJournalDebitLines(recBill,recJE,arrBDD);        
        
        try
        {
            //save the transaction
            stJEId = nlapiSubmitRecord(recJE,true,true);
            nlapiLogExecution('DEBUG','createJournalEntry','stJEId=' + stJEId);
        }
        catch(e)
        {
            var stErrDetails = 'Error in creating allocation journal entry. Details: ' + e.toString();
            nlapiSubmitField('vendorbill',recBill.getId(),'custbody_svb_error_logs',stErrDetails);
            throw nlapiCreateError('Error',stErrDetails,true);
        }
        
        if(stTrigFrom!='suitelet')
        {
            if(stJEId)
            {
                nlapiSubmitField('vendorbill',recBill.getId(),['custbody_svb_allocation_journal','custbody_svb_error_logs'],[[stJEId],'']);
            }
        }
        else
        {
            recBill.setFieldValues('custbody_svb_allocation_journal',[stJEId]);
            recBill.setFieldValue('custbody_svb_error_logs','');
        }
        nlapiLogExecution('DEBUG','Create Standard Journal Entry','stJEId=' + stJEId);
    }
    else
    {
        var stFrmSubs     = recBill.getFieldValue('subsidiary');
        var stPeriod      = recBill.getFieldValue('postingperiod');
        var stDate        = recBill.getFieldValue('trandate');
        var arrSort       = sortDistributionDetails(arrBDD,stBillsSubs);
        var arrUniqToSubs = arrSort[0];
        var arrSortedBDD  = arrSort[1];
        var arrJEIDs      = [];
        nlapiLogExecution('DEBUG','Create IC Journal Entry','arrUniqToSubs=' + JSON.stringify(arrUniqToSubs));        
        
        //[ [arrParentSub,[arrToSub1,stToSubs1,obj1],[arrToSub1,stToSub2,obj2] ] , --> 2-2
        //  [arrParentSub,[arrToSub1,stToSubs1,obj1],[arrToSub1,stToSub2,obj2] ]   --> 3-2
        //]
        for(var i=0; i<arrUniqToSubs.length; i++)
        {
            var recICJE  = nlapiCreateRecord('intercompanyjournalentry');
            var stCurrToSubs = arrUniqToSubs[i];
            
            //set the ic journal header
            recICJE.setFieldValue('subsidiary',stFrmSubs);
            recICJE.setFieldValue('tosubsidiary',stCurrToSubs);
            recICJE.setFieldValue('custbody_svb_vend_bill_link',recBill.getId());
            recICJE.setFieldValue('approved','T');
            
            //set date and posting period on IC JE based on vendor bill values
            recICJE.setFieldValue('trandate',stDate);
            recICJE.setFieldValue('postingperiod',stPeriod);
            
            for(line in arrSortedBDD)
            {
                var arrLines = arrSortedBDD[line];                
                var arrParentLine = arrLines[0];
                             
                for(var x=1; x<arrLines.length; x++)
                {                                
                    var arrToSubsidiaries = arrSortedBDD[line][x];
                    var arrToSub     = arrToSubsidiaries[0];
                    var stToSub      = arrToSubsidiaries[1];
                    var objToDetails = arrToSubsidiaries[2];                    
                    
                    if(stCurrToSubs!=stToSub)
                    {
                        continue;
                    }
                    
                    recICJE = setICJEParentLines(recBill,recICJE,arrParentLine,stFrmSubs,objToDetails);                
                    recICJE = setICJEToSubsidiaryLines(recBill,recICJE,arrToSub,stCurrToSubs,objToDetails);                
                }
            }
            
            try
            {
                //save the je
                stJEId = nlapiSubmitRecord(recICJE,true,true);
            }
            catch(e)
            {
                //reverse all the ICJE that is recently created
                if(arrJEIDs.length>0)
                {
                    for(var i=0; i<arrJEIDs.length; i++)
                    {
                        var stAllocJrnlId = arrJEIDs[i];
                        nlapiSubmitField('journalentry',stAllocJrnlId,'reversaldate',nlapiDateToString(new Date()));
                    }
                }
                
                var stErrDetails = 'Error in creating allocation journal entry. Details: ' + e.toString();
                nlapiSubmitField('vendorbill',recBill.getId(),'custbody_svb_error_logs',stErrDetails);
                throw nlapiCreateError('Error',stErrDetails,true);
            }
            
            //push the jeid to array
            arrJEIDs.push(stJEId);
            
            nlapiLogExecution('DEBUG','Create IC Journal Entry','To Subsidiary:' + stCurrToSubs + '->  stJEId=' + stJEId);
        }
        
        if(stTrigFrom!='suitelet')
        {
            if(arrJEIDs.length>0)
            {
                nlapiSubmitField('vendorbill',recBill.getId(),['custbody_svb_allocation_journal','custbody_svb_error_logs'],[arrJEIDs,'']);
            }
        }
        else
        {
            recBill.setFieldValues('custbody_svb_allocation_journal',arrJEIDs);
            recBill.setFieldValue('custbody_svb_error_logs','');
        }
    }
    nlapiLogExecution('DEBUG','createAllocJournalEntry','END - Create Allocation Journal Entry');
    
    return recBill;
}



//this function create the "parent subsidiary" lines on the allocation journal entry
function setICJEParentLines(recBill,recICJE,arrSubsBDD,stFrmSubs,objToDetails)
{
    var stMemo = 'System Generated from Vendor Bill #: ' + recBill.getFieldValue('transactionnumber');
    
    var currentLine = recICJE.getLineItemCount('line');
    currentLine = (!currentLine || currentLine==0) ? 1 : currentLine + 1;        
    
    //get the to subsidiary details
    var stToAmount   = objToDetails.amount;
    var stAPAcct     = objToDetails.apacct;
    var stARAcct     = objToDetails.aracct;
    var stICVendor   = objToDetails.vendor;
    var stICCust     = objToDetails.customer;    
    var stExpAccount = arrSubsBDD.getValue('custrecord_svb_expense_account');    
    var stLineDept   = arrSubsBDD.getValue('custrecord_svb_details_department');
    var stLineClass  = arrSubsBDD.getValue('custrecord_svb_details_class');
    var stLineLoc    = arrSubsBDD.getValue('custrecord_svb_details_location');
    //nlapiLogExecution('DEBUG','setICJEParentLines','Line: ' + currentLine + ' stFrmSubs='   + stFrmSubs   + ' stExpAccount=' + stExpAccount);
    //nlapiLogExecution('DEBUG','setICJEParentLines','Line: ' + currentLine + ' stLineAmt='   + stLineAmt   + ' stLineAmt='    + stLineAmt);
    //nlapiLogExecution('DEBUG','setICJEParentLines','Line: ' + currentLine + ' stLineClass=' + stLineClass + ' stLineClass='  + stLineClass + ' stLineLoc=' + stLineLoc);
    
    //set credit
    recICJE.setLineItemValue('line','linesubsidiary',currentLine,stFrmSubs);
    recICJE.setLineItemValue('line','account',currentLine,stExpAccount);
    recICJE.setLineItemValue('line','credit',currentLine,stToAmount);
    recICJE.setLineItemValue('line','department',currentLine,stLineDept);
    recICJE.setLineItemValue('line','class',currentLine,stLineClass);
    recICJE.setLineItemValue('line','location',currentLine,stLineLoc);
    recICJE.setLineItemValue('line', 'memo', currentLine, stMemo);
    recICJE.setLineItemValue('line','eliminate',currentLine,'F');
    
    //enter on the next line
    currentLine = currentLine + 1;
    
    //set debit
    recICJE.setLineItemValue('line','linesubsidiary',currentLine,stFrmSubs);
    recICJE.setLineItemValue('line','account',currentLine,stARAcct);
    recICJE.setLineItemValue('line','debit',currentLine,stToAmount);
    recICJE.setLineItemValue('line','department',currentLine,stLineDept);
    recICJE.setLineItemValue('line','class',currentLine,stLineClass);
    recICJE.setLineItemValue('line','location',currentLine,stLineLoc);
    recICJE.setLineItemValue('line', 'memo', currentLine, stMemo);
    recICJE.setLineItemValue('line','entity',currentLine,stICCust);
    recICJE.setLineItemValue('line','eliminate',currentLine,'T');
    
    return recICJE;
}



//this function create the "to subsidiary" lines on the allocation journal entry
function setICJEToSubsidiaryLines(recBill,recICJE,arrSubsBDD,stToSubs,objToDetails)
{
    var stMemo = 'System Generated from Vendor Bill #: ' + recBill.getFieldValue('transactionnumber');
    
    var currentLine = recICJE.getLineItemCount('line');
    currentLine = (!currentLine || currentLine == 0) ? 1 : currentLine + 1;
    
    var stAPAcct     = arrSubsBDD.getValue('custrecord_svb_details_interco_ap_acct');
    var stICVendor   = arrSubsBDD.getValue('custrecord_svb_details_intercomp_vendor');
    var stExpAccount = arrSubsBDD.getValue('custrecord_svb_expense_account');
    var stToAmount   = arrSubsBDD.getValue('custrecord_svb_details_amount');
    var stLineDept   = arrSubsBDD.getValue('custrecord_svb_details_department');
    var stLineClass  = arrSubsBDD.getValue('custrecord_svb_details_class');
    var stLineLoc    = arrSubsBDD.getValue('custrecord_svb_details_location');
    var stDestAcct   = arrSubsBDD.getValue('custrecord_svb_details_account');
    //nlapiLogExecution('DEBUG','setICJEToSubsidiaryLines','Line: ' + currentLine + ' stToSubs='    + stToSubs    + ' stExpAccount=' + stExpAccount);
    //nlapiLogExecution('DEBUG','setICJEToSubsidiaryLines','Line: ' + currentLine + ' stLineAmt='   + stLineAmt   + ' stLineAmt='    + stLineAmt);
    //nlapiLogExecution('DEBUG','setICJEToSubsidiaryLines','Line: ' + currentLine + ' stLineClass=' + stLineClass + ' stLineClass='  + stLineClass);
       
    //set credit
    recICJE.setLineItemValue('line', 'linesubsidiary', currentLine, stToSubs);
    recICJE.setLineItemValue('line', 'account', currentLine, stAPAcct);
    recICJE.setLineItemValue('line', 'credit', currentLine, stToAmount);
    recICJE.setLineItemValue('line', 'department', currentLine, stLineDept);
    recICJE.setLineItemValue('line', 'class', currentLine, stLineClass);
    recICJE.setLineItemValue('line', 'location', currentLine, stLineLoc);
    recICJE.setLineItemValue('line', 'memo', currentLine, stMemo);
    recICJE.setLineItemValue('line','entity',currentLine,stICVendor);    
    recICJE.setLineItemValue('line','eliminate',currentLine,'T');
    
    //enter on the next line
    currentLine = currentLine + 1;
    
     //set debit
    recICJE.setLineItemValue('line', 'linesubsidiary', currentLine, stToSubs);
    recICJE.setLineItemValue('line', 'account', currentLine, stDestAcct);
    recICJE.setLineItemValue('line', 'debit', currentLine, stToAmount);
    recICJE.setLineItemValue('line', 'department', currentLine, stLineDept);
    recICJE.setLineItemValue('line', 'class', currentLine, stLineClass);
    recICJE.setLineItemValue('line', 'location', currentLine, stLineLoc);
    recICJE.setLineItemValue('line', 'memo', currentLine, stMemo);
    recICJE.setLineItemValue('line', 'eliminate', currentLine, 'F');
    
    return recICJE;
}



//this function sorts the distribution details per subsidiary
function sortDistributionDetails(arrBDD,stParentSubs)
{
    var arrSubsSorted = [];
    var arrParentSubs = [];
    var intParent     = 0;
    var intToSub      = 0;    
    var arrLines      = [];
    var arrUniqToSubs = [];
    
    //set first the parent subsidiary
    for(var i=0; i<arrBDD.length; i++)
    {
        var stLineNo   = arrBDD[i].getValue('custrecord_svb_details_line_number');
        var stSubtab   = arrBDD[i].getValue('custrecord_svb_details_sublisttype');
        var stToSubs   = arrBDD[i].getValue('custrecord_svb_details_subsidiary');
        var stAllocAmt = arrBDD[i].getValue('custrecord_svb_details_amount');
        
        if(stParentSubs==stToSubs)
        {
            if(arrLines[stLineNo + '-' + stSubtab]==null || 
               arrLines[stLineNo + '-' + stSubtab]==undefined)
            {
                arrLines[stLineNo + '-' + stSubtab] = [];
            }
            arrLines[stLineNo + '-' + stSubtab].push(arrBDD[i]);            
        }
    }
    
    //then set the to-subsidiary and the amount
    for(var i=0; i<arrBDD.length; i++)
    {
        var stLineNo   = arrBDD[i].getValue('custrecord_svb_details_line_number');
        var stSubtab   = arrBDD[i].getValue('custrecord_svb_details_sublisttype');
        var stToSubs   = arrBDD[i].getValue('custrecord_svb_details_subsidiary');
        var stAllocAmt = arrBDD[i].getValue('custrecord_svb_details_amount');
        var stAPAcct   = arrBDD[i].getValue('custrecord_svb_details_interco_ap_acct');
        var stARAcct   = arrBDD[i].getValue('custrecord_svb_details_interco_ar_acct');
        var stICVendor = arrBDD[i].getValue('custrecord_svb_details_intercomp_vendor');
        var stICCust   = arrBDD[i].getValue('custrecord_svb_details_intercompcustomer');        
        
        var objToSubsDetails = {amount:stAllocAmt, apacct:stAPAcct, aracct:stARAcct, vendor:stICVendor, customer:stICCust};
        
        if(stParentSubs!=stToSubs)
        {
            arrLines[stLineNo + '-' + stSubtab].push([arrBDD[i],stToSubs,objToSubsDetails]);
            var isUnique = arrUniqToSubs.indexOf(stToSubs);
            if(isUnique==-1) arrUniqToSubs.push(stToSubs);
        }
    }
    
    nlapiLogExecution('DEBUG','sortDistributionDetails','arrLines=' + JSON.stringify(arrLines));
    
    return [arrUniqToSubs,arrLines];
}



//this function set the standard journal allocation credit lines
function setStandardJournalCreditLines(recBill,recJE)
{
    //set the journal credit line for expense
    var arrSubTab = [];
        arrSubTab.push('item');
        arrSubTab.push('expense');
    
    var currentLine = recJE.getLineItemCount('line');
        currentLine = (!currentLine || currentLine==0) ? 1 : currentLine + 1;
    
    var stMemo = 'System Generated from Vendor Bill #: ' + recBill.getFieldValue('transactionnumber');
    var fExchRate = recBill.getFieldValue('exchangerate');
    
    for(var x=0; x<arrSubTab.length; x++)
    {
        var count = recBill.getLineItemCount(arrSubTab[x]);
        
        for(var i=1; count && count!=0 && i<=count; i++)
        {            
            var isExclude = recBill.getLineItemValue(arrSubTab[x],'custcol_svb_bill_distr_exclude',i);
            
            if(isExclude=='T')
            {
                continue;
            }
            
            var stItemId       = recBill.getLineItemValue(arrSubTab[x],'item',i);
            var stBillLineAcct = (arrSubTab[x]=='expense') ? recBill.getLineItemValue(arrSubTab[x],'account',i) : 
                                                             recBill.getLineItemValue(arrSubTab[x],'custcol_svb_item_exp_account',i);
            
            var fBillLineAmt = recBill.getLineItemValue(arrSubTab[x],'amount',i);
                fBillLineAmt = parseFloat(fBillLineAmt) * fExchRate;
                fBillLineAmt = fBillLineAmt.toFixed(2);           
            
            var stBillLineDept  = recBill.getLineItemValue(arrSubTab[x],'department',i);
            var stBillLineClass = recBill.getLineItemValue(arrSubTab[x],'class',i);
            var stBillLineLoc   = recBill.getLineItemValue(arrSubTab[x],'location',i);
            
            recJE.setLineItemValue('line','account',currentLine,stBillLineAcct);
            recJE.setLineItemValue('line','credit',currentLine,fBillLineAmt);
            recJE.setLineItemValue('line','department',currentLine,stBillLineDept);
            recJE.setLineItemValue('line','class',currentLine,stBillLineClass);
            recJE.setLineItemValue('line','location',currentLine,stBillLineLoc);
            recJE.setLineItemValue('line','memo',currentLine,stMemo);
            nlapiLogExecution('DEBUG','setStandardJournalCreditLines','stBillLineAcct=' + stBillLineAcct + ' fBillLineAmt=' + fBillLineAmt + ' stBillLineDept=' + stBillLineDept);
            nlapiLogExecution('DEBUG','setStandardJournalCreditLines','stBillLineClass=' + stBillLineClass + ' stBillLineLoc=' + stBillLineLoc + ' currentLine=' + currentLine);
            
            currentLine++;
        }
    }
    
    nlapiLogExecution('DEBUG','setStandardJournalDebitLines','Count=' + recJE.getLineItemCount('line'));
    return recJE;
}


//this function set the standard journal allocation debit lines
function setStandardJournalDebitLines(recBill,recJE,arrBDD)
{
    var stMemo = 'System Generated from Vendor Bill #: ' + recBill.getFieldValue('transactionnumber');
    
    var currentLine = recJE.getLineItemCount('line');
        currentLine = (!currentLine || currentLine==0) ? 1 : currentLine + 1;
    
    for(var i=0; i<arrBDD.length; i++)
    {
        var stDebitLineAcct  = arrBDD[i].getValue('custrecord_svb_details_account');
        var fDebitLineAmt    = arrBDD[i].getValue('custrecord_svb_details_amount');
            fDebitLineAmt    = parseFloat(fDebitLineAmt);
        
        var stDebitLineDept  = arrBDD[i].getValue('custrecord_svb_details_department');
        var stDebitLineClass = arrBDD[i].getValue('custrecord_svb_details_class');
        var stDebitLineLoc   = arrBDD[i].getValue('custrecord_svb_details_location'); 
        nlapiLogExecution('DEBUG','setStandardJournalDebitLines','stDebitLineAcct=' + stDebitLineAcct + ' stDebitLineAmt=' + fDebitLineAmt + ' stDebitLineDept=' + stDebitLineDept);
        nlapiLogExecution('DEBUG','setStandardJournalDebitLines','stDebitLineClass=' + stDebitLineClass + ' stDebitLineLoc=' + stDebitLineLoc + ' currentLine=' + currentLine);
        
        //set journal debit lines
        recJE.setLineItemValue('line','account',currentLine,stDebitLineAcct);           
        recJE.setLineItemValue('line','debit',currentLine,fDebitLineAmt);
        recJE.setLineItemValue('line','department',currentLine,stDebitLineDept);
        recJE.setLineItemValue('line','class',currentLine,stDebitLineClass);
        recJE.setLineItemValue('line','location',currentLine,stDebitLineLoc);
        recJE.setLineItemValue('line','memo',currentLine,stMemo);
                
        currentLine ++;
    }
    
    nlapiLogExecution('DEBUG','setStandardJournalDebitLines','Count=' + recJE.getLineItemCount('line'));
    return recJE;
}


//this function returns the total line count that is for allocation
function getAllLinesForAllocation(recBill)
{
    //get the total item, expense count and schedule line count
    var intItemLines = recBill.getLineItemCount('item');
        intItemLines = (intItemLines!=0 && intItemLines) ? intItemLines : 0;
    var intExpLines  = recBill.getLineItemCount('expense');
        intExpLines  = (intExpLines!=0 && intExpLines) ? intExpLines : 0;
    
    var intItemForAlloc = 0;
    var intExpForAlloc  = 0;
    
    for(var i=1; i<=intItemLines; i++)
    {        
        var stAmortize = recBill.getLineItemValue('item','amortizationsched',i);
        var stItemType = recBill.getLineItemValue('item','itemtype',i);
                
        if(stItemType=='InvtPart' || stAmortize)
        {
            continue;
        }        
        intItemForAlloc++;
    }
    
    for(var i=1; i<=intExpLines; i++)
    {        
        var stAmortize = recBill.getLineItemValue('expense','amortizationsched',i);
                
        if(stAmortize)
        {
            continue;
        }
        intExpForAlloc++;
    }
    
    return (intItemForAlloc + intExpForAlloc);
}


//reverse the current allocation journal entry that is set on the vendor bill record.
function reverseAllocJournalEntry(arrAllocJrnl)
{
    //var arrAllocJrnl = recBill.getFieldValues('custbody_svb_allocation_journal');    
    if(arrAllocJrnl)
    {
        for(var i=0; i<arrAllocJrnl.length; i++)
        {
            var stAllocJrnlId = arrAllocJrnl[i];
            nlapiSubmitField('journalentry',stAllocJrnlId,'reversaldate',nlapiDateToString(new Date()));
        }
    }   
}


//reverse the current allocation journal entry that is set on the vendor bill record.
function searchAllocJEAndReverse(arrAllocJE)
{
    var arrCol = [];
    var arrFil = [];
    var arrAllocJrnl = nlapiSearchRecord('journalentry',null,arrFil,arrCol);
    
    if (arrAllocJrnl)
    {
        for(var i=0; i<arrAllocJrnl.length; i++)
        {
            var stAllocJrnlId = arrAllocJrnl[i];
            nlapiSubmitField('journalentry',stAllocJrnlId,'reversaldate',nlapiDateToString(new Date()));
        }
    }
}


function onSaveBDSLValidations(type)
{
    var stSchedParent = nlapiGetFieldValue('custrecord_svb_line_parent_link');
    
    if(type=='client' && !stSchedParent)
    {
        alert('Error: record cannot be saved. This child custom record must be associated to the parent record - Bill Distribution Schedule.');
        return false;
    }
        
    var isIntercoBillDistri = nlapiGetFieldValue('custrecord_svb_line_is_intercompany');
    var arrFlds = (isIntercoBillDistri=='T') ? INTERCO_MANDATORY_FLDS.split(',') :
                                               NON_INTCO_MANDATORY_FLDS.split(',');
    
    var hasError = false;
    var arrErrorFlds = [];
    var stSrcSubs = nlapiGetFieldValue('custrecord_svb_line_is_source_sub');
    
    if(stSrcSubs=='F' && isIntercoBillDistri=='T')
    {
        arrFlds.push('custrecord_svb_line_intercomp_account');
        arrFlds.push('custrecord_svb_line_intercomp_customer');
        arrFlds.push('custrecord_svb_line_intercomp_ap_account');
        arrFlds.push('custrecord_svb_line_intercomp_vendor');
    }
    
    for(var i=0; i<arrFlds.length; i++)
    {
        var stValue = nlapiGetFieldValue(arrFlds[i]);
        
        if(!stValue || stValue=='')
        {
            var objFld  = nlapiGetField(arrFlds[i]);            
            var stLabel = objFld.getLabel();
            
            if(!stLabel)
            {
                stLabel = arrFlds[i];
            }
                      
            arrErrorFlds.push(stLabel);
            hasError = true;
        }
    }
    
    //mandatory with conditions
    var isSourceAcct = nlapiGetFieldValue('custrecord_svb_line_use_src_acct');
    var stDestAcct = nlapiGetFieldValue('custrecord_svb_line_account');
    
    if(isSourceAcct!='T' && !stDestAcct)
    {
        arrErrorFlds.push('Destination Account');
        hasError = true;
    }
    
    if(hasError)
    {
        alert("Please enter value for the following fields : \n\n " + arrErrorFlds.join('\n'));
        return false;
    }
    else
    {
        var stBDS     = nlapiGetFieldValue('custrecord_svb_line_parent_link');
        var arrResult = (stBDS) ? getDistributionScheduleLine(stBDS) : null;
        var fTotalWt  = nlapiGetFieldValue('custrecord_svb_line_allocation_weight');
            fTotalWt  = parseFloat(fTotalWt);
        
        if(arrResult)
        {
            for(var i=0; i<arrResult.length; i++)
            {
                if(arrResult[i].getId()==nlapiGetRecordId())
                {
                    continue
                }
                var fAllocWt = arrResult[i].getValue('custrecord_svb_line_allocation_weight');
                    fAllocWt = parseFloat(fAllocWt);
                
                //add the current wt            
                fTotalWt += fAllocWt;
            }
        }
        
        //alert(fTotalWt);
        
        if(fTotalWt < 100 && type=='client')
        {
            alert("Warning: The sum of all distribution schedule line's allocation weight is currently less than 100%");
        }
        else if(fTotalWt > 100)
        {
            if(type=='client')
            {
                alert("Error: The sum of all distribution schedule line's allocation weight is over 100%. The total allocation weight must be exactly 100%");
                return false;
            }
            else
            {
                throw nlapiCreateError('Error',"The sum of all distribution schedule line's allocation weight is over 100%. The total allocation weight must be exactly 100%",true);
            }
        }
    }
    return true;
}



//validate whether the following fields setup in the script parameter where changed
function hasFieldChanges(recBill)
{
    var recNew = null;
    var recOld = null;
    
    if(!recBill)
    {
        recNew = nlapiGetNewRecord();
	    recOld = nlapiGetOldRecord();    
    }
    else
    {        
        recOld = recBill;
    }
    
	var arrHeaderFields = (HEADER_CHANGE_FLDS) ? HEADER_CHANGE_FLDS.split(',') : [];
	var arrLineFields = (LINE_CHANGE_FLDS) ? LINE_CHANGE_FLDS.split(',') : [];
    var hasChanges = false;
    
	for(var i = 0; i<arrHeaderFields.length; i++)
    {
		var newValue = (!recBill) ? recNew.getFieldValue(arrHeaderFields[i]) : nlapiGetFieldValue(arrHeaderFields[i])
		var oldValue = recOld.getFieldValue(arrHeaderFields[i]);
        
		if(newValue != oldValue)
        {
			hasChanges = true;
			nlapiLogExecution('DEBUG', 'hasFieldChanges', 'Field Value Changed: ' + arrHeaderFields[i] + ' New Value=' + newValue + ' Old Value=' + oldValue);
            break;
		}
	}
    
    if(!hasChanges)
    {
        var oldItemCount = recOld.getLineItemCount('item');
        var oldExpCount  = recOld.getLineItemCount('expense');
        
        if(!recBill)
        {
            var newItemCount = recNew.getLineItemCount('item');
    	    var newExpCount  = recNew.getLineItemCount('expense');
        }
        else
        {
            var newItemCount = nlapiGetLineItemCount('item');
    	    var newExpCount  = nlapiGetLineItemCount('expense');
        }
        
        if(oldItemCount!=newItemCount)
        {
            hasChanges = true;
            nlapiLogExecution('DEBUG', 'hasFieldChanges', 'Item Line Count Changed: Old Line Item Count=' + oldItemCount + '  New Line Item Count=' + newItemCount);
        }
        
        if(oldExpCount!=newExpCount)
        {
            hasChanges = true;
            nlapiLogExecution('DEBUG', 'hasFieldChanges', 'Expense Line Count Changed: Old Line Item Count=' + oldExpCount + '  New Line Item Count=' + newExpCount);
        }
        
        if(!hasChanges)
        {
            if(!recBill)
            {
                for(var x=1; x<=newItemCount; x++)
                {
                    var isExcludeOld = recOld.getLineItemValue('item','custcol_svb_bill_distr_exclude',x);
                    var isExcludeNew = recNew.getLineItemValue('item','custcol_svb_bill_distr_exclude',x);
                
                    //if item and expense exclude
                    if(isExcludeOld=='T' && isExcludeNew=='T')
                    {
                        continue
                    }
                    
                    for (var i = 0; i<arrLineFields.length; i++) 
                    {
                        var newValue = recNew.getLineItemValue('item',arrLineFields[i],x);
                		var oldValue = recOld.getLineItemValue('item',arrLineFields[i],x);                    
                        
                		if(newValue != oldValue)
                        {
                			hasChanges = true;                                        
                			nlapiLogExecution('DEBUG', 'hasFieldChanges', 'Item Line Field Value Changed: ' + arrLineFields[i] + ' New Value=' + newValue + ' Old Value=' + oldValue);			
                            break;
                		}
                    }
                }
                
                for(var x=1; !hasChanges && x<=newExpCount; x++)
                {
                    var isExcludeOld = recOld.getLineItemValue('expense','custcol_svb_bill_distr_exclude',x);
                    var isExcludeNew = recNew.getLineItemValue('expense','custcol_svb_bill_distr_exclude',x);
                    
                    //if item and expense exclude
                    if(isExcludeOld=='T' && isExcludeNew=='T')
                    {
                        continue
                    }
                    
                    for (var i = 0; i<arrLineFields.length; i++) 
                    {
                        var newValue = recNew.getLineItemValue('expense',arrLineFields[i],x);
                            newValue = (newValue!=undefined && newValue!=null && newValue!='') ? newValue : null;
                		var oldValue = recOld.getLineItemValue('expense',arrLineFields[i],x);               
                            oldValue = (oldValue!=undefined && oldValue!=null && oldValue!='') ? oldValue : null;
                        
                		if(newValue != oldValue)
                        {
                			hasChanges = true;                                        
                			nlapiLogExecution('DEBUG', 'hasFieldChanges', 'Expense Line Field Value Changed: ' + arrLineFields[i] + ' New Value=' + newValue + ' Old Value=' + oldValue);			
                            break;
                		}
                    }
                }
            }
            else
            {
                for(var x=1; x<=newItemCount; x++)
                {
                    var isExcludeOld = recOld.getLineItemValue('item','custcol_svb_bill_distr_exclude',x);
                    var isExcludeNew = nlapiGetLineItemValue('item','custcol_svb_bill_distr_exclude',x);
                    
                    //if item and expense exclude
                    if(isExcludeOld=='T' && isExcludeNew=='T')
                    {
                        continue;
                    }
                    
                    for (var i = 0; i<arrLineFields.length; i++)
                    {
                        var newValue = nlapiGetLineItemValue('item',arrLineFields[i],x);
                		var oldValue = recOld.getLineItemValue('item',arrLineFields[i],x);                    
                        
                		if(newValue != oldValue)
                        {
                			hasChanges = true;                                        
                			nlapiLogExecution('DEBUG', 'hasFieldChanges', 'Item Line Field Value Changed: ' + arrLineFields[i] + ' New Value=' + newValue + ' Old Value=' + oldValue);			
                            break;
                		}
                    }
                }
                
                for(var x=1; !hasChanges && x<=newExpCount; x++)
                {
                    var isExcludeOld = recOld.getLineItemValue('expense','custcol_svb_bill_distr_exclude',x);
                    var isExcludeNew = nlapiGetLineItemValue('expense','custcol_svb_bill_distr_exclude',x);
                    
                    //if item and expense exclude
                    if(isExcludeOld=='T' && isExcludeNew=='T')
                    {
                        continue
                    }
                    
                    for (var i = 0; i<arrLineFields.length; i++) 
                    {
                        var newValue = nlapiGetLineItemValue('expense',arrLineFields[i],x);
                            newValue = (newValue!=undefined && newValue!=null && newValue!='') ? newValue : null;
                		var oldValue = recOld.getLineItemValue('expense',arrLineFields[i],x);                    
                            oldValue = (oldValue!=undefined && oldValue!=null && oldValue!='') ? oldValue : null;
                            
                		if(newValue != oldValue)
                        {
                			hasChanges = true;                                        
                			nlapiLogExecution('DEBUG', 'hasFieldChanges', 'Expense Line Field Value Changed: ' + arrLineFields[i] + ' New Value=' + newValue + ' Old Value=' + oldValue);			
                            break;
                		}
                    }
                }
            }
        }
    }        
    nlapiLogExecution('DEBUG','hasFieldChanges','hasChanges=' + hasChanges);
    return hasChanges;
}



function validateScheduleDistributionLine(type,name)
{
    if(type=='suitelet')
    {
        if(name!='custpage_svb_details_interco_ar_acct' && 
           name!='custpage_svb_details_interco_ap_acct' &&
           name!='custpage_svb_details_intercompcustomer' &&        
           name!='custpage_svb_details_intercomp_vendor' && 
           name!='custpage_svb_details_subsidiary' && 
           name!='custpage_svb_details_department' && 
           name!='custpage_svb_details_class' && 
           name!='custpage_svb_details_location' &&
           name!='custpage_svb_details_account')
        {
            return true;
        }
    }
    else
    {
        if(name!='custrecord_svb_line_intercomp_account' && 
           name!='custrecord_svb_line_intercomp_ap_account' &&
           name!='custrecord_svb_line_intercomp_customer' &&        
           name!='custrecord_svb_line_intercomp_vendor' && 
           name!='custrecord_svb_line_subsidiary' && 
           name!='custrecord_svb_line_department' && 
           name!='custrecord_svb_line_class' && 
           name!='custrecord_svb_line_location' &&
           name!='custrecord_svb_line_account')
        {
            return true;
        }
    }
    
    var isValid = true;
    
    if(name=='custpage_svb_details_subsidiary' || name=='custrecord_svb_line_subsidiary')
    {
        if(type=='suitelet')
        {
            nlapiSetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_department','',false,true);
            nlapiSetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_class','',false,true);
            nlapiSetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_location','',false,true);
            nlapiSetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_account','',false,true);       
            nlapiSetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_interco_ar_acct','',false,true);
            nlapiSetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_interco_ap_acct','',false,true);
            nlapiSetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_intercompcustomer','',false,true);
            nlapiSetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_intercomp_vendor','',false,true);
        }
        else
        {
            nlapiSetFieldValue('custrecord_svb_line_class','',false,false);
            nlapiSetFieldValue('custrecord_svb_line_department','',false,false);
            nlapiSetFieldValue('custrecord_svb_line_location','',false,false);
            nlapiSetFieldValue('custrecord_svb_line_account','',false,false);    
            nlapiSetFieldValue('custrecord_svb_line_intercomp_ap_account','',false,false);
            nlapiSetFieldValue('custrecord_svb_line_intercomp_account','',false,false);
            nlapiSetFieldValue('custrecord_svb_line_intercomp_customer','',false,false);
            nlapiSetFieldValue('custrecord_svb_line_intercomp_vendor','',false,false);
        }
    }
    else
    {
        if(type == 'suitelet')
        {
            var stParentSubs = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_schedule_src_subs');
            var stParentTxt  = nlapiGetCurrentLineItemText('custpage_svb_dist_details','custpage_svb_schedule_src_subs');
            var isInterCo    = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_schedule_is_interco');
            var stFldValue   = nlapiGetCurrentLineItemValue('custpage_svb_dist_details',name);
            var stFldText    = nlapiGetCurrentLineItemText('custpage_svb_dist_details',name);            
            var stSubs       = (isInterCo=='T') ? nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_subsidiary') : stParentSubs;                                                 
            var stSubsTxt    = (isInterCo=='T') ? nlapiGetCurrentLineItemText('custpage_svb_dist_details','custpage_svb_details_subsidiary') : stParentTxt;   
            var stAPAccount  = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_interco_ap_acct');        
            var stARAccount  = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_interco_ar_acct');        
            var stARCustId   = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_intercompcustomer');        
            var stAPVendId   = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_intercomp_vendor');        
        }
        else
        {
            var stParentSubs = nlapiGetFieldValue('custrecord_svb_source_subs_from_parent');
            var stParentTxt  = nlapiGetFieldText('custrecord_svb_source_subs_from_parent');
            var isInterCo    = nlapiGetFieldValue('custrecord_svb_line_is_intercompany');
            var stFldValue   = nlapiGetFieldValue(name);
            var stFldText    = nlapiGetFieldText(name);
            var stSubs       = (isInterCo=='T') ? nlapiGetFieldValue('custrecord_svb_line_subsidiary') : stParentSubs;
            var stSubsTxt    = (isInterCo=='T') ? nlapiGetFieldText('custrecord_svb_line_subsidiary') : stParentTxt;
            var stAPAccount  = nlapiGetFieldValue('custrecord_svb_line_intercomp_ap_account');            
            var stARAccount  = nlapiGetFieldValue('custrecord_svb_line_intercomp_account');            
            var stARCustId   = nlapiGetFieldValue('custrecord_svb_line_intercomp_customer');            
            var stAPVendId   = nlapiGetFieldValue('custrecord_svb_line_intercomp_vendor');            
        }
        
        //alert(stSubs + ' ' + stParentSubs + ' ' +  isInterCo);
        
        //check if the following department belongs to the subsidiary
        if(( name=='custpage_svb_details_department' || 
             name=='custrecord_svb_line_department') && 
           stFldValue)
        {
            //check if the following department belongs to the subsidiary
            isValid = checkWithinSubsidiary('department',stFldValue,stSubs);
            if(!isValid) alert('The department selected "' + stFldText + '" does not belong to subsidiary "' + stSubsTxt + '"');            
        }
        else if(( name=='custpage_svb_details_class' || 
                  name=='custrecord_svb_line_class') && 
                stFldValue)
        {
            //check if the following class belongs to the subsidiary
            isValid = checkWithinSubsidiary('classification',stFldValue,stSubs);
            if(!isValid) alert('The class selected "' + stFldText + '" does not belong to subsidiary "' + stSubsTxt + '"');  
        }
        else if(( name=='custpage_svb_details_location' || 
                  name=='custrecord_svb_line_location') && 
                 stFldValue)
        {
            //check if the following location belongs to the subsidiary
            isValid = checkWithinSubsidiary('location',stFldValue,stSubs);
            if(!isValid) alert('The location selected "' + stFldText + '" does not belong to subsidiary "' + stSubsTxt + '"');  
        }
        else if(( name=='custpage_svb_details_account' || 
                  name=='custrecord_svb_line_account') && 
                 stFldValue)
        {
            //check if the following account belongs to the subsidiary
            isValid = checkWithinSubsidiary('account',stFldValue,stSubs);
            if(!isValid) alert('The destination account selected "' + stFldText + '" does not belong to subsidiary "' + stSubsTxt + '"');  
        }
        else if(( name=='custpage_svb_details_interco_ar_acct' || 
                  name=='custpage_svb_details_intercompcustomer' || 
                  name=='custrecord_svb_line_intercomp_account' || 
                  name=='custrecord_svb_line_intercomp_customer')  && 
                stARAccount && 
                stARCustId && 
                stSubs
               )
        {
            //check the AR Account against the elimination customer
            isValid = checkAPAndARAccount(stARAccount,'customer',stARCustId,type,stParentSubs);
        }
        else if (( name=='custpage_svb_details_interco_ap_acct' || 
                   name=='custpage_svb_details_intercomp_vendor' || 
                   name=='custrecord_svb_line_intercomp_ap_account' || 
                   name=='custrecord_svb_line_intercomp_vendor')  && 
                  stAPAccount && 
                  stAPVendId && 
                  stSubs
                )
        {
            //check the AP Account against the elimination vendor
            isValid = checkAPAndARAccount(stAPAccount,'vendor',stAPVendId,type,stParentSubs);
        }
    }
    return isValid;
}


//this function validate the AP and AR account on the bill distribution scheduled lines
function checkAPAndARAccount(stAccount,stEntityType,stEntityId,stTriggerFrom,stParentSubs)
{
    var isValid = true;
    
    var recAcct      = nlapiLoadRecord('account',stAccount);
    var arrAcctSubs  = recAcct.getFieldValue('subsidiary');
        arrAcctSubs  = (typeof arrAcctSubs=='string') ? arrAcctSubs.split(',') : arrAcctSubs;
    var bIsEliminate = recAcct.getFieldValue('eliminate');
    var arrEntity    = nlapiLookupField(stEntityType,stEntityId,['subsidiary','representingsubsidiary']);
    var stEntSubs    = arrEntity.subsidiary;
    var stEntRepSubs = arrEntity.representingsubsidiary;
    
    if(stTriggerFrom=='suitelet')
    {
        var stDestSubs = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_subsidiary');
        var stParentId = nlapiGetFieldValue('custpage_svb_schedule_template');
        //var stParentSubs  = nlapiLookupField('customrecord_svb_bill_dist_sched',stParentId,'custrecord_svb_source_subsidiary');
    }
    else
    {
        var stDestSubs = nlapiGetFieldValue('custrecord_svb_line_subsidiary');
        var stParentId = nlapiGetFieldValue('custrecord_svb_line_parent_link');
        //var stParentSubs  = nlapiLookupField('customrecord_svb_bill_dist_sched',stParentId,'custrecord_svb_source_subsidiary');
    }
    
    if(bIsEliminate!='T')
    {
        (stEntityType=='customer') ? alert('Intercompany AR Account must have the "Eliminate Intercompany Transactions" field checked.') :
                                     alert('Intercompany AP Account must have the "Eliminate Intercompany Transactions" field checked.');
        return false;
    }
    
    if((arrAcctSubs.indexOf(stEntSubs)==-1 || arrAcctSubs.indexOf(stParentSubs)==-1) && stEntityType=='customer')
    {
        alert("Both Intercompany AR Account subsidiary and Intercompany Customer subsidiary must be the same with Source subsidiary");
        isValid = false;
    }
    else if((arrAcctSubs.indexOf(stEntSubs)==-1 || arrAcctSubs.indexOf(stDestSubs)==-1) && stEntityType=='vendor')
    {
        alert("Both Intercompany AP Account subsidiary and Intercompany Vendor subsidiary must be the same with Destination subsidiary");
        isValid = false;
    }
    else
    {
        if(stEntRepSubs!=stDestSubs && stEntityType=='customer')
        {
            alert("Intercompany Customer's 'Represents Subsidiary' must be the same with Destination Subsidiary");
            isValid = false;
        }
        else if(stEntRepSubs!=stParentSubs && stEntityType=='vendor')
        {
            alert("Intercompany Vendor's 'Represents Subsidiary' must be the same with Source Subsidiary");
            isValid = false;
        }
    }
    
    return isValid;
}


//this function group the allocation per subtab and line number and summarize the allocation weight
function sumLinePerSubtab(type,lineExc)
{
    var count = nlapiGetLineItemCount('custpage_svb_dist_details');
    var arrAllocWtAllLines = [];
    var arrAllocAmtAllLines = []
            
    for(var i=1; count && i<=count; i++)
    {
        var intLineNo     = nlapiGetLineItemValue('custpage_svb_dist_details','custpage_svb_details_line_number',i);
        var intTab        = nlapiGetLineItemValue('custpage_svb_dist_details','custpage_svb_details_sublisttype',i);
        var fAllocWt      = nlapiGetLineItemValue('custpage_svb_dist_details','custpage_svb_details_allocation_weight',i);
            fAllocWt      = Math.round((parseFloat(fAllocWt)/100) * 100000)/100000;
        var fAllocAmt     = nlapiGetLineItemValue('custpage_svb_dist_details','custpage_svb_details_amount_fx',i);
        var fTotalLineAmt = nlapiGetLineItemValue('custpage_svb_dist_details','custpage_svb_details_line_amount',i);
        
        //array for allocation weight
        if (arrAllocWtAllLines[intTab + '-' + intLineNo + '-' + fTotalLineAmt] == null || arrAllocWtAllLines[intTab + '-' + intLineNo + '-' + fTotalLineAmt] == undefined) 
        {
            arrAllocWtAllLines[intTab + '-' + intLineNo + '-' + fTotalLineAmt] = [];
        }
        arrAllocWtAllLines[intTab + '-' + intLineNo + '-' + fTotalLineAmt].push(fAllocWt);
        
        //array for allocation amount
        if (arrAllocAmtAllLines[intTab + '-' + intLineNo + '-' + fTotalLineAmt] == null || arrAllocAmtAllLines[intTab + '-' + intLineNo + '-' + fTotalLineAmt] == undefined) 
        {
            arrAllocAmtAllLines[intTab + '-' + intLineNo + '-' + fTotalLineAmt] = [];
            arrAllocAmtAllLines[intTab + '-' + intLineNo + '-' + fTotalLineAmt].push(0.00);
        }
        arrAllocAmtAllLines[intTab + '-' + intLineNo + '-' + fTotalLineAmt].push(fAllocAmt);      
    }
    
    return [arrAllocAmtAllLines,arrAllocWtAllLines];
}


function getAllLineSubsidiariesPerItem()
{
    var arrSubsidiaries = [];
    var count = nlapiGetLineItemCount('custpage_svb_dist_details');
    
    for (var i = 1; count && i <= count; i++) 
    {
        var intLineNo = nlapiGetLineItemValue('custpage_svb_dist_details','custpage_svb_details_line_number',i);
        var intTab    = nlapiGetLineItemValue('custpage_svb_dist_details','custpage_svb_details_sublisttype',i);
        var stSubsidiary  = nlapiGetLineItemValue('custpage_svb_dist_details','custpage_svb_details_subsidiary',i);
        
        //array for subsidiaries
        if (arrSubsidiaries[intTab + '-' + intLineNo] == null || arrSubsidiaries[intTab + '-' + intLineNo] == undefined) 
        {
            arrSubsidiaries[intTab + '-' + intLineNo] = [];
        }
        
        if (stSubsidiary) 
        {
            arrSubsidiaries[intTab + '-' + intLineNo].push(stSubsidiary);
        }
    }
    
    return arrSubsidiaries;
}


//disable the intercompany fields i
function disableIntercompanyFields()
{
    var stSrcSubs  = nlapiGetFieldValue('custpage_svb_schedule_src_subs');
    var stLineSubs = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_subsidiary');
    var isInterCo  = nlapiGetFieldValue('custpage_svb_schedule_is_interco');
    
    if(stSrcSubs==stLineSubs || isInterCo=='F')
    {
        nlapiDisableLineItemField('custpage_svb_dist_details','custpage_svb_details_interco_ar_acct',true);
        nlapiDisableLineItemField('custpage_svb_dist_details','custpage_svb_details_interco_ap_acct',true);
        nlapiDisableLineItemField('custpage_svb_dist_details','custpage_svb_details_intercompcustomer',true);
        nlapiDisableLineItemField('custpage_svb_dist_details','custpage_svb_details_intercomp_vendor',true);
        
        nlapiSetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_interco_ar_acct','',false,true);
        nlapiSetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_interco_ap_acct','',false,true);
        nlapiSetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_intercompcustomer','',false,true);
        nlapiSetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_intercomp_vendor','',false,true);
    }
    else
    {
        nlapiDisableLineItemField('custpage_svb_dist_details','custpage_svb_details_interco_ar_acct',false);
        nlapiDisableLineItemField('custpage_svb_dist_details','custpage_svb_details_interco_ap_acct',false);
        nlapiDisableLineItemField('custpage_svb_dist_details','custpage_svb_details_intercompcustomer',false);
        nlapiDisableLineItemField('custpage_svb_dist_details','custpage_svb_details_intercomp_vendor',false);
    }   
}


function disableAllLineFields()
{
    arrMapFields = [];
    arrMapFields.push('custpage_svb_details_line_number');
    arrMapFields.push('custpage_svb_details_sublisttype');
    arrMapFields.push('custpage_svb_expense_account');
    arrMapFields.push('custpage_svb_expense_category');
    arrMapFields.push('custpage_svb_details_itemid');
    arrMapFields.push('custpage_svb_details_allocation_weight');
    arrMapFields.push('custpage_svb_details_alloc_wt_orig');
    arrMapFields.push('custpage_svb_details_quantity');
    arrMapFields.push('custpage_svb_details_amount_fx');
    arrMapFields.push('custpage_svb_details_amount');
    arrMapFields.push('custpage_svb_details_amount_orig');
    arrMapFields.push('custpage_svb_details_line_amount');
    arrMapFields.push('custpage_svb_details_subsidiary');
    arrMapFields.push('custpage_svb_details_department');
    arrMapFields.push('custpage_svb_details_account');
    arrMapFields.push('custpage_svb_details_class');
    arrMapFields.push('custpage_svb_details_location');
    arrMapFields.push('custpage_svb_details_interco_ar_acct');
    arrMapFields.push('custpage_svb_details_interco_ap_acct');
    arrMapFields.push('custpage_svb_details_intercompcustomer');
    arrMapFields.push('custpage_svb_details_intercomp_vendor');
    
    var stLineNo = 'custpage_svb_details_line_number'
    
    if(stLineNo)
    {
        for(var i =0; i<arrMapFields.length; i++)
        {
            nlapiDisableLineItemField('custpage_svb_dist_details',arrMapFields[i],false);
        }
    }
    else
    {
        for(var i =0; i<arrMapFields.length; i++)
        {
            nlapiDisableLineItemField('custpage_svb_dist_details',arrMapFields[i],true);
        }
    }
}


function removeDuplicate(arrDistinct)
{
    var temp = [];
    arrDistinct.sort();
    
    for(i=0;i<arrDistinct.length;i++)
    {
        if(arrDistinct[i]==arrDistinct[i+1]) 
        {
            continue
        }
        temp[temp.length]=arrDistinct[i];
    }
    
    return temp;
}


function loadSelectList(recType,fldName ,sourceValueFrom,isSubList)
{
    (isSubList) ? nlapiRemoveLineItemOption('custpage_svb_dist_details', fldName, null) :
                  nlapiRemoveSelectOption(fldName, null);
    
    var arrFil = (sourceValueFrom) ? new nlobjSearchFilter("subsidiary", null, "anyof", sourceValueFrom) : null;
    var arrCol = new nlobjSearchColumn("name");
    var arrRes = nlapiSearchRecord(recType, null, arrFil, arrCol);
    
    for (index in arrRes)
    {
        var stName = arrRes[index].getValue("name");
        var intId  = arrRes[index].getId();
        (isSubList) ? nlapiInsertLineItemOption('custpage_svb_dist_details', fldName, intId, stName) :
                      nlapiInsertSelectOption(fldName, intId, stName);
    }
    (isSubList) ? nlapiInsertLineItemOption('custpage_svb_dist_details', fldName, '', '') :
                  nlapiInsertSelectOption(fldName, '', '--Select--',true);
}


function checkWithinSubsidiary(recType,stCompareSubsTo,stSubs)
{
    var arrDeptId = [];
    var isWithin = false;
    var arrFil = new nlobjSearchFilter("subsidiary", null, "anyof", stSubs);    
    var arrRes = nlapiSearchRecord(recType, null, arrFil);
    
    for(index in arrRes)
    {
        var intId  = arrRes[index].getId();
        arrDeptId.push(intId);
    }
        
    if(arrDeptId.length!=0 && arrDeptId.indexOf(stCompareSubsTo)!=-1)    
    {       
        isWithin = true;
    }
    
    return isWithin;
}


//Function that removes a button in a sublist.
function removeLineButton(buttonname) 
{      
       jQuery('.machineButtonRow').css("display","none");
       jQuery('.listtextnonedit').css("display","none");
       jQuery('.machineButtonRow').parent().css("display","none");
}


//close the suitelet form and refresh the current vendor bill record
function closeAndRedirect(form, recordId, recType)
{
	var url = nlapiResolveURL('record', recType, recordId);
	var scriptFld = form.addField("scripttxt", "inlinehtml");
	scriptFld.setDefaultValue(
		"<script language='javascript'>" +
		"window.opener.location='"+url+"';" +
        "window.ischanged = false;" +
		"window.close();" +      
		"</script>"
	);
}


function setEmptyOnNull(value)
{
    if(value==undefined || value==null || value=='')
    {
        return '';
    }
    
    return value;
}

//**********************************************************************OTHER SUPPORTING FUNCTIONS - ENDS HERE**********************************************//