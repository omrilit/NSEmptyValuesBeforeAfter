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
