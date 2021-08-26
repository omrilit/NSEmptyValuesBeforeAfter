//**********************************************************************SUITELET SCRIPTS - STARTS HERE**********************************************//

//GLOBAL DECLARATIONS
var APPROVED    = 'open';
var APPROVE_FLD = 'statusRef';

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
        fld = objForm.addField('custpage_svb_schedule_src_subs','select','Source Subsidiary','subsidiary');
        fld.setDefaultValue(stSrcSubs);
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
            var fDistrAmt = arrBDS[i].getValue('custrecord_svb_details_amount');
                fDistrAmt = parseFloat(fDistrAmt).toFixed(2);
            var fFxAmt    = arrBDS[i].getValue('custrecord_svb_details_foreign_amt');
                fFxAmt    = parseFloat(fFxAmt).toFixed(2);
                
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
			arrList['custpage_svb_details_amount']            = fDistrAmt;
            arrList['custpage_svb_details_amount_fx']         = fFxAmt;
            arrList['custpage_svb_details_amount_disp']       = fDistrAmt;
            arrList['custpage_svb_details_line_disp']         = arrBDS[i].getValue('custrecord_svb_details_line_amount');
            arrList['custpage_svb_details_amount_orig']       = fDistrAmt
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
    var LIMIT = 900;
    
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
        nlapiSetRedirectURL('RECORD','vendorbill',recBill.getId());
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


//**********************************************************************SUITELET SCRIPTS - ENDS HERE**********************************************//