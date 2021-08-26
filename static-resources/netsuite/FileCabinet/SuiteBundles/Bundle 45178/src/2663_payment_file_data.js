/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * @author alaurito
 *
 * include list: 2663_lib.js
 *
 */

/**
 * Revision History:
 *
 * Date        Fixed Issue    Broken in QA Bundle     Issue Fix Summary
 * =============================================================================================
 * 2011/05/20  198198         1.00.2011.05.20.04      Add filter for empty Reversal Date
 * 2011/06/01  191993         1.00.2011.05.27.01      Add function to get customer payments (GIRO)
 *                                                    Modify bank detail source to include
 *                                                    payment type parameter
 * 2011/06/16  199670         1.01.2011.06.17.01      Modify getFileListDescendingOrder for
 *                                                    test script error
 * 2011/06/21  199847         1.01.2011.06.24.01      Filter for inactive entities when getting
 *                                                    entity bank details
 * 2011/06/24  200164         1.01.2011.06.24.02      Perform filtering of blank entities for
 *                                                    journal entries during manual join
 *                                                    instead of as filter in nlapiSearchRecord
 * 2011/07/26  201836         1.04.2011.07.15.01      Add "tranprefix" field when retrieving
 *                                                    columns for Payment File Admin and Company
 *                                                    Bank Detail records
 * 2011/08/09  203186         1.06.2011.07.29.02      Correct access for array items
 * 2011/08/12  203530         1.07.2011.08.11.01      Fix for 1000 record limit
 * 2011/08/17  203853         1.07.2011.08.18.02      Parallel runs for payment scheduled script
 * 2011/08/18  203913         1.07.2011.08.18.02      France CFONB support (add new fields used
 *                                                    in the format)
 * 2011/09/05  204716         1.09                    Retrieve Aggregation Method for the payment
 *                                                    file info source
 * 2011/09/09  205171         1.11.2011.09.15.01      CIRI-FBF Processing
 * 2011/09/16  205520         1.12.2011.09.15.02      CBI Payments Processing
 * 2011/09/21  205906         1.14.2011.09.22.2       Update id of Country Check fields                                                     
 * 2011/09/22  205944         1.12                    Remove reference to field custrecord_2663_sender_code                                                     
 * 2011/09/28  206319         1.15.2011.09.29.2       Include expense reports with status: 
 *                                                    Approved (Overridden) by Accounting
 *                                                    in search results
 * 2011/10/13  207330         1.15.2011.09.29.2       Change taxidnum to vatregnumber for Entities
 * 2011/10/19  207693         1.15.2011.10.20.1       Added new fields Tax Province, Tax Authorization
 *                                                    Number and Tax Authorization Date 
 * 2011/10/20  207800         1.15.2011.10.20.1       Added Subsidiary legalname and state to Bank Details
 * 													  Added companyname to Entity (Customer) details
 * 2011/10/26  207955         1.15.2011.10.20.1       Added logic to retrieve details from bills/invoices paid	
 * 2011/10/27  208503         1.15.2011.10.27.4       Add US Market Requirements - AP (ACH - CCD/PPD)
 * 2011/11/04  208589         1.15.2011.11.10.2       Retrieve timestamp field for file info object                                                    
 * 2011/12/06  210602         1.17.2011.12.08.2       Add US Market Requirements - AP (ACH - CTX (Free Text))
 * 2011/12/15  211122         1.17.2011.12.15.2       Use foreign currency amount field for paid bills/invoice
 *                                                    when Multiple Currencies setting is on
 * 2011/12/15  210982         1.17.2011.12.08.3       Remove unused functions
 * 2012/01/31  213961         1.19.2012.01.12.1       Rollback Positive Pay code
 * 2012/02/02  212974         1.19.2012.01.19.1       Support for Positive Pay file option
 * 2012/02/24  215992         1.14                    Call SetupEntityDetailList with format and entity values
 *                                                    to return less records
 * 2012/03/13  216909         1.19.2.2012.03.01.2     Update anyof filters to search for every 500 id's
 * 2012/03/30  218911         1.20                    Add columns for new template variables for Groupon
 * 2012/04/13  219655         1.21					  Add columns for new template varaibles for DD format
 * 2012/04/23  220361         1.21                    Add new fields for Company/Entity Bank details
 * 2012/04/23  220546         1.21.1                  Get country codes for Company Bank/Entity Detail country fields
 * 2012/05/01  220840         1.22                    Add payment queue field to PFA record search results
 * 2012/05/11  221286         1.22.1                  Incorrect number of batches used in search for entity details
 * 2012/05/23  222290         1.22.1                  Entity details list (Employee) is not updated during batch processing
 * 2012/07/03  217328         1.20.1       			  Add column custrecord_2663_statement_name
 * 2012/07/17  225904         1.22.3       			  Add columns custrecord_2663_bban and custrecord_2663_entity_bban
 * 2012/08/14  227868         2.01.1                  Add columns custrecord_2663_payments_for_reversal and custrecord_2663_batch_id
 * 2012/08/16  227867         2.01.1                  Add support for customer refund 
 * 2012/09/07  230558		  1.22.3       			  Add columns for BIC field on Bank and Entity details
 * 2012/11/13  235426         2.00.3                  Remove getLastVendorCount function
 * 2012/11/16  230597         2.00.2       			  Check entityType before setting entityDetailList value
 * 2012/11/26  237873         2.00.3                  Get the exchange rate field from the PFA record
 * 2012/12/13  237873         2.00.3                  Add formulacurrency column to compute for amount in bank currency
 * 2013/01/07  238088         2.00.5                  Add sorting of payments/customer refunds by memo
 * 2013/01/07  238104		  2.00.5				  Add billcountry column to retrieve name of country
 * 2013/01/17  240389		  2.00.7				  Replace check with transaction on the searchRecord call in function getChecks
 * 2013/01/23  241041		  2.00.7				  Add otherrefnum column in function getChecks
 * 2012/03/01  244881 		  2.00.10	  			  Add column custrecord_2663_print_company_name for ANZ EFT
 * 2013/03/04  244623         2.00                    Add columns custrecord_2663_payments_for_notify, custrecord_2663_reversal_date,
 * 													  custrecord_2663_reversal_period, custrecord_2663_reversal_reasons and
 * 													  custrecord_2663_notification_mails	
 * 2013/03/07  235824  		  2.00.3				  Added custrecord_2663_pad_blocks column to support 999 block padding for ACH formats
 * 2013/03/12  239628 		  2.00.6				  Added custrecord_2663_entity_bank_acct_type to support entity bank account type
 * 2013/03/14  226700         1.22.5                  Added custrecord_2663_bank_acct_type to support company bank bank account type
 * 2013/03/19  235824  		  2.00.3				  Retrieve block padding information from format details.
 * 2013/04/26  246816  		  2.00.13				  Add all custom fields from Entity Bank Details as search columns
 * 2013/04/17  235777		  2.00.2				  Add method to count customer payments for Direct Debit formats
 * 2013/05/03  241324		  2.00.7				  Add accountnumber as a field for the entity	
 * 2013/05/20  244071		  2.00.10				  Add duedate field for transactions
 * 2013/06/17  254204 		  2.00.18				  Add last process and reprocess flag columns
 * 2013/07/15  245723		  2.00.10				  Add support for commission transactions
 * 2013/07/23  205093		  2.00.2				  Added synonym for Entity printoncheckas
 * 2013/08/01  242348 		  2.00.8				  Add column for custrecord_2663_bank_suffix
 * 2013/08/15  260403  		  2.00.22				  Add checking on function getReferenceFieldValue
 * 2013/08/29  261772 		  2.00.25.2013.08.29.3	  Added checking for employee commission feature
 * 2013/09/03  262132     	  2.00.25				  Log error only when applied to transaction does not exist
 * 2013/09/23  255091		  2.00.18				  Added method for getting entity text details
 *													  Added data source fields for direct debit types, and updated entities
 * 2013/09/24  263190		  3.00.00				  Add column custrecord_2663_batchid
 * 2013/10/05  265406 		  3.00.00				  Refactor code to use Payment File Administration record instead of Payment Batch
 * 2013/12/18  261618 		  3.01.1     			  Add column custrecord_2663_file_name_prefix 
 * 2014/01/28  277164  		  3.01.1.2014.01.28.2     Edited SEPA Belgium, CBI, Ireland, Luxembourg and France's blank values to apostrophes
 * 2014/01/29  275409 		  3.01.1.2014.01.28.1     Add column custbody_2663_reference_num
 * 2014/03/26  277678  		  3.01.1                  Include subsidiary currency in bank details source
 * 2014/04/21  284430  		  3.01.2                  Filter out currency revaluation transactions (auto created by NS if different exchange rates)
 * 2014/05/05  288775  		                          Add support for free marker template engine
 * 2014/05/19  273487         3.00.3       			  Add check for batch process
 * 2014/05/26  291326         3.02.4       			  Add method for getting currencies
 * 2014/05/26  291467  		  3.02.4                  Add function to create FreeMarker function that gets country code 
 * 2014/05/30  292176	      3.02.4                  Add function to create FreeMarker function that gets amount from a payment
 *                                                    Add function to create FreeMarker function that computes total amount from payments
 * 05/30/2014  292330         3.02.4         		  Return absolute value in FreeMarker function getAmount                                                   
 * 2014/06/03  292374         3.02.4                  Add entity columns for vatregnumber and socialsecuritynumber
 * 2014/06/16  293181         3.02.4                  Add function to create FreeMarker function that gets state code
 * 2014/07/03  296609  		  3.02.5                  Consider multi-currency formats in functions getAmount and computeTotalAmount for freemarker templates
 * 													  Remove summary columns in method getPaymentFileSummaryResults
 * 2014/07/09  297258 297342  3.02.5                  Consider single currency account in functions getAmount and computeTotalAmount for freemarker templates
 * 2014/07/15  298109								  Edited naming of amount variable in getAmountFunc 
 * 2014/07/24  299510         4.00.2                  Use prefix "_2663_" to resolve namespace issue in variables of the Advanced Template library
 * 2014/08/04  300769         4.00.2                  Restore original filters for getEntityBankDetails
 * 2014/09/22  304340         4.00.3                  Add function to exclude credits in reprocess
 * 2014/10/01  304354		  4.00.1.2014.09.23.2     Support for term or early settlement discount for Bill Payment Processing update
 * 2014/10/09  312331		  4.00.3                  Add field to store applied credit transactions. Add function to exclude applied credits.
 * 2014/10/17  311015 		  4.00.4				  Add field to store amounts of applied credit transactions
 * 2014/10/22  314000  		  4.00.4				  Include setter methods for credit IDs and credit amounts
 */

var _2663;

if (!_2663)
    _2663 = {};


/**
 * 1) Provides payment file data from payment file/bank/vendor bill and payment search results.
 * 2) Functions for converted saved searches
 */
_2663.PaymentFileDataSrc = function(){
    // data sources - load only when needed
    this.paymentFileInfoSrc = null;
    this.bankDetailSrc = null;
    this.paymentIdList = null;
    this.paymentAmtList = null;
    this.paymentDiscList = null;
    this.appliedCreditsList = null;
    this.appliedCreditsAmtList = null;
    this.entityDetailList = null;
    this.appliedToTransactionList = null;

	/**
     * Load payment file info record from given id
     */
    function setupPaymentFileInfoSrc(paymentRecordId){
        var result = true;

        if (!this.paymentFileInfoSrc) {
            if (paymentRecordId) {
                var filters = [];
                var columns = [];

                filters.push(new nlobjSearchFilter('internalid', null, 'anyof', paymentRecordId));

                columns.push(new nlobjSearchColumn('internalid'));
                columns.push(new nlobjSearchColumn('name'));
                columns.push(new nlobjSearchColumn('custrecord_2663_payment_type'));
                columns.push(new nlobjSearchColumn('custrecord_2663_bank_account'));
                columns.push(new nlobjSearchColumn('custrecord_2663_ref_note'));
                columns.push(new nlobjSearchColumn('custrecord_2663_file_processed'));
                columns.push(new nlobjSearchColumn('custrecord_2663_payments_for_process_id'));
                columns.push(new nlobjSearchColumn('custrecord_2663_payments_for_process_amt'));
                columns.push(new nlobjSearchColumn('custrecord_2663_payments_for_process_dis'));
                columns.push(new nlobjSearchColumn('custrecord_2663_applied_credits'));
                columns.push(new nlobjSearchColumn('custrecord_2663_process_date'));
                columns.push(new nlobjSearchColumn('custrecord_2663_file_ref'));
                columns.push(new nlobjSearchColumn('custrecord_2663_posting_period'));
                columns.push(new nlobjSearchColumn('custrecord_2663_account'));
                columns.push(new nlobjSearchColumn('type', 'custrecord_2663_account'));
                columns.push(new nlobjSearchColumn('custrecord_2663_department'));
                columns.push(new nlobjSearchColumn('custrecord_2663_class'));
                columns.push(new nlobjSearchColumn('custrecord_2663_location'));
                columns.push(new nlobjSearchColumn('custrecord_2663_agg_method'));
                columns.push(new nlobjSearchColumn('tranprefix', 'custrecord_2663_location')); // add to get the bank location's transaction prefix
                columns.push(new nlobjSearchColumn('custrecord_2663_file_creation_timestamp'));
                columns.push(new nlobjSearchColumn('custrecord_ep_payment_creation_queue'));
                columns.push(new nlobjSearchColumn('custrecord_2663_exchange_rates'));
                columns.push(new nlobjSearchColumn('custrecord_2663_reprocess_flag'));
                columns.push(new nlobjSearchColumn('custrecord_2663_last_process'));
                columns.push(new nlobjSearchColumn('custrecord_2663_direct_debit_type'));
                columns.push(new nlobjSearchColumn('custrecord_2663_updated_entities'));
                columns.push(new nlobjSearchColumn('custrecord_2663_from_batch'));
				if(isOneWorld()){
					columns.push(new nlobjSearchColumn('custrecord_2663_payment_subsidiary'));                
				}
                var searchResults = nlapiSearchRecord('customrecord_2663_file_admin', null, filters, columns);                

                // Ensure that there are payments.
                if (searchResults != null) {
                    // Get a line of search results.
                    this.paymentFileInfoSrc = searchResults[0];
                    var lastProcess = this.paymentFileInfoSrc.getValue('custrecord_2663_last_process');
                    
                    if ([EP_CREATEBATCH, EP_CLOSEBATCH].indexOf(this.paymentFileInfoSrc.getValue('custrecord_2663_last_process')) < 0) {
                    	// Get the file record and retrieve the required fields. This overcomes the saved search 4000 limit on long fields.
                        var record = nlapiLoadRecord('customrecord_2663_file_admin', paymentRecordId);
                        var strTransactionKeys = record.getFieldValue('custrecord_2663_payments_for_process_id');
                        var strTransactionAmounts = record.getFieldValue('custrecord_2663_payments_for_process_amt');
                        var strTransactionDiscounts = record.getFieldValue('custrecord_2663_payments_for_process_dis');
                        var strAppliedCredits = record.getFieldValue('custrecord_2663_applied_credits');
                        var strAppliedCreditsAmt = record.getFieldValue('custrecord_2663_applied_credits_amt');
                        if (strTransactionKeys.indexOf('[') > -1) {
                        	this.paymentIdList = strTransactionKeys ? JSON.parse(strTransactionKeys) : '';
                            this.paymentAmtList = strTransactionAmounts ? JSON.parse(strTransactionAmounts) : '';
                            this.paymentDiscList = strTransactionDiscounts ? JSON.parse(strTransactionDiscounts) : '';
                        } else {
                        	// Split the long text field to return a list of payments id's and a list of corresponding amounts.
                            this.paymentIdList = strTransactionKeys ? strTransactionKeys.split('|') : '';
                            this.paymentAmtList = strTransactionAmounts ? strTransactionAmounts.split('|') : '';	
                        }
                        
                        // get applied credits
                        this.appliedCreditsList = strAppliedCredits ? JSON.parse(strAppliedCredits) : '';
                        this.appliedCreditsAmtList = strAppliedCreditsAmt ? JSON.parse(strAppliedCreditsAmt) : '';

                        // check that a payment list was returned.
                        if (this.paymentIdList.length == this.paymentAmtList.length) {
                            nlapiLogExecution('debug', 'Payment Module Processing', 'Payments to be processed : ' + this.paymentIdList.length);
                        }
                        else {
                            result = false;
                            nlapiLogExecution('debug', 'Payment Module Processing', 'Invalid payment setup. Number of selected transactions : ' + this.paymentIdList.length + '. Number of payments input : ' + this.paymentAmtList.length);
                        }
                    }
                }
            }
        }
        return result;
    }

    /**
     * Get payment file info record
     */
    function getPaymentFileInfoSrc(){
        if (!this.paymentFileInfoSrc) {
            this.SetupPaymentFileInfoSrc();
        }

        return this.paymentFileInfoSrc;
    }

    /**
     * Get payment id list
     */
    function getPaymentIdList(){
        if (!this.paymentFileInfoSrc) {
            setupPaymentFileInfoSrc();
        }

        return this.paymentIdList;
    }

    /**
     * Get payment amt list
     */
    function getPaymentAmtList(){
        if (!this.paymentFileInfoSrc) {
            setupPaymentFileInfoSrc();
        }

        return this.paymentAmtList;
    }

    /**
     * Get payment disc list
     */
    function getPaymentDiscList(){
        if (!this.paymentFileInfoSrc) {
            setupPaymentFileInfoSrc();
        }

        return this.paymentDiscList;
    }
    
    /**
     * Get applied credits list
     */
    function getAppliedCreditsList(){
        if (!this.paymentFileInfoSrc) {
            setupPaymentFileInfoSrc();
        }

        return this.appliedCreditsList;
    }
    
    /**
     * Set applied credit list
     */
    function setAppliedCreditsList(list){
        if (!this.paymentFileInfoSrc) {
            setupPaymentFileInfoSrc();
        }
        nlapiSubmitField('customrecord_2663_file_admin', this.paymentFileInfoSrc.id, 'custrecord_2663_applied_credits',JSON.stringify(list));
        this.appliedCreditsList = list;
    }

    /**
     * Get applied credit amount list
     */    
    function getAppliedCreditsAmtList(){
        if (!this.paymentFileInfoSrc) {
            setupPaymentFileInfoSrc();
        }
        
        return this.appliedCreditsAmtList;
    }
    
    /**
     * Set applied credit amount list
     */
    function setAppliedCreditsAmtList(list){
        if (!this.paymentFileInfoSrc) {
            setupPaymentFileInfoSrc();
        }
        nlapiSubmitField('customrecord_2663_file_admin', this.paymentFileInfoSrc.id, 'custrecord_2663_applied_credits_amt',JSON.stringify(list));
        this.appliedCreditsAmtList = list;
    }    
    
    /**
     * Get the bank detail source
     */
    function getBankDetailSrc(paymentType){
        if (!this.paymentFileInfoSrc) {
            setupPaymentFileInfoSrc();
        }
        if (!this.bankDetailSrc) {
            nlapiLogExecution('debug', 'Payment Module Processing', 'Bank internal id: ' + this.paymentFileInfoSrc.getValue('custrecord_2663_bank_account'));
            // Get the Account Bank details and assign them to the BankDetailSrc
            var searchResults = getBankDetails(this.paymentFileInfoSrc.getValue('custrecord_2663_bank_account'), paymentType);
            this.bankDetailSrc = searchResults[0];
        }

        return this.bankDetailSrc;
    }

	/**
	 * Gets file record with payments for reversal
	 */
	function getPaymentReversalRecord() {
        var filters = [];
		var result;
	    filters.push(new nlobjSearchFilter('custrecord_2663_file_processed', null, 'anyof', PAYREVERSAL));

		var searchResults = getUnprocessedFileList(filters);

		if (searchResults) {
			result = searchResults[0];
		}

		return result;
	}

    /**
     * Gets file record with payments for notification
     */
    function getPaymentNotifyRecord() {
        var filters = [];
        var result;
        filters.push(new nlobjSearchFilter('custrecord_2663_file_processed', null, 'anyof', PAYNOTIFICATION));

        var searchResults = getUnprocessedFileList(filters);

        if (searchResults) {
            result = searchResults[0];
        }

        return result;
    }

    /**
     * Gets file record with payments for reprocess
     */
    function getPaymentReprocessRecord() {
        var filters = [];
        var result;
        filters.push(new nlobjSearchFilter('custrecord_2663_file_processed', null, 'anyof', PAYCANCELLED));

        var searchResults = getUnprocessedFileList(filters);

        if (searchResults) {
            result = searchResults[0];
        }

        return result;
    }

    /**
     * Gets file record with file for deletion
     */
    function getDeleteFileRecord() {
        var filters = [];
        var result;
        filters.push(new nlobjSearchFilter('custrecord_2663_file_processed', null, 'anyof', PAYDELETINGFILE));

        var searchResults = getUnprocessedFileList(filters);

        if (searchResults) {
            result = searchResults[0];
        }

        return result;
    }

    /**
     * Add entries to entity detail list
     */
    function setupEntityDetailList(templateType, formatId, entityArr, paymentFilter){
		templateType = templateType == null ? 'eft' : templateType;
        nlapiLogExecution('debug', '[ep] PaymentFileDataSrc:setupEntityDetailList', 'Template type: ' + templateType);
        nlapiLogExecution('debug', '[ep] PaymentFileDataSrc:setupEntityDetailList', 'Payment filter: ' + paymentFilter);
        
        var entityType = '';
        var accountType = this.GetPaymentFileInfoSrc().getValue('type', 'custrecord_2663_account');
        if (paymentFilter) {
            if (paymentFilter == 'entity') {
                if (accountType == 'Bank') {
                    entityType = 'customer';
                }
                else {
                    entityType = 'vendor';
                }
            }
            else {
                entityType = 'employee';
            }
        }
        nlapiLogExecution('debug', '[ep] PaymentFileDataSrc:setupEntityDetailList', 'entityType: ' + entityType);
        nlapiLogExecution('debug', '[ep] PaymentFileDataSrc:setupEntityDetailList', 'this.entityDetailList: ' + JSON.stringify(this.entityDetailList));
        
        if ((!this.entityDetailList || (paymentFilter && !this.entityDetailList[entityType])) && entityArr && entityArr.length > 0) {
        	this.entityDetailList = this.entityDetailList || {};
        	if (paymentFilter) {
        		this.entityDetailList[entityType] = {};
        	} 
        	else {
        		if (templateType == 'eft') {
        		    if (accountType == 'Bank') {
                        this.entityDetailList['customer'] = {};
        		    }
        		    else {
                        this.entityDetailList['vendor'] = {};
                        this.entityDetailList['employee'] = {};
        		    }
                }
                else if (templateType == 'dd') {
                    this.entityDetailList['customer'] = {};
                }
        	}
            
            // perform search by batch of 500 entity id's
            var maxNumInBatch = 500;
            var numBatches = Math.ceil(entityArr.length / maxNumInBatch);
            nlapiLogExecution('debug', '[ep] PaymentFileDataSrc:setupEntityDetailList', 'Number of entities: ' + entityArr.length);
            nlapiLogExecution('debug', '[ep] PaymentFileDataSrc:setupEntityDetailList', 'Number of batches of ' + maxNumInBatch + ': ' + numBatches);
            for (var j = 0; j < numBatches; j++) {
                var startIdx = j * maxNumInBatch;
                var endIdx = (j + 1) * maxNumInBatch;
                endIdx = endIdx > entityArr.length ? entityArr.length : endIdx;
                var entityIdsBatch = entityArr.slice(startIdx, endIdx);

    			if (templateType == 'eft') {
    				var entityDetailResults;
    				if (accountType == 'Bank') {
                        nlapiLogExecution('debug', '[ep] PaymentFileDataSrc:setupEntityDetailList', 'Calling getCustomerRefundBankDetails...');
    				    entityDetailResults = getCustomerRefundBankDetails(formatId, entityIdsBatch);
    				}
    				else {
                        nlapiLogExecution('debug', '[ep] PaymentFileDataSrc:setupEntityDetailList', 'Calling getEntityBankDetails...');
    				    entityDetailResults = getEntityBankDetails(formatId, entityIdsBatch);
    				}
    				if (entityDetailResults) {
                        nlapiLogExecution('debug', '[ep] PaymentFileDataSrc:setupEntityDetailList', 'Number of eft entities: ' + entityDetailResults.length);
    					for (var i = 0; i < entityDetailResults.length; i++) {
    						var entityDetail = entityDetailResults[i];
    
    	                    if (accountType == 'Bank') {
                                var customerId = entityDetail.getValue('custrecord_2663_parent_cust_ref');
                                this.entityDetailList['customer'][customerId] = entityDetail;
    	                    }
    	                    else {
        						var vendorId = entityDetail.getValue('custrecord_2663_parent_vendor');
        						var employeeId = entityDetail.getValue('custrecord_2663_parent_employee');
        						if (vendorId || employeeId) {
        							if (entityType) {
            							this.entityDetailList[entityType][entityType == 'vendor' ? vendorId : employeeId] = entityDetail;
            						} else {
            							if (vendorId) {
                							this.entityDetailList['vendor'][vendorId] = entityDetail;
                						}
                						else if (employeeId) {
            								this.entityDetailList['employee'][employeeId] = entityDetail;
            							}        							
            						}        							
        						}
    	                    }
    					}
    				}
    			}
    			else if (templateType == 'dd') {
                    nlapiLogExecution('debug', '[ep] PaymentFileDataSrc:setupEntityDetailList', 'Calling getCustomerBankDetails...');
    				var entityDetailResults = getCustomerBankDetails(formatId, entityIdsBatch);
                    if (entityDetailResults) {
                        nlapiLogExecution('debug', '[ep] PaymentFileDataSrc:setupEntityDetailList', 'Number of dd entities: ' + entityDetailResults.length);
                        for (var i = 0; i < entityDetailResults.length; i++) {
                            var entityDetail = entityDetailResults[i];
                            var customerId = entityDetail.getValue('custrecord_2663_parent_customer');
                            this.entityDetailList['customer'][customerId] = entityDetail;
                        }
                    }
    			}
            }
        }
    }

    /**
     * Get the entity detail from internal data structure based on record type, internal id, and field name
     *
     * @param {Object} bodyRecord
     * @param {Object} fieldName
     * @param {Object} templateType
     */
    function getEntityFieldValueV2(bodyRecord, fieldName, templateType){
        var entityFieldValue = '';
        
        if (bodyRecord && fieldName && templateType) {
            // get the entity type by checking which of the 3 entity columns has a value
            var entityType;
            var vendorEntityCol = new nlobjSearchColumn('internalid', 'vendor');
            var employeeEntityCol = new nlobjSearchColumn('internalid', 'employee');
            var customerEntityCol = new nlobjSearchColumn('internalid', 'customer');
            var partnerEntityCol = new nlobjSearchColumn('internalid', 'partner');
            
            if (bodyRecord.getValue(vendorEntityCol)) {
                entityType = 'vendor';
            }
            else if (bodyRecord.getValue(employeeEntityCol)) {
                entityType = 'employee';
            }
            else if (bodyRecord.getValue(customerEntityCol)) {
                entityType = 'customer';
            }
            else if (bodyRecord.getValue(partnerEntityCol)) {
                entityType = 'partner';
            }
            
            // perform value assignment only when entity column is found
            if (entityType) {
                // get the entityId
                var entityId = bodyRecord.getValue('internalid', entityType);
                
                // declare searchResultObj and join to be used as basis for field values
                var searchResultObj;
                var join;
                // for eft and dd, use the results from the entityDetailList object
                if (templateType == 'eft' || templateType == 'dd') {
                    if (this.entityDetailList[entityType]) {
                        searchResultObj = this.entityDetailList[entityType][entityId];
                        var joinEntityType = entityType;
                        if (this.GetPaymentFileInfoSrc().getValue('type', 'custrecord_2663_account') == 'Bank') {
                            joinEntityType = 'cust_ref';
                        }
                        join = 'custrecord_2663_parent_' + joinEntityType;
                    }
                }
                // for positive pay, use the bodyRecord and entityType
                else if (templateType == 'pp') {
                    searchResultObj = bodyRecord;
                    join = entityType;
                }
                
                // assign a value only when searchResultObj and the join column are set
                if (searchResultObj && join) {
                    var entityRefFields = ['address1', 'address2', 'address3', 'city', 'zipcode', 'state', 'vatregnumber', 'shipaddress1', 'shipaddress2',
                                           'billcountrycode', 'billcountry', 'accountnumber', 'printoncheckas', 'billaddress1', 'billaddress2', 'billcity', 'billstate'];
                    if (fieldName === 'entityid') {
                        entityFieldValue = entityId;
                    }
                    else if (fieldName == 'entityidtext') {
                        entityFieldValue = bodyRecord.getText('entity');
                    }
                    else if (fieldName == 'entityname' || (fieldName == 'printoncheckas' && entityType != 'vendor')) {
                        entityFieldValue = buildEntityName(searchResultObj, join);
                    } else if (fieldName == 'billcountry') {
                    	entityFieldValue = searchResultObj.getText(fieldName, join) || '';
                    }
                    else if (entityRefFields.indexOf(fieldName) != -1) {
                        if (fieldName == 'vatregnumber' && entityType == 'employee') {
                        	fieldName = 'socialsecuritynumber';
                        } 
                        
                        // apply reference fields only for eft and dd template type
                        if (templateType == 'eft' || templateType == 'dd') {
                            entityFieldValue = searchResultObj.getValue(fieldName, join) || '';
                        }
                        
                        //if printoncheckas is blank, default to entity name
                        if (fieldName == 'printoncheckas' && (entityFieldValue == null || entityFieldValue == '')) {
                        	entityFieldValue = buildEntityName(searchResultObj, join);
                        }
                    }
                    else { 
                        // other fields from searchResultObj (bodyRecord or entitydetaillist)
                        entityFieldValue = searchResultObj.getValue(fieldName) || '';
                    }
                }
            }
        }
        
//        nlapiLogExecution('debug', 'Payment Module Processing', fieldName + ': ' + entityFieldValue);
        return entityFieldValue;
    }
    
    /**
     * Get the entity detail from internal data structure based on record type, internal id, and field name
     *
     * @param {Object} bodyRecord
     * @param {Object} fieldName
     * @param {Object} templateType
     */
    function getEntityFieldText(bodyRecord, fieldName, templateType){
        var entityFieldValue = '';

        if (bodyRecord && fieldName && templateType) {            
            // get the entity type by checking which of the 3 entity columns has a value
            var entityType = '';
            var vendorEntityCol = new nlobjSearchColumn('internalid', 'vendor');
            var employeeEntityCol = new nlobjSearchColumn('internalid', 'employee');
            var customerEntityCol = new nlobjSearchColumn('internalid', 'customer');
            var partnerEntityCol = new nlobjSearchColumn('internalid', 'partner');
            
            if (bodyRecord.getValue(vendorEntityCol)) {
                entityType = 'vendor';
            }
            else if (bodyRecord.getValue(employeeEntityCol)) {
                entityType = 'employee';
            }
            else if (bodyRecord.getValue(customerEntityCol)) {
                entityType = 'customer';
            }
            else if (bodyRecord.getValue(partnerEntityCol)) {
                entityType = 'partner';
            }
            
            // perform value assignment only when entity column is found
            if (entityType) {                
                // get the entityId
                var entityId = bodyRecord.getValue('internalid', entityType);
                
                // declare searchResultObj and join to be used as basis for field values
                var searchResultObj = null;
                
                // for eft and dd, use the results from the entityDetailList object
                if (templateType == 'eft' || templateType == 'dd') {                    
                    if (this.entityDetailList[entityType]) {                    
                        searchResultObj = this.entityDetailList[entityType][entityId];
                    }
                }
                
                // for positive pay, use the bodyRecord and entityType
                else if (templateType == 'pp') {
                    searchResultObj = bodyRecord;
                    join = entityType;
                }
                
                if (searchResultObj && searchResultObj != null) {
                    // fields from searchResultObj (bodyRecord or entitydetaillist)
                    entityFieldValue = searchResultObj.getText(fieldName) || '';
                }
            }
        }

        return entityFieldValue;
    }
    
    /**
     * Builds the entity name based on isperson field
     * 
     * @param searchResultObj
     * @param join
     * @returns {String}
     */
    function buildEntityName(searchResultObj, join) {
        var entityName = '';
        // build the entity name
        if (searchResultObj) {
            var isPersonFlag = searchResultObj.getValue('isperson', join) || 'T';
            if (isPersonFlag == 'T') {  // if not defined, 
                entityName = searchResultObj.getValue('firstname', join) + ' ' + searchResultObj.getValue('lastname', join);
            }
            else if (isPersonFlag == 'F') {
                entityName = searchResultObj.getValue('companyname', join);
            }
        }
        return entityName;
    }
    
    /**
     * Get the bill/invoice details for specified record type
     * - vendorpayment/customerpayment/customerrefund -- get first paid transaction's details if there is only 1 paid transaction for the payment
     * - vendorbill/invoice/journalentry/creditmemo/depositapplication - get the paid transaction's details
     *
     * @param {Object} bodyRecord
     * @param {String} fieldName
     */
    function getReferenceFieldValue(bodyRecord, fieldName){
        var value = '';
        if (bodyRecord && fieldName) {
            // initialize if not applyline type
            this.InitializeAppliedToTransactionList();
            if (this.appliedToTransactionList) {
            	var recType = bodyRecord.getRecordType(); 
                if (['vendorpayment', 'customerpayment', 'customerrefund'].indexOf(recType) > -1) {
                	var appliedToTransaction = this.appliedToTransactionList[bodyRecord.getId()];
                	if (appliedToTransaction) {
                		if (appliedToTransaction.length == 1) {
                            value = appliedToTransaction[0].getValue(fieldName);
                        }
                	} else {
                    	nlapiLogExecution('error', ['Transactions from payment', bodyRecord.getId(), 'are not included in list.'].join(' '));
                    }
                }
                else if (['vendorbill', 'invoice', 'journalentry', 'expensereport', 'creditmemo', 'depositapplication'].indexOf(recType) > -1) { 
                    value = bodyRecord.getValue(fieldName);
                }
            }
        }
        return value;
    }
    
    /**
     * Retrieve the number of transactions that the payment has been applied to
     * 
     * @param paymentRecordId
     */
    function getAppliedToTransactionCount(paymentRecordId) {
        var count = 0;
        this.InitializeAppliedToTransactionList();
        if (paymentRecordId && this.appliedToTransactionList) {
            if (this.appliedToTransactionList[paymentRecordId]) {
                count = this.appliedToTransactionList[paymentRecordId].length;
            }
        }
        return count;
    }
    
    //---------- saved searches ------------

    /**
     * From saved search that returns unprocessed payment files
     * (based on: EFT Unprocessed ABA File Search)
     */
    function getUnprocessedFileList(addlFilters){
        var filters = [];
        var columns = [];

        filters.push(new nlobjSearchFilter('custrecord_2663_file_processed', null, 'noneof', PAYPROCESSED));
        filters.push(new nlobjSearchFilter('custrecord_2663_file_processed', null, 'noneof', PAYFAILED));
        filters.push(new nlobjSearchFilter('custrecord_2663_file_processed', null, 'noneof', PAYERROR));
        filters.push(new nlobjSearchFilter('custrecord_2663_file_processed', null, 'noneof', PAYCANCELLED));

		if (addlFilters) {
			for (var i = 0; i < addlFilters.length; i++) {
				filters.push(addlFilters[i]);
			}
		}

        columns.push(new nlobjSearchColumn('internalid'));
        columns.push(new nlobjSearchColumn('name'));
        columns.push(new nlobjSearchColumn('custrecord_2663_payment_type'));
        columns.push(new nlobjSearchColumn('custrecord_2663_bank_account'));
        columns.push(new nlobjSearchColumn('custrecord_2663_ref_note'));
        columns.push(new nlobjSearchColumn('custrecord_2663_file_processed'));
        columns.push(new nlobjSearchColumn('custrecord_2663_payments_for_process_id'));
        columns.push(new nlobjSearchColumn('custrecord_2663_payments_for_process_amt'));
        columns.push(new nlobjSearchColumn('custrecord_2663_payments_for_process_dis'));
        columns.push(new nlobjSearchColumn('custrecord_2663_applied_credits'));
        columns.push(new nlobjSearchColumn('custrecord_2663_payments_for_reversal'));
        columns.push(new nlobjSearchColumn('custrecord_2663_payments_for_notify'));
        columns.push(new nlobjSearchColumn('custrecord_2663_process_date'));
        columns.push(new nlobjSearchColumn('custrecord_2663_file_ref'));
        columns.push(new nlobjSearchColumn('custrecord_2663_posting_period'));
        columns.push(new nlobjSearchColumn('custrecord_2663_account'));
        columns.push(new nlobjSearchColumn('custrecord_2663_department'));
        columns.push(new nlobjSearchColumn('custrecord_2663_class'));
        columns.push(new nlobjSearchColumn('custrecord_2663_location'));
        columns.push(new nlobjSearchColumn('custrecord_2663_from_batch'));
        columns.push(new nlobjSearchColumn('custrecord_2663_reversal_date'));
        columns.push(new nlobjSearchColumn('custrecord_2663_reversal_period'));
        columns.push(new nlobjSearchColumn('custrecord_2663_reversal_reasons'));
        columns.push(new nlobjSearchColumn('custrecord_2663_notification_mails'));
        columns.push(new nlobjSearchColumn('tranprefix', 'custrecord_2663_location'));  // add to get the bank location's transaction prefix

        var searchResults = nlapiSearchRecord('customrecord_2663_file_admin', null, filters, columns);

		if (searchResults) {
			searchResults.sort(function(a, b){
				return parseInt(a.getValue('name')) - parseInt(b.getValue('name'));
			});
		}

        return searchResults;
    }

	/**
     * From saved search that returns file list in descending order
     * (based on: EFT ABA List in Descending Order)
	 */
	function getFileListDescendingOrder(){
        var filters = [];
        var columns = [];

		columns.push(new nlobjSearchColumn('internalid'));
		columns.push(new nlobjSearchColumn('name').setSort(true));
		columns.push(new nlobjSearchColumn('custrecord_2663_file_processed'));

		var searchResults = nlapiSearchRecord('customrecord_2663_file_admin', null, null, columns);

		return searchResults;
	}

    /**
     * From saved search that returns bank details based on given id
     * (based on: EFT ABA Company Bank Details)
     * @param {Object} strBankAccountId
	 * @param {Object} paymentType
	 */
    function getBankDetails(strBankAccountId, paymentType){
        var filters = [];
        var columns = [];

		var join = 'custrecord_2663_' + paymentType + '_template_details';
        var subsidiary = 'custrecord_2663_subsidiary';

        filters.push(new nlobjSearchFilter('internalid', null, 'anyof', strBankAccountId));

        columns.push(new nlobjSearchColumn('internalid'));
        columns.push(new nlobjSearchColumn('name'));
        columns.push(new nlobjSearchColumn('custrecord_2663_legal_name'));
        columns.push(new nlobjSearchColumn('custrecord_2663_gl_bank_account'));
        columns.push(new nlobjSearchColumn('custrecord_2663_currency'));
        columns.push(new nlobjSearchColumn('custrecord_2663_eft_file_cabinet_id'));
        columns.push(new nlobjSearchColumn('custrecord_2663_file_name_prefix'));
        columns.push(new nlobjSearchColumn('custrecord_2663_bank_code', join));
        columns.push(new nlobjSearchColumn('custrecord_2663_bank_comp_id', join));
        columns.push(new nlobjSearchColumn('custrecord_2663_bank_num', join));
        columns.push(new nlobjSearchColumn('custrecord_2663_branch_num', join));
        columns.push(new nlobjSearchColumn('custrecord_2663_acct_num', join));
        columns.push(new nlobjSearchColumn('custrecord_2663_bank_name', join));
        columns.push(new nlobjSearchColumn('custrecord_2663_branch_name', join));
        columns.push(new nlobjSearchColumn('custrecord_2663_balance_line', join));
        columns.push(new nlobjSearchColumn('custrecord_2663_center_code', join));
        columns.push(new nlobjSearchColumn('custrecord_2663_issuer_num', join));
        columns.push(new nlobjSearchColumn('custrecord_2663_opt_fld', join));
        columns.push(new nlobjSearchColumn('custrecord_2663_iban', join));
        columns.push(new nlobjSearchColumn('custrecord_2663_country_code', join));
        columns.push(new nlobjSearchColumn('custrecord_2663_iban_check', join));
        columns.push(new nlobjSearchColumn('custrecord_2663_country_check', join));
        columns.push(new nlobjSearchColumn('custrecord_2663_processor_code', join));
        columns.push(new nlobjSearchColumn('custrecord_2663_tax_province', join));
        columns.push(new nlobjSearchColumn('custrecord_2663_tax_authorization_num', join));
        columns.push(new nlobjSearchColumn('custrecord_2663_tax_authorization_date', join));
        columns.push(new nlobjSearchColumn('custrecord_2663_bank_address1', join));
        columns.push(new nlobjSearchColumn('custrecord_2663_bank_address2', join));
        columns.push(new nlobjSearchColumn('custrecord_2663_bank_address3', join));
        columns.push(new nlobjSearchColumn('custrecord_2663_bank_city', join));
        columns.push(new nlobjSearchColumn('custrecord_2663_bank_state', join));
        columns.push(new nlobjSearchColumn('custrecord_2663_bank_zip', join));
        columns.push(new nlobjSearchColumn('custrecord_2663_bank_country', join));
        columns.push(new nlobjSearchColumn('custrecord_2663_statement_name', join));
        columns.push(new nlobjSearchColumn('custrecord_2663_bban', join));
        columns.push(new nlobjSearchColumn('custrecord_2663_bic', join));
        columns.push(new nlobjSearchColumn('custrecord_2663_bank_acct_type', join));
        columns.push(new nlobjSearchColumn('custrecord_2663_bank_suffix', join));
        columns.push(new nlobjSearchColumn('custrecord_2663_eft_template')); // need to load record for the eft template
        columns.push(new nlobjSearchColumn('custrecord_2663_dd_template')); // need to load record for the dd template
        columns.push(new nlobjSearchColumn('custrecord_2663_pp_template')); // need to load record for the pp template
        columns.push(new nlobjSearchColumn('tranprefix', 'custrecord_2663_bank_location'));  // add to get the bank location's transaction prefix
        columns.push(new nlobjSearchColumn('custrecord_2663_print_company_name'));
        columns.push(new nlobjSearchColumn('custrecord_2663_pad_blocks', join));

        if (isOneWorld()) {
            columns.push(new nlobjSearchColumn('address1', subsidiary));
            columns.push(new nlobjSearchColumn('city', subsidiary));
            columns.push(new nlobjSearchColumn('zip', subsidiary));
            columns.push(new nlobjSearchColumn('taxidnum', subsidiary));
            columns.push(new nlobjSearchColumn('legalname', subsidiary));
            columns.push(new nlobjSearchColumn('state', subsidiary));
            columns.push(new nlobjSearchColumn('currency', subsidiary));
        }

        return nlapiSearchRecord('customrecord_2663_bank_details', null, filters, columns);
    }

    /**
     * Retrieve vendor payments (main line only if no parameter is passed)
     * @param {String}  paymentFilter
     * @param {Array}   arrFreeMarkerColumns     - columns (nlobjSearchColumn) used by payment file template using free marker     
     */
    function getVendorPayments (paymentFilter, arrFreeMarkerColumns){
        // The following search retrieve all vendor payments to establish those not created.
        var filters = [];
        var columns = [];

        filters.push(new nlobjSearchFilter('type', null, 'anyof', 'VendPymt'));
        filters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
        filters.push(new nlobjSearchFilter('custrecord_2663_eft_file_id', 'custrecord_2663_parent_payment', 'anyof', this.paymentFileInfoSrc.getValue('internalid')));
    	if (paymentFilter == 'entity') {
            filters.push(new nlobjSearchFilter('internalid', 'vendor', 'noneof', '@NONE@'));
    	}
    	else if (paymentFilter == 'employee') {
    		filters.push(new nlobjSearchFilter('internalid', 'employee', 'noneof', '@NONE@'));
    	}

        if (arrFreeMarkerColumns){
            columns = columns.concat(arrFreeMarkerColumns);
        }
        
        else {
            columns.push(new nlobjSearchColumn('internalid'));
            columns.push(new nlobjSearchColumn('trandate'));
            columns.push(new nlobjSearchColumn('postingperiod'));
            columns.push(new nlobjSearchColumn('type'));
            columns.push(new nlobjSearchColumn('tranid'));
            columns.push(new nlobjSearchColumn('entity'));
            columns.push(new nlobjSearchColumn('internalid', 'vendor'));
            columns.push(new nlobjSearchColumn('internalid', 'employee'));
            columns.push(new nlobjSearchColumn('account'));
            columns.push(new nlobjSearchColumn('memo'));
            columns.push(new nlobjSearchColumn('memomain'));
            if (isMultiCurrency()) {
                columns.push(new nlobjSearchColumn('fxamount'));
                columns.push(new nlobjSearchColumn('currency'));
                columns.push(new nlobjSearchColumn('formulacurrency').setFormula('ABS(ROUND({fxamount}*{exchangerate},2))'));
            }
            columns.push(new nlobjSearchColumn('amount'));
            columns.push(new nlobjSearchColumn('custrecord_2663_eft_file_id', 'custrecord_2663_parent_payment'));        
        }                

        //var searchResults = nlapiSearchRecord('transaction', null, filters, columns);
        var searchResults = searchRecord('transaction', null, filters, columns);
        searchResults.sort(function(a, b){
			var memoA = a.getValue('memo');
			var memoB = b.getValue('memo');
			var aId = 0;
			var bId = 0;
			if (memoA.indexOf('/') != -1) {
				aId = parseInt(memoA.substring(memoA.indexOf('/') + 1, memoA.length), 10);
			}
            if (memoB.indexOf('/') != -1) {
                bId = parseInt(memoB.substring(memoB.indexOf('/') + 1, memoB.length), 10);
            }
            return aId - bId;
        });
        
        return searchResults;
    }

    /**
     * Retrieve customer payments
     *
     * @param {Array}   arrFreeMarkerColumns     - columns (nlobjSearchColumn) used by payment file template using free marker          
     */
    function getCustomerPayments(arrFreeMarkerColumns){
        var filters = [];
        var columns = [];

        filters.push(new nlobjSearchFilter('type', null, 'anyof', 'CustPymt'));
        filters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
        filters.push(new nlobjSearchFilter('custrecord_2663_eft_file_id', 'custrecord_2663_parent_payment', 'anyof', this.paymentFileInfoSrc.getValue('internalid')));

        if (arrFreeMarkerColumns){
            columns = columns.concat(arrFreeMarkerColumns);
        }

        else {
            columns.push(new nlobjSearchColumn('internalid'));
            columns.push(new nlobjSearchColumn('trandate'));
            columns.push(new nlobjSearchColumn('postingperiod'));
            columns.push(new nlobjSearchColumn('type'));
            columns.push(new nlobjSearchColumn('tranid'));
            columns.push(new nlobjSearchColumn('entity'));
            columns.push(new nlobjSearchColumn('internalid', 'customer'));
            columns.push(new nlobjSearchColumn('account'));
            columns.push(new nlobjSearchColumn('memo'));
            columns.push(new nlobjSearchColumn('memomain'));
            if (isMultiCurrency()) {
                columns.push(new nlobjSearchColumn('fxamount'));
                columns.push(new nlobjSearchColumn('currency'));
                columns.push(new nlobjSearchColumn('formulacurrency').setFormula('ABS(ROUND({fxamount}*{exchangerate},2))'));
            }
            columns.push(new nlobjSearchColumn('amount'));
            columns.push(new nlobjSearchColumn('custrecord_2663_eft_file_id', 'custrecord_2663_parent_payment'));        
        }
        


        var searchResults = searchRecord('transaction', null, filters, columns);
        searchResults.sort(function(a, b){
			var memoA = a.getValue('memo');
			var memoB = b.getValue('memo');
			var aId = 0;
			var bId = 0;
			if (memoA.indexOf('/') != -1) {
				aId = parseInt(memoA.substring(memoA.indexOf('/') + 1, memoA.length), 10);
			}
            if (memoB.indexOf('/') != -1) {
                bId = parseInt(memoB.substring(memoB.indexOf('/') + 1, memoB.length), 10);
            }
            return aId - bId;
        });

        return searchResults;
    }
    
    /**
     * Retrieve checks for positive pay
     *
     * @param {Array}   arrFreeMarkerColumns     - columns (nlobjSearchColumn) used by payment file template using free marker          
     */
    function getChecks(arrFreeMarkerColumns){

        var filters = [];
        var columns = [];

        filters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
        filters.push(new nlobjSearchFilter('custrecord_2663_eft_file_id', 'custrecord_2663_parent_payment', 'anyof', this.paymentFileInfoSrc.getValue('internalid')));

        if (arrFreeMarkerColumns){
            columns = columns.concat(arrFreeMarkerColumns);
        }        
        else {
            columns.push(new nlobjSearchColumn('internalid'));
            columns.push(new nlobjSearchColumn('tranid'));
            columns.push(new nlobjSearchColumn('otherrefnum'));
            columns.push(new nlobjSearchColumn('trandate'));
            columns.push(new nlobjSearchColumn('reversaldate'));
            columns.push(new nlobjSearchColumn('entity'));
            columns.push(new nlobjSearchColumn('memo'));
            columns.push(new nlobjSearchColumn('memomain'));
            var entityTypes = ['vendor', 'employee', 'customer'];
            for (var i = 0; i < entityTypes.length; i++) {
                var entityType = entityTypes[i];
                columns.push(new nlobjSearchColumn('internalid', entityType));
                columns.push(new nlobjSearchColumn('firstname', entityType));
                columns.push(new nlobjSearchColumn('lastname', entityType));
                if (entityType != 'employee') {
                    columns.push(new nlobjSearchColumn('companyname', entityType));
                    columns.push(new nlobjSearchColumn('isperson', entityType));
                }
            }
            
            if (isMultiCurrency()) {
                columns.push(new nlobjSearchColumn('fxamount'));
                columns.push(new nlobjSearchColumn('currency'));
                columns.push(new nlobjSearchColumn('formulacurrency').setFormula('ABS(ROUND({fxamount}*{exchangerate},2))'));
            }
            columns.push(new nlobjSearchColumn('amount'));
            columns.push(new nlobjSearchColumn('custrecord_2663_eft_file_id', 'custrecord_2663_parent_payment'));        
        }        

        //var searchResults = nlapiSearchRecord('transaction', null, filters, columns);
        var searchResults = searchRecord('transaction', null, filters, columns);

        return searchResults;
    }
    
    /**
     * Retrieve customer refunds
     * @param {String} paymentFilter
     * @param {Array}   arrFreeMarkerColumns     - columns (nlobjSearchColumn) used by payment file template using free marker          
     */
    function getCustomerRefunds(paymentFilter, arrFreeMarkerColumns){

        // The following search retrieve all vendor payments to establish those not created.
        var filters = [];
        var columns = [];

        filters.push(new nlobjSearchFilter('type', null, 'anyof', 'CustRfnd'));
        filters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
        filters.push(new nlobjSearchFilter('custrecord_2663_eft_file_id', 'custrecord_2663_parent_payment', 'anyof', this.paymentFileInfoSrc.getValue('internalid')));
        if (paymentFilter == 'entity') {
            filters.push(new nlobjSearchFilter('internalid', 'customer', 'noneof', '@NONE@'));
        }
        else if (paymentFilter == 'employee') {
            filters.push(new nlobjSearchFilter('internalid', 'employee', 'noneof', '@NONE@'));
        }

        if (arrFreeMarkerColumns){
            columns = columns.concat(arrFreeMarkerColumns);
        }
        else {
            columns.push(new nlobjSearchColumn('internalid'));
            columns.push(new nlobjSearchColumn('trandate'));
            columns.push(new nlobjSearchColumn('postingperiod'));
            columns.push(new nlobjSearchColumn('type'));
            columns.push(new nlobjSearchColumn('tranid'));
            columns.push(new nlobjSearchColumn('entity'));
            columns.push(new nlobjSearchColumn('internalid', 'customer'));
            columns.push(new nlobjSearchColumn('account'));
            columns.push(new nlobjSearchColumn('memo'));
            columns.push(new nlobjSearchColumn('memomain'));
            if (isMultiCurrency()) {
                columns.push(new nlobjSearchColumn('fxamount'));
                columns.push(new nlobjSearchColumn('currency'));
                columns.push(new nlobjSearchColumn('formulacurrency').setFormula('ABS(ROUND({fxamount}*{exchangerate},2))'));
            }
            columns.push(new nlobjSearchColumn('amount'));
            columns.push(new nlobjSearchColumn('custrecord_2663_eft_file_id', 'custrecord_2663_parent_payment'));        
        }

        
        //var searchResults = nlapiSearchRecord('transaction', null, filters, columns);
        var searchResults = searchRecord('transaction', null, filters, columns);
        searchResults.sort(function(a, b){
			var memoA = a.getValue('memo');
			var memoB = b.getValue('memo');
			var aId = 0;
			var bId = 0;
			if (memoA.indexOf('/') != -1) {
				aId = parseInt(memoA.substring(memoA.indexOf('/') + 1, memoA.length), 10);
			}
            if (memoB.indexOf('/') != -1) {
                bId = parseInt(memoB.substring(memoB.indexOf('/') + 1, memoB.length), 10);
            }
            return aId - bId;
        });

        return searchResults;
    }
    /**
     * Returns the transactions with applied payments
     * 
     * @param {Object} templateType
     * @param {Object} paymentFileId
     * @param {Array}   arrFreeMarkerColumns     - columns (nlobjSearchColumn) used by payment file template using free marker          
     */
    function getAppliedToTransactionList(templateType, paymentFileId, arrFreeMarkerColumns){
        var filters = [];
        var columns = [];
        var tranTypes = {};
        
    	if (isCommissionEnabled() || isEmployeeCommissionEnabled()) {
    		tranTypes = {
                'eft': ['VendBill', 'ExpRept', 'Journal', 'Commissn'],
                'dd': ['CustInvc', 'Journal'] 
    		};
    	} else {
    		tranTypes = {
                    'eft': ['VendBill', 'ExpRept', 'Journal'],
                    'dd': ['CustInvc', 'Journal'] 
        		};
    	}
        
        filters.push(new nlobjSearchFilter('type', null, 'anyof', tranTypes[templateType]));
        filters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
        filters.push(new nlobjSearchFilter('custrecord_2663_eft_file_id', 'custrecord_2663_parent_bill', 'anyof', paymentFileId));
        filters.push(new nlobjSearchFilter('voided', 'applyingtransaction', 'is', 'F'));
        if (isMultiCurrency()) {
            filters.push(new nlobjSearchFilter('applyingforeignamount', null, 'greaterthan', 0));            
        }
        
        if (arrFreeMarkerColumns){
            columns = columns.concat(arrFreeMarkerColumns);  
        }
        else {
            columns.push(new nlobjSearchColumn('internalid'));
            columns.push(new nlobjSearchColumn('trandate'));
            columns.push(new nlobjSearchColumn('tranid'));
            if (isMultiCurrency()) {
                columns.push(new nlobjSearchColumn('applyingforeignamount'));
            }
            else {
                columns.push(new nlobjSearchColumn('applyinglinkamount'));
            }
            
            columns.push(new nlobjSearchColumn('otherrefnum'));
            columns.push(new nlobjSearchColumn('entity'));
            columns.push(new nlobjSearchColumn('applyingtransaction'));
            columns.push(new nlobjSearchColumn('duedate'));
            columns.push(new nlobjSearchColumn('custrecord_2663_eft_file_id', 'custrecord_2663_parent_bill'));
            columns.push(new nlobjSearchColumn('custbody_2663_reference_num'));        
        }
        
        var searchResults = searchRecord('transaction', null, filters, columns);

        return searchResults;
    }
    
    /**
     * Returns the transactions with applied refunds
     * 
     * @param {Array} paymentIdList
     */
    function getAppliedToRefundTransactionList(paymentIdList){
        var custRefundIds = [];
        if (paymentIdList) {
            for (var i = 0; i < paymentIdList.length; i++) {
                custRefundIds.push(paymentIdList[i].substring(0, paymentIdList[i].indexOf('-')));
            }
        }
        
        var searchResults;
        if (custRefundIds.length > 0) {
            var filters = [];
            var columns = [];
            // create filter for each batch of transactions
            var batchSize = 500;
            var numBatches = Math.ceil(custRefundIds.length / batchSize);
            nlapiLogExecution('debug', '[ep] PaymentFileDataSrc:getAppliedToRefundTransactionList', 'number of batches: ' + numBatches);
            for (var i = 0; i < numBatches; i++) {
                var startIdx = i * batchSize;
                var endIdx = (i + 1) * batchSize < custRefundIds.length ? (i + 1) * batchSize : custRefundIds.length ;
                nlapiLogExecution('debug', '[ep] PaymentFileDataSrc:getAppliedToRefundTransactionList', 'batch: ' + i + ', start: ' + startIdx + ', end: ' + endIdx);
                var transactionBatch = custRefundIds.slice(startIdx, endIdx);
                // create filter for entity batch
                var newTransFilter = new nlobjSearchFilter('appliedtotransaction', null, 'anyof', transactionBatch);
                if (numBatches > 1) {
                    if (i == 0) {
                        // set left paren for first batch
                        newTransFilter.setLeftParens(2);
                        // set or as true
                        newTransFilter.setOr(true);
                    }
                    else if (i == numBatches - 1) {
                        // set right paren for last batch
                        newTransFilter.setRightParens(2);
                    }
                    else {
                        // set or as true
                        newTransFilter.setOr(true);
                    }
                }
                filters.push(newTransFilter);
            }
            filters.push(new nlobjSearchFilter('voided', 'appliedtotransaction', 'is', 'F'));
            columns.push(new nlobjSearchColumn('appliedtotransaction'));

            if (isMultiCurrency()) {
                columns.push(new nlobjSearchColumn('appliedtoforeignamount'));
            }
            else {
                columns.push(new nlobjSearchColumn('appliedtolinkamount'));
            }
            
            columns.push(new nlobjSearchColumn('tranid'));
            columns.push(new nlobjSearchColumn('trandate'));
            columns.push(new nlobjSearchColumn('otherrefnum'));
            columns.push(new nlobjSearchColumn('entity'));
            columns.push(new nlobjSearchColumn('custbody_2663_reference_num'));

            var searchResults = searchRecord('transaction', null, filters, columns);
        }

        return searchResults;
    }
    
    /**
     * Initialize the applied to transaction list
     */
    function initializeAppliedToTransactionList() {
        if (!this.appliedToTransactionList) {
            var appliedToTransactionList = {};
            var accountType = this.paymentFileInfoSrc.getValue('type', 'custrecord_2663_account');
            if (accountType == 'Bank') {
                var paidTransactions = getAppliedToRefundTransactionList(this.GetPaymentIdList());
                
                (paidTransactions || []).forEach(function (res) {
                    var paymentIdIdx = res.getValue('appliedtotransaction');
                    if (!appliedToTransactionList[paymentIdIdx]) {
                        appliedToTransactionList[paymentIdIdx] = [];
                    }
                    appliedToTransactionList[paymentIdIdx].push(res);
                });
            }
            else {
                var paidTransactions = getAppliedToTransactionList(this.paymentFileInfoSrc.getText('custrecord_2663_payment_type').toLowerCase(), this.paymentFileInfoSrc.getValue('internalid'));
                
                (paidTransactions || []).forEach(function (res) {
                    var paymentIdIdx = res.getValue('applyingtransaction');
                    if (!appliedToTransactionList[paymentIdIdx]) {
                        appliedToTransactionList[paymentIdIdx] = [];
                    }
                    appliedToTransactionList[paymentIdIdx].push(res);
                });
            }
            this.appliedToTransactionList = appliedToTransactionList;
        }
    }
    
    /**
     * Gets all custom fields from custom record
     * 
     * @param {Object} recordType
     * @return {Array}
     */
    function getCustomFieldIds(recordType){
    	var customFldIds = [];
    	if (recordType) {
    		var rec = nlapiCreateRecord(recordType);
    		if (rec) {
    			customFldIds = (rec.getAllFields()).filter(function(fldId) {
    				return fldId && fldId.indexOf('custrecord') > -1;
    			});
    		}
    		
    	}
    	return customFldIds;
    }

    /**
     * Gets all entity details to build data structure in memory
     *
     * @param {Array}   arrEntityIds            - entity internal IDs
     * @param {Array}   arrFreeMarkerColumns    - columns (nlobjSearchColumn) used by payment file template using free marker          
     */    
    function getEntityDetails(arrEntityIds, arrFreeMarkerColumns){		
    
        var filters = [];
        var columns = [];
    
        // search entities for id and type
		if (arrEntityIds && arrEntityIds.length > 0) {
		    nlapiLogExecution('debug', 'Payment Module Processing', 'Entity Ids: ' + arrEntityIds.length);
	        filters.push(new nlobjSearchFilter('internalid', null, 'anyof', arrEntityIds));
		}
        if (arrFreeMarkerColumns){
            columns = columns.concat(arrFreeMarkerColumns);
        }
        
        // NOTE: For employee/vendor/customer specific columns, remove them from the default entity columns in _2663.FreeMarkerProcessor.getColumns()
        
        // search employees (including employee specific columns)
        var employeeColumns = columns;
        employeeColumns = employeeColumns.concat([new nlobjSearchColumn('socialsecuritynumber')]);
        var employeeResults = searchRecord('employee', null, filters, employeeColumns);
        
        // search vendors (including vendor specific columns)               
        var vendorColumns = columns;
        vendorColumns = vendorColumns.concat([new nlobjSearchColumn('isperson')]);
        vendorColumns = vendorColumns.concat([new nlobjSearchColumn('companyname')]);
        vendorColumns = vendorColumns.concat([new nlobjSearchColumn('printoncheckas')]);
        vendorColumns = vendorColumns.concat([new nlobjSearchColumn('vatregnumber')]);
        var vendorResults = searchRecord('vendor', null, filters, vendorColumns);
        
        // search customers (including customer specific columns)
        var customerColumns = columns;
        customerColumns = customerColumns.concat([new nlobjSearchColumn('isperson')]);
        customerColumns = customerColumns.concat([new nlobjSearchColumn('companyname')]);        
        customerColumns = customerColumns.concat([new nlobjSearchColumn('vatregnumber')]);        
        var customerResults = searchRecord('customer', null, filters, customerColumns);
        
        // combine the results
        var entityResults = [];
        entityResults = employeeResults ? entityResults.concat(employeeResults) : entityResults;
        entityResults = vendorResults ? entityResults.concat(vendorResults) : entityResults;
        entityResults = customerResults ? entityResults.concat(customerResults) : entityResults;
        
        return entityResults;
    }
    
    /**
     * Gets all entity bank details to build data structure in memory
     *
     * @param {String}  format                  - foramt ID
     * @param {Array}   entityArr               - entity IDs
     * @param {Array}   arrFreeMarkerColumns    - columns (nlobjSearchColumn) used by payment file template using free marker               
     */
    function getEntityBankDetails(format, entityArr, arrFreeMarkerColumns){
        var entityFilters = [];
        var entityColumns = [];
        var customFldIds = getCustomFieldIds('customrecord_2663_entity_bank_details') || [];

        // don't get customer entity details
        entityFilters.push(new nlobjSearchFilter('custrecord_2663_parent_customer', null, 'anyof', '@NONE@'));
        entityFilters.push(new nlobjSearchFilter('custrecord_2663_parent_cust_ref', null, 'anyof', '@NONE@'));

        // only get primary details
        entityFilters.push(new nlobjSearchFilter('custrecord_2663_entity_bank_type', null, 'anyof', '1'));

        // check if eft = true for vendor
        var vendorEftFilter = new nlobjSearchFilter('custentity_2663_payment_method', 'custrecord_2663_parent_vendor', 'is', 'T');
        vendorEftFilter.setLeftParens(2);

        // check if vendor is inactive
        var vendorInactiveFilter = new nlobjSearchFilter('isinactive', 'custrecord_2663_parent_vendor', 'is', 'F');
        vendorInactiveFilter.setRightParens(1);
        vendorInactiveFilter.setOr(true);

        // check if eft = true for employee
        var employeeEftFilter = new nlobjSearchFilter('custentity_2663_payment_method', 'custrecord_2663_parent_employee', 'is', 'T');
        employeeEftFilter.setLeftParens(1);

        // check if employee is inactive
        var employeeInactiveFilter = new nlobjSearchFilter('isinactive', 'custrecord_2663_parent_employee', 'is', 'F');
        employeeInactiveFilter.setRightParens(2);

        // add filter expression
        entityFilters.push(vendorEftFilter);
        entityFilters.push(vendorInactiveFilter);
        entityFilters.push(employeeEftFilter);
        entityFilters.push(employeeInactiveFilter);

        // check format if indicated
        if (format) {
			nlapiLogExecution('debug', 'Payment Module Processing', 'File Format: ' + format);
            entityFilters.push(new nlobjSearchFilter('custrecord_2663_entity_file_format', null, 'anyof', format));
        }

		// if entity id list is given
		if (entityArr && entityArr.length > 0) {
		    nlapiLogExecution('debug', 'Payment Module Processing', 'Entity Ids: ' + entityArr.length);
	        var vendorFilter = new nlobjSearchFilter('internalid', 'custrecord_2663_parent_vendor', 'anyof', entityArr);
            vendorFilter.setLeftParens(1);
	        vendorFilter.setOr(true);
	        var employeeFilter = new nlobjSearchFilter('internalid', 'custrecord_2663_parent_employee', 'anyof', entityArr);
			employeeFilter.setRightParens(1);
	        entityFilters.push(vendorFilter);
	        entityFilters.push(employeeFilter);
		}

        if (arrFreeMarkerColumns) {
            entityColumns = entityColumns.concat(arrFreeMarkerColumns);    
        }
        
        else {
            customFldIds.forEach(function(fldId) {
                entityColumns.push(new nlobjSearchColumn(fldId));
            });
            entityColumns.push(new nlobjSearchColumn('companyname', 'custrecord_2663_parent_vendor'));
            entityColumns.push(new nlobjSearchColumn('address1', 'custrecord_2663_parent_vendor'));
            entityColumns.push(new nlobjSearchColumn('address2', 'custrecord_2663_parent_vendor'));
            entityColumns.push(new nlobjSearchColumn('address3', 'custrecord_2663_parent_vendor'));
            entityColumns.push(new nlobjSearchColumn('billaddress1', 'custrecord_2663_parent_vendor'));
            entityColumns.push(new nlobjSearchColumn('billaddress2', 'custrecord_2663_parent_vendor'));
            entityColumns.push(new nlobjSearchColumn('billaddress3', 'custrecord_2663_parent_vendor'));
            entityColumns.push(new nlobjSearchColumn('shipaddress1', 'custrecord_2663_parent_vendor'));
            entityColumns.push(new nlobjSearchColumn('shipaddress2', 'custrecord_2663_parent_vendor'));
            entityColumns.push(new nlobjSearchColumn('shipaddress3', 'custrecord_2663_parent_vendor'));
            entityColumns.push(new nlobjSearchColumn('billcity', 'custrecord_2663_parent_vendor'));
            entityColumns.push(new nlobjSearchColumn('billzipcode', 'custrecord_2663_parent_vendor'));
            entityColumns.push(new nlobjSearchColumn('billstate', 'custrecord_2663_parent_vendor'));
            entityColumns.push(new nlobjSearchColumn('city', 'custrecord_2663_parent_vendor'));
            entityColumns.push(new nlobjSearchColumn('zipcode', 'custrecord_2663_parent_vendor'));
            entityColumns.push(new nlobjSearchColumn('state', 'custrecord_2663_parent_vendor'));
            entityColumns.push(new nlobjSearchColumn('vatregnumber', 'custrecord_2663_parent_vendor'));
            entityColumns.push(new nlobjSearchColumn('billcountrycode', 'custrecord_2663_parent_vendor'));
            entityColumns.push(new nlobjSearchColumn('billcountry', 'custrecord_2663_parent_vendor'));
            entityColumns.push(new nlobjSearchColumn('isperson', 'custrecord_2663_parent_vendor'));
            entityColumns.push(new nlobjSearchColumn('firstname', 'custrecord_2663_parent_vendor'));
            entityColumns.push(new nlobjSearchColumn('lastname', 'custrecord_2663_parent_vendor'));
            entityColumns.push(new nlobjSearchColumn('accountnumber', 'custrecord_2663_parent_vendor'));
            entityColumns.push(new nlobjSearchColumn('printoncheckas', 'custrecord_2663_parent_vendor'));
            entityColumns.push(new nlobjSearchColumn('firstname', 'custrecord_2663_parent_employee'));
            entityColumns.push(new nlobjSearchColumn('lastname', 'custrecord_2663_parent_employee'));
            entityColumns.push(new nlobjSearchColumn('address1', 'custrecord_2663_parent_employee'));
            entityColumns.push(new nlobjSearchColumn('address2', 'custrecord_2663_parent_employee'));
            entityColumns.push(new nlobjSearchColumn('address3', 'custrecord_2663_parent_employee'));
            entityColumns.push(new nlobjSearchColumn('billaddress1', 'custrecord_2663_parent_employee'));
            entityColumns.push(new nlobjSearchColumn('billaddress2', 'custrecord_2663_parent_employee'));
            entityColumns.push(new nlobjSearchColumn('billaddress3', 'custrecord_2663_parent_employee'));
            entityColumns.push(new nlobjSearchColumn('shipaddress1', 'custrecord_2663_parent_employee'));
            entityColumns.push(new nlobjSearchColumn('shipaddress2', 'custrecord_2663_parent_employee'));
            entityColumns.push(new nlobjSearchColumn('shipaddress3', 'custrecord_2663_parent_employee'));
            entityColumns.push(new nlobjSearchColumn('billcity', 'custrecord_2663_parent_employee'));
            entityColumns.push(new nlobjSearchColumn('billzipcode', 'custrecord_2663_parent_employee'));
            entityColumns.push(new nlobjSearchColumn('billstate', 'custrecord_2663_parent_employee'));
            entityColumns.push(new nlobjSearchColumn('city', 'custrecord_2663_parent_employee'));
            entityColumns.push(new nlobjSearchColumn('zipcode', 'custrecord_2663_parent_employee'));
            entityColumns.push(new nlobjSearchColumn('state', 'custrecord_2663_parent_employee'));
            entityColumns.push(new nlobjSearchColumn('socialsecuritynumber', 'custrecord_2663_parent_employee'));
            entityColumns.push(new nlobjSearchColumn('billcountrycode', 'custrecord_2663_parent_employee'));
            entityColumns.push(new nlobjSearchColumn('billcountry', 'custrecord_2663_parent_employee'));
            entityColumns.push(new nlobjSearchColumn('accountnumber', 'custrecord_2663_parent_employee'));
        }
        var entityDetailResults = searchRecord('customrecord_2663_entity_bank_details', null, entityFilters, entityColumns);

        return entityDetailResults;
    }

    /**
     * Gets all customer bank details to build data structure in memory
     *
     * @param {String}  format                  - foramt ID
     * @param {Array}   entityArr               - entity IDs     
     * @param {Array}   arrFreeMarkerColumns    - columns (nlobjSearchColumn) used by payment file template using free marker
     */
    function getCustomerBankDetails(format, entityArr, arrFreeMarkerColumns){
        var entityFilters = [];
        var entityColumns = [];
        var customFldIds = getCustomFieldIds('customrecord_2663_entity_bank_details') || [];

        // don't get vendor/employee entity details
        entityFilters.push(new nlobjSearchFilter('custrecord_2663_parent_vendor', null, 'anyof', '@NONE@'));
        entityFilters.push(new nlobjSearchFilter('custrecord_2663_parent_employee', null, 'anyof', '@NONE@'));
        entityFilters.push(new nlobjSearchFilter('custrecord_2663_parent_cust_ref', null, 'anyof', '@NONE@'));

        // only get primary details
        entityFilters.push(new nlobjSearchFilter('custrecord_2663_entity_bank_type', null, 'anyof', '1'));

        // check if dd = true
        entityFilters.push(new nlobjSearchFilter('custentity_2663_direct_debit', 'custrecord_2663_parent_customer', 'is', 'T'));

        // check if customer is inactive
        entityFilters.push(new nlobjSearchFilter('isinactive', 'custrecord_2663_parent_customer', 'is', 'F'));

        // check format if indicated
        if (format) {
            nlapiLogExecution('debug', 'Payment Module Processing', 'File Format: ' + format);
            entityFilters.push(new nlobjSearchFilter('custrecord_2663_entity_file_format', null, 'anyof', format));
        }

        // if entity id list is given
        if (entityArr && entityArr.length > 0) {
            nlapiLogExecution('debug', 'Payment Module Processing', 'Entity Ids: ' + entityArr.length);
            entityFilters.push(new nlobjSearchFilter('internalid', 'custrecord_2663_parent_customer', 'anyof', entityArr));
        }
        
        if (arrFreeMarkerColumns) {
            entityColumns = entityColumns.concat(arrFreeMarkerColumns);
        }
        
        else{
            customFldIds.forEach(function(fldId) {
                entityColumns.push(new nlobjSearchColumn(fldId));
            });
            entityColumns.push(new nlobjSearchColumn('companyname', 'custrecord_2663_parent_customer'));
            entityColumns.push(new nlobjSearchColumn('address1', 'custrecord_2663_parent_customer'));
            entityColumns.push(new nlobjSearchColumn('address2', 'custrecord_2663_parent_customer'));
            entityColumns.push(new nlobjSearchColumn('address3', 'custrecord_2663_parent_customer'));
            entityColumns.push(new nlobjSearchColumn('city', 'custrecord_2663_parent_customer'));
            entityColumns.push(new nlobjSearchColumn('zipcode', 'custrecord_2663_parent_customer'));
            entityColumns.push(new nlobjSearchColumn('state', 'custrecord_2663_parent_customer'));
            entityColumns.push(new nlobjSearchColumn('vatregnumber', 'custrecord_2663_parent_customer'));
            entityColumns.push(new nlobjSearchColumn('billcountrycode', 'custrecord_2663_parent_customer'));
            entityColumns.push(new nlobjSearchColumn('billcountry', 'custrecord_2663_parent_customer'));
            entityColumns.push(new nlobjSearchColumn('isperson', 'custrecord_2663_parent_customer'));
            entityColumns.push(new nlobjSearchColumn('firstname', 'custrecord_2663_parent_customer'));
            entityColumns.push(new nlobjSearchColumn('lastname', 'custrecord_2663_parent_customer'));
            entityColumns.push(new nlobjSearchColumn('accountnumber', 'custrecord_2663_parent_customer'));        
        }

        var entityDetailResults = searchRecord('customrecord_2663_entity_bank_details', null, entityFilters, entityColumns);

        return entityDetailResults;
    }
    
    /**
     * Gets all customer refund bank details to build data structure in memory
     *
     * @param {String}  format                  - foramt ID
     * @param {Array}   entityArr               - entity IDs     
     * @param {Array}   arrFreeMarkerColumns     - columns (nlobjSearchColumn) used by payment file template using free marker                    
     */
    function getCustomerRefundBankDetails(format, entityArr, arrFreeMarkerColumns){
        var entityFilters = [];
        var entityColumns = [];
        var customFldIds = getCustomFieldIds('customrecord_2663_entity_bank_details') || [];

        // don't get vendor/employee/customer entity details
        entityFilters.push(new nlobjSearchFilter('custrecord_2663_parent_vendor', null, 'anyof', '@NONE@'));
        entityFilters.push(new nlobjSearchFilter('custrecord_2663_parent_employee', null, 'anyof', '@NONE@'));
        entityFilters.push(new nlobjSearchFilter('custrecord_2663_parent_customer', null, 'anyof', '@NONE@'));

        // only get primary details
        entityFilters.push(new nlobjSearchFilter('custrecord_2663_entity_bank_type', null, 'anyof', '1'));

        // check if customer refund flag = true
        entityFilters.push(new nlobjSearchFilter('custentity_2663_customer_refund', 'custrecord_2663_parent_cust_ref', 'is', 'T'));

        // check if customer is inactive
        entityFilters.push(new nlobjSearchFilter('isinactive', 'custrecord_2663_parent_cust_ref', 'is', 'F'));

        // check format if indicated
        if (format) {
            nlapiLogExecution('debug', '[ep] PaymentFileDataSrc:getCustomerRefundBankDetails', 'File Format: ' + format);
            entityFilters.push(new nlobjSearchFilter('custrecord_2663_entity_file_format', null, 'anyof', format));
        }

        // if entity id list is given
        if (entityArr && entityArr.length > 0) {
            nlapiLogExecution('debug', '[ep] PaymentFileDataSrc:getCustomerRefundBankDetails', 'Entity Ids: ' + entityArr.length);
            entityFilters.push(new nlobjSearchFilter('internalid', 'custrecord_2663_parent_cust_ref', 'anyof', entityArr));
        }

        if (arrFreeMarkerColumns) {
            entityColumns = entityColumns.concat(arrFreeMarkerColumns);        
        }

        else {
            customFldIds.forEach(function(fldId) {
                entityColumns.push(new nlobjSearchColumn(fldId));
            });
            entityColumns.push(new nlobjSearchColumn('address1', 'custrecord_2663_parent_cust_ref'));
            entityColumns.push(new nlobjSearchColumn('address2', 'custrecord_2663_parent_cust_ref'));
            entityColumns.push(new nlobjSearchColumn('address3', 'custrecord_2663_parent_cust_ref'));
            entityColumns.push(new nlobjSearchColumn('city', 'custrecord_2663_parent_cust_ref'));
            entityColumns.push(new nlobjSearchColumn('zipcode', 'custrecord_2663_parent_cust_ref'));
            entityColumns.push(new nlobjSearchColumn('state', 'custrecord_2663_parent_cust_ref'));
            entityColumns.push(new nlobjSearchColumn('vatregnumber', 'custrecord_2663_parent_cust_ref'));
            entityColumns.push(new nlobjSearchColumn('billcountrycode', 'custrecord_2663_parent_cust_ref'));
            entityColumns.push(new nlobjSearchColumn('billcountry', 'custrecord_2663_parent_cust_ref'));
            entityColumns.push(new nlobjSearchColumn('isperson', 'custrecord_2663_parent_cust_ref'));
            entityColumns.push(new nlobjSearchColumn('companyname', 'custrecord_2663_parent_cust_ref'));
            entityColumns.push(new nlobjSearchColumn('firstname', 'custrecord_2663_parent_cust_ref'));
            entityColumns.push(new nlobjSearchColumn('lastname', 'custrecord_2663_parent_cust_ref'));
            entityColumns.push(new nlobjSearchColumn('accountnumber', 'custrecord_2663_parent_cust_ref'));        
        }


        var entityDetailResults = searchRecord('customrecord_2663_entity_bank_details', null, entityFilters, entityColumns);
        
        return entityDetailResults;
    }
    
    function getVendorPaymentCount(paymentFilter) {
        // The following search retrieve all vendor payments to establish those not created.
        var filters = [];
        var columns = [];

        if (this.GetPaymentFileInfoSrc().getValue('type', 'custrecord_2663_account') == 'Bank') {
            filters.push(new nlobjSearchFilter('type', null, 'anyof', 'CustRfnd'));
            if (paymentFilter == 'entity') {
                filters.push(new nlobjSearchFilter('internalid', 'customer', 'noneof', '@NONE@'));
            }
        }
        else {
            filters.push(new nlobjSearchFilter('type', null, 'anyof', 'VendPymt'));
            if (paymentFilter == 'entity') {
                filters.push(new nlobjSearchFilter('internalid', 'vendor', 'noneof', '@NONE@'));
            }
            else if (paymentFilter == 'employee') {
                filters.push(new nlobjSearchFilter('internalid', 'employee', 'noneof', '@NONE@'));
            }
        }
        filters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
        filters.push(new nlobjSearchFilter('custrecord_2663_eft_file_id', 'custrecord_2663_parent_payment', 'anyof', this.paymentFileInfoSrc.getValue('internalid')));

        columns.push(new nlobjSearchColumn('internalid', null, 'count'));

        //var searchResults = nlapiSearchRecord('transaction', null, filters, columns);
        var searchResults = nlapiSearchRecord('transaction', null, filters, columns);
        var count = 0;
        if (searchResults) {
        	count = searchResults[0].getValue('internalid', null, 'count');
        }
        
        nlapiLogExecution('debug', 'Payment Module Processing -- count (in data)', count);
        return count;
    }
    
    function getCountries() {
    	var companyInfo = nlapiLoadConfiguration('companyinformation');  // 10 points
        var fld = companyInfo.getField('country');
        var countriesFromCompanyInfo = fld.getSelectOptions() || [];	
	
		var dummyFormat = nlapiCreateRecord('customrecord_2663_payment_file_format');  // 2 points
        fld = dummyFormat.getField('custrecord_2663_format_country');
        var countriesFromDummyFormat = fld.getSelectOptions() || [];
        
        var countryCodes = {};
        var countries = {};
        
    	
        countriesFromCompanyInfo.forEach(function(country){
        	countryCodes[country.text] = country.id;
        });
        
        countriesFromDummyFormat.forEach(function(country){
        	countries[country.id] = {};
        	countries[country.id].text = country.text;
        	countries[country.id].code = countryCodes[country.text];
        });
        
        return countries;
    };
    
    function getCustomerPaymentCount() {
        // The following search retrieve all customer payments to establish those not created.
        var filters = [];
        var columns = [];

        filters.push(new nlobjSearchFilter('type', null, 'anyof', 'CustPymt'));
        filters.push(new nlobjSearchFilter('internalid', 'customer', 'noneof', '@NONE@'));
        filters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
        filters.push(new nlobjSearchFilter('custrecord_2663_eft_file_id', 'custrecord_2663_parent_payment', 'anyof', this.paymentFileInfoSrc.getValue('internalid')));

        columns.push(new nlobjSearchColumn('internalid', null, 'count'));

        //var searchResults = nlapiSearchRecord('transaction', null, filters, columns);
        var searchResults = nlapiSearchRecord('transaction', null, filters, columns);
        var count = 0;
        if (searchResults) {
        	count = searchResults[0].getValue('internalid', null, 'count');
        }
        
        nlapiLogExecution('debug', 'Payment Module Processing -- count (in data)', count);
        return count;
    }
    
    /**
    * Get sequence IDs of payment file administration records for the bank account and template type
    *
    *   @param {String}     templateType                - payment template type ("eft" or "dd")
    *   @param {Boolean}    forTodaySequenceOnly        - flag to filter pfa records created for today only (true or false)
    */
    function getPaymentFileSummaryResults (templateType, forTodaySequenceOnly){
        // get internal id of file format
        var templateTypeIds = {'eft': 1, 'dd': 2};
    	var filters = [
	        new nlobjSearchFilter('custrecord_2663_file_processed', null, 'is', PAYPROCESSED),
	        new nlobjSearchFilter('custrecord_2663_bank_account', null, 'is', this.paymentFileInfoSrc.getValue('custrecord_2663_bank_account')),            
	        new nlobjSearchFilter('custrecord_2663_payment_type', null, 'is', templateTypeIds[templateType])
        ];

    	if (forTodaySequenceOnly) {
    		//filter only PFA records created this day
            var currentDate = nlapiStringToDate(this.paymentFileInfoSrc.getValue('custrecord_2663_file_creation_timestamp'));
    		filters.push(new nlobjSearchFilter('custrecord_2663_file_creation_timestamp', null, 'on', nlapiDateToString(currentDate)));	
    	}
    	
    	var columns = [];
		columns.push(new nlobjSearchColumn('custrecord_2663_sequence_id'));
		columns.push(new nlobjSearchColumn('custrecord_2663_file_creation_timestamp').setSort(true));    		
    	
    	var result = nlapiSearchRecord('customrecord_2663_file_admin', null, filters, columns) || [];
        
        return result;
    }
    
    /**
    * Gets account currencies 
    *   - based on _2663.Currency
    *
    * @returns {returnObj}      - contains the currencies and its type
    */
    function getCurrencies() {
        
        var multiCurrencyOn = isMultiCurrency();
        var baseCurrencyId = '1';
        var returnObj = {};
        
        
        // Only when Multiple Currencies is enabled are the ff. possible:
        // - nlapiSearchRecord('currency')
        // - nlapiLoadConfiguration('companyinformation').getFieldValue('basecurrency')
        if (multiCurrencyOn) {
            var columns = [new nlobjSearchColumn('symbol'), new nlobjSearchColumn('name')];
            var result = nlapiSearchRecord('currency', null, null, columns) || [];
            returnObj.type = "search";
            returnObj.currency = result;            
        } 
        else {
            var record = nlapiLoadRecord('currency', baseCurrencyId) || '';
            returnObj.type = "record";
            returnObj.currency = record;
        }
        
        return returnObj;
    } 

    /**
    * Gets country code function to be appended in FreeMarker template library    
    *
    * @returns {String}      - country code function with FreeMarker syntax
    */
    function getCountryCodeFunc() {
        
        var strGetCountryCodeFunc = '';
        strGetCountryCodeFunc += '<#function getCountryCode (country)>' + '\n';
        strGetCountryCodeFunc += '      <#assign _2663_countryCodes = {} >' + '\n';        
        var countries = this.GetCountries();        
        for (var key in countries){
            strGetCountryCodeFunc += '      <#assign _2663_countryCodes = _2663_countryCodes + {"' + countries[key].text + '":"' + countries[key].code + '"} >' + '\n';
        }        
        strGetCountryCodeFunc += '      <#return _2663_countryCodes[country]>' + '\n';
        strGetCountryCodeFunc += '</#function>' + '\n';
        
        return strGetCountryCodeFunc;
    }    
    
    /**
    * Gets getStateCode function to be appended in FreeMarker template library    
    *
    * @returns {String}      - getStateCode with FreeMarker syntax
    */
    function getStateCodeFunc() {
        
        var companyInfo = nlapiLoadConfiguration('companyinformation');  // 10 points
        var fld = companyInfo.getField('dropdownstate');
        var statesFromCompanyInfo = fld.getSelectOptions() || [];
        
        var strGetStateCodeFunc = '';
        strGetStateCodeFunc += '<#function getStateCode (state)>' + '\n';
        strGetStateCodeFunc += '      <#assign _2663_stateCodes = {} >' + '\n';
        for (var i = 0, ii = statesFromCompanyInfo.length; i < ii; i++){
            var state = statesFromCompanyInfo[i];
            strGetStateCodeFunc += '      <#assign _2663_stateCodes = _2663_stateCodes + {"' + state.text + '":"' + state.id + '"} >' + '\n';
        }        
        strGetStateCodeFunc += '      <#return _2663_stateCodes[state]>' + '\n';
        strGetStateCodeFunc += '</#function>' + '\n';
        
        return strGetStateCodeFunc;
    }

    /**
    * Retrieves get amount function to be appended in FreeMarker template library    
    *
    * @param    {String}    templateType    - format template type
    * @returns  {String}                    - getAmount function with FreeMarker syntax
    */
    function getAmountFunc(templateType) {

        // check if multicurrency feature is enabled to determine foreign amount
        var companyFeatures = nlapiLoadConfiguration('companyfeatures');
        var foreignAmount = companyFeatures.getFieldValue('multicurrency') == 'T' ? "payment.fxamount" : "\"\"";
        
        // compare base currency and bank currency to determine which amount to retrieve
        var companyInfo = nlapiLoadConfiguration('companyinformation');
        var baseCurrency = isOneWorld() ? this.GetBankDetailSrc(templateType).getValue('currency', 'custrecord_2663_subsidiary') : companyInfo.getFieldValue('basecurrency');
        var bankCurrency = this.GetBankDetailSrc(templateType).getValue('custrecord_2663_currency');        
        var exchangeRates = this.GetPaymentFileInfoSrc().getValue('custrecord_2663_exchange_rates');        
        var sameBaseAndBankCurrency = exchangeRates && (baseCurrency == bankCurrency) ? 'true' : 'false';
        
        // build FreeMarker getAmount function
        var strGetAmountFunc = '';
        strGetAmountFunc += '<#function getAmount (payment, multiCurrency=false)>' + '\n';     
        strGetAmountFunc += '   <#assign _2663_sameBaseAndBankCurrency = ' + sameBaseAndBankCurrency + '>' + '\n';
        strGetAmountFunc += '   <#assign _2663_amountValue = payment.amount>' + '\n';
        strGetAmountFunc += '   <#assign _2663_foreignAmount = ' + foreignAmount + '>' + '\n';
        strGetAmountFunc += '   <#if multiCurrency && _2663_sameBaseAndBankCurrency>' + '\n';
        strGetAmountFunc += '       <#assign _2663_foreignAmount = payment.formulacurrency>' + '\n';
        strGetAmountFunc += '   </#if>' + '\n';
        strGetAmountFunc += '   <#if _2663_foreignAmount?has_content>' + '\n';
        strGetAmountFunc += '       <#assign _2663_amountValue = _2663_foreignAmount>' + '\n';
        strGetAmountFunc += '   </#if>' + '\n';
        strGetAmountFunc += '   <#if (_2663_amountValue < 0) >' + '\n';
        strGetAmountFunc += '       <#assign _2663_amountValue = _2663_amountValue * -1 >' + '\n';
        strGetAmountFunc += '   </#if>' + '\n';
        strGetAmountFunc += '   <#return _2663_amountValue>' + '\n';
        strGetAmountFunc += '</#function>' + '\n';

        return strGetAmountFunc;
    }    

    /**
    * Retrieves get compute total amount function to be appended in FreeMarker template library    
    * 
    * @param    {Array}   	payments   		- list of payments
    * @param    {Boolean}   multiCurrency   - if template is multi-currency  
    * @returns  {String}                    - get compute total amount function with FreeMarker syntax
    */
    function getComputeTotalAmountFunc() {
    
        var strGetComputeTotalAmountFunc = '';
        strGetComputeTotalAmountFunc += '<#function computeTotalAmount payments, multiCurrency=false>' + '\n';                
        strGetComputeTotalAmountFunc += '    <#assign _2663_total = 0>' + '\n';                
        strGetComputeTotalAmountFunc += '    <#list payments as payment>' + '\n';                
        strGetComputeTotalAmountFunc += '        <#assign _2663_total = _2663_total + getAmount(payment, multiCurrency)>' + '\n';                
        strGetComputeTotalAmountFunc += '    </#list>' + '\n';                
        strGetComputeTotalAmountFunc += '    <#return _2663_total>' + '\n';                
        strGetComputeTotalAmountFunc += '</#function>' + '\n';                

        return strGetComputeTotalAmountFunc;
    }     
    
    /**
    * Exclude applied credits from list of transactions to be processed
    *
    */
    function excludeAppliedCredits(){
        if (this.paymentFileInfoSrc) {
            // remove negative amounts and corresponding ids
            var isCreditIncluded = false;
            if (this.paymentAmtList.length > 0 && this.appliedCreditsList.length > 0){
                var i = 0;
                while (i < this.paymentAmtList.length){
                    var amount = this.paymentAmtList[i] * 1;                    
                    var paymentId = this.paymentIdList[i].substring(0,this.paymentIdList[i].indexOf('-'));                    
                    if (amount < 0 && this.appliedCreditsList.indexOf(paymentId) > -1){
                        this.paymentAmtList.splice(i,1);
                        this.paymentDiscList.splice(i,1);
                        this.paymentIdList.splice(i,1);                        
                        isCreditIncluded = true;
                    }
                    else {
                        i++;
                    }
                }
            }
                    
            if (isCreditIncluded){           
                // update PFA fields
                var pfaId = this.paymentFileInfoSrc.id;
                var fieldList = ['custrecord_2663_payments_for_process_id','custrecord_2663_payments_for_process_amt','custrecord_2663_payments_for_process_dis'];
                var valueList = [JSON.stringify(this.paymentIdList),JSON.stringify(this.paymentAmtList),JSON.stringify(this.paymentDiscList)];
                nlapiSubmitField('customrecord_2663_file_admin', pfaId, fieldList, valueList);
            }
        }
    }
    
    // functions for checking state processing
	this.GetFileListDescendingOrder = getFileListDescendingOrder;

	// functions for data source fields
    this.SetupPaymentFileInfoSrc = setupPaymentFileInfoSrc;
    this.GetPaymentFileInfoSrc = getPaymentFileInfoSrc;
    this.GetBankDetailSrc = getBankDetailSrc;
    this.GetEntityFieldValue = getEntityFieldValueV2;
    this.GetEntityFieldText = getEntityFieldText;
    this.GetReferenceFieldValue = getReferenceFieldValue;
    this.GetVendorPayments = getVendorPayments;
	this.SetupEntityDetailList = setupEntityDetailList;
	this.GetCustomerPayments = getCustomerPayments;
	this.GetVendorPaymentCount = getVendorPaymentCount;
	this.GetCustomerPaymentCount = getCustomerPaymentCount;
	this.InitializeAppliedToTransactionList = initializeAppliedToTransactionList;
	this.GetAppliedToTransactionCount = getAppliedToTransactionCount;
	this.GetAppliedToTransactionList = getAppliedToTransactionList;
	this.GetChecks = getChecks;
	this.GetCountries = getCountries;
	this.GetCustomerRefunds = getCustomerRefunds;
    this.GetEntityDetails = getEntityDetails;
	this.GetEntityBankDetails = getEntityBankDetails;
	this.GetCustomerBankDetails = getCustomerBankDetails;
	this.GetCustomerRefundBankDetails = getCustomerRefundBankDetails;
	this.GetPaymentFileSummaryResults = getPaymentFileSummaryResults;
	this.GetCurrencies = getCurrencies;
    
    // functions for FreeMarker
    this.GetCountryCodeFunc = getCountryCodeFunc;
    this.GetAmountFunc = getAmountFunc;
    this.GetComputeTotalAmountFunc = getComputeTotalAmountFunc;
    this.GetStateCodeFunc = getStateCodeFunc;
    
    // functions for handling of credits
    this.GetAppliedCreditsList = getAppliedCreditsList;
    this.SetAppliedCreditsList = setAppliedCreditsList;
    this.GetAppliedCreditsAmtList = getAppliedCreditsAmtList;
    this.SetAppliedCreditsAmtList = setAppliedCreditsAmtList;
    this.ExcludeAppliedCredits = excludeAppliedCredits;
	
    // saved searches for payment processing
    this.GetPaymentIdList = getPaymentIdList;
    this.GetPaymentAmtList = getPaymentAmtList;
    this.GetPaymentDiscList = getPaymentDiscList;

	// functions for jumplet
	this.GetUnprocessedFileList = getUnprocessedFileList;
	this.GetPaymentReversalRecord = getPaymentReversalRecord;
	this.GetDeleteFileRecord = getDeleteFileRecord;
	this.GetPaymentReprocessRecord = getPaymentReprocessRecord;
    this.GetPaymentNotifyRecord = getPaymentNotifyRecord;
};
