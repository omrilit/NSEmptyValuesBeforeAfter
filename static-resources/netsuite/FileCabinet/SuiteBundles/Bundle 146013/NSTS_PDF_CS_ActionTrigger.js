/**
 * Copyright (c) 1998-2016 NetSuite, Inc.
 * 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * NetSuite, Inc. ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with NetSuite.
 * 
 */

/**
 * goToDefaultPage() corresponds to the "Reset" button to go back to default page 
 */
function goToDefaultPage(){
	var url = nlapiResolveURL('SUITELET','customscript_template_bulk_process_ui','customdeploy_template_bulk_process_ui');
    window.location.replace(url);
}

function printAction(){
	javascript:void(window.onbeforeunload=null);
	if(storeCheckedRecord('print')){
		nlapiSetFieldValue('custpage_ps_action','printAction');
	    document.forms['main_form'].submit();
	}else{
		alert('Please select at least one, maximun 20 check boxes');
	}
}

function sendEmailAction(){
	javascript:void(window.onbeforeunload=null);
	var total = storeCheckedRecord('print');
	if(total == 0){
		alert('Please select at least one transaction.');
	}else if(total > 50){
		alert('Only 50 transactions can be processed a time.');
	}else{
		nlapiSetFieldValue('custpage_ps_action','sendEmailAction');
	    document.forms['main_form'].submit();
		
	}
}

function storeCheckedRecord(action){
	var listLength = nlapiGetLineItemCount('custpage_ps_save_search_list');
	var itemTotal = 0;
	var strlist = '';
	for(var i=1;i<=listLength;i++){
		var checkValue = nlapiGetLineItemValue('custpage_ps_save_search_list','custpage_ps_check_box',i);
		if(checkValue == 'T'){
			itemTotal++;
			strlist ='|' + i + ':' + strlist;
		}
	}
	nlapiSetFieldValue('custpage_ps_hiddenfield_checkindex',strlist);
	
	nlapiLogExecution('DEBUG','total',itemTotal);
	return itemTotal;
}

function goBack(){
	var sturl = nlapiResolveURL('SUITELET', 'customscript_template_bulk_process_ui', 'customdeploy_template_bulk_process_ui');
	document.location=sturl;
}


function pdfValidateBulkPrintingOnSave(){
    var stAction = nlapiGetFieldValue(CUSTPAGE_PS_ACTION);

    if(stAction == 'displaySearchResult'){
        var intErrcount = 0;
        var arrErr = [];
        var stFromTranDate = nlapiGetFieldValue(CUSTPAGE_PS_TRANSACTION_START_DATE);
        var stEndTranDate = nlapiGetFieldValue(CUSTPAGE_PS_TRANSACTION_END_DATE);
        
        if(!isEmpty(stFromTranDate) && !isEmpty(stEndTranDate)){

            
            var dtFromTranDate = new Date(stFromTranDate);
            var dtEndTranDate = new Date(stEndTranDate);
            
            if(dtFromTranDate == 'Invalid Date'){
                intErrcount++;
                arrErr.push('nvalid Date transaction from date.')
            }
            if(dtEndTranDate == 'Invalid Date'){
                intErrcount++;
                arrErr.push('nvalid Date transaction end date.')
            }
            
            if(dtFromTranDate > dtEndTranDate){
                intErrcount++;
                arrErr.push('Invalid transaction date range!');
            }
        }
        if(intErrcount > 0){
            alert(arrErr.join('\n'));
            return false;
        }
        
    }
    return true
}
