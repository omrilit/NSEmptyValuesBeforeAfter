/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * @author alaurito
 *
 */

/**
 * Revision History:
 * 
 * Date        Fixed Issue    Broken in QA Bundle     Issue Fix Summary
 * =============================================================================================
 * 2012/05/01  220840         1.22                    Initial version
 * 2012/05/04  221144         2.00.2012.05.03.2       Set the mid-priority index to correct
 *                                                    value
 *                                                    Re-initialize the priority queue to check
 *                                                    for changes in saved search
 * 2012/05/15  221788         2.00.0.2012.05.17.1     Changes for issues found during unit test automation
 * 2012/05/22  222193         2.00.0.2012.05.24.3     Start payment processing only when deployments
 *                                                    related to payment file admin record are idle
 * 2012/06/04  222827         2.00.0.2012.05.31.3     Use correct case when checking for status of
 *                                                    thread deployments
 * 2012/06/11  223176         2.00.0.2012.06.07.2     Queue management checking
 * 2012/08/01  227867         2.00.1                  Fix errors that occur in IE
 * 2013/01/18  240638         2.00.7                  Use hiddendeprecatedstatus instead of status if
 * 													  version is 2013.1
 * 2013/02/05  242241         2.00.8                  Load scriptdeployment record after doing a nlapiSearchRecord
 * 													  to be able to get the hiddendeprecatedstatus
 * 2013/02/06  242241         2.00.8                  Use value from loaded scriptdeployment record in getDeploymentStatus
 * 2013/02/06  242241         2.00.8                  Replace scriptIds with deploymentScriptIds
 * 2013/02/06  242329         2.00.8                  Utilize function getDeployments in checkDeploymentStatus logic
 * 2013/02/07  242429         2.00.8                  Load scriptdeployment record only on 13.1
 * 2013/02/07  242429         2.00.8                  Add statusOnly parameter on function getScriptDeployments
 * 2013/02/12  242616         2.00.9                  Remove workaround for payment processing on JCurve accounts
 * 2013/03/18  246361         2.00.10                 Remove checking of 'serversidemultiq' feature
 * 2013/05/17  251637 		  2.00.15				  Replace INQUEUE and INPROGRESS status check with constant TERMINAL_DEPLOYMENT_STATUSES
 * 2013/06/17  254204 		  2.00.18				  Update canStartPaymentProcessing function to allow queueing while other EP process is running
 * 2013/06/17  254204 		  2.00.18				  Implement additional check for other PFA records in progress
 * 2013/07/22  257800   	  2.00.20				  Implement work around for loading scriptdeployment record on both 13.1 and 13.2
 * 2013/08/29  250004   	  2.00.24				  Implement parallel processing
 * 2013/09/03  262132     	  2.00.25				  Log error only when Parallel Processing is On
 * 2013/09/05  262404   	  2.00.25				  Expose function convertQueueGroupXmlToObjectArray
 * 2013/09/05  262404   	  2.00.25				  Consider subsdiary when getting processing PFA records
 * 2013/10/07  265406 		  3.00.00				  Replace subsidiary filter with parent deployment filter
 * 2014/01/13  275373 		  3.00.00				  Remove work around for loading scriptdeployment record on both 13.1 and 13.2
 * 2013/03/05  279192   	  2.00.24				  Use parent deployment as filter when getting queued payment batches instead of subsidiary
 * 2014/05/19  273487         3.00.3       			  Support parallel processing for batch processing
 * 2014/08/13  291599         4.00.00       		  Check PFA status whenever assigning a queue
 */

var _2663;

if (!_2663)
    _2663 = {};

/**
 * Class with functions that handle pfa queue management
 * 
 * @returns {_2663.PaymentTaskManager}
 */
_2663.PaymentTaskManager = function() {
    /**
     * Returns true when the payment processing can start for a PFA with specified file format, account, and subsidiary
     * 
     * @param fileFormat
     * @param account
     * @param subsidiaryId
     * @returns {Boolean}
     */
    function canStartPaymentProcessing(fileFormat, account, subsidiaryId) {
        var result = false;
        
        var oneWorldFlag = isOneWorld();
        nlapiLogExecution('debug', '[ep] PaymentTaskManager:canStartPaymentProcessing', 'file format: ' + fileFormat + ', account: ' + account + ', sub:' + subsidiaryId + ', owFlag: ' + oneWorldFlag);
        if ((oneWorldFlag == true && subsidiaryId && fileFormat) || (oneWorldFlag == false && fileFormat)) {
            var searchResults = getProcessingPFARecords([PAYPROCESSED, PAYFAILED, PAYERROR, PAYCANCELLED], [EP_PROCESSPAYMENTS]);
            if (searchResults) {
            	nlapiLogExecution('debug', 'getProcessingPFARecords', 'searchResults: ' + searchResults.length);
                var sameSetFromFiltersFound = false;
                for (var i = 0; i < searchResults.length; i++) {
                    var status = searchResults[i].getValue('custrecord_2663_file_processed');
                    var subValue = searchResults[i].getValue('custrecord_2663_payment_subsidiary');
                    var eftTemplate = searchResults[i].getValue('custrecord_2663_eft_template', 'custrecord_2663_bank_account');
                    var ddTemplate = searchResults[i].getValue('custrecord_2663_dd_template', 'custrecord_2663_bank_account');
                    var ppTemplate = searchResults[i].getValue('custrecord_2663_pp_template', 'custrecord_2663_bank_account');
                    var accountValue = searchResults[i].getValue('custrecord_2663_account');
                    
                    //check if PFA with same subsidiary, file format and  
                    // check sub
                    var subFlag = false;
                    if (oneWorldFlag == false) {
                        subFlag = true;
                    }
                    else if (subsidiaryId && subsidiaryId == subValue) {
                        subFlag = true; 
                    }
                    
                    // check file format
                    var fileFormatFlag = false;
                    if (fileFormat == eftTemplate || fileFormat == ddTemplate || fileFormat == ppTemplate) {
                        fileFormatFlag = true;
                    }
                    
                    // check account
                    var acctFlag = false;
                    if (!account) {
                        acctFlag = true;
                    }
                    else if (account == accountValue) {
                        acctFlag = true; // no account specified
                    }
                    
                    if (subFlag == true && fileFormatFlag == true && acctFlag == true) {
                        sameSetFromFiltersFound = true;
                        break;
                    }
                }
                
                if (sameSetFromFiltersFound == false) {
                    nlapiLogExecution('debug', '[ep] PaymentTaskManager:canStartPaymentProcessing', 'No other tasks from set of filters are being processed.');
                    result = true;
                }
                else {
                    nlapiLogExecution('debug', '[ep] PaymentTaskManager:canStartPaymentProcessing', 'Other tasks from set of filters are being processed.');
                }
            }
            else {
                nlapiLogExecution('debug', '[ep] PaymentTaskManager:canStartPaymentProcessing', 'No other tasks are being processed.');
                result = true;
            }
        }
        return result;
    }
    
    /**
     * Gets the currently processing PFA records
     * 
     * @param {Array} statuses
     * @param {Array} processes
     * @param {Array} pdaIds
     * @param {String} parentDeployment
     */
    function getProcessingPFARecords(statuses, processes, pfaIds, parentDeployment) {
        if (statuses && statuses.length > 0) {
        	var filters = [];
            var columns = [];
            // filter for queued/processing payment file admin records
        	filters.push(new nlobjSearchFilter('custrecord_2663_file_processed', null, 'noneof', statuses));
        	filters.push(new nlobjSearchFilter('custrecord_2663_file_processed', null, 'noneof', '@NONE@'));
        	if (processes && processes.length > 0) {
        		filters.push(new nlobjSearchFilter('custrecord_2663_last_process', null, 'anyof', processes));	
        	}
        	if (pfaIds && pfaIds.length > 0) {
        		filters.push(new nlobjSearchFilter('internalid', null, 'noneof', pfaIds));
        	}
        	if (parentDeployment) {
        		filters.push(new nlobjSearchFilter('custrecord_2663_parent_deployment', null, 'is', parentDeployment));
        	}
        	columns.push(new nlobjSearchColumn('name'));
            columns.push(new nlobjSearchColumn('custrecord_2663_file_processed'));
            columns.push(new nlobjSearchColumn('custrecord_2663_last_process'));
            columns.push(new nlobjSearchColumn('custrecord_2663_payment_subsidiary'));
            columns.push(new nlobjSearchColumn('custrecord_2663_bank_account'));
            columns.push(new nlobjSearchColumn('custrecord_2663_account'));
            columns.push(new nlobjSearchColumn('custrecord_2663_eft_template', 'custrecord_2663_bank_account'));
            columns.push(new nlobjSearchColumn('custrecord_2663_dd_template', 'custrecord_2663_bank_account'));
            columns.push(new nlobjSearchColumn('custrecord_2663_pp_template', 'custrecord_2663_bank_account'));
            
            return nlapiSearchRecord('customrecord_2663_file_admin', null, filters, columns);	
        }
        return null;
    }
    
    /**
     * Starts payment processing for the given PFA id, returns the result from nlapiScheduleScript
     * 
     * @param paymentFileAdminId
     * @returns
     */
    function startPaymentProcessing(paymentFileAdminId) {
        var rtnSchedule = '';
        if (paymentFileAdminId) {
        	var parentDeployment = nlapiLookupField('customrecord_2663_file_admin', paymentFileAdminId, 'custrecord_2663_parent_deployment');	
        	//Check if there are other processes that are currently in progress
        	var searchResults = getProcessingPFARecords([PAYPROCESSED, PAYFAILED, PAYERROR, PAYCANCELLED, PAYQUEUED], null, [paymentFileAdminId], parentDeployment);
        	if (!searchResults) {
        		var scriptId = getScriptId(paymentFileAdminId);
            	var deploymentId = getDeploymentId(paymentFileAdminId);
                // only start scheduled script when deployment status are all idle
                if (deploymentId && !(new _2663.PaymentDeploymentQueueManager()).IsScriptStarted(deploymentId)) {
                    nlapiLogExecution('debug', '[ep] PaymentTaskManager:startPaymentProcessing', 'Start processing for id: ' + paymentFileAdminId);
                    // start the scheduled script
                    var params = {};
                    params['custscript_2663_file_id'] = paymentFileAdminId;
                    rtnSchedule = nlapiScheduleScript(scriptId, deploymentId, params);
                    nlapiLogExecution('debug', '[ep] PaymentTaskManager:startPaymentProcessing', 'Schedule payment module processing for: ' + paymentFileAdminId + ', result: ' + rtnSchedule);
                }
                else {
                    rtnSchedule = 'INPRIORITYQUEUE';
                    nlapiLogExecution('debug', '[ep] PaymentTaskManager:startPaymentProcessing', 'One or More Script Deployment is running. Queued id: ' + paymentFileAdminId);
                }
        	} else {
        		rtnSchedule = 'INPRIORITYQUEUE';
        		nlapiLogExecution('debug', '[ep] PaymentTaskManager:startPaymentProcessing', 'Other PFA In Progress. Queued id: ' + paymentFileAdminId);
        	}
        }
        return rtnSchedule;
    }
    
    /**
     * Starts the next payment in priority queue, returns the result from nlapiScheduleScript
     * 
     * @param deploymentId
     * @returns
     */
    function startNextQueuedPayment(deploymentId) {
        var rtnSchedule;
        if (deploymentId) {
        	var scriptId = getScriptId();
            var paymentPriorityQueue = new _2663.PaymentPriorityQueue(deploymentId);
            var dequeueResult = paymentPriorityQueue.DequeueHighestPriorityElement();
            if (dequeueResult) {
                nlapiLogExecution('debug', '[ep] PaymentTaskManager:startNextQueuedPayment', 'Dequeued id to be started: ' + dequeueResult.id);
                var params = {};
                params['custscript_2663_file_id'] = dequeueResult.id;
                rtnSchedule = nlapiScheduleScript(scriptId, deploymentId, params);
                nlapiLogExecution('debug', '[ep] PaymentTaskManager:startPaymentProcessing', 'Schedule payment module processing for: ' + dequeueResult.id + ', result: ' + rtnSchedule);
            }
            else {
                nlapiLogExecution('debug', '[ep] PaymentTaskManager:startNextQueuedPayment', 'There are no items in the priority queue.');
                rtnSchedule = 'NOQUEUEITEMS';
            }
        }
        return rtnSchedule;
    }
    
    /**
     * Gets the script deployment id for the given file id (in v2.00, always default deployment id)
     * @param paymentFileAdminId
     * @returns {String}
     */
    function getDeploymentId(paymentFileAdminId) {
        // future support: can get different deployment for each bank to allow parallel processing
    	if (paymentFileAdminId) {
    		return nlapiLookupField('customrecord_2663_file_admin', paymentFileAdminId, 'custrecord_2663_parent_deployment');
    	}
        return EP_PAYMENTPROCESSING_DEPLOY; 
    }
    
    /**
     * Gets the script id for the given file id (in v2.00, always default script id)
     * @param paymentFileAdminId
     * @returns {String}
     */
    function getScriptId(paymentFileAdminId) {
        // future support: can get different script for each bank to allow parallel processing
        return EP_PAYMENTPROCESSING_SCRIPT; 
    }
    
    this.CanStartPaymentProcessing = canStartPaymentProcessing;
    this.StartPaymentProcessing = startPaymentProcessing;
    this.StartNextQueuedPayment = startNextQueuedPayment;
    this.GetProcessingPFARecords = getProcessingPFARecords;
};

/**
 * Class with function to retrieve deployments for multiple scheduled script processing
 * @returns {_2663.PaymentDeploymentQueueManager}
 */
_2663.PaymentDeploymentQueueManager = function() {
	var scriptIdObj = {};
	var defaultQueueSetting = {
		parentDeployment: EP_PAYMENTPROCESSING_DEPLOY,
		creatorDeployments: [EP_PAYMENTCREATOR_DEPLOY],
		rollbackDeployment: EP_ROLLBACK_DEPLOY,
		reversalDeployment: EP_REVERSEPAYMENTS_DEPLOY,
		notifyDeployment: EP_EMAILNOTIFICATION_DEPLOY,
		batchDeployment: EP_ONDEMANDBATCH_DEPLOY
	};
	
    /**
     * Get deployment settings from EP Preference record
     * 
     * @returns {Array}
     */
    function getDeploymentSettings() {
        var subsidiaryQueueGroups = [];

        var isLicensed = (new _2663.EditionControl()).IsLicensed();
        nlapiLogExecution('debug', '[ep] PaymentDeploymentQueueManager:getDeploymentSettings', 'isLicensed: ' + isLicensed);  
        if (isLicensed) {
            var columns = [];
            columns.push(new nlobjSearchColumn('custrecord_ep_queue_setting'));
            var queueGroupSearchResults = nlapiSearchRecord('customrecord_ep_preference', null, null, columns);
    
            if (queueGroupSearchResults) {
                var queueXml = queueGroupSearchResults[0].getValue('custrecord_ep_queue_setting'); // only 1 preference record
                subsidiaryQueueGroups = convertQueueGroupXmlToObjectArray(queueXml);
            }
        } 
            
        // add default queue groups if none were found
        if (subsidiaryQueueGroups.length == 0) {
            nlapiLogExecution('debug', '[ep] PaymentDeploymentQueueManager:getDeploymentSettings', 'No queue groups found, use default deployments: customdeploy_2663_payment_processing_ss -> customdeploy_ep_payment_creator_ss');
            var defaultQueueGroup = '<queueDeployments>' +
                                    '<queueSetting parentDeployment="customdeploy_2663_payment_processing_ss">' +
                                    '    <paymentCreatorDeployments>' +
                                    '        <paymentCreatorDeployment>customdeploy_ep_payment_creator_ss</paymentCreatorDeployment>' +
                                    '    </paymentCreatorDeployments>' +
                                    '</queueSetting>' +
                                    '</queueDeployments>';
            subsidiaryQueueGroups = convertQueueGroupXmlToObjectArray(defaultQueueGroup);
        }

        return subsidiaryQueueGroups;
    }
    
    /**
     * Get queue settings for specific subsidiary
     * 
     * @returns {Array}
     */
    function getQueueSettings(subsidiary, parentDeployment) {
    	var oneWorldFlag = isOneWorld();
    	var queueSettings = [];
        if (isParallelProcessingOn()) {
        	var filters = [new nlobjSearchFilter('custrecord_2663_qs_ep_preference', null, 'noneof', '@NONE@')];
        	if (oneWorldFlag && subsidiary) {
        		filters.push(new nlobjSearchFilter('custrecord_2663_qs_subsidiary', null, 'anyof', subsidiary));
        	}
        	if (parentDeployment) {
        		filters.push(new nlobjSearchFilter('custrecord_2663_qs_parent_deployment', null, 'is', parentDeployment));
        	}
        	
            var columns = [
                new nlobjSearchColumn('custrecord_2663_qs_parent_deployment'),
                new nlobjSearchColumn('custrecord_2663_qs_creator_deployment'),
                new nlobjSearchColumn('custrecord_2663_qs_rollback_deployment'),
                new nlobjSearchColumn('custrecord_2663_qs_reversal_deployment'),
                new nlobjSearchColumn('custrecord_2663_qs_notify_deployment'),
                new nlobjSearchColumn('custrecord_2663_qs_batch_deployment')
            ];
            
            if (oneWorldFlag) {
            	columns.push(new nlobjSearchColumn('custrecord_2663_qs_subsidiary'));
        	}
            
            var queueSettingResults = nlapiSearchRecord('customrecord_2663_queue_settings', null, filters, columns);
            if (queueSettingResults) {
            	for (var i = 0, ii = queueSettingResults.length; i < ii; i++) {
            		var queueSettingResult = queueSettingResults[i];
            		var queueSetting = {};
            		if (oneWorldFlag) {
            			queueSetting.subsidiaries = (queueSettingResult.getValue('custrecord_2663_qs_subsidiary') || '').split(',');
            		}
            		queueSetting.parentDeployment = queueSettingResult.getValue('custrecord_2663_qs_parent_deployment');
                	queueSetting.creatorDeployments = JSON.parse(queueSettingResult.getValue('custrecord_2663_qs_creator_deployment') || '[]');
                	queueSetting.rollbackDeployment = queueSettingResult.getValue('custrecord_2663_qs_rollback_deployment');
                	queueSetting.reversalDeployment = queueSettingResult.getValue('custrecord_2663_qs_reversal_deployment');
                	queueSetting.notifyDeployment = queueSettingResult.getValue('custrecord_2663_qs_notify_deployment');
                	queueSetting.batchDeployment = queueSettingResult.getValue('custrecord_2663_qs_batch_deployment');
                	queueSettings.push(queueSetting);
            	}
        		return queueSettings; 
            }
        } 

        // return default setting
        return getDefaultQueueSetting();
    }
    
    function getDefaultQueueSetting() {
    	var queueSettings = [];
    	var filters = [
            new nlobjSearchFilter('custrecord_2663_qs_ep_preference', null, 'noneof', '@NONE@'), 
            new nlobjSearchFilter('custrecord_2663_qs_parent_deployment', null, 'is', EP_PAYMENTPROCESSING_DEPLOY),
    		new nlobjSearchFilter('custrecord_2663_qs_default', null, 'is', 'T')
        ];
        var columns = [
            new nlobjSearchColumn('custrecord_2663_qs_parent_deployment'),
            new nlobjSearchColumn('custrecord_2663_qs_creator_deployment'),
            new nlobjSearchColumn('custrecord_2663_qs_rollback_deployment'),
            new nlobjSearchColumn('custrecord_2663_qs_reversal_deployment'),
            new nlobjSearchColumn('custrecord_2663_qs_notify_deployment'),
            new nlobjSearchColumn('custrecord_2663_qs_batch_deployment')
        ];
      
        //Only one default setting
        var queueSettingResult = (nlapiSearchRecord('customrecord_2663_queue_settings', null, filters, columns) || [])[0];
        if (queueSettingResult) {
    		var queueSetting = {};
    		queueSetting.parentDeployment = queueSettingResult.getValue('custrecord_2663_qs_parent_deployment');
        	queueSetting.creatorDeployments = JSON.parse(queueSettingResult.getValue('custrecord_2663_qs_creator_deployment') || '[]');
        	queueSetting.rollbackDeployment = queueSettingResult.getValue('custrecord_2663_qs_rollback_deployment');
        	queueSetting.reversalDeployment = queueSettingResult.getValue('custrecord_2663_qs_reversal_deployment');
        	queueSetting.notifyDeployment = queueSettingResult.getValue('custrecord_2663_qs_notify_deployment');
        	queueSetting.batchDeployment = queueSettingResult.getValue('custrecord_2663_qs_batch_deployment');
        	queueSettings.push(queueSetting);
        	
    		return queueSettings;
        } else if (isParallelProcessingOn()) {
        	nlapiLogExecution('error', '[ep] PaymentDeploymentQueueManager.getDefaultQueueSetting', 'No default setting returned. You may need to update your EP preferences.');
        }
    	
    	return [defaultQueueSetting];
    }
    
    /**
     * Converts the xml to an object array
     * @param queueXml
     * @returns {Array}
     */
    function convertQueueGroupXmlToObjectArray(queueXml) {
        var subsidiaryQueueGroups = [];
        if (queueXml) {
            try {
                var xmlObj = eval(queueXml);
                if (xmlObj) {
                    for (var i = 0; i < xmlObj.queueSetting.length(); i++) {
                        var queueXmlObj = xmlObj.queueSetting[i];
                        var queueObj = convertQueueGroupXmlToObject(queueXmlObj);
                        subsidiaryQueueGroups.push(queueObj);
                    }
                }
            }
            catch(ex) {
                var errorStr = (ex.getCode != null) ? ex.getCode() + '\n' + ex.getDetails() + '\n' + ex.getStackTrace().join('\n') : ex.toString();
                nlapiLogExecution('debug', '[ep] PaymentDeploymentQueueManager:convertQueueGroupXmlToObjectArray', errorStr);
            }
        }
        return subsidiaryQueueGroups;
    }
    
    /**
     * Converts the XML object to an object 
     * @param xmlObj
     * @returns {___anonymous12317_12318}
     */
    function convertQueueGroupXmlToObject(xmlObj) {
        var queueGroupObject = {};
        
        if (xmlObj) {
            if (xmlObj && xmlObj.attribute('parentDeployment') && xmlObj.paymentCreatorDeployments && xmlObj.paymentCreatorDeployments.paymentCreatorDeployment.length() > 0) {
                queueGroupObject.parentDeployment = xmlObj.attribute('parentDeployment').text().toString();
                queueGroupObject.paymentCreatorDeployments = [];
                for (var i = 0; i < xmlObj.paymentCreatorDeployments.paymentCreatorDeployment.length(); i++) {
                    queueGroupObject.paymentCreatorDeployments.push(xmlObj.paymentCreatorDeployments.paymentCreatorDeployment[i].text().toString());
                }
            }
        }
        
        return queueGroupObject;
    }
    
    /**
     * 
     * @param parentDeployment
     */
    function checkDeploymentStatus(parentDeployment) {
        nlapiLogExecution('debug', '[ep] PaymentDeploymentQueueManager:checkDeploymentStatus', 'Parent deployment: ' + parentDeployment);
        
        var status = {};
        if (parentDeployment) {
        	parentDeployment = new String(parentDeployment).toLowerCase();
        	var subsidiaryQueueGroups = getQueueSettings(null, parentDeployment);
            var scriptTypeIdArray = [];
        	for (var i = 0; i < subsidiaryQueueGroups.length; i++) {
                var queueSettingObj = subsidiaryQueueGroups[i];
                if (queueSettingObj.parentDeployment == parentDeployment) {
                    scriptTypeIdArray.push({
                        scriptId: EP_PAYMENTPROCESSING_SCRIPT,
                    	scriptType: getScriptInternalId(EP_PAYMENTPROCESSING_SCRIPT),
                        deploymentScriptIds: [queueSettingObj.parentDeployment]
                    });
                    scriptTypeIdArray.push({
                    	scriptId: EP_PAYMENTCREATOR_SCRIPT,
                    	scriptType: getScriptInternalId(EP_PAYMENTCREATOR_SCRIPT),
                        deploymentScriptIds: queueSettingObj.creatorDeployments
                    });
                    scriptTypeIdArray.push({
                    	scriptId: EP_ROLLBACK_SCRIPT,
                    	scriptType: getScriptInternalId(EP_ROLLBACK_SCRIPT),
                        deploymentScriptIds: [queueSettingObj.rollbackDeployment]
                    });
                    scriptTypeIdArray.push({
                    	scriptId: EP_REVERSEPAYMENTS_SCRIPT,
                    	scriptType: getScriptInternalId(EP_REVERSEPAYMENTS_SCRIPT),
                        deploymentScriptIds: [queueSettingObj.reversalDeployment]
                    });
                    scriptTypeIdArray.push({
                    	scriptId: EP_EMAILNOTIFICATION_SCRIPT,
                    	scriptType: getScriptInternalId(EP_EMAILNOTIFICATION_SCRIPT),
                        deploymentScriptIds: [queueSettingObj.notifyDeployment]
                    });
                    scriptTypeIdArray.push({
                    	scriptId: EP_ONDEMANDBATCH_SCRIPT,
                    	scriptType: getScriptInternalId(EP_ONDEMANDBATCH_SCRIPT),
                        deploymentScriptIds: [queueSettingObj.batchDeployment]
                    });
                }
            }
        	
        	if (scriptTypeIdArray.length > 0) {
        		var scriptDeployments = getScriptDeployments(scriptTypeIdArray, true);
                if (scriptDeployments) {
                    Object.keys(scriptDeployments).forEach(function(scriptId) {
                    	status[scriptId] = scriptDeployments[scriptId].status;
                    });
                }	
        	}
        }
        
        return status;
    }
    
    /**
     * Gets the deployments in progress
     * 
     * @returns
     */
    function getDeploymentsInProgress() {
        var deploymentsInProgress = [];
        var subsidiaryQueueGroups = getQueueSettings();
        var scriptTypeIdArray = [];
        for (var i = 0; i < subsidiaryQueueGroups.length; i++) {
            var queueSettingObj = subsidiaryQueueGroups[i];
            scriptTypeIdArray.push({
                scriptId: EP_PAYMENTPROCESSING_SCRIPT,
            	scriptType: getScriptInternalId(EP_PAYMENTPROCESSING_SCRIPT),
                deploymentScriptIds: [queueSettingObj.parentDeployment]
            });
            scriptTypeIdArray.push({
            	scriptId: EP_PAYMENTCREATOR_SCRIPT,
            	scriptType: getScriptInternalId(EP_PAYMENTCREATOR_SCRIPT),
                deploymentScriptIds: queueSettingObj.creatorDeployments
            });
            scriptTypeIdArray.push({
            	scriptId: EP_ROLLBACK_SCRIPT,
            	scriptType: getScriptInternalId(EP_ROLLBACK_SCRIPT),
                deploymentScriptIds: [queueSettingObj.rollbackDeployment]
            });
            scriptTypeIdArray.push({
            	scriptId: EP_REVERSEPAYMENTS_SCRIPT,
            	scriptType: getScriptInternalId(EP_REVERSEPAYMENTS_SCRIPT),
                deploymentScriptIds: [queueSettingObj.reversalDeployment]
            });
            scriptTypeIdArray.push({
            	scriptId: EP_EMAILNOTIFICATION_SCRIPT,
            	scriptType: getScriptInternalId(EP_EMAILNOTIFICATION_SCRIPT),
                deploymentScriptIds: [queueSettingObj.notifyDeployment]
            });
            scriptTypeIdArray.push({
            	scriptId: EP_ONDEMANDBATCH_SCRIPT,
            	scriptType: getScriptInternalId(EP_ONDEMANDBATCH_SCRIPT),
                deploymentScriptIds: [queueSettingObj.batchDeployment]
            });
        }
        
        var scriptDeployments = getScriptDeployments(scriptTypeIdArray);
        for (var deployment in scriptDeployments) {
            if (TERMINAL_DEPLOYMENT_STATUSES.indexOf(scriptDeployments[deployment].status) < 0) {
                deploymentsInProgress.push({
                    title: scriptDeployments[deployment].title,
                    scriptId: scriptDeployments[deployment].scripttype,
                    deploymentId: deployment,
                    status: scriptDeployments[deployment].status
                });
            }
        }
        
        return deploymentsInProgress;
    }
    
    /**
     * Checks the queue XML to be saved
     * 
     * @param queueXml
     * @returns {Array}
     */
    function checkQueueXml(queueXml) {
        var errors = [];
        
        // only check when XML is defined
        if (queueXml) {
            var subsidiaryQueueGroups = convertQueueGroupXmlToObjectArray(queueXml);
            if (subsidiaryQueueGroups && subsidiaryQueueGroups.length > 0) {
                var parentDeploymentArray = [];
                var paymentCreatorDeploymentArray = [];
                var scriptTypeIdArray = [];
                for (var i = 0; i < subsidiaryQueueGroups.length; i++) {
                    var queueSettingObj = subsidiaryQueueGroups[i];
                    
                    // check if parent deployment is blank
                    if (!queueSettingObj.parentDeployment) {
                        errors.push('Empty parent deployment at queueSetting index ' + i);
                        break;
                    }
                    
                    // check if parent deployment is duplicate
                    if (parentDeploymentArray.indexOf(queueSettingObj.parentDeployment) != -1) {
                        errors.push('Duplicate parent deployment: ' + queueSettingObj.parentDeployment + ' at queueSetting index ' + i);
                        break;
                    }
                    else {
                        parentDeploymentArray.push(queueSettingObj.parentDeployment);
                    }
                    
                    var errorInPaymentCreatorDeployment = false;
                    for (var j = 0; j < queueSettingObj.paymentCreatorDeployments.length; j++) {
                        // check if payment creator deployment id is blank
                        if (!queueSettingObj.paymentCreatorDeployments[j]) {
                            errors.push('Empty payment creator deployment for parent deployment: ' + queueSettingObj.parentDeployment + ' at queueSetting index ' + i + ', payment creator deployment index ' + j);
                            errorInPaymentCreatorDeployment = true;
                            break;
                        }
                        // check if payment creator deployment id is duplicate
                        if (paymentCreatorDeploymentArray.indexOf(queueSettingObj.paymentCreatorDeployments[j]) != -1) {
                            errors.push('Duplicate payment creator deployment: ' + queueSettingObj.paymentCreatorDeployments[j] + ' for parent deployment: ' + queueSettingObj.parentDeployment + ' at queueSetting index ' + i + ', payment creator deployment index ' + j);
                            errorInPaymentCreatorDeployment = true;
                            break;
                        }
                        else {
                            paymentCreatorDeploymentArray.push(queueSettingObj.paymentCreatorDeployments[j]);
                        }
                    }
                    if (errorInPaymentCreatorDeployment == true) {
                        // exit loop, error occurred
                        break;
                    }
                    
                    // if ok, add to filter
                    scriptTypeIdArray.push(
                        {
                        	scriptId: 'customscript_2663_payment_processing_ss',
                        	scriptType: getScriptInternalId('customscript_2663_payment_processing_ss'),
                            deploymentScriptIds: [queueSettingObj.parentDeployment]
                        });
                    scriptTypeIdArray.push(
                        {
                        	scriptId: 'customscript_ep_payment_creator_ss',
                        	scriptType: getScriptInternalId('customscript_ep_payment_creator_ss'),
                        	deploymentScriptIds: queueSettingObj.paymentCreatorDeployments
                        });
                }

                // if there are no errors, get the deployment info to check the queue
                if (errors.length == 0) {
                    // get deployment info
                    var scriptDeployments = getScriptDeployments(scriptTypeIdArray);
                    
                    for (var i = 0; i < scriptTypeIdArray.length; i++) {
                        var scriptTypeIdObj = scriptTypeIdArray[i];
                        // check if deployments exist
                        for (var j = 0; j < scriptTypeIdObj.deploymentScriptIds.length; j++) {
                            if (!scriptDeployments[scriptTypeIdObj.deploymentScriptIds[j]]) {
                                errors.push('Cannot find deployment: ' + scriptTypeIdObj.deploymentScriptIds[j] + ', script: ' + scriptTypeIdObj.scriptId);
                            }
                        }
                    }
                    
                    // check duplicate queue id
                    var queueNumArray = [];
                    var queueDepArray = [];
                    for (var dep in scriptDeployments) {
                        var queueNum = scriptDeployments[dep].queueid;
                        if (queueNumArray.indexOf(queueNum) != -1) {
                            errors.push('Error in deployment: ' + dep + ', queue id: ' + scriptDeployments[dep].queueid + ' already used, duplicate for : ' + queueDepArray[queueNumArray.indexOf(queueNum)]);
                            errorInQueueId = true;
                        }
                        else {
                            queueNumArray.push(queueNum);
                            queueDepArray.push(dep);
                        }
                    }
                }
            }
            else {
                errors.push('Invalid XML string: ' + queueXml);
            }
        }
        
        return errors;
    }
    
    /**
     * Get the script deployment records and convert to an object
     * 
     * @param scriptTypeIdArray
     * @param statusOnly
     * @returns {___anonymous18177_18178}
     */
    function getScriptDeployments(scriptTypeIdArray, statusOnly) {
        var scriptDeployments = {};
        if (scriptTypeIdArray) {
        	for (var i = 0; i < scriptTypeIdArray.length; i++) {
                if (scriptTypeIdArray[i].scriptType && scriptTypeIdArray[i].scriptId) {
                    var filters = [];
                    if (scriptTypeIdArray[i].deploymentScriptIds) {
                        for (var j = 0; j < scriptTypeIdArray[i].deploymentScriptIds.length; j++) {
                            var filterString = new String(scriptTypeIdArray[i].deploymentScriptIds[j]).toUpperCase();
                            filters.push(new nlobjSearchFilter('scriptid', null, 'is', filterString).setOr(true));
                        }
                    }
                    var searchResults = nlapiSearchRecord('scriptdeployment', null, filters);
                    if (searchResults) {
                        for (var j = 0; j < searchResults.length; j++) {
                        	var searchResult = searchResults[j];
                        	var scriptDeployment = nlapiLoadRecord('scriptdeployment', searchResult.getId());
                        	var deploymentScriptId = new String(scriptDeployment.getFieldValue('scriptid')).toLowerCase();
                            scriptDeployments[deploymentScriptId] = {};
                            scriptDeployments[deploymentScriptId].status = scriptDeployment.getFieldValue('hiddendeprecatedstatus');
                            if (!statusOnly) {
                            	scriptDeployments[deploymentScriptId].scripttype = scriptTypeIdArray[i].scriptId;
                                scriptDeployments[deploymentScriptId].queueid = scriptDeployment.getFieldValue('queueid');
                                scriptDeployments[deploymentScriptId].title = scriptDeployment.getFieldValue('title');	
                            }
                        }
                    }
                }
            }
        }
        return scriptDeployments;
    }
    
    function getScriptInternalId(scriptId) {
    	if (!scriptIdObj[scriptId]) {
    		var res = nlapiSearchRecord('script', null, [new nlobjSearchFilter('scriptid', null, 'is', scriptId)]);
        	if (res) {
        		scriptIdObj[scriptId] = res[0].getId();
        	} else {
        		nlapiLogExecution('error', '[ep] PaymentPriorityQueue:getScriptInternalId', 'Script ' + scriptId + 'does not exist.');
        	}	
    	}
    	return scriptIdObj[scriptId];
    }
    
    function getParentDeployment(subsidiary) {
    	var parentDeployment = '';
        if (isParallelProcessingOn()) {            
            var taskMgr = new _2663.PaymentTaskManager();
        	var queueSettings = getQueueSettings(subsidiary);            
        	var qsLength = queueSettings.length;
        	if (qsLength > 1) {
        		for (var i = 0, ii = queueSettings.length; i < ii; i++) {
            		var queueSetting = queueSettings[i];                    
                    var searchResults = taskMgr.GetProcessingPFARecords([PAYPROCESSED, PAYFAILED, PAYERROR, PAYCANCELLED], null, null, queueSetting.parentDeployment);                    
            		// return if value is equal to default deployment or if there are no running deployments
            		if (!searchResults && (queueSetting.parentDeployment == EP_PAYMENTPROCESSING_DEPLOY || !isScriptStarted(queueSetting.parentDeployment))) {
                    	return queueSetting.parentDeployment;
                    }
            	}
        		return '';
        	} else {
        		// return parentDeployment if there is only one queue setting
        		var queueSetting = queueSettings[0];
        		if (queueSetting) {
        			return queueSetting.parentDeployment;
        		}
        	}
        }
    	return EP_PAYMENTPROCESSING_DEPLOY;
    }
    
    function isScriptStarted(deploymentId) {
    	var isStarted = false;
    	var deploymentStatus = checkDeploymentStatus(deploymentId);
    	for (var i in deploymentStatus) {
            if (TERMINAL_DEPLOYMENT_STATUSES.indexOf(deploymentStatus[i]) < 0) {
            	if (!deploymentStatus[i]) {
            		nlapiLogExecution('error', '[ep] PaymentDeploymentQueueManager:isScriptStarted', 'Deployment status is null');
            	} else if (VALID_SCHEDULE_STATUSES.indexOf(deploymentStatus[i]) < 0) {
            		nlapiLogExecution('error', '[ep] PaymentDeploymentQueueManager:isScriptStarted', 'Unexpected Deployment status: ' + i + '-' + deploymentStatus[i]);
            	} else {
            		nlapiLogExecution('debug', '[ep] PaymentDeploymentQueueManager:isScriptStarted', 'Deployment is already started: ' + i + '-' + deploymentStatus[i]);	
            	}
            	isStarted = true;
            }
        }
    	return isStarted;
    }
    
    function isParallelProcessingOn() {
    	return isOneWorld() && (new _2663.EditionControl()).IsLicensed() && nlapiGetContext().getQueueCount() > 1;
    }
    
    this.DefaultQueueSetting = defaultQueueSetting;
    this.GetDeploymentSettings = getDeploymentSettings;
    this.GetQueueSettings = getQueueSettings;
    this.CheckDeploymentStatus = checkDeploymentStatus;
    this.GetDeploymentsInProgress = getDeploymentsInProgress;
    this.CheckQueueXml = checkQueueXml;
    this.GetParentDeployment = getParentDeployment;
    this.IsScriptStarted = isScriptStarted;
    this.IsParallelProcessingOn = isParallelProcessingOn;
    this.ConvertQueueGroupXmlToObjectArray = convertQueueGroupXmlToObjectArray;
};

/**
 * Wrapper class for a priority queue based on Payment Queue saved search
 * 
 * @returns {_2663.PaymentPriorityQueue}
 */
_2663.PaymentPriorityQueue = function(deployId) {
    ///////////////////////////////////////////////////
    // Initialization
    this.PriorityQueueContents = [];
    this.PriorityQueueIndex = {};
    
    // get priority levels
    var dummyRecord = nlapiCreateRecord('customrecord_2663_file_admin', {recordmode: 'dynamic'});
    var priorityField = dummyRecord.getField('custrecord_ep_priority');
    var priorityOptions = priorityField.getSelectOptions();
    if (priorityOptions) {
        for (var i = 0; i < priorityOptions.length; i++) {
            this.PriorityQueueContents.push({
                priority: new String(priorityOptions[i].id),
                ids: []
            });
            this.PriorityQueueIndex[new String(priorityOptions[i].id)] = i;
        }
    }
    
    ///////////////////////////////////////////////////

    function initialize() {
        // sorted by priority
        //var searchResults = nlapiSearchRecord('customrecord_2663_file_admin', 'customsearch_ep_payment_queue');
    	var filters = [new nlobjSearchFilter('custrecord_2663_file_processed', null, 'is', PAYQUEUED)];
    	var deploymentQueueMgr = new _2663.PaymentDeploymentQueueManager();
    	
    	if (deploymentQueueMgr.IsParallelProcessingOn() && deployId && deployId != EP_PAYMENTPROCESSING_DEPLOY) {
    		var queueSettings = deploymentQueueMgr.GetQueueSettings(null, deployId);
    		if (queueSettings && queueSettings.length > 0) {
    			var deploymentFilter = new nlobjSearchFilter('custrecord_2663_parent_deployment', null, 'is', deployId);
    			deploymentFilter.setLeftParens(1);
    			deploymentFilter.setOr(true);
    			var emptyDeploymentFilter = new nlobjSearchFilter('custrecord_2663_parent_deployment', null, 'isempty');
    			emptyDeploymentFilter.setRightParens(1);
    			filters.push(deploymentFilter);
    			filters.push(emptyDeploymentFilter);
    		}
    	} else {
    		filters.push(new nlobjSearchFilter('custrecord_2663_parent_deployment', null, 'is', EP_PAYMENTPROCESSING_DEPLOY));
    	}
    	
    	var searchResults = nlapiSearchRecord('customrecord_2663_file_admin', 'customsearch_ep_payment_queue', filters);
        if (searchResults) {
            for (var i = 0; i < searchResults.length; i++) {
                var priority = new String(searchResults[i].getValue('custrecord_ep_priority'));
                var priorityIdx = this.PriorityQueueIndex[priority];
                var priorityContents = this.PriorityQueueContents[priorityIdx];
                if (priorityContents) {
                    if (priorityContents.ids.indexOf(searchResults[i].getId()) == -1) {
                        priorityContents.ids.push(searchResults[i].getId());
                    }
                }
            }
        }
        
        for (var i = 0; i < this.PriorityQueueContents.length; i++) {
            nlapiLogExecution('debug', '[ep] PaymentPriorityQueue:initialization', 'Priority: ' + this.PriorityQueueContents[i].priority + ' -- length: ' + this.PriorityQueueContents[i].ids.length + ', contents: [' + this.PriorityQueueContents[i].ids.join() + ']');
        }
    }
    
    /**
     * Returns the number of priority queue elements 
     */
    function size() {
        var counter = 0;
        for (var i = 0; i < this.PriorityQueueContents.length; i++) {
            counter += this.PriorityQueueContents[i].ids.length;
        }
        return counter;
    }
    
    /**
     * Returns true if the priority queue is empty
     * 
     * @returns {Boolean}
     */
    function empty() {
        return this.Size() == 0;
    }
    
    /**
     * Returns the highest priority element in the queue
     * 
     * @returns {___anonymous16132_16298}
     */
    function getHighestPriorityElement() {
        var obj = null;
        for (var i = 0; i < this.PriorityQueueContents.length; i++) {
            if (this.PriorityQueueContents[i].ids.length > 0) {
                obj = {
                    priority: parseInt(this.PriorityQueueContents[i].priority, 10),
                    id: this.PriorityQueueContents[i].ids[0]
                };
                break;
            }
        }
        return obj;
    }
    
    /**
     * Enqueues a given PFA id as mid-priority and returns the id and priority
     * 
     * @param paymentFileAdminId
     * @returns {___anonymous16979_17083}
     */
    function enqueue(paymentFileAdminId) {
        var newElement;
        if (paymentFileAdminId) {
            // reinitialize in case of new entries
            this.Initialize();
            // enqueues as mid priority
            var midPriorityIdx = Math.round(this.PriorityQueueContents.length / 2) - 1;
            var priorityObj = this.PriorityQueueContents[midPriorityIdx];
            var priority = parseInt(priorityObj.priority, 10);
            priorityObj.ids.push(paymentFileAdminId);
            newElement = {
                    id: paymentFileAdminId,
                    priority: priority
                };
            updatePriorityInPFARecords([newElement]);  // this submits the field
        }
        // return the priority
        return newElement;
    }
    
    /**
     * Dequeues the highest priority element and returns its id and priority
     * 
     * @returns {___anonymous17882_17989}
     */
    function dequeueHighestPriorityElement() {
        var removedItem;
        var highestPriorityElement = this.GetHighestPriorityElement();
        if (highestPriorityElement) {
            // remove highest priority element
            var priorityIdx = this.PriorityQueueIndex[new String(highestPriorityElement.priority)];
            var idToRemove = this.PriorityQueueContents[priorityIdx].ids.shift();  
            removedItem = {
                id: idToRemove,
                priority: highestPriorityElement.priority
            };
            // update removed PFA record
            updatePriorityInPFARecords([removedItem]);
        }
        return removedItem;
    }
    
    /**
     * Update the priority in the PFA custom record
     * 
     * @param records
     */
    function updatePriorityInPFARecords(records) {
        if (records) {
            var updatedRecords = 0;
            for (var i = 0; i < records.length; i++) {
                nlapiSubmitField('customrecord_2663_file_admin', records[i].id, 'custrecord_ep_priority', records[i].priority);
                nlapiLogExecution('debug', '[ep] PaymentPriorityQueue:updatePriorityInPFARecords', 'Updating id: ' + records[i].id + ', priority: ' + records[i].priority);
                updatedRecords++;
            }
            nlapiLogExecution('debug', '[ep] PaymentPriorityQueue:updatePriorityInPFARecords', 'Number of records updated: ' + updatedRecords);
        }
    }
    
    this.Size = size;
    this.Empty = empty;
    this.GetHighestPriorityElement = getHighestPriorityElement;
    this.Enqueue = enqueue;
    this.DequeueHighestPriorityElement = dequeueHighestPriorityElement;
    this.Initialize = initialize;

    this.Initialize();
};