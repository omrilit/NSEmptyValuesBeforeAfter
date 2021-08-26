/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * @author mcadano
 */

/**
 * Revision History:
 * 
 * Date        Fixed Issue    Broken in QA Bundle     Issue Fix Summary
 * =============================================================================================
 * 2013/08/12  250004   	  2.00.24				  Initial version
 * 2013/08/19  250004   	  2.00.24				  Add return values on validateDelete function
 * 2013/12/26  272459    	  3.00.1    			  Save email template preference 
 */

var _2663;

if (!_2663)
	_2663 = {};

function pageInit(){
	var dummyList = getDummyList(true);
	var qsSublistId = 'recmachcustrecord_2663_qs_ep_preference';
	var lineCount = nlapiGetLineItemCount(qsSublistId);
	for (var lineNum = 1; lineNum <= lineCount; lineNum++) {
		var creatorDeploymentArr =  JSON.parse(nlapiGetLineItemValue(qsSublistId, 'custrecord_2663_qs_creator_deployment', lineNum) || '[]');
		if (creatorDeploymentArr.length > 0) {
			var creatorDeploymentIds = [];
			for (var i = 0, ii = creatorDeploymentArr.length; i < ii; i++) {
				var creatorId = dummyList[creatorDeploymentArr[i]];
				if (creatorId) {
					creatorDeploymentIds.push(creatorId);
				}
			}
			var creatorDeploymentValue = creatorDeploymentIds.join(MULTISELECT_SEPARATOR);
			if (creatorDeploymentValue) {
				nlapiLogExecution('debug', 'beforeLoad', lineNum + ' ' + creatorDeploymentValue);	
				nlapiSetLineItemValue(qsSublistId, 'custrecord_2663_qs_dummy_creator', lineNum, creatorDeploymentValue);
			}
		}
	}
	
	//Hide "- New -"
	jQuery('td.dropdownNotSelected:contains("- New -")').hide();
}

function validateDelete(type) {
	if (type == 'recmachcustrecord_2663_qs_ep_preference') {
		if (nlapiGetCurrentLineItemValue(type, 'custrecord_2663_qs_default') == 'T') {
			alert('You may not delete default queue setting.');
			return false;
		}
	}
	return true;
}

function saveRecord() {
	var dummyList = getDummyList();
	var lineCount = nlapiGetLineItemCount('recmachcustrecord_2663_qs_ep_preference');
	for (var lineNum = 1; lineNum <= lineCount; lineNum++) {
		var dummyCreatorFldValue = nlapiGetLineItemValue('recmachcustrecord_2663_qs_ep_preference', 'custrecord_2663_qs_dummy_creator', lineNum);
		if (dummyCreatorFldValue) {
			var creatorDeploymentDummyIds =  dummyCreatorFldValue.split(MULTISELECT_SEPARATOR);
			if (creatorDeploymentDummyIds.length > 0) {
				var creatorDeploymentScriptIds = [];
				for (var i = 0, ii = creatorDeploymentDummyIds.length; i < ii; i++) {
					var creatorDeploymentScriptId = dummyList[creatorDeploymentDummyIds[i]];
					if (creatorDeploymentScriptId) {
						creatorDeploymentScriptIds.push(creatorDeploymentScriptId);
					}
				}
				nlapiSetLineItemValue('recmachcustrecord_2663_qs_ep_preference', 'custrecord_2663_qs_creator_deployment', lineNum, JSON.stringify(creatorDeploymentScriptIds));
			}
		}
	}
	
	var approvalRoutingValue = nlapiGetFieldValue('custrecord_ep_eft_approval_routing');
	if (approvalRoutingValue == 'T') {
		if (nlapiLookupField('customrecord_ep_preference', nlapiGetRecordId(), 'custrecord_ep_eft_approval_routing') == 'F') {
			alert([
		       'EFT Payment Batch Approval Routing preference is activated, you must complete the setup process per company bank record.', 
			   'To do so, follow the instructions at Payments > Setup > Bank Details. You must complete the setup process each time you activate the feature.'
	       ].join('/n'));	
		}
	}
    
    // save preferred email templates
    nlapiSetFieldValue('custrecord_ep_eft_email_template',nlapiGetFieldText('custpage_ep_eft_email_template'));
    nlapiSetFieldValue('custrecord_ep_dd_email_template',nlapiGetFieldText('custpage_ep_dd_email_template'));
    
	return true;
}

function getDummyList(nameAsKey) {
	var searchResults = nlapiSearchRecord('customrecord_2663_dummy_list', null, null, new nlobjSearchColumn('name')) || [];
	var dummyList = {};
	for (var i = 0, ii = searchResults.length; i < ii; i++) {
		var searchResult = searchResults[i];
		if (nameAsKey) {
			dummyList[searchResult.getValue('name')] = searchResult.getId();
		} else {
			dummyList[searchResult.getId()] = searchResult.getValue('name');	
		}
	}
	return dummyList;
}