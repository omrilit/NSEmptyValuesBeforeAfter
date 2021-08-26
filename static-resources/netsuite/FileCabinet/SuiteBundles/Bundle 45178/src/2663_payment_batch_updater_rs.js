/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * Revision History:
 * 
 * Date        Fixed Issue    Broken in QA Bundle     Issue Fix Summary
 * =============================================================================================
 * 2013/09/19  263190 		  3.00.00				  Initial version
 * 2013/09/26  263190 		  3.00.00				  Support Refresh Batch functionality
 * 2013/10/05  265406 		  3.00.00				  Replace _2663.Batch with _2663.PaymentBatch
 * 2014/01/24  273463 		  3.00.10				  Include Partially Payed Keys and Transaction Entities fields in batch creation
 * 2014/05/19  273487         3.00.3       			  Add process parameter
 * 2014/07/31  298933		  4.00.0.a	  			  Set autoBatch parameter value in batchObj.addTransactions method call
 * 2014/10/29  314559		  4.00.3	  			  Include discounts when adding transactions 
 */

function updateBatch(datain) {
	var logger = new _2663.Logger('[ep] updateBatch (RS)');
	try {
		logger.debug('start..');
		var startTime = new Date();
		var updated = 0;
		logger.debug('datain: ' + JSON.stringify(datain));
		if (datain.process) {
			if (['add', 'update', 'reject'].indexOf(datain.process) > -1) {
				if (datain.batch_id) {
					var batchObj = new _2663.PaymentBatch();
					batchObj.load(datain.batch_id);
					var start = datain.start * 1;
					var end = datain.end * 1;
					var transKeys = datain.process == 'update' ? batchObj.getRemovedKeys() : batchObj.getTransactionKeys();
					var transAmts = batchObj.getTransactionAmounts();
					var transDiscounts = batchObj.getTransactionDiscounts();
					var transEntities = batchObj.getTransactionEntities();
					logger.debug('transKeys.length: ' + transKeys.length + '<br>' + 'transAmts.length: ' + transAmts.length + '<br>' + 'transEntities.length: ' + transEntities.length);
					
					var keysToProcess = transKeys.slice(start, end);
					var amtsToProcess = transAmts.slice(start, end);
					var discountsToProcess = transDiscounts.slice(start, end);
					var entitiesToProcess = transEntities.slice(start, end);
					logger.debug('keysToProcess.length: ' + keysToProcess.length + '<br>' + 'amtsToProcess.length: ' + amtsToProcess.length + '<br>' + 'discountsToProcess.length: ' + discountsToProcess.length);

					updated = datain.process == 'add' ? batchObj.addTransactions(keysToProcess, amtsToProcess, discountsToProcess, entitiesToProcess, true) : batchObj.removeTransactions(keysToProcess);
					logger.debug('updated: ' + updated);
					
					logger.debug('time: ' + (new Date() - startTime));
					if (updated == keysToProcess.length) {
						logger.debug('Units remaining  : ' + nlapiGetContext().getRemainingUsage());
						return {update: 'complete'};
					} else {
						logger.error(['Not all transactions were processed sucessfully.', 'batchId: ' + datain.batch_id, 'updated: ' + updated, 'keys to process: ' + keysToProcess.length].join('<br>'));
						return {error: {code: 'EP_INCOMPLETE_UPDATE', message: 'Not all transactions were added sucessfully.'}};
					}	
				} else {
					logger.error('Batch id is null');
					return {error: {code: 'EP_NULL_BATCHID', message: 'Batch id is null.'}};
				}
			} else if (datain.process == 'refresh_batch') {
				if (datain.bank_acct) {
					var batchProcessor = new psg_ep.BatchProcessor();
					var state = batchProcessor.updateBatches('eft', EP_CREATEBATCH, {bankAccount: datain.bank_acct});
					logger.debug('state: ' + JSON.stringify(state) || ['empty']);
					if (['complete', 'incomplete'].indexOf(state.update) > -1) {
						return {update: state.update};
					} else {
						logger.error('Error during batchProcessor.updateBatches call. Invalid return status ' + state.update);
						return {error: {code: 'EP_INVALID_REFRESH_STATUS', message: 'Error during batchProcessor.updateBatches call. Invalid return status ' + state.update}};
					}
				} else {
					logger.error('Bank Account id is null');
					return {error: {code: 'EP_NULL_BANK_ACCT_ID', message: 'Bank Account id is null'}};
				}
			} else {
				logger.error('Invalid process' + datain.process);
				return {error: {code: 'EP_INVALID_PROCESS', message: 'Invalid process' + datain.process}};
			}
		} else {
			logger.error('Invalid process' + datain.process);
			return {error: {code: 'EP_INVALID_PROCESS', message: 'Invalid process' + datain.process}};
		}
	} catch(ex) {
		logger.error('An error occurred while updating batch ' + datain.batch_id, ex);
		return {error: {code: 'EP_ERROR_ON_BATCH_UPDATE', message: 'An error occurred while updating batch ' + datain.batch_id}};
	}
}