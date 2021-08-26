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
 * 2011/09/12  205257         1.11.2011.09.15.01      Restrict subsidiary view based on user's
 *                                                    permissions
 * 2011/09/19  203845         1.07.2011.08.18.02      Edit error codes
 * 2012/03/08  217041         GPM Beta - 1.19.2       Support edition control
 * 2012/05/01  220840         1.22                    Control payment processing through
 *                                                    multiple scheduled scripts
 *                                                    Control payment processing through queue management
 * 2012/05/22  222193         2.00.0.2012.05.24.3     Refactor code to perform queue management correctly
 * 2012/08/01  227867         2.01.1                  Refactor for payment portal functionality
 * 2012/08/03  227868         2.01.1                  Added BatchUpdater class from Batch Jumplet
 * 2012/08/13  227867         2.01.1                  Add support for customer refund 
 * 2012/08/23  227868         2.01.1                  Do not update the deferred batches when Process
 *                                                    Bills Automatically flag is false 
 * 2012/09/10  227868         2.01.1                  Add handling for summarized data
 * 2012/09/12  227868         2.01.1                  Handle removal of payment from array when not selected in batch
 * 2012/10/19  232116         2.01.1                  Check if format is valid for license before processing
 * 2012/10/25  233946         2.01.1                  Do not submit deferred batch if ap is not same
 *                                                    as auto ap setting     
 * 2012/11/03  232116         2.01                    Do not check if auto ap is undefined when submitting batch
 * 2012/11/23  237873         2.00.3                  Update setting of amount value, add exchange rate string
 *                                                    to PFA
 * 2013/03/04  244623         2.00                    Update to support Reversal and Notifications
 * 2013/06/17  254204 		  2.00.18				  Implement Enhanced Queue Management for all EP Processes
 * 2013/06/18  252784 		  2.00.18				  Update batch transaction info to include in deferred batch
 * 2013/07/10  256434 		  2.00.18				  Save user id on PFA record
 * 			   256237
 * 2013/08/29  250004   	  2.00.24				  Update parent deployment of PFA record
 * 2013/09/11  263037   	  2.01.00				  Get the parent deployment outside the one world check 
 * 2013/09/23  255091		  2.00.18				  Added setup of direct debit type
 *													  Allowed aggregation for payment type dd
 * 2013/09/19  263190 		  3.00.00				  Use _2663.Logger and update transaction information custom records during marking
 * 2013/10/05  265406 		  3.00.00				  Refactor code to use Payment File Administration record instead of Payment Batch
 * 2013/10/07  265426 		  3.00.0.2013.10.10.2	  Ignore mandatory fields when submitting Payment File Administration record
 * 2013/10/08  265426 		  3.00.0.2013.10.10.2	  Convert array variables linesToBeProcessedId and linesToBeProcessedAmt to string
 * 													  before saving values in PFA record
 * 2013/11/26                 3.00.00				  Retrieve and save a selected email template
 * 2013/11/26                 3.00.00				  Store values for email recipients, cc, and bcc
 * 2014/10/01  304354		  4.00.1.2014.09.23.2     Support for term or early settlement discount for Bill Payment Processing update
 */

var _2663;

if (!_2663)
    _2663 = {};

/**
 * Main function that points to processing based on parameters set
 * 
 * @param {Object} request
 * @param {Object} response
 */
function main(request, response) {
    (new _2663.PaymentSelectionProcessor).ProcessSelection(request);
}

/**
 * Class that handles synchronization of starting scheduled script
 */
_2663.PaymentSelectionProcessor = function() {
	var logTitle = '_2663.PaymentSelectionProcessor';
	var logger = new _2663.Logger(logTitle);
	var taskMgr = new _2663.PaymentTaskManager();
	/**
     * Function to create the payment file record and start scheduled script
     * 
     * @param {Object} request
     */
    function processSelection(request) {
    	logger.setTitle(logTitle + ':processSelection');
        var errorCode = '';
        var errorDetails = '';
        
        if (request && request.getParameter('custpage_2663_paymenttype')) {
        	var paymentType = request.getParameter('custpage_2663_paymenttype');
        	var pfaRecId = request.getParameter('custpage_2663_file_id');
        	if (paymentType == 'reversal') {
        		logger.debug('Start processing reversals..');
        		var rtnSchedule = startPaymentReversals(request);
        		if (VALID_SCHEDULE_STATUSES.indexOf(rtnSchedule) > -1) {
                    logger.debug('Schedule payment reversal processing. Redirecting to PFA record...');
                    nlapiSetRedirectURL('RECORD', 'customrecord_2663_file_admin', pfaRecId);
                }
        		else if (rtnSchedule == 'INPRIORITYQUEUE') {
                    logger.debug('Reversal request is queued in priority queue. Redirecting to PFA record...');
                    nlapiSetRedirectURL('RECORD', 'customrecord_2663_file_admin', pfaRecId);
                }
                else {
                    errorCode = 'EP_CANNOT_START_MAIN_PROC';
                    errorDetails = 'An error occurred while starting the main processing script. The schedule is : ' + rtnSchedule;
                }
        	}
        	else if (paymentType == 'notification') {
        		logger.debug('Start processing notifications..');
        		var rtnSchedule = startPaymentNotifications(request);
        		if (VALID_SCHEDULE_STATUSES.indexOf(rtnSchedule) > -1) {
                    logger.debug('Schedule payment notification processing. Redirecting to PFA record...');
                    nlapiSetRedirectURL('RECORD', 'customrecord_2663_file_admin', pfaRecId);
                }
        		else if (rtnSchedule == 'INPRIORITYQUEUE') {
                    logger.debug('Notification request is queued in priority queue. Redirecting to PFA record...');
                    nlapiSetRedirectURL('RECORD', 'customrecord_2663_file_admin', pfaRecId);
                }
                else {
                    errorCode = 'EP_CANNOT_MAIN_PROC';
                    errorDetails = 'An error occurred while starting the main processing script. The schedule is : ' + rtnSchedule;
                }
        	}
            // Checking if format is valid for license...
            else if (checkValidFileFormat(paymentType, request.getParameter('custpage_2663_format_display')) == true) {
                // process lines based on lines marked for processing
                logger.debug('Create PFA record...');
                pfaRecId = createPFARecordFromRequest(request);
                
                // if record entry has been created, start the scheduled script to queue processing
                if (pfaRecId && pfaRecId > 0) {
                    logger.debug('Start processing payments for: ' + pfaRecId);
                    var rtnSchedule = startPaymentProcessing(pfaRecId);
                    
                    if (VALID_SCHEDULE_STATUSES.indexOf(rtnSchedule) > -1) {
                        var action = rtnSchedule == 'QUEUED' ? 'Scheduled' : 'Queued';
                        logger.debug(action + ' payment processing. Redirecting to created record...');
                        nlapiSetRedirectURL('RECORD', 'customrecord_2663_file_admin', pfaRecId);
                    }
                    else if (rtnSchedule == 'INPRIORITYQUEUE') {
                        logger.debug('Payment request is queued in priority queue. Redirecting to created record...');
                        nlapiSetRedirectURL('RECORD', 'customrecord_2663_file_admin', pfaRecId);
                    }
                    else {
                        errorCode = 'EP_CANNOT_START_PAYMENT_PROC';
                        errorDetails = 'An error occurred while starting the payment processing script. The schedule is : ' + rtnSchedule;
                    }
                }
                else {
                    errorCode = 'EP_CANNOT_CREATE_PAYMENT_REC';
                    errorDetails = 'An error occurred while creating the payment file admin record.';
                }
            }
            else {
                errorCode = 'EP_FORMAT_CANNOT_BE_USED';
                errorDetails = 'The format cannot be used because the OneWorld license expired. Format: ' + request.getParameter('custpage_2663_format_display');
            }

        }
        else {
            errorCode = 'EP_INVALID_REQUEST';
            errorDetails = 'An error occurred while starting processing - invalid request.';
        }
        
        if (errorCode && errorDetails) {
            logger.error(errorDetails);
            throw nlapiCreateError(errorCode, errorDetails, true);
        }
    }
    
    /**
     * Create the PFA record from request
     * 
     * @param request
     * @returns
     */
    function createPFARecordFromRequest(request) {
    	logger.setTitle(logTitle + ':createPFARecordFromRequest');
        var nFileId = 0;
        // get the marked lines field from request
        if (request) {
        	var batchId = request.getParameter('custpage_2663_batchid');
        	
            // initialize lines to be processed
            var linesToBeProcessedId = [];
            var linesToBeProcessedAmt = [];
            var linesToBeProcessedDisc = [];
            
            // set the precision / round off options
            var precision = getCurrencyPrecision(request.getParameter('custpage_2663_bank_account'));
            
            // get the payment type
            var paymentType = request.getParameter('custpage_2663_paymenttype');
            
            if (request.getParameter('custpage_2663_sublist_numpages')) {
                // get the marked lines from the request
                var markedLines = getMarkedLines(request);
                
                // parse marked lines for id's and amounts
                for (var i in markedLines) {
                    for (var j in markedLines[i]) {
                        // use the original property to get the amount
                        var markedLineValue = JSON.parse(markedLines[i][j]);
                        var lineAmt;
                        var discAmt;
                        if (markedLineValue.hasOwnProperty('amount')) {
                            lineAmt = parseFloat(markedLineValue.amount);
                            discAmt = markedLineValue.custpage_discamount? parseFloat(markedLineValue.custpage_discamount) : nlapiFormatCurrency(0);
                        } else {
                            lineAmt = parseFloat(markedLineValue);
                        }
                        
                        // remove indicator for void payments (pp)
                        if (paymentType == 'pp') {
                            if (j.indexOf('-v') != -1) {
                                j = j.substring(0, j.indexOf('-v'));
                            }
                        }
                        
                        linesToBeProcessedId.push(j);
                        
                        // if multicurrency is on and the precision is not 2, round the value according to the currency setting
                        if (isMultiCurrency() && precision != 2) {
                            var decimals = Math.pow(10, precision);
                            lineAmt = Math.round(lineAmt * decimals) / decimals;
                            logger.debug('Changed line amount : ' + lineAmt);
                        }
                        
                        // append the line amount
                        linesToBeProcessedAmt.push(lineAmt);
                        linesToBeProcessedDisc.push(discAmt);
                    }
                }
            }

            // create Payment File Administration record if there are entries selected
            if (batchId || (linesToBeProcessedId && linesToBeProcessedId.length > 0)) {
                logger.debug('Lines to be processed id : ' + linesToBeProcessedId + '<br>' + 'Lines to be processed amount : ' + linesToBeProcessedAmt);
                nFileId = upsertPFARecord(request, JSON.stringify(linesToBeProcessedId), JSON.stringify(linesToBeProcessedAmt), JSON.stringify(linesToBeProcessedDisc));
                logger.debug('Payment file record entry created internal id : ' + nFileId);
            }
        }         
        return nFileId;
    }
    
    /**
     * Get the marked lines based on request
     * 
     * @param request
     * @returns {___anonymous8931_8932}
     */
    function getMarkedLines(request) {
        var markedLines = {};
        if (request && request.getParameter('custpage_2663_sublist_numpages') != null && !isNaN(request.getParameter('custpage_2663_sublist_numpages'))) {
            var totalPages = parseInt(request.getParameter('custpage_2663_sublist_numpages'), 10);
            for (var i = 1; i <= totalPages; i++) {
                var param = 'custpage_2663_sublist_markdata' + i;
                markedLines[param] = JSON.parse(request.getParameter(param));
            }
        }
        return markedLines;
    };

    /**
     * Performs currency precision check for currencies that do not have decimals
     * 
     * @param {Object} bankAccount
     */
    function getCurrencyPrecision(bankAccount) {
    	logger.setTitle(logTitle + ':getCurrencyPrecision');
        var precision = 2;
        if (isMultiCurrency() && bankAccount) {
            var currency = nlapiLookupField('customrecord_2663_bank_details', bankAccount, 'custrecord_2663_currency');
            // search for currency
            if (currency) {
                var filters = [];
                filters.push(new nlobjSearchFilter('internalid', null, 'anyof', currency));
                var searchResults = nlapiSearchRecord('currency', null, filters);
                if (searchResults) {
                    // load the record if it exists
                    var currRec = nlapiLoadRecord('currency', currency);
                    if (currRec) {
                        precision = currRec.getFieldValue('currencyprecision') == null ? 2 : currRec.getFieldValue('currencyprecision');
                    }
                }
            }
        }
        logger.debug('Precision : ' + precision);
        return precision;
    }
    
    /**
     * Creates the Payment File Administration record based on the form contents and selected lines
     * 
     * @param {Object} request
     * @param {Object} linesToBeProcessedId
     * @param {Object} linesToBeProcessedAmt
     */
    function upsertPFARecord(request, linesToBeProcessedId, linesToBeProcessedAmt, linesToBeProcessedDisc){
    	logger.setTitle(logTitle + ':createPFARecord');
        var res;

        if (request && linesToBeProcessedId && linesToBeProcessedAmt && linesToBeProcessedDisc) {
            // create a payment file custom record.
        	var batchId = request.getParameter('custpage_2663_batchid');
            var record = batchId ? nlapiLoadRecord('customrecord_2663_file_admin', batchId) : nlapiCreateRecord('customrecord_2663_file_admin', {recordmode: 'dynamic'});
            
            // state
            record.setFieldValue('custrecord_2663_file_processed', PAYQUEUED);
            
            // last process
            record.setFieldValue('custrecord_2663_last_process', EP_PROCESSPAYMENTS);
            
            
            if (!batchId) {
            	// bank account
                record.setFieldValue('custrecord_2663_bank_account', request.getParameter('custpage_2663_bank_account'));
                
                // process date
                if (request.getParameter('custpage_2663_process_date')) {
                    var dateWorkaround = nlapiDateToString(nlapiStringToDate(request.getParameter('custpage_2663_process_date')));
                    record.setFieldValue('custrecord_2663_process_date', dateWorkaround);
                }
                
                // posting period
                record.setFieldValue('custrecord_2663_posting_period', request.getParameter('custpage_2663_postingperiod'));

                // lines to be processed
                record.setFieldValue('custrecord_2663_payments_for_process_id', linesToBeProcessedId);
                record.setFieldValue('custrecord_2663_payments_for_process_amt', linesToBeProcessedAmt);
                record.setFieldValue('custrecord_2663_payments_for_process_dis', linesToBeProcessedDisc);
            }
            
            
            // priority
            record.setFieldValue('custrecord_ep_priority', 3);
            
            // timestamp
            record.setFieldValue('custrecord_2663_file_creation_timestamp', request.getParameter('custpage_2663_file_creation_timestamp'));
            
            // parent deployment
            var parentDeployment = (new _2663.PaymentDeploymentQueueManager()).GetParentDeployment(request.getParameter('custpage_2663_subsidiary'));
            if (parentDeployment) {
            	record.setFieldValue('custrecord_2663_parent_deployment', parentDeployment);
            }
            logger.debug('parentDeployment: ' + parentDeployment);
            
            // ---- payment-type specific fields - start ----
            var paymentType = request.getParameter('custpage_2663_paymenttype');
            
            // payment type id
            var paymentTypeIds = {
                'eft' : '1',
                'dd'  : '2',
                'pp'  : '3',
                'custref': '1'
            };
            var paymentTypeId = paymentTypeIds[paymentType];
            record.setFieldValue('custrecord_2663_payment_type', paymentTypeId);
                
            // account
            var account = '';
            if (paymentType == 'eft') {
                account = request.getParameter('custpage_2663_ap_account');
            }
            else if (paymentType == 'dd') {
                account = request.getParameter('custpage_2663_ar_account');
            }
            else if (paymentType == 'pp' || paymentType == 'custref') {
                account = nlapiLookupField('customrecord_2663_bank_details', request.getParameter('custpage_2663_bank_account'), 'custrecord_2663_gl_bank_account');
            }
            if (!batchId) {
            	record.setFieldValue('custrecord_2663_account', account);	
            }
            
            if (paymentType == 'eft' || paymentType == 'dd') {
                if (request.getParameter('custpage_2663_department')) {
                    record.setFieldValue('custrecord_2663_department', request.getParameter('custpage_2663_department'));
                }
                if (request.getParameter('custpage_2663_classification')) {
                    record.setFieldValue('custrecord_2663_class', request.getParameter('custpage_2663_classification'));
                }
                if (request.getParameter('custpage_2663_location')) {
                    record.setFieldValue('custrecord_2663_location', request.getParameter('custpage_2663_location'));
                }
                
                // batch id
                if (paymentType == 'eft' && batchId) {
                    record.setFieldValue('custrecord_2663_from_batch', 'T');
                    record.setFieldValue('custrecord_2663_status', BATCH_SUBMITTED);
                }
            }
            
            // reference note
            if (!batchId && (paymentType == 'eft' || paymentType == 'custref' || paymentType == 'dd')) {
                record.setFieldValue('custrecord_2663_ref_note', request.getParameter('custpage_2663_payment_ref'));
            }
            
            // direct debit type
            if (paymentType == 'dd') {
                record.setFieldValue('custrecord_2663_direct_debit_type', request.getParameter('custpage_2663_dd_type'));
            }
                
            // aggregation
            if (paymentType == 'eft' || paymentType == 'dd') {
            	var aggregateByPayee = request.getParameter('custpage_2663_aggregate') == 'T';
                if (!aggregateByPayee) {
                    // if unchecked, set to "@NONE@"
                    record.setFieldValue('custrecord_2663_agg_method', '@NONE@');
                } else {
                    record.setFieldValue('custrecord_2663_agg_method', request.getParameter('custpage_2663_agg_method'));
                }
            }
            
            // set the last check number for pp
            if (paymentType == 'pp') {
                record.setFieldValue('custrecord_2663_last_check_no', request.getParameter('custpage_2663_last_check_no'));
            }
            
            // set the exchange rate field if eft/dd and if multiple currencies are allowed for format
            if ((paymentType == 'eft' || paymentType == 'dd') && request.getParameter('custpage_2663_format_currency') && request.getParameter('custpage_2663_exchange_rates')) {
                record.setFieldValue('custrecord_2663_exchange_rates', request.getParameter('custpage_2663_exchange_rates'));
            }
            
            // ---- payment-type specific fields - end ----

            // submit the record, try 500 times to avoid collisions
            var max = 500; 
            var i = 0;
            // avoid collisions during multi-queue updates
            while (i < max) {
                i++;
                try {
                    res = nlapiSubmitRecord(record, true, true);
                    logger.debug('Payment Record Created - id: ' + res);
                    break;
                } catch (ex) {
                	logger.error('Error while submitting PFA record', ex);
                }
            }
        }
        
        return res;
    }
    
    /**
     * Function to create the payment file record and start scheduled script
     * 
     * @param {Object} paymentFileId
     */
    function startPaymentProcessing(paymentFileId) {
        var rtnSchedule;
        
        // if record entry has been created, start the scheduled processing 
        if (paymentFileId && paymentFileId > 0) {
            // schedule the processing
            rtnSchedule = taskMgr.StartPaymentProcessing(paymentFileId);
        }
        
        return rtnSchedule;
    }
    
    /**
     * Check if the format is valid
     * 
     * @param paymentType
     * @param format
     * @returns {Boolean}
     */
    function checkValidFileFormat(paymentType, format) {
    	logger.setTitle(logTitle + ':checkValidFileFormat');
        var result = false;
        if (paymentType && format) {
            var formatTypes = {
                'eft': 'EFT',
                'custref': 'EFT',
                'dd': 'DD',
                'pp': 'Positive Pay'
            };
            var formatType = formatTypes[paymentType];
            var validFormats = (new _2663.FormatRestrictor()).GetAllowedFormats(formatType);
            for (var i in validFormats) {
                if (format == i) {
                    result = true;
                    logger.debug('format is valid: ' + format);
                    break;
                }
            }
        }
        return result;
    }
    
    /**
     * Function to start Reversals scheduled script
     * 
     * @param {Object} request
     */
    function startPaymentReversals(request) {
    	logger.setTitle(logTitle + ':startPaymentReversals');
    	var rtnSchedule = '';
    	if (request) {
    		var pfaRecId = request.getParameter('custpage_2663_file_id');
    		if (pfaRecId && request.getParameter('custpage_2663_sublist_numpages')) {
    			var defReversalReason = request.getParameter('custpage_2663_reason') || '';
    			var reversalDate = request.getParameter('custpage_2663_process_date') || '';
    			var postingPeriod = request.getParameter('custpage_2663_postingperiod') || '';
    			var linesToBeProcessedIds = [];
    			var linesToBeProcessedIdStr = '';
    			var reversalReasonsObj = {'all': defReversalReason};
    			var reversalReasonsStr = '';
        		
        		// get the marked lines from the request
        		var markedLines = getMarkedLines(request);
        		for (var i in markedLines) {
        			var markedLine = markedLines[i];
        			var markeLineIds = Object.keys(markedLine);
        			
        			for (var j = 0, jj = markeLineIds.length; j < jj; j++) {
        				var markeLineId = markeLineIds[j];
        				var markedLineObj = JSON.parse(markedLine[markeLineId]);
        				if (markedLineObj['custpage_note']) {
        					reversalReasonsObj[markeLineId] =  markedLineObj['custpage_note'];	
        				}
        			}
        			
        			linesToBeProcessedIds = linesToBeProcessedIds.concat(markeLineIds);
        		}
        		
        		linesToBeProcessedIdStr = linesToBeProcessedIds.join('|'); 
        		reversalReasonsStr = JSON.stringify(reversalReasonsObj);
        		
        		var subsidiary = isOneWorld() ? nlapiLookupField('customrecord_2663_file_admin', pfaRecId, 'custrecord_2663_payment_subsidiary') : '';
        		var parentDeployment = (new _2663.PaymentDeploymentQueueManager()).GetParentDeployment(subsidiary) || '';
        		logger.debug('parentDeployment: ' + parentDeployment);

        		nlapiSubmitField('customrecord_2663_file_admin', pfaRecId, 
    				['custrecord_2663_file_processed', 'custrecord_2663_last_process', 'custrecord_ep_priority', 'custrecord_2663_payments_for_reversal', 'custrecord_2663_reversal_reasons', 'custrecord_2663_reversal_date', 'custrecord_2663_reversal_period', 'custrecord_2663_parent_deployment'], 
        			[PAYQUEUED, EP_REVERSEPAYMENTS, 3, linesToBeProcessedIdStr, reversalReasonsStr, reversalDate, postingPeriod, parentDeployment || '']
        		);
                    
        		// schedule the processing
                rtnSchedule = taskMgr.StartPaymentProcessing(pfaRecId);
    		}
    	}
        return rtnSchedule;
    }
    
    /**
     * Function to start Notifications scheduled script
     * 
     * @param {Object} request
     */
    function startPaymentNotifications(request) {
    	logger.setTitle(logTitle + ':startPaymentNotifications');
    	var rtnSchedule = '';
    	if (request) {
    		var pfaRecId = request.getParameter('custpage_2663_file_id');
    		if (pfaRecId && request.getParameter('custpage_2663_sublist_numpages')) {
                var emailTemplate = request.getParameter('custpage_2663_email_templates') || '';
    			var defNotificationMail = request.getParameter('custpage_2663_email_body_def') || '';
    			var emailSubject = request.getParameter('custpage_2663_subject');
    			var linesToBeProcessedIds = [];
    			var linesToBeProcessedIdStr = '';
    			var notificationMailsObj = {
                    'all': defNotificationMail,
                    'template': emailTemplate
                };
    			var notificationMailsStr = '';
    			var receiverEmails = {};
    			var receiverEmailsStr = '';
    			var ccEmails = {};
    			var ccEmailsStr = '';
    			var bccEmails = {};
    			var bccEmailsStr = '';
        		
        		// get the marked lines from the request
        		var markedLines = getMarkedLines(request);
        		for (var i in markedLines) {
        			var markedLine = markedLines[i];
        			var markeLineIds = Object.keys(markedLine);
        			
        			for (var j = 0, jj = markeLineIds.length; j < jj; j++) {
        				var markeLineId = markeLineIds[j];
        				var markedLineObj = JSON.parse(markedLine[markeLineId]);
        				if (markedLineObj['custpage_note']) {
        					notificationMailsObj[markeLineId] =  markedLineObj['custpage_note'].trim();
        				}
        				if (markedLineObj['custpage_email_notif']) {
        					receiverEmails[markeLineId] =  markedLineObj['custpage_email_notif'];
        				}
        				if (markedLineObj['custpage_email_cc']) {
        					ccEmails[markeLineId] =  markedLineObj['custpage_email_cc'];
        				}
        				if (markedLineObj['custpage_email_bcc']) {
        					bccEmails[markeLineId] =  markedLineObj['custpage_email_bcc'];
        				}
        			}
        			
        			linesToBeProcessedIds = linesToBeProcessedIds.concat(markeLineIds);
        		}
        		
        		linesToBeProcessedIdStr = linesToBeProcessedIds.join('|'); 
        		notificationMailsStr = JSON.stringify(notificationMailsObj);
        		receiverEmailsStr = JSON.stringify(receiverEmails);
        		ccEmailsStr = JSON.stringify(ccEmails);
        		bccEmailsStr = JSON.stringify(bccEmails);
        		
        		var subsidiary = isOneWorld() ? nlapiLookupField('customrecord_2663_file_admin', pfaRecId, 'custrecord_2663_payment_subsidiary') : '';
        		var parentDeployment = (new _2663.PaymentDeploymentQueueManager()).GetParentDeployment(subsidiary) || '';
        		logger.debug('parentDeployment: ' + parentDeployment);
        		
        		nlapiSubmitField('customrecord_2663_file_admin', pfaRecId, 
    				['custrecord_2663_file_processed', 'custrecord_2663_last_process', 'custrecord_ep_priority', 'custrecord_2663_payments_for_notify', 'custrecord_2663_notification_mails', 'custrecord_2663_notification_sender', 'custrecord_2663_parent_deployment', 'custrecord_2663_notification_subject', 'custrecord_2663_email_receivers', 'custrecord_2663_cc_receivers', 'custrecord_2663_bcc_receivers'], 
        			[PAYQUEUED, EP_EMAILNOTIFICATION, 3, linesToBeProcessedIdStr, notificationMailsStr, nlapiGetUser(), parentDeployment || '', emailSubject, receiverEmailsStr, ccEmailsStr, bccEmailsStr]
        		);
        		
        		// schedule the processing
                rtnSchedule = taskMgr.StartPaymentProcessing(pfaRecId);
    		}
    	}
        return rtnSchedule;
    }
    
    this.ProcessSelection = processSelection;
};