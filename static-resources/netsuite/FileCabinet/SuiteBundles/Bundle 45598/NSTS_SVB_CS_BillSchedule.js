//**********************************************************************USER EVENT SCRIPTS DEPLOYED ON BILL DISTRIBUTION SCHEDULE - STARTS HERE**********************************************//

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
    var arrBDS = getDuplicateBillDistributionSchedule(stBDSName);
    
    //alert(arrBDS + ' ' + stBDSName + ' ' + type + ' ' + 'id=' + nlapiGetRecordId());
    
    if(arrBDS)
    {
        alert('Error Duplicate Record. Details: There is already a Bill Distribution Schedule Name "' + stBDSName + '" that exists.');
        isValid = false;
    }
    return isValid;
}



//search the header bill distribution parent custom record with the given parameter record name
function getDuplicateBillDistributionSchedule(stBDSName)
{
    var col = [new nlobjSearchColumn('custrecord_svb_parent_intercomany_alloc'),
               new nlobjSearchColumn('name')];
    var fil = [new nlobjSearchFilter('name',null,'is',stBDSName)];
    
    if(nlapiGetRecordId()!=null && nlapiGetRecordId()!='') fil.push(new nlobjSearchFilter('internalid',null,'noneof',nlapiGetRecordId()));    
    var res = nlapiSearchRecord('customrecord_svb_bill_dist_sched',null,fil,col);
    
    return res;
}


//**********************************************************************CLIENT SIDE SCRIPTS DEPLOYED ON BILL DISTRIBUTION SCHEDULE- ENDS HERE**********************************************//
