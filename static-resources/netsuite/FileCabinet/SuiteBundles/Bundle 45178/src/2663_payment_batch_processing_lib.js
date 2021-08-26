/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * Revision History:
 * 
 * Date        Fixed Issue    Broken in QA Bundle     Issue Fix Summary
 * =============================================================================================
 * 2012/08/01  227868         2.00.1       			  Initial version
 * 2012/08/13  227868         2.00.1       			  Update to support multiple schedules per Bank
 * 2012/08/14  227868         2.00.1       			  Create deferred batch on creation of initital batch record
 * 2012/08/17  227868         2.00.1       			  Use admin data loader suitelet instead of nlapiLoadConfiguration
 * 2012/08/28  229807 	      2.00.1				  Fix error on function getTimeZone()
 * 2012/08/31  230021         2.00.1       			  Fix transaction id filters when getting transaction summary
 * 													  and fix issue on computing next schedule date
 * 2012/09/07  229807 	      2.00.1				  Add Transaction Amounts field when creating batch records 
 * 2012/09/19  229807 	      2.00.1				  Add column fxamount if multicurrency
 * 2012/09/19  231497 	      2.00.1				  Refactor code to facilitate automation
 * 2012/10/08  232800         2.00.1       			  Remove use of nlapiYieldScript and reschedule script once governance limit is reached
 * 2012/10/22  232777         2.00.1       			  Add method closeBatches to class psg_ep.BatchProcessor
 * 2012/10/22  233817         2.00.1       			  Include transactions for vendors with 0 or negative balance and optimize
 * 													  transaction search
 * 2012/10/23  234032         2.00.1       			  Use account specified in Bank Detail record
 * 2012/11/06  234987         2.00.1       			  Set default batch limit to 5000
 * 2012/11/20  237873         2.00.3                  Support multicurrency payments
 * 2012/12/20  238697         2.00.5                  Get base currency from admin data loader suitelet
 * 2013/01/08  239643         2.00.6                  Add checking on Include All Currencies field of Payment File Format record
 * 2013/02/28  243634         2.00.6                  Fix function getTransactionSummary to call search api only if transactionIds parameter
 * 													  is not null and has 1 or more elements
 * 2013/04/15  248888   	  2.00.12				  Support multiple batch configuration per Company Bank 
 * 2013/04/16  248997   	  2.00.12				  Check if schedules array length > 0
 * 2013/04/16  249099   	  2.00.12				  Fix handling when governance limit is reached
 * 2013/04/17  249111   	  2.00.13				  Add support for auto-numbering for batches
 * 2013/04/18  249247   	  2.00.13				  Get due schedules only when schedules are set per batch detail
 * 2013/04/18  249266   	  2.00.13				  Check if schedules next date is equal to today's date
 * 2013/04/19  249266   	  2.00.13				  Add time zone column and get text value from payment schedule record
 * 2013/04/22  249473   	  2.00.13				  Make sure getLastBatchNumber returns an integer value
 * 2013/04/22  249474    	  2.00.13				  Fix for loop in function addTransactionsToBatch
 * 2013/05/06  250624		  2.00.13				  Consider order of Batch Details during Payment batch creation
 * 2013/07/15  245723		  2.00.10				  Add support for commission transactions
 * 2013/08/29  261772 		  2.00.25.2013.08.29.3	  Added checking for employee commission feature
 * 2013/09/26  263190 		  3.00.00				  Add support for Approval Routing
 * 													  Include handling for Creation event type
 * 2013/09/27  263190 		  3.00.00				  Move transaction search inside method updateBatch
 * 													  Send notification when refresh batch completes
 * 2013/09/30  264794 		  3.00.00				  Send notification when batch creation finishes
 * 2013/10/05  265406 		  3.00.00				  Refactor code to use Payment File Administration record instead of Payment Batch
 * 2013/10/07  265406 		  3.00.00				  Replace name field with altname
 * 2013/10/08  265602 		  3.00.00				  Remove reference to columns variable
 * 													  Add Commissions only when Commission feature is enabled
 * 2013/11/07  267722 		  3.00.00				  Inititalize process date and posting period fields
 * 2013/11/26   		      3.00.00				  Replace hardcoded link with sourced value
 * 2013/11/26  272626	      3.01.00				  Add subsidiary filter
 * 2014/01/24  273463 		  3.00.10				  Include Partially Payed Keys and Transaction Entities fields in batch update
 * 													  Add filters to be able to include previously partially payed transactions
 * 													  when Automated Batch processing is disabled
 * 2014/03/25  273472 		  3.00.3     			  Exclude main batch detail if inactive
 * 2014/03/25  282962 		  3.01.3     			  Reload batch record after updating status
 * 2014/05/19  273487         3.00.3       			  Support parallel processing for batch processing
 * 2014/04/08  281197 		  3.01.3     			  Remove time from date in method getAccountingPeriod
 * 2014/07/30  299484  		  4.00.1     			  Add name column in method getBatches
 * 2014/09/01  299074  		  4.00.2     			  Limit transaction search to increase efficiency
 * 2014/10/07  309319         4.00.3                  Include credits in auto-batch processing
 * 2014/10/17  313419         4.00.3                  Do not include negative credit amounts, except for credits
 * 2014/10/29  314208         4.00.3                  added check for vendor credit transactions (treat as negative in computation of total amount)
 * 2014/10/29  314559		  4.00.3	  			  Include discounts when adding transactions  
 */
var _2663 = _2663 || {};
var psg_ep = psg_ep || {};

psg_ep.SYSTEM_USER_ID = -4;	//User: -System-

psg_ep.BatchProcessor = function() {
	var logTitle = '[ep] BatchProcessor';
	var logger = new _2663.Logger(logTitle);
	var baseUrl = _2663.getDomainUrl();
	var context = nlapiGetContext();
	var oneWorld = context.getFeature('SUBSIDIARIES');
	var multiCurrency = context.getFeature('MULTICURRENCY');
	var paymentTypeIds = {'eft': '1', 'dd': '2'};
	var batchLimit = defaultLimit = 5000;
	var governanceLimit = 100;
	var batchDS = new psg_ep.BatchProcessorData(governanceLimit);
	var dtUtil = new psg_ep.DateUtil();
	var timeZoneOffset = (getTimeZone().match(/[+-]\d{2}:\d{2}/) || [''])[0];
	var config = _2663.getConfigurationObject();
	var batchSearch = new _2663.Search('customrecord_2663_file_admin');
	var thisObj = this;
	
	function getBatches(bankAccountId, statuses, accountId) {
		statuses = statuses || [BATCH_OPEN, BATCH_UPDATING, BATCH_PENDINGAPPROVAL];
		batchSearch.clearFilters();
	    batchSearch.addFilter('custrecord_2663_bank_account', null, 'is', bankAccountId);
        batchSearch.addFilter('custrecord_2663_status', null, 'anyof', statuses);
        if (accountId) {
        	batchSearch.addFilter('custrecord_2663_account', null, 'anyof', accountId);
        }

        batchSearch.clearColumns();
        batchSearch.addColumn('name');
        batchSearch.addColumn('altname');
	    batchSearch.addColumn('custrecord_2663_bank_account');
	    batchSearch.addColumn('custrecord_2663_account');
	    batchSearch.addColumn('custrecord_2663_status');
	    batchSearch.addColumn('custrecord_2663_batch_detail');
	    batchSearch.addColumn('custrecord_2663_payments_for_process_id');
	    batchSearch.addColumn('custrecord_2663_time_stamp');
	    batchSearch.addColumn('custrecord_2663_number');
	    batchSearch.addColumn('custrecord_2663_total_amount');
	    batchSearch.addColumn('custrecord_2663_total_transactions');
	    
		return batchSearch.getResults();
	}
	
	function updateBatches(paymentType, process, state) {
		logger.setTitle(logTitle + 'updateBatches');
		state = state || {};
		state.updatedCount = state.updatedCount || 0;
		if ([EP_CREATEBATCH, EP_CLOSEBATCH].indexOf(process) < 0) {
			throw nlapiCreateError('EP_INVALID_PROCESS', 'Invalid process: ' + process);
		}
		
		var bankAccounts = batchDS.getBankAccounts(paymentType, state.bankAccount || state.unprocessedBankAccounts);
		var fileFormats = batchDS.getFileFormats(paymentType);
		var bankAccountIds = bankAccounts.map(function(bankAcct) {
			return bankAcct.getId();
		});
		
		logger.debug('state: ' + JSON.stringify(state || ['empty']) + '<br>' + 'bankAccounts.length: ' + bankAccounts.length);
		for (var i = 0; i < bankAccounts.length && !state.updateSchedules; i++) {
			var bankAccount = bankAccounts[i];
			var bankAccountId = bankAccount.getId();
			var accountId = bankAccount.getValue('custrecord_2663_auto_ap');
			if (accountId) {
				var fileFormatId = bankAccount.getValue('custrecord_2663_' + paymentType + '_template');
				var fileFormat = fileFormats[fileFormatId];
				var subsidiary = oneWorld && bankAccount.getValue('custrecord_2663_subsidiary');
				var bankCurrency = bankAccount.getValue('custrecord_2663_currency');
				var currencies = batchDS.getCurrencies(bankCurrency, subsidiary, fileFormat);
				
				batchLimit = fileFormat.max_lines || defaultLimit;
				
				var batchDetails = batchDS.getBatchDetails(bankAccountId, state.unprocessedBatchDetails);
				var batchDetailIds = Object.keys(batchDetails);
				
				for (var j = 0; j < batchDetailIds.length; j++) {
					var batchDetailId = batchDetailIds[j];
					var batchDetail = batchDetails[batchDetailId];
					logger.debug('bank account: ' + bankAccountId + ', batchDetailId: ' + batchDetailId);
					
					if (process == EP_CREATEBATCH && (!state.dueBatchDetails || state.dueBatchDetails.length == 0 || state.dueBatchDetails.indexOf(batchDetailId) > -1)) {
						state.updatedCount += thisObj.updateBatch(paymentType, subsidiary, bankAccountId, accountId, fileFormatId, currencies, batchDetail);
					} else if (process == EP_CLOSEBATCH && state.dueBatchDetails &&  state.dueBatchDetails.indexOf(batchDetailId) > -1) {
						state.updatedCount += thisObj.closeBatch(bankAccountId, accountId, batchDetailId);
					}
					if (_2663.governanceReached(governanceLimit)) {
						break;
					}
				}
				state.update = 'complete';
				if (_2663.governanceReached(governanceLimit)) {
					state.unprocessedBatchDetails = batchDetailIds.slice(j);
					if (!state.bankAccount) {
						state.unprocessedBankAccounts = bankAccountIds.slice(state.unprocessedBatchDetails.length > 0 ? i : i + 1);	
					}
					state.update = 'incomplete';
					break;
				} else if (state.bankAccount) {
					var emailRecipient = nlapiGetUser();
					
					if (emailRecipient) {
						logger.debug('send notification email..');
			        	var url = [baseUrl, nlapiResolveURL('suitelet', 'customscript_2663_batch_selection_main_s', 'customdeploy_2663_batch_selection_main_s'), '&custpage_2663_bank_acct_id=', bankAccount.getId()].join('');
						var emailBody = [
			                ['Payment Batches for Bank Account:', bankAccount.getValue('name'), 'has been completed.'].join(' '), 
			                'To submit for approval, please click this <a href="' + url + '">link</a>'
			            ].join('<br>'); 
						
						if (emailRecipient == psg_ep.SYSTEM_USER_ID) {
							
							for (var batchIdIndx = 0; batchIdIndx < batchDetailIds.length; batchIdIndx++) {
								var batchId = batchDetailIds[batchIdIndx];
								sendNotificationEmail(batchDetails[batchId].emailRecipient, 'Refresh Batch Completed', emailBody);
							}
						} else {
							//send email that refresh batch has completed
							sendNotificationEmail(emailRecipient, 'Refresh Batch Completed', emailBody);
						}
					}
				}
			}
		}
		
		return state;
	}
	
	function createBatch(subsidiary, bankAccountId, accountId, paymentType, batchDetailId) {
		var currDate = dtUtil.getCurrentTime(timeZoneOffset);
		var batch = new _2663.PaymentBatch();
		batch.create();
		var batchNumber = (getLastBatchNumber(bankAccountId, batchDetailId) || 0) + 1;
		if (oneWorld && subsidiary) {
			batch.setSubsidiary(subsidiary);
		}
		
		var batchDetailName = nlapiLookupField('customrecord_2663_batch_details', batchDetailId, 'name');
		batch.setName([batchDetailName, batchNumber].join('-'));
		batch.setBankAccount(bankAccountId);
		batch.setAccount(accountId);
		batch.setPaymentType(paymentTypeIds[paymentType]);
		batch.setDetail(batchDetailId);
		batch.setTransactionKeys();
		batch.setTransactionAmounts();
        batch.setTransactionDiscounts();
		batch.setStatus(BATCH_UPDATING);
		batch.setNumber(batchNumber);
		batch.setApprovalLevel(APPROVAL_LEVEL1);
		batch.setProcessDate(nlapiDateToString(currDate));
		batch.setPostingPeriod(batchDS.getAccountingPeriod(currDate, true));
		batch.setTimeStamp(nlapiDateToString(currDate, 'datetimetz'));
		batch.submit();
		
		return batch;
	}
	
	function getBatch(bankAccountId, accountId, batchDetailId) {
		batchSearch.clearFilters();
		batchSearch.addFilter('custrecord_2663_bank_account', null, 'is', bankAccountId); 
	    batchSearch.addFilter('custrecord_2663_account', null, 'is', accountId);
	    batchSearch.addFilter('custrecord_2663_status', null, 'is', BATCH_OPEN);
		
		batchSearch.clearColumns();
		
		if (batchDetailId) {
			batchSearch.addFilter('custrecord_2663_batch_detail', null, 'is', batchDetailId);
		}
		var res = batchSearch.getResults();
		if (res && res.length > 0) {
			var batch = new _2663.PaymentBatch();
			batch.load(res[0].getId());
		} 
		return batch;
	}
	
	function updateBatch(paymentType, subsidiary, bankAccountId, accountId, fileFormatId, currencies, batchDetail, fromSchedule) {
		logger.setTitle(logTitle + ':updateBatch');
		var transactions = batchDS.getTransactions(batchDetail.savedSearch, paymentType, subsidiary, accountId, bankAccountId, currencies, fileFormatId);
		if (transactions && transactions.length > 0) {
			transactions.sort(sortTransactions);
			logger.debug('transactions.length: ' + transactions.length);
			if (!_2663.governanceReached(governanceLimit)) {
				var batch = thisObj.getBatch(bankAccountId, accountId, batchDetail.id);
				if (!batch) {
					batch = thisObj.createBatch(subsidiary, bankAccountId, accountId, paymentType, batchDetail.id);
				} else {
					batch.submitField(batch.getId(), 'custrecord_2663_status', BATCH_UPDATING);
					// reload batch due to optimistic locking
					batch.load(batch.getId());
				}
				return thisObj.addTransactionsToBatch(transactions, batch, paymentType, batchDetail.id, fromSchedule);	
			}
		}
		return 0;
	}
	
	function closeBatch(bankAccountId, accountId, batchDetailId) {
		var batch = getBatch(bankAccountId, accountId, batchDetailId);
		if (batch) {
			batch.setStatus(BATCH_PENDINGAPPROVAL);
			batch.submit();
			return 1;
		}
		return 0;
	}
	
	function closeBatches() {
		batchSearch.clearFilters();
		batchSearch.addFilter('custrecord_2663_status', null, 'is', BATCH_OPEN);
		batchSearch.clearColumns();
		var openBatches = batchSearch.getResults();
		if (openBatches && openBatches.length > 0) {
			var batch = new _2663.PaymentBatch();
			openBatches.forEach(function(openBatch) {
				batch.submitField(openBatch.getId(), 'custrecord_2663_status', BATCH_PENDINGAPPROVAL);
			});
		}
	}
	
	function addTransactionsToBatch(transactions, batch, paymentType, batchDetailId, fromSchedule) {
		logger.setTitle(logTitle + ':addTransactionsToBatch');
		logger.debug('start..');
		var amtRemainingColumn = multiCurrency ? 'fxamountremaining' : 'amountremaining';
		
		var batchTransactionIds = batch.getTransactionKeys();
		var batchTransactionAmounts = batch.getTransactionAmounts();
        var batchTransactionDiscounts = batch.getTransactionDiscounts();
		var batchTransactionEntities = batch.getTransactionEntities();
		var batchJournalKeys =  batch.getJournalKeys();
		var batchPartiallyPaidKeys =  batch.getPartiallyPaidKeys();
		var batchTotalAmount = batch.getTotalAmount();
		var batchCreditFlag = (batch.getCreditFlag() === 'T');
		var batchMapEntityAmt = JSON.parse(batch.getMapEntityAmt() || '{}');
		var maxNoOfTransactions = batchLimit - batchTransactionIds.length;
		var noOfTransactions = maxNoOfTransactions < transactions.length ? maxNoOfTransactions : transactions.length;
		var addedTransactions = 0;
		var updatedCount = 0;
		
        // search for discount terms and create term details object
        var columns = [];
    	columns.push(new nlobjSearchColumn('name'));
        columns.push(new nlobjSearchColumn('discountpercent'));
        var res = nlapiSearchRecord('term', null, null, columns) || [];        
        var objTerms = {};
        for (var i = 0, ii = res.length; i < ii; i++) {
        	var term = res[i];
        	objTerms[term.getId()] = {};
        	objTerms[term.getId()].discPercent = term.getValue('discountpercent');
        }        
        
		for (var i = 0; i < noOfTransactions && batchTransactionIds.length < batchLimit && !_2663.governanceReached(governanceLimit); i++) {
			var transaction = transactions[i];
			var tranKey = [transaction.getId(),transaction.getValue('line')].join('-');
			var tranAmt = transaction.getValue(amtRemainingColumn);
			var tranEntity = transaction.getValue('name');
			var fxRate = 1;
			// compute discount amount and recompute tranAmt
            var objTerm = objTerms[transaction.getValue('terms')] || {};
            var tranDisc = objTerm && objTerm.discPercent ? _2663.computeDiscountAmount(objTerm.discPercent, nlapiFormatCurrency(tranAmt)) : 0;
            tranAmt = (tranAmt - tranDisc)* 1;

            // adjust for credit type
			var creditRecTypes = ['vendorcredit','vendorpayment'];
            var tranType = transaction.getRecordType();
            var isCredit = isInArray(tranType,creditRecTypes);
            tranAmt = isCredit ? (tranAmt *= -1) : tranAmt;
            tranAmt = multiCurrency ? parseFloat(tranAmt) : tranAmt;

			batchTotalAmount += tranAmt;
			batchTransactionIds.push(tranKey);
			batchTransactionAmounts.push(tranAmt);
            batchTransactionDiscounts.push(tranDisc);
			batchTransactionEntities.push(tranEntity);
            batchCreditFlag = batchCreditFlag || isCredit;
            updateEntityAmountMap(batchMapEntityAmt, transaction, tranAmt);
			
			if (transaction.getRecordType() == 'journalentry') {
				batchJournalKeys.push(tranKey);
			} else if (transaction.getValue('amount') != transaction.getValue('amountremaining')) {
				batchPartiallyPaidKeys.push(tranKey);
			}
			
			batch.addTransaction(tranKey, tranAmt, tranDisc, tranEntity, true);
			addedTransactions++;
		}
		
		var remainingTransactions = transactions.splice(addedTransactions);
		
		batch.setTransactionKeys(batchTransactionIds);
		batch.setTransactionAmounts(batchTransactionAmounts);
		batch.setTransactionDiscounts(batchTransactionDiscounts);
		batch.setTransactionEntities(batchTransactionEntities);
		batch.setJournalKeys(batchJournalKeys);
		batch.setPartiallyPaidKeys(batchPartiallyPaidKeys);
		batch.setTotalAmount(batchTotalAmount);
		batch.setTotalTransactions(batchTransactionIds.length);
		batch.setStatus(batchTransactionIds.length == batchLimit ? BATCH_PENDINGAPPROVAL : BATCH_OPEN);
        batch.setCreditFlag(batchCreditFlag ? 'T' : 'F');
        batch.setMapEntityAmt(JSON.stringify(batchMapEntityAmt));
		batch.submit();
		if (batchTransactionIds.length == batchLimit || !governanceReached(governanceLimit)) {
			updatedCount++;
		}
		if (fromSchedule && !governanceReached(governanceLimit)) {
        	var url = [baseUrl, nlapiResolveURL('suitelet', 'customscript_2663_batch_selection_ap_s', 'customdeploy_2663_batch_selection_ap_s'), '&custpage_2663_batchid=', batch.getId()].join('');
        	var bankAcctName = nlapiLookupField('customrecord_2663_bank_details', batch.getBankAccount(), 'name');
			var emailRecipient = nlapiLookupField('customrecord_2663_batch_details', batchDetailId, 'custrecord_2663_bd_email_recipient');
			var emailSubject = 'Payment Batch Created';
			var emailBody = [
                ['Payment Batch ', batch.getName(), 'has been created.<br>'].join(' '),
                'Bank Account: ' + bankAcctName, 
                'Total Payment Amount: ' + batch.getTotalAmount(), 
                'Number of Transactions: ' + batch.getTotalTransactions() + '<br>', 
                'To view this record, please click this <a href="' + url + '">link</a>'
            ].join('<br>'); 
			
			sendNotificationEmail(emailRecipient, 'Payment Batch Created', emailBody);
		}
		if (remainingTransactions.length > 0 && batchTransactionIds.length == batchLimit && !_2663.governanceReached(governanceLimit)) {
			var subsidiary = oneWorld && batch.getSubsidiary();
			batch = createBatch(subsidiary, batch.getBankAccount(), batch.getAccount(), paymentType, batchDetailId);
			updatedCount += addTransactionsToBatch(remainingTransactions, batch, paymentType, batchDetailId);
		}
		return updatedCount;
	}
	
    function updateEntityAmountMap(map, transaction, amount){
        var currency = multiCurrency ? (transaction.getValue('currency') || 'default') : 'default';
        var entityName = transaction.getText('entity');
        if (map[entityName]) {
            if (map[entityName][currency]){
                map[entityName][currency] += amount;
            }
            else {
                map[entityName][currency] = amount;
            }
        } 
        else {
            map[entityName] = {};
            map[entityName][currency] = amount;
        }        
    }
	
	function getLastBatchNumber(bankAccountId, batchDetailId) {
		if (bankAccountId && batchDetailId) {
			batchSearch.clearFilters();
			batchSearch.addFilter('custrecord_2663_bank_account', null, 'is', bankAccountId);
			batchSearch.addFilter('custrecord_2663_batch_detail', null, 'is', batchDetailId);

			batchSearch.clearColumns();
			
			batchSearch.addColumn('custrecord_2663_number', null, 'max');
			var res = (batchSearch.getResults())[0];
			return res ? (res.getValue('custrecord_2663_number', null, 'max') * 1) : 0; 
		}
		return 0;
	}
	
	function updateDueSchedules(dueSchedules) {
		var noOfDueSchedules = dueSchedules.length;
		if (dueSchedules && noOfDueSchedules > 0) {
			var updatedSchedules = 0;
			for (var i = 0; i < noOfDueSchedules && !_2663.governanceReached(governanceLimit); i++) {
				var schedule = dueSchedules[i];
				var nextDate = getNextScheduleDate(schedule);
				nlapiSubmitField('customrecord_2663_payment_schedule', schedule.getId(), 'custrecord_2663_schedule_next_date', nlapiDateToString(nextDate));
				updatedSchedules++;
			}
			if (_2663.governanceReached(governanceLimit) && updatedSchedules < noOfDueSchedules) {
				return false;
			}
		}
		return true;
	}
	
	function getNextScheduleDate(schedule) {
		var recurrence = schedule.getValue('custrecord_2663_schedule_recurrence');
		var nextDate = new Date(nlapiStringToDate(schedule.getValue('custrecord_2663_schedule_next_date')));
		var weekDays = '12345';
		
		if (recurrence) {
			if (recurrence == 1) {
				var dailyOption = schedule.getValue('custrecord_2663_schedule_daily_option');
				if (dailyOption) {
					if (dailyOption == 1) {
						var numOfDays = parseInt(schedule.getValue('custrecord_2663_schedule_num_of_days') || 0, 10);
						if (numOfDays > 0) {
							nextDate.setDate(nextDate.getDate() + numOfDays);
						}
					} else if (dailyOption == 2) {
						do {
							nextDate.setDate(nextDate.getDate() + 1);
						} while(weekDays.indexOf(nextDate.getDay()) < 0)
					}	
				}
			} else if (recurrence == 2) {
				var daysOfWeek = (schedule.getValue('custrecord_2663_schedule_days_of_week') || '').split(',');
				var numOfWeeks = schedule.getValue('custrecord_2663_schedule_num_of_weeks');
				if (daysOfWeek.length > 0 && numOfWeeks) {
					var intervalDays = 0;
					var diff = 0;
					while (diff <= 0) {
						for (var i = 0, ii = daysOfWeek.length; i < ii; i++) {
							diff = (daysOfWeek[i] - 1 + intervalDays) - nextDate.getDay();
							if (diff > 0) {
								nextDate.setDate(nextDate.getDate() + diff);
								break;
							}
						}
						intervalDays = 7 * numOfWeeks;
					}
				}
			} else if (recurrence == 3) {
				var monthlyOption = schedule.getValue('custrecord_2663_schedule_monthly_option');
				if (monthlyOption) {
					if (monthlyOption == 1) {
						var dayOfMonth = schedule.getValue('custrecord_2663_schedule_day_of_month');
						var expectedMonth = nextDate.getMonth() + 1;
						nextDate.setMonth(expectedMonth);
						nextDate.setDate(dayOfMonth);
						while (expectedMonth != nextDate.getMonth()) {
							nextDate.setDate(nextDate.getDate() - 1);
						}
					} else if (monthlyOption == 2) {
						var weekOfMonth = schedule.getValue('custrecord_2663_schedule_week_of_month');
						var dayOfWeek = schedule.getValue('custrecord_2663_schedule_day_of_week');
						if (weekOfMonth && dayOfWeek) {
							nextDate.setDate(1);
							nextDate.setMonth(nextDate.getMonth() + 1);
							var dates = dtUtil.getDatesByDayOfWeek(nextDate, dayOfWeek - 1);
							nextDate = dates[(weekOfMonth > 4 ? dates.length : weekOfMonth) - 1];
						}
					}
				}
			}
		}
		return nextDate;
	}
	
	function getTimeZone(subId) {
		if (oneWorld && subId) {
			var sub = nlapiLoadRecord('subsidiary', subId);
			 if (sub) {
				 return sub.getFieldText('TIMEZONE') || '';	 
			 } 
		} else {
			if (config && config.companyinformation && config.companyinformation.timezone) {
				return config.companyinformation.timezone.text || '';
			}
		}
		return '';
	}

	/**
     * Function to sort transactions
     * 
     * @param {Object} a
     * @param {Object} b
     * @returns {Number}
     */
    function sortTransactions(a, b) {
        var aString = a.getText('name').toLowerCase();
        var bString = b.getText('name').toLowerCase();
        if (aString < bString) {
            return -1;
        } else if (aString > bString) {
            return 1;
        } else {
            if (a.getText('type') < b.getText('type')) {
                return -1;
            } else if (a.getText('type') > b.getText('type')) {
                return 1;
            } else {
                var aNum = !isNaN(a.getValue('number')) ? parseInt(a.getValue('number'), 10) : '';
                var bNum = !isNaN(b.getValue('number')) ? parseInt(b.getValue('number'), 10) : '';
                if (aNum && bNum) {
                	if (aNum < bNum) {
                        return -1;
                    } else if (aNum > bNum) {
                        return 1;
                    }
                }
                return 0;
            }
        }
    }
	
    function sendNotificationEmail(emailRecipient, emailSubject, emailBody) {
    	
    	logger.setTitle(logTitle + ':sendNotificationEmail');
    	var emailSender = nlapiGetUser();
    	
    	try {
    		if (emailSender == psg_ep.SYSTEM_USER_ID) {
        		emailSender = emailRecipient;
        	}
        	
        	if (emailSender && emailRecipient && emailSubject && emailBody) {
    			logger.debug(['emailSender :' + emailSender, 'emailRecipient :' + emailRecipient].join('<br>'));
    			nlapiSendEmail(emailSender, emailRecipient, emailSubject, emailBody);
        	}
    	} catch (err) {
    		//log the error
    		nlapiLogExecution('ERROR', 'EP001', 'Error sending notification email [sender: ' + emailSender + 
    				'; emailRecipient: ' + emailRecipient + '; emailSubject: ' + emailSubject + ']');
    		nlapiLogExecution('ERROR', 'EP001', 'Error: ' + err);
    	}
    }
    
    function createPFA(paymentTypeId, bankAcctId, process, bankSubsidiary, dueBatchDetails) {
    	var batchPFA = new _2663.PaymentBatch();
    	batchPFA.create();
    	batchPFA.setBankAccount(bankAcctId);
    	batchPFA.setFileProcessed(PAYQUEUED);
    	batchPFA.setLastProcess(process);
    	batchPFA.setPriority(3);
    	batchPFA.setPaymentType(paymentTypeId);
    	if (dueBatchDetails && dueBatchDetails.length > 0) {
    		batchPFA.setDueBatchDetails(dueBatchDetails);
    	}
    	
    	// parent deployment
        var parentDeployment = (new _2663.PaymentDeploymentQueueManager()).GetParentDeployment(bankSubsidiary);
        if (parentDeployment) {
        	batchPFA.setParentDeployment(parentDeployment);
        }
    	
       return batchPFA.submit(null, true);
    }

    this.getBatch = getBatch;
	this.getBatches = getBatches;
	this.updateBatch = updateBatch;
	this.updateBatches = updateBatches;
	this.createBatch = createBatch;
	this.closeBatch = closeBatch;
	this.closeBatches = closeBatches;
	this.addTransactionsToBatch = addTransactionsToBatch;
	this.updateEntityAmountMap = updateEntityAmountMap;
	this.createPFA = createPFA;
	this.updateDueSchedules = updateDueSchedules;
};


/**
 * Contains the functions that return data for Batch Processing
 * 
 */
psg_ep.BatchProcessorData = function(governanceLimit) {
	var logTitle = '[ep] BatchProcessorData';
	var logger = new _2663.Logger(logTitle);
	var context = nlapiGetContext();
	var oneWorld = context.getFeature('SUBSIDIARIES');
	var multiCurrency = context.getFeature('MULTICURRENCY');
	var dtUtil = new psg_ep.DateUtil();
	var typeText = {'eft': 'EFT', 'dd' : 'DD'};
	var fileFormats = {'eft': {}, 'dd': {}};
	var accountingPeriods = {};
	var thisObj = this;
	
	/**
     * Returns the list of posting periods
     * 
     * @returns {Object}
     */
    function getAccountingPeriods(){
    	var accountingPeriodIds = Object.keys(accountingPeriods);
    	if (accountingPeriodIds.length < 1) {
    		var acctPeriodSearch = new _2663.Search('accountingperiod');
    		acctPeriodSearch.addFilter('isadjust', null, 'is', 'F');
    		acctPeriodSearch.addFilter('isquarter', null, 'is', 'F');
    		acctPeriodSearch.addFilter('isyear', null, 'is', 'F');
            
    		acctPeriodSearch.addColumn('startdate');
            acctPeriodSearch.addColumn('enddate');
            acctPeriodSearch.addColumn('periodname');
            acctPeriodSearch.addColumn('closed');
            
            acctPeriodSearch.setSort(0);
            
            var searchResults = acctPeriodSearch.getResults();
            for (var i = 0, ii = searchResults.length; i < ii; i++) {
            	var searchResult = searchResults[i];
            	var accountingPeriodId = searchResult.getId();
            	accountingPeriods[accountingPeriodId] = {};
            	accountingPeriods[accountingPeriodId].startdate = searchResult.getValue('startdate');
            	accountingPeriods[accountingPeriodId].enddate = searchResult.getValue('enddate');
            	accountingPeriods[accountingPeriodId].periodname = searchResult.getValue('periodname');
            	accountingPeriods[accountingPeriodId].closed = searchResult.getValue('closed');
            }
	
    	}
                
        return accountingPeriods;
    }
	
    /**
     * Get the accounting period to where the date belongs
     * 
     * @param {Date} procDate
     * @param {Boolean} nextOpen
     */
    function getAccountingPeriod(procDate, nextOpen) {
        var accountingPeriod = '';

        if (procDate) {
        	// make sure time is not included in date
        	procDate = new Date(procDate.getFullYear(), procDate.getMonth(), procDate.getDate());
        	var accountingPeriods = thisObj.getAccountingPeriods();
            var checkNextOpenPeriod = false;
            var periodIds = [];
            if (accountingPeriods) {
                for (var i in accountingPeriods) {
                	if (nextOpen && checkNextOpenPeriod) {
                		if (accountingPeriods[i].closed == 'F') {
                			accountingPeriod = i;
                			break;
                		}
                	} else if (accountingPeriods[i].startdate && accountingPeriods[i].enddate) {
                        var startDate = nlapiStringToDate(accountingPeriods[i].startdate);
                        var endDate = nlapiStringToDate(accountingPeriods[i].enddate);
                        if (startDate <= procDate && endDate >= procDate) {
                            if (nextOpen && accountingPeriods[i].closed == 'T') {
                            	checkNextOpenPeriod = true;
                            } else {
                            	accountingPeriod = i;
                            	break;
                            }
                        }
                	}
                	if (nextOpen && i && accountingPeriods[i].closed == 'F') {
                		periodIds.push(i);	
                	}
                }
            }
            if (nextOpen && !accountingPeriod && periodIds.length > 0) {
            	var currDate = new Date();
            	if (procDate > currDate) {
            		accountingPeriod = periodIds[periodIds.length - 1];
            	} else if (procDate < currDate) {
            		accountingPeriod = periodIds[0];
            	}
            }
        }
        
        return accountingPeriod;
    }
	
	function getFileFormats(type) {
		if (Object.keys(fileFormats[type]).length  < 1) {
			var allowedFormats = (new _2663.FormatRestrictor()).GetAllowedFormats(typeText[type]);
			var formatIds = (Object.keys(allowedFormats) || []);
			if (formatIds.length > 0) {
				var filters = [new nlobjSearchFilter('internalid', null, 'anyof', formatIds)];
				var cols = [
		            new nlobjSearchColumn('name'), 
		            new nlobjSearchColumn('custrecord_2663_max_lines'), 
		            new nlobjSearchColumn('custrecord_2663_format_currency'),
		            new nlobjSearchColumn('custrecord_2663_include_all_currencies')
	            ];
				var res = nlapiSearchRecord('customrecord_2663_payment_file_format', null, filters, cols);
				if (res) {
					res.forEach(function(r) {
						var id = r.getId();
						fileFormats[type][id] = {};
						fileFormats[type][id].name = r.getValue('name');
						fileFormats[type][id].max_lines = r.getValue('custrecord_2663_max_lines');
						fileFormats[type][id].currencies = r.getValue('custrecord_2663_format_currency');
						fileFormats[type][id].includeAllCurrencies = r.getValue('custrecord_2663_include_all_currencies') == 'T';
					});
				}
			}
		}
		return fileFormats[type];
	}
	
	/**
	 * Returns the list of bank accounts where batch processing is enabled
	 * 
	 * @param {String} type
	 * @param {Array} bankAccounts
	 */
	function getBankAccounts(type, bankAccounts) {
		var filters = [];
		var searchResults;

		type = type || 'eft';
		// Get bank accounts based on available formats for license
		var allowedFormats = getFileFormats(type);
		var formatFilter = [];
		for (var i in allowedFormats) {
			formatFilter.push(i);
		}
		
		if (formatFilter.length > 0) {
			if (type == 'eft' || type == 'dd') {
				filters.push(new nlobjSearchFilter('custrecord_2663_' + type + '_template', null, 'anyof', formatFilter));
				filters.push(new nlobjSearchFilter('custrecord_2663_' + type + '_batch', null, 'is', 'T'));
			}
			// Only get active records
			filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
			if (bankAccounts && bankAccounts.length > 0) {
				filters.push(new nlobjSearchFilter('internalid', null, 'anyof', bankAccounts));
			}

			var columns = [];
			columns.push(new nlobjSearchColumn('internalid'));
			columns.push(new nlobjSearchColumn('name').setSort());
			columns.push(new nlobjSearchColumn('custrecord_2663_' + type + '_template'));
			if (oneWorld) {
				columns.push(new nlobjSearchColumn('custrecord_2663_subsidiary'));	
			}
			if(multiCurrency) {
				columns.push(new nlobjSearchColumn('custrecord_2663_currency'));
			}
			columns.push(new nlobjSearchColumn('custrecord_2663_bank_department'));
			columns.push(new nlobjSearchColumn('custrecord_2663_bank_class'));
			columns.push(new nlobjSearchColumn('custrecord_2663_bank_location'));
			columns.push(new nlobjSearchColumn('custrecord_2663_auto_ap'));
				
			searchResults = nlapiSearchRecord('customrecord_2663_bank_details', null, filters, columns);
		}

		return searchResults || [];
	}
	
	function getBatchDetails(bankAccountId, batchDetailIds) {
		var batchDetails = {};
		if (bankAccountId) {
			var bankAcctRec = nlapiLoadRecord('customrecord_2663_bank_details', bankAccountId);
			if (bankAcctRec) {
				var batchDetailCount = bankAcctRec.getLineItemCount('recmachcustrecord_2663_bd_bank_acct');
				if (batchDetailCount > 0) {
					var mainLineNum = 0;
					for (var i = 1; i <= batchDetailCount; i++) {
						var batchDetailId = bankAcctRec.getLineItemValue('recmachcustrecord_2663_bd_bank_acct', 'id', i);
						if (batchDetailIds && batchDetailIds.length > 0 && batchDetailIds.indexOf(batchDetailId) < 0) {
							continue;
						}
						var isInactive = bankAcctRec.getLineItemValue('recmachcustrecord_2663_bd_bank_acct', 'custrecord_2663_bd_inactive', i) == 'T';
						if (!isInactive) {
							if (bankAcctRec.getLineItemValue('recmachcustrecord_2663_bd_bank_acct', 'custrecord_2663_bd_is_main', i) == 'T') {
								mainLineNum = i;		
							} else {
								batchDetails[batchDetailId] = {};
								batchDetails[batchDetailId].id = batchDetailId;
								batchDetails[batchDetailId].savedSearch = bankAcctRec.getLineItemValue('recmachcustrecord_2663_bd_bank_acct', 'custrecord_2663_bd_saved_search', i); 
								batchDetails[batchDetailId].schedules = bankAcctRec.getLineItemValues('recmachcustrecord_2663_bd_bank_acct', 'custrecord_2663_bd_payment_schedule', i) || [];
								batchDetails[batchDetailId].emailRecipient = bankAcctRec.getLineItemValue('recmachcustrecord_2663_bd_bank_acct', 'custrecord_2663_bd_email_recipient', i);
							}	
						}
					}
					if (mainLineNum) {
						isInactive = bankAcctRec.getLineItemValue('recmachcustrecord_2663_bd_bank_acct', 'custrecord_2663_bd_inactive', mainLineNum) == 'T';
						if (!isInactive) {
							batchDetailId = bankAcctRec.getLineItemValue('recmachcustrecord_2663_bd_bank_acct', 'id', mainLineNum);
							batchDetails[batchDetailId] = {};
							batchDetails[batchDetailId].id = batchDetailId;
							batchDetails[batchDetailId].savedSearch = bankAcctRec.getLineItemValue('recmachcustrecord_2663_bd_bank_acct', 'custrecord_2663_bd_saved_search', mainLineNum); 
							batchDetails[batchDetailId].schedules = bankAcctRec.getLineItemValues('recmachcustrecord_2663_bd_bank_acct', 'custrecord_2663_bd_payment_schedule', mainLineNum) || [];
							batchDetails[batchDetailId].emailRecipient = bankAcctRec.getLineItemValue('recmachcustrecord_2663_bd_bank_acct', 'custrecord_2663_bd_email_recipient', mainLineNum);	
						}
					}
				}	
			}
		}
		return batchDetails;
	}
	
	function getAccounts(subsidiary, acctType) {
        var searchResults;
        if ((!oneWorld || (oneWorld && subsidiary)) && acctType) {
            var filters = [];
            var columns = [];

            // accounts for subsidiary
            if (oneWorld && subsidiary) {
                filters.push(new nlobjSearchFilter('subsidiary', null, 'is', subsidiary));
            }
            
            // get accounts that are of given type
            filters.push(new nlobjSearchFilter('type', null, 'is', acctType));
            
            // do not get inactive accounts
            filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
            
            columns.push(new nlobjSearchColumn('name').setSort());
            
            searchResults = nlapiSearchRecord('account', null, filters, columns);
        }

        return searchResults || [];
    }
	
	function getDueSchedules(schedules) {
		logger.setTitle(logTitle + ':getDueSchedules');
		var filters = [];
		if (schedules && schedules.length > 0) {
			filters.push(new nlobjSearchFilter('internalid', null, 'anyof', schedules));
		}
		
		var columns = [];
		var colNames = ['event_type', 'recurrence', 'daily_option', 'num_of_days', 'num_of_weeks', 'days_of_week', 'monthly_option', 'day_of_month', 'week_of_month', 'day_of_week', 'next_date', 'start_time', 'time_zone'];
		colNames.forEach(function(colName) {
			columns.push(new nlobjSearchColumn('custrecord_2663_schedule_' + colName));
		});
		
		var schedules = (nlapiSearchRecord('customrecord_2663_payment_schedule', null, filters, columns) || []).filter(function(schedule) {
			var timeZoneOffset = ((schedule.getText('custrecord_2663_schedule_time_zone') || '').match(/[+-]\d{2}:\d{2}/) || [''])[0];
			var currentTime = dtUtil.getCurrentTime(timeZoneOffset);
			var currentDate = nlapiDateToString(currentTime);
			var nextDate = schedule.getValue('custrecord_2663_schedule_next_date');
			if (nextDate == currentDate) {
				var startTime = schedule.getValue('custrecord_2663_schedule_start_time');
				var hours = 0;
				var minutes = 0;
				logger.debug('startTime' + startTime);
				if (startTime) {
					var timeArr =  (startTime.match(/\d{1,2}:\d{1,2}/) || [''])[0].split(':');
					if (timeArr[0] == '12'){
						hours = startTime.indexOf('am') > -1 ? 0 : 12;
					} else {
						hours = timeArr[0] * 1 + (startTime.indexOf('pm') > -1 && 12);
					}
					minutes = timeArr[1] * 1;

				}
				var timeToClose = new Date(currentTime);
				timeToClose.setHours(hours);
				timeToClose.setMinutes(minutes);
				timeToClose.setSeconds(0);
				
				logger.debug('timeToClose ' + timeToClose + '<br>' + nlapiDateToString(timeToClose, 'datetimetz'));
				logger.debug('currentTime ' + currentTime + '<br>' + nlapiDateToString(currentTime, 'datetimetz'));
				
				var remainingTime = (timeToClose - currentTime)/ 3600000;
				logger.debug('remainingTime ' + remainingTime);
				if (remainingTime < 1) {
					return true; 
				}	
			}
			return false;
		});
		logger.debug('schedules' + JSON.stringify(schedules));
		return schedules; 
	}
	
	function getCurrencies(bankCurrency, subsidiary, fileFormat) {
		var currencies;
		var formatCurrenciesStr = fileFormat.currencies;
		var includeAllCurrencies =  fileFormat.includeAllCurrencies;
		if (multiCurrency) {
			var currencies = bankCurrency;
			var baseCurrency = '';
			if (subsidiary) {
				baseCurrency = nlapiLookupField('subsidiary', subsidiary, 'currency');	
			} else if (!oneWorld) {
				var config = _2663.getConfigurationObject();
				if (config && config.companyinformation && config.companyinformation.basecurrency) {
					baseCurrency = config.companyinformation.basecurrency + '';
				}
			}
			
			if (baseCurrency == bankCurrency && (includeAllCurrencies || formatCurrenciesStr)) {
				if (includeAllCurrencies) {
					currencies = getCurrencyIds([]);
				} else {
					var formatCurrencies = JSON.parse(formatCurrenciesStr);
					if (formatCurrencies && formatCurrencies.length > 0) {
						currencies = getCurrencyIds(formatCurrencies);
					}	
				}
			}
		}
		return currencies;
	}
	
	function getCurrencyIds(currencySymbols) {
		var filters = [];
	    if (currencySymbols && currencySymbols.length > 0) {
	        for (var i = 0; i < currencySymbols.length; i++) {
	            var currSymbolFilter = new nlobjSearchFilter('symbol', null, 'is', currencySymbols[i]);
	            if (currencySymbols.length > 1 && i < currencySymbols.length - 1) {
	                currSymbolFilter.setOr(true);
	            }
	            filters.push(currSymbolFilter);
	        }
	    }
	    var currencies = (nlapiSearchRecord('currency', null, filters) || []).map(function(res){
        	return res.getId();
        });
	    return currencies.length > 0 ? currencies : null;
	}
	
	function buildFilters(type, subsidiary, accountId, currency, fileFormatId) {
		var filterValuesObj = {
			'eft': {acctType: 'AcctPay', recTypes: ['ExpRept', 'Journal'], status: ['ExpRept:F', 'ExpRept:G', 'Journal:B'], creditRecTypes: ['VendPymt', 'VendCred']},
		    'dd': {acctType: 'AcctRec', recTypes:  ['CustInvc', 'Journal']}
		};
		
		if (isCommissionEnabled() || isEmployeeCommissionEnabled()) {
			filterValuesObj['eft'].recTypes.push('Commissn');
			filterValuesObj['eft'].status.push('Commissn:A');
		}
		
		var filters = [];
        
        //file format
        filters.push(new nlobjSearchFilter('custcol_2663_eft_file_format', null, 'is', fileFormatId));
        
        // subsidiary
        if (subsidiary) {
        	filters.push(new nlobjSearchFilter('subsidiary', null, 'is', subsidiary));
        }

        // do not get negative values (skip for credits)
        if (filterValuesObj[type].creditRecTypes){
            var filter;
            filter = new nlobjSearchFilter('creditamount', null, 'greaterthan', 0);
            filter.setLeftParens(1);
            filter.setOr(true);
            filters.push(filter);
            filter = new nlobjSearchFilter('type', null, 'anyof', filterValuesObj[type].creditRecTypes);
            filter.setRightParens(1);
            filters.push(filter);
        }
        else {
            filters.push(new nlobjSearchFilter('creditamount', null, 'greaterthan', 0));
        }
		
        // accounts of type accounts payable
        filters.push(new nlobjSearchFilter('accounttype', null, 'is', filterValuesObj[type].acctType));
        
        // ap account  
        filters.push(new nlobjSearchFilter('account', null, 'is', accountId));
        
        // only get values with amount remaining
        filters.push(new nlobjSearchFilter('amountremainingisabovezero', null, 'is', 'T'));
        
        // does not have reversal date
        filters.push(new nlobjSearchFilter('reversaldate', null, 'isempty', 'T'));
        
        // don't get memorized transactions
        filters.push(new nlobjSearchFilter('memorized', null, 'is', 'F'));
        
		if (filterValuesObj[type].creditRecTypes){
            // set payables..
            var payableRecFilter = new nlobjSearchFilter('type', null, 'anyof', filterValuesObj[type].recTypes);
            payableRecFilter.setLeftParens(3);
            if (filterValuesObj[type].status) {
                // ..with status..
                filters.push(payableRecFilter);
                var statusFilter = new nlobjSearchFilter('status', null, 'anyof', filterValuesObj[type].status);
                statusFilter.setRightParens(1);
                statusFilter.setOr(true);
                filters.push(statusFilter);
            }
            else {
                payableRecFilter.setRightParens(1);
                payableRecFilter.setOr(true);
                filters.push(payableRecFilter);
            }
			//if version 2015 or higher, filter out vendor bills with payment on hold status
		    var context = nlapiGetContext();       
			var paymentHoldFilter = new nlobjSearchFilter('status', null, 'is','VendBill:A');
			paymentHoldFilter.setLeftParens(1);
			filters.push(paymentHoldFilter);
			if(context.getVersion() != '2014.2'){
				paymentHoldFilter = new nlobjSearchFilter('paymenthold', null, 'is', 'F');
				filters.push(paymentHoldFilter);			
			}
			paymentHoldFilter = new nlobjSearchFilter('type', null, 'is', 'VendBill');			
            paymentHoldFilter.setRightParens(2);
            paymentHoldFilter.setOr(true);
            filters.push(paymentHoldFilter);
			
            // ..OR credits with amount remaining
            var creditRecFilter = new nlobjSearchFilter('type', null, 'anyof', filterValuesObj[type].creditRecTypes);
            creditRecFilter.setLeftParens(1);
            filters.push(creditRecFilter);
            var amtRemainFilter = new nlobjSearchFilter('amountremainingisabovezero', null, 'is', 'T');
            
            amtRemainFilter.setRightParens(2);
            filters.push(amtRemainFilter);
        }
        else {
            // set record type and status filters
            filters.push(new nlobjSearchFilter('type', null, 'anyof', filterValuesObj[type].recTypes));
            if (filterValuesObj[type].status) {
                filters.push(new nlobjSearchFilter('status', null, 'anyof', filterValuesObj[type].status));
            }
        }


        // currency (based on bank account)
        if (multiCurrency) {
            filters.push(new nlobjSearchFilter('currency', null, 'anyof', currency || '@NONE@'));
        }
        
        //add filters for handling batches
        var batchFilter = new nlobjSearchFilter('custrecord_2663_eft_file_id', 'custrecord_2663_parent_bill', 'anyof', '@NONE@');
        batchFilter.setLeftParens(1);
        batchFilter.setOr(true);
        var processingStatusFilter = new nlobjSearchFilter('custrecord_2663_eft_payment_processed', 'custrecord_2663_parent_bill', 'is', PAYPROCESSED);
        processingStatusFilter.setOr(true);
        var batchJournalFilter = new nlobjSearchFilter('type', null, 'is', 'Journal');
        batchJournalFilter.setRightParens(1);
        
        filters.push(batchFilter);
        filters.push(processingStatusFilter);
        filters.push(batchJournalFilter);	
        
        return filters;
    }
	
    function getTransactions(savedSearch, type, subsidiary, accountId, bankAccountId, currency, fileFormatId, notAll) {
    	logger.setTitle(logTitle + ':getTransactions');
    	var transactions = [];
    	var transactionSearch = new _2663.Search('transaction');
    	transactionSearch.setSavedSearch(savedSearch || 'customsearch_ep_ap_trans_search');
    	transactionSearch.addFilters(buildFilters(type, subsidiary, accountId, currency, fileFormatId));
    	transactionSearch.addColumn('line');
    	transactionSearch.addColumn('name');
    	transactionSearch.addColumn('type');
    	transactionSearch.addColumn('number');
    	transactionSearch.addColumn('amount');
    	transactionSearch.addColumn('amountremaining');
    	transactionSearch.addColumn('terms');
    	
    	if (multiCurrency) {
    		transactionSearch.addColumn('fxamount');
            transactionSearch.addColumn('fxamountremaining');
        } 
    	
		try {
            // at 2000 transactions, it is expected that the script will reschedule, so the rest of the transactions will be gathered afterwards
			transactions = notAll ? transactionSearch.getResults() : transactionSearch.getAllResults(governanceLimit,null,null,null,null,2000);
		} catch(ex) {
			logger.error('Error during transaction search', ex);
		}
		logger.debug('transactions.length: ' + transactions.length);
    	transactions = thisObj.removeInvalidTransactions(transactions, bankAccountId, accountId);
    	logger.debug('after removing invalid journals transactions.length: ' + transactions.length);
    	return transactions;
    }
    
    function removeInvalidTransactions(transactions, bankAccountId, accountId) {
    	var validTransactions = [];
    	var excludedTranKeys = thisObj.getExcludedTransactionKeys(bankAccountId, accountId);
    	if (excludedTranKeys && excludedTranKeys.length > 0) {
    		for (var i = 0, ii = transactions.length; i < ii; i++) {
    			var transaction = transactions[i];
    			if (transaction.getRecordType() == 'journalentry' || transaction.getValue('amount') != transaction.getValue('amountremaining')) {
    				var tranKey = [transaction.getId(), transaction.getValue('line')].join('-');
        			if (excludedTranKeys.indexOf(tranKey) < 0) {
        				validTransactions.push(transaction);
        			}	
    			} else {
    				validTransactions.push(transaction);
    			}
    		}
    	} else {
    		validTransactions = transactions;
    	}
    	return validTransactions;
    }
    
    function getExcludedTransactionKeys(bankAccountId, accountId) {
    	logger.setTitle(logTitle + ':getExcludedTransactionKeys');
    	logger.debug('start');
    	var excludedTranKeys = [];
    	var excludedJournalKeys = [];
    	var excludedPartiallyPaidKeys = [];
    	var batchSearch = new _2663.Search('customrecord_2663_file_admin');
    	batchSearch.addFilter('custrecord_2663_bank_account', null, 'is', bankAccountId);
    	batchSearch.addFilter('custrecord_2663_account', null, 'anyof', accountId);
    	batchSearch.addFilter('custrecord_2663_status', null, 'anyof', [BATCH_OPEN, BATCH_UPDATING, BATCH_PENDINGAPPROVAL]);
        batchSearch.addFilter('custrecord_2663_status', null, 'is', BATCH_SUBMITTED);
        batchSearch.addFilter('custrecord_2663_file_processed', null, 'anyof', [PAYMARKPAYMENTS, PAYPROCESSING, PAYQUEUED, REQUEUED]);
        batchSearch.setLeftParens(2, 1);
        batchSearch.setOr(2, true);
        batchSearch.setLeftParens(3, 1);
        batchSearch.setOr(3, false);
        batchSearch.setRightParens(4, 2);
        
	    batchSearch.addColumn('custrecord_2663_journal_keys');
	    batchSearch.addColumn('custrecord_2663_partially_paid_keys');
	    var results = batchSearch.getAllResults(governanceLimit);
	    for (var i = 0, ii = results.length; i < ii; i++) {
	    	var res = results[i];
	    	excludedJournalKeys = excludedJournalKeys.concat(JSON.parse(res.getValue('custrecord_2663_journal_keys') || '[]'));
	    	excludedPartiallyPaidKeys = excludedPartiallyPaidKeys.concat(JSON.parse(res.getValue('custrecord_2663_partially_paid_keys') || '[]'));
	    }
	    logger.debug('excludedJournalKeys: ' + JSON.stringify(excludedJournalKeys) + '<br>' + 'excludedPartiallyPaidKeys: ' + JSON.stringify(excludedPartiallyPaidKeys));
	    excludedTranKeys = excludedJournalKeys.concat(excludedPartiallyPaidKeys);
	    return excludedTranKeys;
    }
    
    function getTransactionSummary(transactionIds, summaryColumns, batchId) {
    	logger.setTitle(logTitle + ':getTransactionSummary');
    	logger.debug('transactionIds ' + JSON.stringify(transactionIds) + '<br>' + 'batchId:' + batchId);
    	if ((transactionIds && transactionIds.length > 0) || batchId) {
    		logger.debug('transactionIds ' + JSON.stringify(transactionIds) + '<br>' + 'batchId:' + batchId);
	    	var filters = [
	            new nlobjSearchFilter('mainline', null, 'is', 'T'),
	            new nlobjSearchFilter('creditamount', null, 'greaterthan', 0),
	            new nlobjSearchFilter('amountremainingisabovezero', null, 'is', 'T')
	        ];
	    	if (batchId) {
	    		filters.push(new nlobjSearchFilter('custrecord_2663_eft_file_id', 'custrecord_2663_transaction', 'is', batchId));
	    	} else {
	    		var batchSize = 300;
	            var numOfBatches = Math.ceil(transactionIds.length / batchSize);
	            for (var i = 0; i < numOfBatches; i++) {
	                var startIdx = i * batchSize;
	                var endIdx = (i + 1) * batchSize;
	                var transBatch = transactionIds.slice(startIdx, endIdx);
	                var filter = new nlobjSearchFilter('internalid', null, 'anyof', transBatch);
	                if (numOfBatches > 1) {
	                	if (i == 0) {
	                		filter.setLeftParens(1);
	                		filter.setOr(true);
	                	} else if (i == (numOfBatches - 1)) {
	                		filter.setRightParens(1);
	                	} else {
	                		filter.setOr(true);
	                	}
	                }
	                filters.push(filter);
	            }
	    	}
    		
            return (nlapiSearchRecord('transaction', null, filters, summaryColumns) || [])[0];
        }
    	return null;
    }
    
    this.getAccountingPeriods = getAccountingPeriods;
    this.getAccountingPeriod = getAccountingPeriod;
    this.getBankAccounts = getBankAccounts;
    this.getBatchDetails = getBatchDetails;
    this.getFileFormats = getFileFormats;
	this.getAccounts = getAccounts;
	this.getDueSchedules = getDueSchedules;
	this.getCurrencies = getCurrencies;
	this.getTransactions = getTransactions;
	this.getTransactionSummary = getTransactionSummary;
	this.getExcludedTransactionKeys = getExcludedTransactionKeys;
	this.removeInvalidTransactions = removeInvalidTransactions;
};