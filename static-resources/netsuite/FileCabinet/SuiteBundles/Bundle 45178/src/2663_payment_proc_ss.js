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
 * 2012/05/04  221143         2.00.2012.05.03.2       Do not restart thread if state is failed
 * 2012/05/15  221788         2.00.0.2012.05.17.1     Changes for issues found during unit test automation
 * 2012/06/04  222827         2.00.0.2012.05.31.3     Create result records and notify parent process
 *                                                    after completing processing
 * 2013/05/30  252743         2.00.16				  Implement Queue/Thread Monitoring mechanism
 * 			   247323
 * 2013/06/17  254204 		  2.00.18				  Improve error handling
 * 2013/06/19  254204 		  2.00.18				  Set Monitor record to Failed if no payments made
 * 2013/07/15  257010   	  2.00.19				  Fix typo on try catch
 */

var _2663;

if (!_2663) 
    _2663 = {};

/**
 * Main function for scheduled script
 */
function main(){
	var context = nlapiGetContext();
	var deploymentId = context.getDeploymentId();
	var paymentRecordId = context.getSetting('script', 'custscript_ep_file_id');
	var threadResultId = context.getSetting('script', 'custscript_ep_thread_result_id') || '';
	try {
		if (threadResultId) {
			var paymentProcThread = new _2663.PaymentProcessingThread();
		    paymentProcThread.CreatePayments(paymentRecordId, threadResultId);	
		} else {
			nlapiLogExecution('error', '[ep] Payment Creator: main', ['No threadResultId for PFA:', paymentRecordId, 'deployment:', deploymentId].join(' '));
		}
	} catch(ex) {
		if (threadResultId) {
			nlapiSubmitField('customrecord_ep_proc_results', threadResultId, ['custrecord_ep_state', 'custrecord_ep_thread_last_updated'], [PAYFAILED, nlapiDateToString(new Date(), 'datetimetz')]);	
		}
		var errorStr = ['Error occured while creating payments for PFA:', paymentRecordId, 'deployment:', deploymentId].join(' ');
		if (ex instanceof nlobjError) {
			errorStr += ex.getCode() + '\n' + ex.getDetails() + '\n' + ex.getStackTrace();
		} else if (ex && ex.toString) {
			errorStr += ex.toString();
		}
		throw nlapiCreateError('EP_PAYMENT_CREATION_FAILED', errorStr);
	}
}

/**
 * Processes payment record creation for each scheduled script ("thread")
 * 
 * @returns {_2663.PaymentProcessingThread}
 */
_2663.PaymentProcessingThread = function(){
    /**
     * Create the payments assigned for this deployment
     */
    function createPayments(paymentRecordId, threadResultId) {
    	var context = nlapiGetContext();
        nlapiLogExecution('debug', '[ep] PaymentProcessingThread:createPayments', ['Processing for payment record :', paymentRecordId, 'thread result record :', threadResultId].join(' '));
        
        var dataSource = new _2663.PaymentFileDataSrc();
        if (dataSource.SetupPaymentFileInfoSrc(paymentRecordId)) {
        	var deploymentId = context.getDeploymentId();
            var transactionListStr = context.getSetting('script', 'custscript_ep_transactions');
            var transactions = JSON.parse(transactionListStr) || [];
            var procScriptDeploymentId = context.getSetting('script', 'custscript_ep_proc_dep_id');
            var queueIndex = context.getSetting('script', 'custscript_ep_queue_idx') || 1;
            queueIndex = parseInt(queueIndex, 10);
            var lastProcessedIndex = context.getSetting('script', 'custscript_ep_last_idx') || 0;
            lastProcessedIndex = parseInt(lastProcessedIndex, 10);
            var queueCount = context.getSetting('script', 'custscript_ep_queue_count') || 1;
            queueCount = parseInt(queueCount, 10);
            var paymentCtr = context.getSetting('script', 'custscript_ep_payment_ctr') || 0;
            paymentCtr = parseInt(paymentCtr, 10);
             
            nlapiLogExecution('debug', '[ep] PaymentProcessingThread:createPayments', [
                'Transactions string : ' + transactionListStr, 'Number of transactions : ' + transactions.length, 'Deployed from : ' + procScriptDeploymentId,
                'Queue index : ' + queueIndex, 'Queue count: ' + queueCount, 'Last processed index : ' + lastProcessedIndex, 'Payment counter : ' + paymentCtr 
    		 ].join(' '));
            
            var resultState;
            var paymentProcessor = new _2663.PaymentProcessor(dataSource);
            try {
                var result = paymentProcessor.CreatePaymentForQueue(transactions, lastProcessedIndex, queueIndex, queueCount, paymentCtr);
                lastProcessedIndex = result.lastProcessedIndex;
                paymentCtr = result.createdPaymentsCtr;
                resultState = PAYPROCESSED;
            }
            catch (ex) {
                var errorStr = (ex.getCode != null) ? ex.getCode() + '\n' + ex.getDetails() + '\n' + ex.getStackTrace().join('\n') : ex.toString();
                nlapiLogExecution('error', '[ep] PaymentProcessingThread:createPayments', errorStr);
                resultState = PAYFAILED;
            }
            
            
            if (resultState != PAYFAILED && governanceReached(paymentProcessor.governanceLimit)) {
            	resultState = REQUEUED;
                // save the results by updating thread result record
            	nlapiSubmitField('customrecord_ep_proc_results', threadResultId, ['custrecord_ep_state', 'custrecord_ep_paid_trans', 'custrecord_ep_thread_last_updated'], [resultState, paymentCtr, nlapiDateToString(new Date(), 'datetimetz')]);
                
                // set the params
                var params = {};
                params['custscript_ep_file_id'] = paymentRecordId;
                params['custscript_ep_transactions'] = JSON.stringify(transactions);
                params['custscript_ep_proc_dep_id'] = procScriptDeploymentId;
                params['custscript_ep_queue_idx'] = queueIndex;
                params['custscript_ep_last_idx'] = lastProcessedIndex;
                params['custscript_ep_queue_count'] = queueCount;
                params['custscript_ep_payment_ctr'] = paymentCtr;
                params['custscript_ep_thread_result_id'] = threadResultId;
                var rtnSchedule = nlapiScheduleScript(context.getScriptId(), deploymentId, params);
                nlapiLogExecution('debug', '[ep] PaymentProcessingThread:createPayments', 'Calling the scheduled script again. The new Schedule is : ' + rtnSchedule);
            }
            else {
                // save the results by updating thread result record
            	resultState = paymentCtr > 0 ? resultState : PAYFAILED;
            	nlapiSubmitField('customrecord_ep_proc_results', threadResultId, ['custrecord_ep_state', 'custrecord_ep_paid_trans', 'custrecord_ep_thread_last_updated'], [resultState, paymentCtr, nlapiDateToString(new Date(), 'datetimetz')]);
                
                // notify the parent process that the thread is completed
                var rtnSchedule = notifyParentProcess(paymentRecordId, procScriptDeploymentId);
                if (rtnSchedule == 'QUEUED') {
                    nlapiLogExecution('debug', '[ep] PaymentProcessingThread:createPayments', 'Deployed on parent script...');
                }
                else {
                    nlapiLogExecution('debug', '[ep] PaymentProcessingThread:createPayments', 'Cannot call parent deployment, result: ' + rtnSchedule);
                }
                nlapiLogExecution('debug', '[ep] PaymentProcessingThread:createPayments', 'Thread end');
            }
        }
        else {
            nlapiLogExecution('error', '[ep] PaymentProcessingThread:createPayments', 'Error in retrieving data source.');
        }
    }
    
    /**
     * Call the parent deployment script to notify that thread is finished
     * 
     * @param parentRecordId
     * @param procScriptDeploymentId
     * @returns 
     */
    function notifyParentProcess(paymentRecordId, procScriptDeploymentId) {
        var rtnSchedule = '';
        
        if (paymentRecordId && procScriptDeploymentId) {
            var params = {};
            params['custscript_2663_file_id'] = paymentRecordId;
            rtnSchedule = nlapiScheduleScript('customscript_2663_payment_processing_ss', procScriptDeploymentId, params);
            nlapiLogExecution('debug', '[ep] PaymentProcessingThread:notifyParentProcess', 'Calling the parent scheduled script: ' + procScriptDeploymentId + ', the new Schedule is : ' + rtnSchedule);
        }
        
        return rtnSchedule;
    }
    
    this.CreatePayments = createPayments;
};