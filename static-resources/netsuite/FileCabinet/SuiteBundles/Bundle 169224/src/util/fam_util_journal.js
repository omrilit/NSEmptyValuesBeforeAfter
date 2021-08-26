/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.x
*/

define([
        "../adapter/fam_adapter_record",
        "../adapter/fam_adapter_format",
        "../adapter/fam_adapter_config",
        "../adapter/fam_adapter_runtime",
        "../adapter/fam_adapter_error",
        "../const/fam_const_customlist",
        "./fam_util_currency",
        "./fam_util_math",
        "./fam_util_systemsetup",
        "./fam_util_translator",
], 

function (record, format, config, runtime, error, 
          constList, utilCurrency, utilMath, utilSetup, utilTranslator){
    return {
        createJournalEntry : function(obj) {
            var allowCustomTrans = utilSetup.getSetting("allowCustomTransaction");
            var currPrcn = 2; // Default to 2
            var journalId;
            
            //NOTE: obj.type is the transaction type id
            journalRec = obj.type? obj.type : record.getType().JOURNAL_ENTRY;
            var JE = record.create({
                type:journalRec,
                isDynamic : true
            });
            var journalId, 
                tempCId = '', 
                tempDId = '', 
                tempLId = '';
            
            if (obj.postingperiod) {
                JE.setValue({
                    fieldId :'postingperiod',
                    value   : obj.postingperiod
                });
            }
            
            if(runtime.isFeatureInEffect({feature :'SUBSIDIARIES'}) && obj.subId){
                JE.setValue({
                    fieldId :'subsidiary',
                    value   : obj.subId
                });
            }
            
            if(obj.trnDate) {
                if (obj.trnDate instanceof Date) {
                    JE.setValue({
                        fieldId :'trandate',
                        value   : obj.trnDate
                    });
                }
                else {
                    var tranDate = format.parse({
                        value: obj.trnDate,
                        type: format.getType().DATE
                    });
                    JE.setValue({
                        fieldId :'trandate',
                        value   : tranDate
                    });
                }
            }

            if( (obj.currId != '') && (obj.currId) && runtime.isFeatureInEffect({feature :'MULTICURRENCY'})){
                JE.setValue({
                    fieldId :'currency',
                    value   : obj.currId.toString()
                });
                JE.setValue({
                    fieldId :'exchangerate',
                    value   : obj.exchangeRate || '1'
                });
                
                currPrcn = utilCurrency.getPrecision(obj.currId);
            }

            if (!Array.isArray(obj.classId)) {
                JE.setValue({
                    fieldId :'class',
                    value   : obj.classId
                });
            }
            if (!Array.isArray(obj.deptId)) {
                JE.setValue({
                    fieldId :'department',
                    value   : obj.deptId
                });
            }
            if (!Array.isArray(obj.locId)) {
                JE.setValue({
                    fieldId :'location',
                    value   : obj.locId
                });
            }
            
            JE.setValue({
                fieldId :'bookje',
                value   : 'T' //causes unexpected error when set to true; cannot verify if checkbox or not
            });
            JE.setValue({
                fieldId :'accountingbook',
                value   : obj.bookId || 1
            });
            JE.setValue({
                fieldId :'generatetranidonsave',
                value   : true
            });
            
            if (obj.isReversal) {
                JE.setValue({
                    fieldId :'custbody_fam_jrn_is_reversal',
                    value   : obj.isReversal
                });
            }
            
            if (obj.reversalNo) {
                JE.setValue({
                    fieldId :'custbody_fam_jrn_reversal_no',
                    value   : obj.reversalNo
                });
            }
                    
            if (obj.reversalDate) {
                JE.setValue({
                    fieldId :'custbody_fam_jrn_reversal_date',
                    value   : obj.reversalDate
                });
            }
            
            // Check Journal Permission
            var permit = obj.permit || 0;
            var requireApproval = config.load({
                    type: config.getType().ACCOUNTING_PREFERENCES
                }).getValue({
                    fieldId : 'JOURNALAPPROVALS'
                });                
            var fieldName = allowCustomTrans ? 'transtatus' : 'approved';
            var approvedValue = allowCustomTrans ? constList.CustomTransactionStatus['Approved'] : true;
            var pendingValue = allowCustomTrans ? constList.CustomTransactionStatus['Pending Approval'] : false;

            if (obj.alwaysApproved || !requireApproval || +permit > constList.Permissions.Create) {
                JE.setValue({
                    fieldId : fieldName,
                    value   : approvedValue
                });
            }
            else {
                JE.setValue({
                    fieldId : fieldName,
                    value   : pendingValue
                });
            }
            
            // validate accounts & amounts
            if (obj.accts.length === 0) {
                throw error.create({
                    name: 'NCFAR_JOURNALERROR',
                    message: utilTranslator.getString('custpage_accounts_missing'),
                    notifyOff: true
                });
            }
            
            if (obj.debitAmts.length === 0 && obj.creditAmts.length === 0){
                throw error.create({
                    name: 'NCFAR_JOURNALERROR',
                    message: utilTranslator.getString('custpage_amounts_missing'),
                    notifyOff: true
                });
            }
            
            for(var n=0; n<obj.accts.length; ++n){
                if( obj.accts[n] == null ){
                    throw error.create({
                        name: 'NCFAR_JOURNALERROR',
                        message: utilTranslator.getString('custpage_accounts_missing'),
                        notifyOff: true
                    });
                }
                
                if ( obj.debitAmts[n] == null && obj.creditAmts[n] == null){
                    throw error.create({
                        name: 'NCFAR_JOURNALERROR',
                        message: utilTranslator.getString('custpage_amounts_missing'),
                        notifyOff: true
                    });
                }
            }
            
            // line counter
            for(var i=0, j=1; i<obj.accts.length; ++i){
                var debitAmts = utilMath.roundByPrecision(obj.debitAmts[i], currPrcn).toString() || "0";
                var creditAmts = utilMath.roundByPrecision(obj.creditAmts[i], currPrcn).toString() || "0";
                
                JE.selectNewLine({
                    sublistId : 'line'
                });
                
                JE.setCurrentSublistValue({
                    sublistId   : 'line', 
                    fieldId     : 'account', 
                    value       : +obj.accts[i]
                });
                
                JE.setCurrentSublistValue({
                    sublistId   : 'line', 
                    fieldId     : 'debit', 
                    value       : debitAmts
                });
                JE.setCurrentSublistValue({
                    sublistId   : 'line', 
                    fieldId     : 'origdebit', 
                    value       : debitAmts
                });
                JE.setCurrentSublistValue({
                    sublistId   : 'line', 
                    fieldId     : 'credit', 
                    value       : creditAmts
                });
                JE.setCurrentSublistValue({
                    sublistId   : 'line', 
                    fieldId     : 'origcredit', 
                    value       : creditAmts
                });
                
                if( obj.currId != null ){
                    JE.setCurrentSublistValue({
                        sublistId   : 'line', 
                        fieldId     : 'account_cur', 
                        value       : obj.currId.toString()
                    });
                    JE.setCurrentSublistValue({
                        sublistId   : 'line', 
                        fieldId     : 'account_cur_isbase', 
                        value       : true
                    });
                    JE.setCurrentSublistValue({
                        sublistId   : 'line', 
                        fieldId     : 'account_cur_fx', 
                        value       : false
                    });
                }
                
                if (obj.entities[i] != null){
                    JE.setCurrentSublistValue({
                        sublistId   : 'line', 
                        fieldId     : 'entity', 
                        value       : +obj.entities[i]
                    });
                }
                JE.setCurrentSublistValue({
                    sublistId   : 'line', 
                    fieldId     : 'memo', 
                    value       : obj.ref[i].toString()
                });

                // need to allow Class, Department and Location to be single value (same for all rows) or per row, i.e. string or array
                if (obj.classId) {
                    if (Array.isArray(obj.classId)) {
                        tempCId = obj.classId[i];
                    }
                    else {
                        tempCId = obj.classId;
                    }
                    JE.setCurrentSublistValue({
                        sublistId   : 'line', 
                        fieldId     : 'class', 
                        value       : tempCId
                    });
                }

                if (obj.deptId) {
                    if (Array.isArray(obj.deptId)) {
                        tempDId = obj.deptId[i];
                    }
                    else {
                        tempDId = obj.deptId;
                    }
                    JE.setCurrentSublistValue({
                        sublistId   : 'line', 
                        fieldId     : 'department', 
                        value       : tempDId
                    });
                }

                if (obj.locId) {
                    if (Array.isArray(obj.locId)) {
                        tempLId = obj.locId[i];
                    }
                    else {
                        tempLId = obj.locId;
                    }
                    JE.setCurrentSublistValue({
                        sublistId   : 'line', 
                        fieldId     : 'location', 
                        value       : tempLId
                    });
                }
                
                JE.commitLine({
                    sublistId:'line'
                });
                
                ++j;
            }
            
            try{
                journalId = JE.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });
            }
            catch(e){
                throw e;
            }
            
            return journalId;
        }
    }
});