//**********************************************************************USER EVENT SCRIPTS DEPLOYED ON BILL DISTRIBUTION LINES - STARTS HERE**********************************************//

//GLOBAL DECLARATIONS
var ITEM             = 1;
var EXPENSE          = 2;
var PENDING_APPROVAL = 'pendingApproval';
var APPROVED         = 'open';
var APPROVE_FLD      = 'statusRef';

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