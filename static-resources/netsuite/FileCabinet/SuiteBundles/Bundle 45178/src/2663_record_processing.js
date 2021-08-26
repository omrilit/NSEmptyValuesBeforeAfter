/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * @author jseego
 *
 */

/**
 * Revision History:
 *
 * Date        Fixed Issue    Broken in QA Bundle     Issue Fix Summary
 * =============================================================================================
 * 2013/09/27  255091 		  3.00.00				  Initial version
 * 2013/11/07  267045 		  3.00.00				  Reset reference amended field to 'No Changes' after a payment is made
 *                                                    Refactor -- remove unused variables and duplicate searches, improve code readability
 * 2013/11/08  268886 		  3.00.1.2013.11.14.1     Update logic to always use the latest updated reference amended as basis for restore
 * 2013/12/12  256855 		  3.00.00     			  Add support for SEPA Direct Debit (CBI)
 * 2014/10/07  308888         4.00.3                  Enable Entity Bank Detail updates when Payment File Format field Update Entity Bank Details is checked
 */

var _2663 = _2663 || {};

_2663.RecordProcessor = function RecordProcessor(pfaRecId) {

    var arrPfaUpdatedRecords = null;
    var arrEntityIds = null
    var arrEntityBankResults = null;
    var paymentFileTemplate = null;
    var searchPfaResults = null;
    var paymentFileInfoSrc = null;
    var isUpdateEnabled = false;
    
    initialize();

    /**
     * Returns the update type for the entity
     *      - COUNT     - if update transaction count will be done
     *      - RECORD    - if update/restore of record will be done
     *      - <empty>   - update record feature is disabled
     *
     * @param   {String}    entityId
     * @returns {String}
     */
    function getUpdateType(entityId){
        if (arrPfaUpdatedRecords){
            if (getEntityIndex(entityId) > -1){
                return 'COUNT';
            }
            return 'RECORD';
        }
        return '';
    }

    /**
     * Updates a record, depending on the payment file template
     *
     * @param   {String}    entityId
     */
    function updateRecord(entityId){

        if (arrPfaUpdatedRecords && paymentFileTemplate && isUpdateEnabled){

            var entityIndex = getEntityIndex(entityId);

            //update a record which is not processed yet
            if (entityIndex == -1){

            	//search for entity bank record and update the fields

            	var arrFilters = [];

            	// parent should by the current entity being processed
            	arrFilters.push(new nlobjSearchFilter('internalid', 'custrecord_2663_parent_customer', 'is', entityId));

            	// parent should have direct debit box checked
            	arrFilters.push(new nlobjSearchFilter('custentity_2663_direct_debit', 'custrecord_2663_parent_customer', 'is', 'T'));

            	// entity bank should be primary
            	arrFilters.push(new nlobjSearchFilter('custrecord_2663_entity_bank_type', null, 'anyof', '1'));

            	var arrColumns = [];
            	arrColumns.push(new nlobjSearchColumn('custrecord_2663_entity_billing_seq_type'));
            	arrColumns.push(new nlobjSearchColumn('custrecord_2663_num_payments'));
            	arrColumns.push(new nlobjSearchColumn('custrecord_2663_entity_ref_amended'));

            	var result = nlapiSearchRecord('customrecord_2663_entity_bank_details',null,arrFilters,arrColumns);
            	if (result && result[0]){

            		var entityBankDetail = result[0];

            		//get entity bank details
            		var entityBankId = entityBankDetail.getId();
            		var sequenceType = entityBankDetail.getText('custrecord_2663_entity_billing_seq_type');
            		var sequenceTypeValue = entityBankDetail.getValue('custrecord_2663_entity_billing_seq_type');
            		var numPayments = entityBankDetail.getValue('custrecord_2663_num_payments');
            		var refAmendedValue = entityBankDetail.getValue('custrecord_2663_entity_ref_amended');

            		//determine new record values
            		var newSequenceType = null;
            		var newFirstPayDate = null;
            		var newFinalPayDate = null;
            		var newNumPayments = null;
            		switch (sequenceType){
            		case 'FRST':
            			newFirstPayDate = nlapiDateToString(new Date());
            			newSequenceType = BILL_SEQ_RCUR;                            
            			break;
            		case 'FNAL':
            		case 'OOFF':                            
            			newFinalPayDate = nlapiDateToString(new Date());
            			break;
            		}
            		newNumPayments = (numPayments) ? (parseInt(numPayments) + 1) : '1' ;
            		newNumPayments += '';

            		//submit the new field values
            		var arrFieldIds = [];
            		var arrFieldValues = [];
            		if (newSequenceType){
            			arrFieldIds.push('custrecord_2663_entity_billing_seq_type');
            			arrFieldValues.push(newSequenceType);
            		}
            		if (newFirstPayDate){
            			arrFieldIds.push('custrecord_2663_first_pay_date');
            			arrFieldValues.push(newFirstPayDate);
            		}
            		if (newFinalPayDate){
            			arrFieldIds.push('custrecord_2663_final_pay_date');
            			arrFieldValues.push(newFinalPayDate);
            		}
            		if (newNumPayments){
            			arrFieldIds.push('custrecord_2663_num_payments');
            			arrFieldValues.push(newNumPayments);
            		}

            		//save the original reference amended
            		arrFieldIds.push('custrecord_2663_customer_code');
            		arrFieldValues.push(refAmendedValue);

            		//set reference amended to no changes
            		arrFieldIds.push('custrecord_2663_entity_ref_amended');
            		arrFieldValues.push(AMEND_NONE);

            		nlapiSubmitField('customrecord_2663_entity_bank_details', entityBankId, arrFieldIds, arrFieldValues);

            		//update the list of updated records
            		var objEntity = {};
            		objEntity.id = entityId || '';
            		objEntity.bankId = entityBankId || '';
            		objEntity.oldSeqTypeValue = sequenceTypeValue || '';
            		objEntity.transCount = 1;

            		arrPfaUpdatedRecords.push(JSON.stringify(objEntity));
            		nlapiSubmitField('customrecord_2663_file_admin',pfaRecId,'custrecord_2663_updated_entities',arrPfaUpdatedRecords.join('|'));

            	}

            }

            //update transaction count for the record
            else{

            	var objEntity = JSON.parse(arrPfaUpdatedRecords[entityIndex]);
            	var count = parseInt(objEntity.transCount);
            	objEntity.transCount = ++count;
            	arrPfaUpdatedRecords[entityIndex] = JSON.stringify(objEntity);
            	nlapiSubmitField('customrecord_2663_file_admin',pfaRecId,'custrecord_2663_updated_entities',arrPfaUpdatedRecords.join('|'));

            }

        }
    }

    /**
     * Restores record data that were updated during payment file processing
     *
     * @param   {String}    entityId
     */
    function restoreRecord(entityId){

        if (arrPfaUpdatedRecords && paymentFileTemplate && isUpdateEnabled){

            var entityIndex = getEntityIndex(entityId);
            if (entityIndex > -1){

                var transactionCount = getTransactionCount(entityId);
                var objEntity = JSON.parse(arrPfaUpdatedRecords[entityIndex]);

                //update the record transaction count
                if (transactionCount > 1){
                	var count = parseInt(objEntity.transCount);
                	objEntity.transCount = --count;
                	arrPfaUpdatedRecords[entityIndex] = JSON.stringify(objEntity);
                	nlapiSubmitField('customrecord_2663_file_admin',pfaRecId,'custrecord_2663_updated_entities',arrPfaUpdatedRecords.join('|'));
                }

                //restore the record data
                else {
                	//get current values
                	var seqTypeValue = null;
                	var numPayments = null;
                	var firstPaymentDate = null;
                	var origRefAmendValue = '';
                	for (var i = 0, ii = arrEntityBankResults.length; i < ii; i++){
                		var entityBank = arrEntityBankResults[i];
                		if (entityBank.getValue('internalid', 'custrecord_2663_parent_customer') == entityId){
                			seqTypeValue = entityBank.getValue('custrecord_2663_entity_billing_seq_type');
                			numPayments = entityBank.getValue('custrecord_2663_num_payments');
                			numPayments = (numPayments) ? parseInt(numPayments) : 0;
                			firstPaymentDate = entityBank.getValue('custrecord_2663_first_pay_date');
                			origRefAmendValue = entityBank.getValue('custrecord_2663_customer_code');
                			break;
                		}
                	}

                	//Note: the presence of a firstPaymentDate means that the initial billing sequence type of the entity bank is BILL_SEQ_FRST
                	var restoreSeqType = (seqTypeValue != BILL_SEQ_RCUR) ? seqTypeValue :
                		(firstPaymentDate && (numPayments == 1)) ? BILL_SEQ_FRST : BILL_SEQ_RCUR;
                	var restoreFirstPayDate = (numPayments == 1) ? '' : firstPaymentDate;
                	var restoreFinalPayDate = '';
                	var restoreNumPayments = (numPayments == 1) ? '' : (numPayments - 1);
                	var restoreRefAmended = origRefAmendValue;

                	//update entity bank record
                	var arrFieldIds = [];
                	arrFieldIds.push('custrecord_2663_entity_billing_seq_type');
                	arrFieldIds.push('custrecord_2663_first_pay_date');
                	arrFieldIds.push('custrecord_2663_final_pay_date');
                	arrFieldIds.push('custrecord_2663_num_payments');
                	var arrFieldValues = [];
                	arrFieldValues.push(restoreSeqType);
                	arrFieldValues.push(restoreFirstPayDate);
                	arrFieldValues.push(restoreFinalPayDate);
                	arrFieldValues.push(restoreNumPayments);
                	arrFieldIds.push('custrecord_2663_entity_ref_amended');
                	arrFieldValues.push(restoreRefAmended);
                	nlapiSubmitField('customrecord_2663_entity_bank_details', objEntity.bankId, arrFieldIds, arrFieldValues);

                	//remove the entity from the list of updated records
                	arrPfaUpdatedRecords.splice(entityIndex,1);
                	nlapiSubmitField('customrecord_2663_file_admin',pfaRecId,'custrecord_2663_updated_entities',arrPfaUpdatedRecords.join('|'));
                }
            }
        }
    }

    //--- private functions ---//

    /**
     * Initializes record processor
     *
     */
    function initialize(){

        //get details of pfa record
        var arrPfaFilters = [];
        arrPfaFilters.push(new nlobjSearchFilter('internalid', null, 'anyof', pfaRecId));
        var arrPfaColumns = [];
        arrPfaColumns.push(new nlobjSearchColumn('custrecord_2663_payment_type'));
        arrPfaColumns.push(new nlobjSearchColumn('custrecord_2663_bank_account'));
        arrPfaColumns.push(new nlobjSearchColumn('custrecord_2663_updated_entities'));
        searchPfaResults = nlapiSearchRecord('customrecord_2663_file_admin',null,arrPfaFilters,arrPfaColumns);
        paymentFileInfoSrc = (searchPfaResults) ? searchPfaResults[0] : null;

        if (paymentFileInfoSrc){
        	//check if update record step is enabled
            var paymentType = paymentFileInfoSrc.getText('custrecord_2663_payment_type');
            if (paymentType == 'DD'){
                var bankAccount = paymentFileInfoSrc.getValue('custrecord_2663_bank_account');
                paymentFileTemplate = nlapiLookupField('customrecord_2663_bank_details',bankAccount,'custrecord_2663_dd_template',true);
                //check if Update Entity Check Box field is ticked
                var templateId = nlapiLookupField('customrecord_2663_bank_details',bankAccount,'custrecord_2663_dd_template');
                isUpdateEnabled = nlapiLookupField('customrecord_2663_payment_file_format',templateId,'custrecord_2663_update_entity_details') == 'T';
            }

            //set up local copy of records data
            if (isUpdateEnabled){
                var updatedRecords = paymentFileInfoSrc.getValue('custrecord_2663_updated_entities') || '';
                arrPfaUpdatedRecords = (updatedRecords) ? updatedRecords.split('|') : [];

                arrEntityIds = [];
                var arrEntityBankIds = [];
                for (var i = 0, ii = arrPfaUpdatedRecords.length; i < ii; i++){
                    var objEntity = JSON.parse(arrPfaUpdatedRecords[i]);
                    arrEntityIds.push(objEntity.id);
                    arrEntityBankIds.push(objEntity.bankId);
                }

                //search for details of entity banks
                if (arrEntityBankIds.length > 0){
                    var arrEntityBankFilters = [];
                    arrEntityBankFilters.push(new nlobjSearchFilter('internalid', null, 'anyof', arrEntityBankIds));
                    var arrEntityBankColumns = [];
                    arrEntityBankColumns.push(new nlobjSearchColumn('internalid', 'custrecord_2663_parent_customer'));
                    arrEntityBankColumns.push(new nlobjSearchColumn('custrecord_2663_entity_billing_seq_type'));
                    arrEntityBankColumns.push(new nlobjSearchColumn('custrecord_2663_num_payments'));
                    arrEntityBankColumns.push(new nlobjSearchColumn('custrecord_2663_first_pay_date'));
                    arrEntityBankColumns.push(new nlobjSearchColumn('custrecord_2663_final_pay_date'));
                    arrEntityBankColumns.push(new nlobjSearchColumn('custrecord_2663_customer_code'));

                    arrEntityBankResults = nlapiSearchRecord('customrecord_2663_entity_bank_details', null, arrEntityBankFilters, arrEntityBankColumns) || '';
                }
            }
        }
    }

    /**
     * Returns the index of the entity from the list of updated records
     *
     * @param   {String}    entityId
     * @returns {Number}
     */
    function getEntityIndex(entityId){
        if (arrPfaUpdatedRecords && paymentFileInfoSrc){
            for (var i = 0, ii = arrPfaUpdatedRecords.length; i < ii; i++){
                var objEntity = JSON.parse(arrPfaUpdatedRecords[i]);
                if (entityId == objEntity.id){
                    return i;
                }
            }
        }
        return -1;
    }

    /**
     * Returns the transaction count of the entity from the list of updated records
     *
     * @param   {String}    entityId
     * @returns {Number}
     */
    function getTransactionCount(entityId){
        if (arrPfaUpdatedRecords && paymentFileInfoSrc){
            for (var i = 0, ii = arrPfaUpdatedRecords.length; i < ii; i++){
                var objEntity = JSON.parse(arrPfaUpdatedRecords[i]);
                if (entityId == objEntity.id){
                    return objEntity.transCount;
                }
            }
        }
        return -1;
    }


    this.getUpdateType = getUpdateType;
    this.updateRecord = updateRecord;
    this.restoreRecord = restoreRecord;

};