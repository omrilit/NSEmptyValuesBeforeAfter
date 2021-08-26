//**********************************************************************OTHER SUPPORTING FUNCTIONS - STARTS HERE**********************************************//

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
* These functions are common function to scripts that are deployed to : 
*     1. Bill Distribution Schedule 
*     2. Bill Distribution Schedule Line 
*     3. Vendor Bill 
*     4. Adjust Distribution Suitelet 
*  
*/
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
                nlapiSubmitField('vendorbill',stBillId,['custbody_svb_sched_in_process','custbody_svb_error_logs'],['F','']);
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


//this script creates the bill distribution details
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
        fAllocAmt = (Math.round(fAllocAmt * 100))/100;
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
    var stCurrency = recBill.getFieldValue('currency');    
    recJE.setFieldValue('currency',stCurrency);
    
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
                fBillLineAmt = parseFloat(fBillLineAmt); // * fExchRate;
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
    
    nlapiLogExecution('DEBUG','setStandardJournalCreditLines','Count=' + recJE.getLineItemCount('line'));
    return recJE;
}


//this function set the standard journal allocation debit lines
function setStandardJournalDebitLines(recBill,recJE,arrBDD)
{
    var stMemo = 'System Generated from Vendor Bill #: ' + recBill.getFieldValue('transactionnumber');
    
    var currentLine  = recJE.getLineItemCount('line');
        currentLine  = (!currentLine || currentLine==0) ? 1 : currentLine + 1;    
    var arrTotDbtAmt = [];
    var fTotalVBAmt  = recBill.getFieldValue('total');
        fTotalVBAmt  = parseFloat(fTotalVBAmt);    
    var arrDebitLine = [];
    
    for(var i=0; i<arrBDD.length; i++)
    {
        var intTab           = arrBDD[i].getValue('custrecord_svb_details_sublisttype');
        var intLineNo        = arrBDD[i].getValue('custrecord_svb_details_line_number');        
        var fTotalLineAmt    = arrBDD[i].getValue('custrecord_svb_details_line_amount');     
        var stDebitLineAcct  = arrBDD[i].getValue('custrecord_svb_details_account');
        var fDebitLineAmt    = arrBDD[i].getValue('custrecord_svb_details_foreign_amt');
            fDebitLineAmt    = (Math.round(parseFloat(fDebitLineAmt))*100)/100;              
        var stDebitLineDept  = arrBDD[i].getValue('custrecord_svb_details_department');
        var stDebitLineClass = arrBDD[i].getValue('custrecord_svb_details_class');
        var stDebitLineLoc   = arrBDD[i].getValue('custrecord_svb_details_location');
        nlapiLogExecution('DEBUG','setStandardJournalDebitLines','stDebitLineAcct='  + stDebitLineAcct  + ' stDebitLineAmt=' + fDebitLineAmt  + ' stDebitLineDept=' + stDebitLineDept);
        nlapiLogExecution('DEBUG','setStandardJournalDebitLines','stDebitLineClass=' + stDebitLineClass + ' stDebitLineLoc=' + stDebitLineLoc + ' currentLine='     + currentLine);
        
        //array for allocation weight
        if (arrDebitLine[intTab + '-' + intLineNo + '-' + fTotalLineAmt] == null || arrDebitLine[intTab + '-' + intLineNo + '-' + fTotalLineAmt] == undefined) 
        {
            arrDebitLine[intTab + '-' + intLineNo + '-' + fTotalLineAmt] = [];
        }
        arrDebitLine[intTab + '-' + intLineNo + '-' + fTotalLineAmt].push({account: stDebitLineAcct, debit: fDebitLineAmt, department: stDebitLineDept, classification: stDebitLineClass, location: stDebitLineLoc, memo: stMemo});
    }
    
    for(line in arrDebitLine)
    {
        var arrPerLine = arrDebitLine[line];
        var fTotalVBAmt = line.split('-')[2];
            fTotalVBAmt = parseFloat(fTotalVBAmt);
        var fTotDbAmt = 0.00;
        
        for(var i=0; i<arrPerLine.length; i++)
        {
            var objJEDetails = arrPerLine[i];
            
            //set journal debit lines
            recJE.setLineItemValue('line','account',currentLine,objJEDetails.account);           
            recJE.setLineItemValue('line','debit',currentLine,objJEDetails.debit);
            recJE.setLineItemValue('line','department',currentLine,objJEDetails.department);
            recJE.setLineItemValue('line','class',currentLine,objJEDetails.classification);
            recJE.setLineItemValue('line','location',currentLine,objJEDetails.location);
            recJE.setLineItemValue('line','memo',currentLine,objJEDetails.memo);
            
            fTotDbAmt += objJEDetails.debit;
            
            currentLine ++;
        }
        
        //make an adjustment on the last line if the not balance journal is within the tolerance of 0.01 due to rounding off    
        fTotDbAmt = (Math.round(parseFloat(fTotDbAmt) * 100))/100;
        nlapiLogExecution('DEBUG','setStandardJournalDebitLines','fTotDbAmt=' + fTotDbAmt + ' fTotalVBAmt=' + fTotalVBAmt);
        
        //adjust if there are rounding issue
        recJE = adjustJEByTolerance(recJE,fTotDbAmt,fTotalVBAmt)
    }
    
    nlapiLogExecution('DEBUG','setStandardJournalDebitLines','Count=' + recJE.getLineItemCount('line'));
    return recJE;
}



//this function adjust the last line of distribution of item or expense line due to rounding off
function adjustJEByTolerance(recJE,fTotDbAmt,fTotalVBAmt)
{
    if(fTotDbAmt!=fTotalVBAmt)
    {
        var intLastLine   = recJE.getLineItemCount('line');
        var fLastDebitAmt = recJE.getLineItemValue('line','debit',intLastLine);
            fLastDebitAmt = parseFloat(fLastDebitAmt);
        var fDebitHigh    = fTotDbAmt - fTotalVBAmt;
        var fVBAmtHigh    = fTotalVBAmt - fTotDbAmt;
        
        if(fDebitHigh <= 0.01)
        {  
            var fAdjustDebitAmt = (fLastDebitAmt - fDebitHigh).toFixed(2);
            recJE.setLineItemValue('line','debit',intLastLine,fAdjustDebitAmt);
        }
        
        if(fVBAmtHigh <= 0.01)
        {
            var fAdjustDebitAmt = (fLastDebitAmt + fVBAmtHigh).toFixed(2);
            recJE.setLineItemValue('line','debit',intLastLine,fAdjustDebitAmt);
        }
    }    
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
            nlapiSubmitField('journalentry',stAllocJrnlId,['reversaldate','custbody_svb_vend_bill_link'],[nlapiDateToString(new Date()),'']);
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
        if((name!='custpage_svb_details_interco_ar_acct' && 
           name!='custpage_svb_details_interco_ap_acct' &&
           name!='custpage_svb_details_intercompcustomer' &&        
           name!='custpage_svb_details_intercomp_vendor' && 
           name!='custpage_svb_details_subsidiary' && 
           name!='custpage_svb_details_department' && 
           name!='custpage_svb_details_class' && 
           name!='custpage_svb_details_location' &&
           name!='custpage_svb_details_account') || 
           !nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_line_number'))
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
            var stParentSubs = nlapiGetFieldValue('custpage_svb_schedule_src_subs');
            var stParentTxt  = nlapiGetFieldText('custpage_svb_schedule_src_subs');
            var isInterCo    = nlapiGetFieldValue('custpage_svb_schedule_is_interco');
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
        
        //check if the following department belongs to the subsidiary
        if(( name=='custpage_svb_details_department' || 
             name=='custrecord_svb_line_department') && 
           (stFldValue))
        {
            //check if the following department belongs to the subsidiary
            isValid = checkWithinSubsidiary('department',stFldValue,stSubs);
            if(!isValid) alert('The department selected "' + stFldText + '" does not belong to subsidiary "' + stSubsTxt + '"');            
        }
        else if(( name=='custpage_svb_details_class' || 
                  name=='custrecord_svb_line_class') && 
                (stFldValue))
        {
            //check if the following class belongs to the subsidiary
            isValid = checkWithinSubsidiary('classification',stFldValue,stSubs);
            if(!isValid) alert('The class selected "' + stFldText + '" does not belong to subsidiary "' + stSubsTxt + '"');
        }
        else if(( name=='custpage_svb_details_location' || 
                  name=='custrecord_svb_line_location') && 
                (stFldValue))
        {
            //check if the following location belongs to the subsidiary
            isValid = checkWithinSubsidiary('location',stFldValue,stSubs);
            if(!isValid) alert('The location selected "' + stFldText + '" does not belong to subsidiary "' + stSubsTxt + '"');
        }
        else if(( name=='custpage_svb_details_account' || 
                  name=='custrecord_svb_line_account') && 
                (stFldValue))
        {
            //check if the following account belongs to the subsidiary
            isValid = checkWithinSubsidiary('account',stFldValue,stSubs);
            if(!isValid) alert('The destination account selected "' + stFldText + '" does not belong to subsidiary "' + stSubsTxt + '"');
        }
        else if(( name=='custpage_svb_details_interco_ar_acct' || 
                  name=='custpage_svb_details_intercompcustomer' || 
                  name=='custrecord_svb_line_intercomp_account' || 
                  name=='custrecord_svb_line_intercomp_customer')  && 
                (stARAccount) && 
                (stARCustId) && 
                (stSubs))
        {
            //check the AR Account against the elimination customer
            isValid = checkAPAndARAccount(stARAccount,'customer',stARCustId,type,stParentSubs);
        }
        else if (( name=='custpage_svb_details_interco_ap_acct' || 
                   name=='custpage_svb_details_intercomp_vendor' || 
                   name=='custrecord_svb_line_intercomp_ap_account' || 
                   name=='custrecord_svb_line_intercomp_vendor')  && 
                 (stAPAccount) && 
                 (stAPVendId) && 
                 (stSubs))
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
    //var arrAcctSubs  = recAcct.getFieldValue('subsidiary');
        //arrAcctSubs  = (typeof arrAcctSubs=='string') ? arrAcctSubs.split(',') : arrAcctSubs;
    var bIsEliminate = recAcct.getFieldValue('eliminate');
    var arrEntity    = nlapiLookupField(stEntityType,stEntityId,['subsidiary','representingsubsidiary']);
    var stEntSubs    = arrEntity.subsidiary;
    var stEntRepSubs = arrEntity.representingsubsidiary;
    
    if(stTriggerFrom=='suitelet')
    {
        var stDestSubs = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_subsidiary');
        var stParentId = nlapiGetFieldValue('custpage_svb_schedule_template');
    }
    else
    {
        var stDestSubs = nlapiGetFieldValue('custrecord_svb_line_subsidiary');
        var stParentId = nlapiGetFieldValue('custrecord_svb_line_parent_link');
    }
    
    if(bIsEliminate!='T')
    {
        (stEntityType=='customer') ? alert('Intercompany AR Account must have the "Eliminate Intercompany Transactions" field checked.') :
                                     alert('Intercompany AP Account must have the "Eliminate Intercompany Transactions" field checked.');
        return false;
    }
    
    if((!checkWithinSubsidiary('account',stAccount,stEntSubs) || !checkWithinSubsidiary('account',stAccount,stParentSubs)) && stEntityType=='customer')
    {
        alert("Both Intercompany AR Account subsidiary and Intercompany Customer subsidiary must be the same with Source subsidiary");
        isValid = false;
    }
    else if((!checkWithinSubsidiary('account',stAccount,stEntSubs) || !checkWithinSubsidiary('account',stAccount,stDestSubs)) && stEntityType=='vendor')
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
    var arrFil = [new nlobjSearchFilter("subsidiary", null, "anyof", stSubs),
                  new nlobjSearchFilter("internalid", null, "anyof", stCompareSubsTo)];
    
    var arrRes = nlapiSearchRecord(recType, null, arrFil);
    
    /*
    for(index in arrRes)
    {
        var intId = arrRes[index].getId();
        arrDeptId.push(intId);
    }
    
    if(arrDeptId.length!=0 && arrDeptId.indexOf(stCompareSubsTo)!=-1)
    {
        isWithin = true;
    }*/
    
    isWithin = (arrRes) ? true : false;
    
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
    if(value==undefined || value==null)
    {
        return '';
    }
    
    return value;
}

//**********************************************************************OTHER SUPPORTING FUNCTIONS - ENDS HERE**********************************************//