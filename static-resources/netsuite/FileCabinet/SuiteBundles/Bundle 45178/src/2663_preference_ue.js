/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * @author alaurito
 */

/**
 * Revision History:
 * 
 * Date        Fixed Issue    Broken in QA Bundle     Issue Fix Summary
 * =============================================================================================
 * 2012/06/11  223176         2.00.0.2012.06.07.2     Queue management checking
 * 2013/08/29  250004   	  2.00.24				  Use sublist for Queue settings instead of XML
 * 2013/09/05  262404   	  2.00.25				  Update parent deployment
 * 2013/10/05  265406 		  3.00.00				  Refactor code to use Payment File Administration record instead of Payment Batch
 * 2013/11/20  270099 		  3.00.10				  Use column namenohierarchy when displaying subsidiary names
 * 2013/11/20  270379 		  3.00.10				  Replace method openBatchesExist with batchesForApprovalExist
 * 2013/12/18  273283    	  2.01.00				  Execute validation on beforeSubmit when type is xedit
 * 2013/12/26  272459    	  3.00.1    			  Add email template preference
 * 2014/01/13  275373 		  3.00.00				  Remove work around for loading scriptdeployment record on both 13.1 and 13.2
 * 2014/03/03  280556 		  3.01.2				  Use type-insensitive checking ( == instead of indexOf or === )when comparing form type and string value
 * 2014/05/19  273487         3.00.3       			  Support parallel processing for batch processing
 * 2014/07/31  274704         4.00.2.2014.08.05.2     Added checking for multiple default queue setting for the preference
 * 2014/10/13  312556 		  4.00.4				  Update FLH
 * 2014/10/22  313991 		  4.00.1.2014.10.21.4	  Move the Email Template fields under the General Preference subtab in EP preference page when in edit mode
 */

var _2663;

if (!_2663)
	_2663 = {};

function beforeLoad(type, form) {
	var executionContext = nlapiGetContext().getExecutionContext();
	
	if (type == 'create') {
        var searchRes = nlapiSearchRecord('customrecord_ep_preference', null, null, null);
		
		if (searchRes) {
		    throw (nlapiCreateError('EP002', 'Copying or creating a new Electronic Payments Preference record is not allowed.'));
		}
	}
	
	if (executionContext == 'userinterface') {
		
		if (type == 'copy') {
			throw (nlapiCreateError('EP002', 'Copying or creating a new Electronic Payments Preference record is not allowed.'));
		}
		
		upsertDefaultQueueSetting(nlapiGetRecordId());
		var queueSettingSublist = form.getSubList('recmachcustrecord_2663_qs_ep_preference');
		if (queueSettingSublist) {
			var scheduledScriptMap = getScheduleScriptsMap();
			// remove unnecessary buttons
			var queueSettingRecordTypeId = getCustomRecordTypeId('EP Queue Settings');
			if (queueSettingRecordTypeId) {
				queueSettingSublist.removeButton('newrec' + queueSettingRecordTypeId);	
			}
			queueSettingSublist.removeButton('attach');
			queueSettingSublist.removeButton('customize');
			if (type == 'edit') {
				// hide header fields
				var headerFlds = queueSettingSublist.getAllHeaderFields();
				for (var i = 0; i < headerFlds.length; i++) {
					nlapiGetField(headerFlds[i]).setDisplayType('hidden');
				}
				
				// set label of dummy payment creator field
				var dummyCreatorFld = queueSettingSublist.getField('custrecord_2663_qs_dummy_creator');
				dummyCreatorFld.setLabel('Payment Creator Deployment');
				
				// add Payment Creator Deployments Multi-select field
				var creatorDeployments = getDeployments(scheduledScriptMap[EP_PAYMENTCREATOR_SCRIPT]);
				var dummmyList = getDummyList();
				var dummyDeployments = Object.keys(dummmyList);
				var deploymentsToDelete = dummyDeployments.filter(function(d) { return creatorDeployments.indexOf(d) < 0; });
				if (deploymentsToDelete.length > 0) {
					for (var i = 0, ii = deploymentsToDelete.length; i < ii; i++) {
						var deployId = deploymentsToDelete[i];
						nlapiDeleteRecord('customrecord_2663_dummy_list', dummmyList[deployId]);
					}
				}
				
				var deploymentsToAdd = creatorDeployments.filter(function(d) { return dummyDeployments.indexOf(d) < 0; });
				if (deploymentsToAdd.length > 0) {
					for (var i = 0, ii = deploymentsToAdd.length; i < ii; i++) {
						var deployId = deploymentsToAdd[i];
						var rec = nlapiCreateRecord('customrecord_2663_dummy_list');
						rec.setFieldValue('name', deployId);
						nlapiSubmitRecord(rec);
					}
				}

                // hide saved email templates (text fields) 
                nlapiGetField('custrecord_ep_eft_email_template').setDisplayType('hidden');
                nlapiGetField('custrecord_ep_dd_email_template').setDisplayType('hidden');                
                
                // show list of email templates (select fields)
                var vendorEmailTemplate = nlapiGetFieldValue('custrecord_ep_eft_email_template') || '';
                var customerEmailTemplate = nlapiGetFieldValue('custrecord_ep_dd_email_template') || '';
                var tabInternalId = getCustomTabInternalId('Electronic Payments Preference', 'General Preferences');
                var vendorEmailTemplateList = form.addField('custpage_ep_eft_email_template', 'select', 'Email Template for Vendor Payments', null, tabInternalId);
                var customerEmailTemplateList = form.addField('custpage_ep_dd_email_template', 'select', 'Email Template for Customer Payments', null, tabInternalId);
                var dataProvider = new psg_ep.FormFieldDataProvider();
                var arrEmailTemplateObj = dataProvider.GetEmailTemplates();                
                vendorEmailTemplateList.addSelectOption('','');
                customerEmailTemplateList.addSelectOption('','');
                for (var i in arrEmailTemplateObj){
                    var objEmailTemplate = JSON.parse(arrEmailTemplateObj[i]);                    
                    vendorEmailTemplateList.addSelectOption(objEmailTemplate.id, objEmailTemplate.name, vendorEmailTemplate == objEmailTemplate.name);
                    customerEmailTemplateList.addSelectOption(objEmailTemplate.id, objEmailTemplate.name, customerEmailTemplate == objEmailTemplate.name);
                }
                vendorEmailTemplateList.setHelpText(EP_FLH.en.custpage_ep_eft_email_template || '');
                customerEmailTemplateList.setHelpText(EP_FLH.en.custpage_ep_dd_email_template || '');

			} else if (type == 'view') {
				queueSettingSublist.setDisplayType('hidden');
				var tabName = 'custom' + getCustomTabId('Electronic Payments Preference', 2);
				var customQueueSettingSublist = form.addSubList('custpage_2663_queue_setting', 'staticlist', 'Queue Setting', tabName);
				if (isOneWorld()) {
					var subsidiaryMap = _2663.getMap('subsidiary', 'namenohierarchy');
					customQueueSettingSublist.addField('custpage_subsidiary', 'textarea', 'Subsidiary');
				}
				customQueueSettingSublist.addField('custpage_parent_deployment', 'text', 'Parent Deployment');
				customQueueSettingSublist.addField('custpage_creator_deployment', 'text', 'Payment Creator Deployment');
				customQueueSettingSublist.addField('custpage_rollback_deployment', 'text', 'Rollback Deployment');
				customQueueSettingSublist.addField('custpage_reversal_deployment', 'text', 'Reversal Deployment');
				customQueueSettingSublist.addField('custpage_notify_deployment', 'text', 'Notification Deployment');
				customQueueSettingSublist.addField('custpage_batch_deployment', 'text', 'Batch Processing Deployment');
				customQueueSettingSublist.addField('custpage_default', 'text', 'Default');
				
				var epPreference = nlapiLoadRecord('customrecord_ep_preference', nlapiGetRecordId());
				var qsCount = epPreference.getLineItemCount('recmachcustrecord_2663_qs_ep_preference');
				if (qsCount > 0) {
					var queueSettings = [];
					for (var i = 1; i <= qsCount; i++) {
						var lineValue = {};
						if (isOneWorld()) {
							var subsidiaryNames = [];
							var subsidiaryIds = (epPreference.getLineItemValue('recmachcustrecord_2663_qs_ep_preference', 'custrecord_2663_qs_subsidiary', i) || '').split(String.fromCharCode(5));
							for (var j = 0, jj = subsidiaryIds.length; j < jj; j++) {
								var subsidaryId = subsidiaryIds[j];
								if (subsidiaryMap && subsidiaryMap[subsidaryId]) {
									subsidiaryNames.push(subsidiaryMap[subsidaryId]);	
								}
							}
							lineValue.custpage_subsidiary = subsidiaryNames.join('\n');
						}
						lineValue.custpage_parent_deployment = epPreference.getLineItemValue('recmachcustrecord_2663_qs_ep_preference', 'custrecord_2663_qs_parent_deployment', i);
						lineValue.custpage_creator_deployment = (JSON.parse(epPreference.getLineItemValue('recmachcustrecord_2663_qs_ep_preference', 'custrecord_2663_qs_creator_deployment', i) || '[]')).join('\n');
						lineValue.custpage_rollback_deployment = epPreference.getLineItemValue('recmachcustrecord_2663_qs_ep_preference', 'custrecord_2663_qs_rollback_deployment', i);
						lineValue.custpage_reversal_deployment = epPreference.getLineItemValue('recmachcustrecord_2663_qs_ep_preference', 'custrecord_2663_qs_reversal_deployment', i);
						lineValue.custpage_notify_deployment = epPreference.getLineItemValue('recmachcustrecord_2663_qs_ep_preference', 'custrecord_2663_qs_notify_deployment', i);
						lineValue.custpage_batch_deployment = epPreference.getLineItemValue('recmachcustrecord_2663_qs_ep_preference', 'custrecord_2663_qs_batch_deployment', i);
						lineValue.custpage_default = epPreference.getLineItemValue('recmachcustrecord_2663_qs_ep_preference', 'custrecord_2663_qs_default', i) == 'T' ? 'Yes' : 'No';
						queueSettings.push(lineValue);
					}
					if (queueSettings.length > 0) {
						customQueueSettingSublist.setLineItemValues(queueSettings);
					}
				}
			}
		}
	}
}

function beforeSubmit(type) {
	if (type == 'edit' || type == 'xedit')  {
		// check if there are open batches
		if (nlapiGetFieldValue('custrecord_ep_eft_approval_routing') == 'F' && batchesForApprovalExist()) {
			throw nlapiCreateError('EP_OPEN_BATCHES_EXIST', 'You may not disable EFT Payment Batch Approval Routing preference because you have at least one payment batch in Pending Approval status. Please approve or reject all payment batches if you would like to disable this preference.', true);
		}
		
		// check deployments in progress
		var errorCode = '';
		var errorDetails = '';
		var queueMgr = new _2663.PaymentDeploymentQueueManager();
		var deploymentsInProgress = queueMgr.GetDeploymentsInProgress();
		if (deploymentsInProgress.length > 0) {
			errorCode = 'EP_DEPLOYMENTS_IN_PROGRESS';
			errorDetails = 'Deployments in the current queue setting are currently in progress. Please wait for them to finish before saving an update:\n';
			for (var i = 0; i < deploymentsInProgress.length; i++) {
				errorDetails += deploymentsInProgress[i].title + ' (deployment id = ' + deploymentsInProgress[i].deploymentId + ', script id = ' + deploymentsInProgress[i].scriptId + ', status = ' + deploymentsInProgress[i].status + ')\n';
			}
			throw nlapiCreateError(errorCode, errorDetails, true);
		}
		
		//initialize maps
		var scheduledScriptMap = getScheduleScriptsMap();
		var parentDeploymentMap = getDeploymentsMap(scheduledScriptMap[EP_PAYMENTPROCESSING_SCRIPT]);
		var creatorDeploymentMap = getDeploymentsMap(scheduledScriptMap[EP_PAYMENTCREATOR_SCRIPT]);
		var rollbackDeploymentMap = getDeploymentsMap(scheduledScriptMap[EP_ROLLBACK_SCRIPT]);
		var reversalDeploymentMap = getDeploymentsMap(scheduledScriptMap[EP_REVERSEPAYMENTS_SCRIPT]);
		var notifyDeploymentMap = getDeploymentsMap(scheduledScriptMap[EP_EMAILNOTIFICATION_SCRIPT]);
		var batchDeploymentMap = getDeploymentsMap(scheduledScriptMap[EP_ONDEMANDBATCH_SCRIPT]);
		
		// start queue settings validation
		var qsSublistId = 'recmachcustrecord_2663_qs_ep_preference';
		var lineCount = nlapiGetLineItemCount(qsSublistId);
		var queueMap = {};
		var defaultCount = 0;
		for (var lineNum = 1; lineNum <= lineCount; lineNum++) {
			var isDefault = nlapiGetLineItemValue(qsSublistId, 'custrecord_2663_qs_default', lineNum) == 'T';
			
			if(isDefault){
				defaultCount++;
			}
			
			// subsidiary validations
			if (isDefault && nlapiGetLineItemValue(qsSublistId, 'custrecord_2663_qs_subsidiary', lineNum)) {
				throw nlapiCreateError('EP_DEFAULT_SUBSIDIARY_SET', 'Subsidiary for default setting may not be set.', true);
			}
			
			// parent deployment validation
			var parentFldValue = nlapiGetLineItemValue(qsSublistId, 'custrecord_2663_qs_parent_deployment', lineNum);
			if (parentFldValue) {
				if (Object.keys(parentDeploymentMap).indexOf(parentFldValue) < 0) {
					throw nlapiCreateError('EP_INVALID_PARENT_DEPLOYMENT', 'Parent deployment ' + parentFldValue + ' is invalid.', true);
				}
				
				var usedParentDeployments = getOtherUsedValues(qsSublistId, lineNum, 'custrecord_2663_qs_parent_deployment');
				if (usedParentDeployments.indexOf(parentFldValue) > -1) {
					throw nlapiCreateError('EP_PARENT_DEPLOYMENT_USED', 'Parent Deployment ' + parentFldValue + ' is selected more than once.', true);
				} else if (!isDefault && parentFldValue == EP_PAYMENTPROCESSING_DEPLOY) {
					throw nlapiCreateError('EP_DEF_PARENT_DEPLOYMENT_USED', 'Parent Deployment ' + parentFldValue + ' is reserved for the default setting.', true);
				}
				
			} else {
				throw nlapiCreateError('EP_BLANK_PARENT_DEPLOYMENT', 'Parent Deployment may not be blank.', true);
			}
			
			var parentQueueId = parentDeploymentMap[parentFldValue];
			if (!queueMap[parentQueueId]) {
				queueMap[parentQueueId] = [lineNum];
			} else if (queueMap[parentQueueId].indexOf(lineNum) < 0) {
				queueMap[parentQueueId].push(lineNum);	
			}
			
			// creator deployment validation
			var creatorFldValue = nlapiGetLineItemValue(qsSublistId, 'custrecord_2663_qs_creator_deployment', lineNum);
			if (creatorFldValue) {
				var creatorDeployments = JSON.parse(creatorFldValue);
				var usedCreatorFldValues = getOtherUsedValues(qsSublistId, lineNum, 'custrecord_2663_qs_creator_deployment') ;
				var usedCreatorDeployments = [];
				for (var i = 0, ii = usedCreatorFldValues.length; i < ii; i++) {
					usedCreatorDeployments = usedCreatorDeployments.concat(JSON.parse(usedCreatorFldValues[i] || '[]'));
				}
				for (var i = 0, ii = creatorDeployments.length; i < ii; i++) {
					var creatorDeployment = creatorDeployments[i];
					if (Object.keys(creatorDeploymentMap).indexOf(creatorDeployment) < 0) {
						throw nlapiCreateError('EP_INVALID_CREATOR_DEPLOYMENT', 'Payment creator deployment ' + creatorDeployment + ' is invalid.', true);
					} else if (usedCreatorDeployments.indexOf(creatorDeployment) > -1) {
						throw nlapiCreateError('EP_CREATOR_DEPLOYMENT_USED', 'Payment Creator Deployment ' + creatorDeployment + ' is selected more than once.', true);
					} else if (!isDefault && creatorDeployment == EP_PAYMENTCREATOR_DEPLOY) {
						throw nlapiCreateError('EP_DEF_CREATOR_DEPLOYMENT_USED', 'Payment Creator Deployment ' + creatorDeployment + ' is reserved for the default setting.', true);
					}
					
					var creatorQueueId = creatorDeploymentMap[creatorDeployment];
					if (!queueMap[creatorQueueId]) {
						queueMap[creatorQueueId] = [lineNum];
					} else if (queueMap[creatorQueueId].indexOf(lineNum) < 0) {
						queueMap[creatorQueueId].push(lineNum);	
					}
				}
			} else {
				throw nlapiCreateError('EP_BLANK_CREATOR_DEPLOYMENT', 'Payment Creator Deployment may not be blank.', true);
			}
			
			// rollback deployment validation
			var rollbackFldValue = nlapiGetLineItemValue(qsSublistId, 'custrecord_2663_qs_rollback_deployment', lineNum);
			if (rollbackFldValue) {
				if (Object.keys(rollbackDeploymentMap).indexOf(rollbackFldValue) < 0) {
					throw nlapiCreateError('EP_INVALID_ROLLBACK_DEPLOYMENT', 'Rollback deployment ' + rollbackFldValue + ' is invalid.', true);
				}
				
				var usedRollbackDeployments = getOtherUsedValues(qsSublistId, lineNum, 'custrecord_2663_qs_rollback_deployment');
				if (usedRollbackDeployments.indexOf(rollbackFldValue) > -1) {
					throw nlapiCreateError('EP_ROLLBACK_DEPLOYMENT_USED', 'Rollback Deployment ' + rollbackFldValue + ' is selected more than once.', true);
				} else if (!isDefault && rollbackFldValue == EP_ROLLBACK_DEPLOY) {
					throw nlapiCreateError('EP_DEF_ROLLBACK_DEPLOYMENT_USED', 'Rollback Deployment ' + rollbackFldValue + ' is reserved for the default setting.', true);
				}
			} else {
				throw nlapiCreateError('EP_BLANK_ROLLBACK_DEPLOYMENT', 'Rollback Deployment may not be blank.', true);
			}
			
			var rollbackQueueId = rollbackDeploymentMap[rollbackFldValue];
			if (parentQueueId != rollbackQueueId) {
				throw nlapiCreateError('EP_INVALID_ROLLBACK_DEPLOYMENT_QUEUE', 'Rollback Deployment ' + rollbackFldValue + ' should be on queue ' + parentQueueId + ' .', true);
			}
			
			// reversal deployment validation
			var reversalFldValue = nlapiGetLineItemValue(qsSublistId, 'custrecord_2663_qs_reversal_deployment', lineNum);
			if (reversalFldValue) {
				if (Object.keys(reversalDeploymentMap).indexOf(reversalFldValue) < 0) {
					throw nlapiCreateError('EP_INVALID_REVERSAL_DEPLOYMENT', 'Reversal deployment ' + reversalFldValue + ' is invalid.', true);
				}
				
				var usedReversalDeployments = getOtherUsedValues(qsSublistId, lineNum, 'custrecord_2663_qs_reversal_deployment');
				if (usedReversalDeployments.indexOf(reversalFldValue) > -1) {
					throw nlapiCreateError('EP_REVERSAL_DEPLOYMENT_USED', 'Reversal Deployment ' + reversalFldValue + ' is selected more than once.', true);
				} else if (!isDefault && reversalFldValue == EP_REVERSEPAYMENTS_DEPLOY) {
					throw nlapiCreateError('EP_DEF_REVERSAL_DEPLOYMENT_USED', 'Reversal Deployment ' + reversalFldValue + ' is reserved for the default setting.', true);
				}
			} else {
				throw nlapiCreateError('EP_BLANK_REVERSAL_DEPLOYMENT', 'Reversal Deployment may not be blank.', true);
			}
			
			var reversalQueueId = reversalDeploymentMap[reversalFldValue];
			if (parentQueueId != reversalQueueId) {
				throw nlapiCreateError('EP_INVALID_REVERSAL_DEPLOYMENT_QUEUE', 'Reversal Deployment ' + reversalFldValue + ' should be on queue ' + parentQueueId + ' .', true);
			}
			
			// notification deployment validation
			var notifyFldValue = nlapiGetLineItemValue(qsSublistId, 'custrecord_2663_qs_notify_deployment', lineNum);
			if (notifyFldValue) {
				if (Object.keys(notifyDeploymentMap).indexOf(notifyFldValue) < 0) {
					throw nlapiCreateError('EP_INVALID_NOTIFY_DEPLOYMENT', 'Notification deployment ' + notifyFldValue + ' is invalid.', true);
				}
				
				var usedNotifyDeployments = getOtherUsedValues(qsSublistId, lineNum, 'custrecord_2663_qs_notify_deployment');
				if (usedNotifyDeployments.indexOf(notifyFldValue) > -1) {
					throw nlapiCreateError('EP_NOTIFY_DEPLOYMENT_USED', 'Notification Deployment ' + notifyFldValue + ' is selected more than once.', true);
				} else if (!isDefault && notifyFldValue == EP_EMAILNOTIFICATION_DEPLOY) {
					throw nlapiCreateError('EP_DEF_NOTIFY_DEPLOYMENT_USED', 'Notification Deployment ' + notifyFldValue + ' is reserved for the default setting.', true);
				}
			} else {
				throw nlapiCreateError('EP_BLANK_NOTIFY_DEPLOYMENT', 'Notification Deployment may not be blank.', true);
			}
			
			var notifyQueueId = notifyDeploymentMap[notifyFldValue];
			if (parentQueueId != notifyQueueId) {
				throw nlapiCreateError('EP_INVALID_NOTIFY_DEPLOYMENT_QUEUE', 'Notification Deployment ' + notifyFldValue + ' should be on queue ' + parentQueueId + ' .', true);
			}
			
			// scheduled batch deployment validation
			var batchFldValue = nlapiGetLineItemValue(qsSublistId, 'custrecord_2663_qs_batch_deployment', lineNum);
			if (batchFldValue) {
				if (Object.keys(batchDeploymentMap).indexOf(batchFldValue) < 0) {
					throw nlapiCreateError('EP_INVALID_BATCH_DEPLOYMENT', 'Batch Processing deployment ' + batchFldValue + ' is invalid.', true);
				}
				
				var usedBatchDeployments = getOtherUsedValues(qsSublistId, lineNum, 'custrecord_2663_qs_batch_deployment');
				if (usedBatchDeployments.indexOf(batchFldValue) > -1) {
					throw nlapiCreateError('EP_BATCH_DEPLOYMENT_USED', 'Batch Processing deployment ' + batchFldValue + ' is selected more than once.', true);
				} else if (!isDefault && batchFldValue == EP_ONDEMANDBATCH_DEPLOY) {
					throw nlapiCreateError('EP_DEF_BATCH_DEPLOYMENT_USED', 'Batch Processing deployment ' + batchFldValue + ' is reserved for the default setting.', true);
				}
			} else {
				throw nlapiCreateError('EP_BLANK_BATCH_DEPLOYMENT', 'Batch Processing deployment may not be blank.', true);
			}
			
			var batchQueueId = batchDeploymentMap[batchFldValue];
			if (parentQueueId != batchQueueId) {
				throw nlapiCreateError('EP_INVALID_BATCH_DEPLOYMENT_QUEUE', 'Batch Processing deployment ' + batchFldValue + ' should be on queue ' + parentQueueId + ' .', true);
			}
			
			if(defaultCount > 1){
				throw nlapiCreateError('EP_QUEUE_SETTING_DEFAULT_USED', 'Only 1 queue setting should be a default for the preference.', true);
			}
			
		}
		for (var i in queueMap) {
			var lineNumbers = queueMap[i];
			if (lineNumbers.length > 1) {
				var errorDetails = ['Deployments setup on lines', lineNumbers.join(','), 'are using the same queue', i + '.', 'You may need to update your script deployments.'].join(' '); 
				throw nlapiCreateError('EP_DEPLOYMENTS_ON_SAME_QUEUE', errorDetails, true);
			}
		}
	}
}

function batchesForApprovalExist() {
	var batchSearch = new _2663.Search('customrecord_2663_file_admin');
	batchSearch.addFilter('custrecord_2663_status', null, 'anyof', [BATCH_PENDINGAPPROVAL]);
	return (batchSearch.getResults()).length > 0;
}

function getCustomRecordTypeId(name) {
	if (name) {
		var res = nlapiSearchRecord('customrecordtype', null, new nlobjSearchFilter('name', null, 'is', name));
		return res ? res[0].getId() : '';
	}
	return '';
}

function upsertDefaultQueueSetting(recId) {
	if (recId) {
		var filters = [
            new nlobjSearchFilter('custrecord_2663_qs_default', null, 'is', 'T'),
            new nlobjSearchFilter('custrecord_2663_qs_ep_preference', null, 'is', recId)
        ];
       	var columns = [new nlobjSearchColumn('custrecord_2663_qs_default')];
       	var defaultSetting = (nlapiSearchRecord('customrecord_2663_queue_settings', null, filters, columns) || [])[0];
       	if (!defaultSetting) {
       		var rec = nlapiCreateRecord('customrecord_2663_queue_settings');
       		rec.setFieldValue('custrecord_2663_qs_ep_preference', recId);
       		rec.setFieldValue('custrecord_2663_qs_default', 'T');
       		rec.setFieldValue('custrecord_2663_qs_parent_deployment', EP_PAYMENTPROCESSING_DEPLOY);
       		rec.setFieldValue('custrecord_2663_qs_creator_deployment', '["' + EP_PAYMENTCREATOR_DEPLOY +'"]');
       		rec.setFieldValue('custrecord_2663_qs_rollback_deployment', EP_ROLLBACK_DEPLOY);
       		rec.setFieldValue('custrecord_2663_qs_reversal_deployment', EP_REVERSEPAYMENTS_DEPLOY);
       		rec.setFieldValue('custrecord_2663_qs_notify_deployment', EP_EMAILNOTIFICATION_DEPLOY);
       		rec.setFieldValue('custrecord_2663_qs_batch_deployment', EP_ONDEMANDBATCH_DEPLOY);
       		
       		nlapiSubmitRecord(rec);
       	}	
	}
}

function getDeployments(scriptInternalId) {
	var searchResults = nlapiSearchRecord('scriptdeployment', null, new nlobjSearchFilter('script', null, 'is', scriptInternalId), new nlobjSearchColumn('scriptid'));
	return searchResults.map(function(r){ return (r.getValue('scriptid')).toLowerCase(); });
}

function getDeploymentsMap(scriptInternalId) {
	var deploymentsMap = {};
	var searchResults = nlapiSearchRecord('scriptdeployment', null, new nlobjSearchFilter('script', null, 'is', scriptInternalId), [new nlobjSearchColumn('scriptid'), new nlobjSearchColumn('queueid')]) || [];
	for (var i = 0, ii = searchResults.length; i < ii; i++) {
		var res = searchResults[i];
		deploymentsMap[(res.getValue('scriptid')).toLowerCase()] = res.getValue('queueid');
	}
	return deploymentsMap;
}

function getDummyList() {
	var searchResults = nlapiSearchRecord('customrecord_2663_dummy_list', null, null, new nlobjSearchColumn('name')) || [];
	var dummyList = {};
	for (var i = 0, ii = searchResults.length; i < ii; i++) {
		var searchResult = searchResults[i];
		dummyList[searchResult.getValue('name')] = searchResult.getId();
	}
	return dummyList;
}

function getScheduleScriptsMap() {
	var scheduledScriptMap = {};
	var filters = [];
	var columns = [new nlobjSearchColumn('scriptid')];
	for (var i = 0, ii = EP_SS_SCRIPT_IDS.length; i < ii; i++) {
        var scriptId = EP_SS_SCRIPT_IDS[i];
        filters.push(new nlobjSearchFilter('scriptid', null, 'is', scriptId).setOr(true));
    }
	if (filters.length > 0) {
		(nlapiSearchRecord('script', null, filters, columns) || []).forEach(function(r) {
			scheduledScriptMap[r.getValue('scriptid').toLowerCase()] = r.getId();
		});
	}
	return scheduledScriptMap;
}

function addSelectOptions(fld, options) {
	if (fld && options && typeof options == 'object') {
		var isArray = Array.isArray(options);
		var ids = isArray ? options : Object.keys(options);
		for (var i = 0, ii = ids.length; i < ii; i++) {
			var id = ids[i];
			var text = isArray ? id : options[id];
			fld.addSelectOption(id, text);
		}
	}
}

function getCustomTabId(recName, num) {
	var res = nlapiSearchRecord('customrecordtype', null, new nlobjSearchFilter('name', null, 'is', recName));
	if (res) {
		var rec = nlapiLoadRecord('customrecordtype', res[0].getId());
		return rec.getLineItemValue('tabs', 'tabid', num) || '';
	}
	return '';
}

/**
 * Returns a tab's internal id
 *
 * @param   {String} recName      - name of the custom record
 * @param   {String} label        - tab label
 * @returns {String}
 */
function getCustomTabInternalId(recName, label){
	var res = nlapiSearchRecord('customrecordtype', null, new nlobjSearchFilter('name', null, 'is', recName));
	if (res) {
		var rec = nlapiLoadRecord('customrecordtype', res[0].getId());        
        var lineNum = 1;
        var tabTitle = 'dummy';
        while (tabTitle){
            tabTitle = rec.getLineItemValue('tabs', 'tabtitle', lineNum);
            if (tabTitle == label){
                return 'custom' + rec.getLineItemValue('tabs', 'tabid', lineNum);
            }
            lineNum++;
        }        
	}
	return null;
}

/**
 * Returns values that have already been used 
 *
 * @param {String} sublistId
 * @param {Integer} excludedLine
 * @param {String} fldName
 */
function getOtherUsedValues(sublistId, excludedLine, fldName) {
	var usedValues = [];
	var lineCount = nlapiGetLineItemCount(sublistId);
	for (var i = 1; i <= lineCount; i++) {
		if (i != excludedLine) {
			usedValues.push(nlapiGetLineItemValue(sublistId, fldName, i));
		}
	}
	return usedValues;
}
