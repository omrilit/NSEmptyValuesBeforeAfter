//**********************************************************************SUITELET CLIENT SCRIPTS - STARTS HERE**********************************************//

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
* This script is deployed as client side validator for the Suitelet.
*  
* @author Jaime Villafuerte III
* @version 1.0
* 
*/
function validateField_CheckAdjustLineFields(type,name,line)
{    
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

jQuery(document).ready(function(){
jQuery("#custpage_svb_dist_details_insert").attr("value","Copy");
});

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
        nlapiSetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_amount',fCalcAmount.toFixed(2),false,true);
        nlapiSetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_amount_fx',fCalcFxAmt.toFixed(2),false,true);             
    }
    else
    {
        var fCalcAmount = fFxAmount * fExchRate;
        var fNewAllocWt = (fFxAmount/fLineAmount) * 100;
        nlapiSetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_allocation_weight',fNewAllocWt.toFixed(2),false,true);
        nlapiSetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_amount',fCalcAmount.toFixed(2),false,true);    
    }
    
    var stSubtab    = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_sublisttype');
    var arrSum      = sumLinePerSubtab('allocamt',line);
    var arrAllLines = arrSum[0];
    var fSumResult  = eval(arrAllLines[stSubtab + '-' + fLineNo + '-' + fLineAmount].join('+')) + fFxAmount;
        fSumResult  = (Math.round(fSumResult*100))/100;
    
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
            fSumResult  = (Math.round(fSumResult*100))/100;
        
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
                
                if(index!=-1)
                {                    
                    arrChanged.splice(index,1);
                    nlapiSetFieldValue('custpage_svb_changed_bdsid',arrChanged.join(','),false,true);
                }                
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
        alert('Cannot add a new line that is not associated to any of the item or expense line. \n To add a new line, select the desired item or expense line and click "Copy"');
        return false;
    }
    
    var isSourceAcct    = nlapiGetFieldValue('custpage_svb_schedule_src_acct');
    var stDestAcct      = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_account');
    var stSourceSubs    = nlapiGetFieldValue('custpage_svb_schedule_src_subs');
    var stDestSubs      = nlapiGetCurrentLineItemValue('custpage_svb_dist_details','custpage_svb_details_subsidiary');    
    var arrErrorFlds    = [];
    var hasError        = false;    
    var isIntercoDistri = nlapiGetFieldValue('custpage_svb_schedule_is_interco');
    var arrFlds         = (isIntercoDistri=='T') ? ['custpage_svb_details_subsidiary'] :
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
    var arrSum      = sumLinePerSubtab('allocamt');
    var arrAmt      = arrSum[0];
    var arrWt       = arrSum[1];
    var fDistrTotal = nlapiGetFieldValue('custpage_svb_details_distr_total');    
    var isInterCo   = nlapiGetFieldValue('custpage_svb_schedule_is_interco');
    var arrErrors   = [];
    
    for(line in arrAmt)
    {
        var arrLine       = line.split('-');
        var stLineNo      = arrLine[1];
        var fTotalLineAmt = arrLine[2];
        var fAmount       = eval(arrAmt[line].join('+'));
            fAmount       = (Math.round(fAmount*100))/100
        var fWeight       = eval(arrWt[line].join('+'));
        
        if(fAmount!=fTotalLineAmt) //&& fWeight!=1.0)
        {
            var fDiff = Math.abs(fAmount-fTotalLineAmt);
                fDiff = (Math.round(fDiff*100))/100
            
            //to allow the rounded off number within 0.01 tolerance
            if(fDiff > 0.01)
            {
                var arrLine  = line.split('-');
                var stSubtab = arrLine[0];
                    stSubtab = (stSubtab==1) ? 'Item' : 'Expense';
                var stLineNo = arrLine[1];
                arrErrors.push("Error on Sublist Type: "+ stSubtab +" and Line#: "+ stLineNo + ". The total distribution amount for each line expense and line item must be equal to line total");           
            }
        }
    }
    
    if(isInterCo=='T')
    {
        var arrSubsidiaries = getAllLineSubsidiariesPerItem();
    
        for(line in arrSubsidiaries)
        {
            var arrSubsPerItem = arrSubsidiaries[line];
                arrSubsPerItem = removeDuplicate(arrSubsPerItem);
            var hasParent = false;
            
            for(var i=0; i<arrSubsPerItem.length; i++)
            {
                if(arrSubsPerItem[i] == nlapiGetFieldValue('custpage_svb_schedule_src_subs'))
                {
                    hasParent = true;
                    break;
                }
            }
            
            if(!hasParent)
            {
                var arrLine  = line.split('-');
                var stSubtab = arrLine[0];
                    stSubtab = (stSubtab==1) ? 'Item' : 'Expense';
                var stLineNo = arrLine[1];
                arrErrors.push("Error on Sublist Type: "+ stSubtab +" and Line#: "+ stLineNo +". The allocation specified on the distribution details must have a source and destination subsidiary");
            }
        }
    }
    
    if(arrErrors.length!=0 && arrErrors.length!=null)
    {
        alert(arrErrors.join('\n'));
        return false;
    }
    
    var count = nlapiGetLineItemCount('custpage_svb_dist_details');
    
    if(!count || count==0)
    {
        return confirm("Removing ALL the distribution details will reverse the current Allocation Journal and delete all the Distribution Details record. \nClick OK to Confirm \nClick Cancel to abort");
    }
    
    var isAcknowledge = confirm("Warning: Adjusting the allocation weight would reverse the current Allocation Journal and would trigger to create a new allocation. \nClick OK to Confirm \nClick Cancel to abort");
    
    return isAcknowledge;
}

//**********************************************************************SUITELET CLIENT SCRIPTS - ENDS HERE**********************************************//
