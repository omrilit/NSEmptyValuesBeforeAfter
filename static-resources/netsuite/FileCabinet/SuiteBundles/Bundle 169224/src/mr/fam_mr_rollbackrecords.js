/**
 * � 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 *
 * @NScriptName FAM Rollback Script
 * @NScriptId _fam_mr_rollbackrecords
 * @NScriptType mapreducescript
 * @NApiVersion 2.x
*/

define(['../adapter/fam_adapter_runtime',
        '../adapter/fam_adapter_record',
        '../adapter/fam_adapter_task',
        '../util/fam_util_systemsetup',
        '../const/fam_const_customlist'], rollbackRecords);

function rollbackRecords(runtime, record, task, fSetup, fCustomList) {
    function deleteDHR(id){
        log.debug('delete FAM - Depreciation History', 'ID: ' + id);
        
        var dhrRec = record.delete({type: 'customrecord_ncfar_deprhistory', id: id});
        return dhrRec;
    }
    
    function reverseJournal(id, custJrnId){
        log.debug('reverse Journal', 'ID: ' + id);
        var allowCustomTrans = fSetup.getSetting('allowCustomTransaction'),
        recTypeId, revDateId;
        
        /*
         * Change to consider:
         * * This script should not check for allowCustomTrans anymore. Actual journal ID should be
         *   passed instead, specifically for disposal. See implementation done for transfer.
         * 
         */
        
        // Custom Journal
        if (custJrnId) {
            recTypeId = custJrnId;
            revDateId = "custbody_fam_jrn_reversal_date";
        }
        
        // Right now, specifically for Custom Disposal Journal
        else if (allowCustomTrans) {
            recTypeId = "customtransaction_fam_disp_jrn"; 
            revDateId = "custbody_fam_jrn_reversal_date";
        }
        
        // Standard Journal Entry
        else {
            recTypeId = "journalentry";
            revDateId = "reversaldate";
        }

        var jrnRec = record.load({ type : recTypeId, id : id});

        jrnRec.setValue(revDateId, jrnRec.getValue('trandate'));
        jrnRec.save({
            ignoreMandatoryFields: true
        });
        
        return jrnRec;
    }
    
    function updateRecord(rectype, data){
        log.debug('updateRecord - ' + rectype, data.id);
        
        return record.submitFields({
            type : rectype,
            id : data.id,
            values : data.fldval,
            options : { enableSourcing : true }
        });
    }
    
    return {
        getInputData: function getInputData() {
            
            var i, procRec = this.loadProcessInstance(),
                procName = procRec.getValue('custrecord_far_proins_processname'),
                rollbackData = JSON.parse(procRec.getValue('custrecord_fam_proins_rollbackdata')||'{}');
                rollbackRec = [];

            log.debug('Processing Start', procName + ' (' + procRec.id + ')');
            
            if(JSON.stringify(rollbackData)!=='{}'){
                procRec.setValue('custrecord_far_proins_procstatus', 
                        fCustomList.BGProcessStatus.Reverting); //in-progress
                procRec.save();
                
                for (var type in rollbackData){
                    switch (type) {
                        case 'j'   :
                                for(i = 0; i < rollbackData.j.length; i ++)
                                    rollbackRec.push({'j': rollbackData.j[i]});
                                break;
                        case 'tranj'   :
                            for(i = 0; i < rollbackData.tranj.length; i ++)
                                rollbackRec.push(
                                    {'tranj': rollbackData.tranj[i]});
                            break;
                        case 'h'   :
                                for(i = 0; i < rollbackData.h.length; i ++)
                                    rollbackRec.push({'h': rollbackData.h[i]});
                                break;
                        case 'a' :
                                for(var element in rollbackData.a)
                                    rollbackRec.push({'a': {id     : element,
                                                            fldval : rollbackData.a[element]}});
                                break;
                        case 't'   :
                                for(var element in rollbackData.t)
                                    rollbackRec.push({'t': {id     : element,
                                                            fldval : rollbackData.t[element]}});
                                break;
                        case 'invErr'  :
                                procRec.setValue('custrecord_far_proins_procstatus', 
                                                 fCustomList.BGProcessStatus.CompletedError);
                                break;
                        default      :                                
                                for(i = 0; i < rollbackData[type].length; i ++){
                                    var rollbackObj = {};
                                    rollbackObj[type] = rollbackData[type][i];
                                    rollbackRec.push(rollbackObj);
                                }
                                break;
                    }
                }
            }
            return rollbackRec;
        },
        
        map: function map(context) {
            log.debug('map parameters', 'key: ' + context.key + ' | value: ' + context.value);
            
            /**
             * TODO: All FAM transactions should use actual journal record id as key
             */
            var CUSTOM_JOURNAL_ID_MAP = {
               "tranj" : "customtransaction_fam_transfer_jrn"
            }
            
            var procRec = this.loadProcessInstance(), 
                procStatus,
                contextVal = JSON.parse(context.value);
            try{
                for(var e in contextVal){
                    switch (e) {
                        case 'j'   :
                        case 'journalentry' :
                                reverseJournal(contextVal[e]);
                                break;
                        case 'tranj':
                                reverseJournal(contextVal[e], CUSTOM_JOURNAL_ID_MAP[e]);
                                break;
                        case 'h'   :
                                deleteDHR(contextVal[e]);
                                break;
                        case 'a' :
                                updateRecord('customrecord_ncfar_asset', contextVal[e]);
                                break;
                        case 't'   :
                                updateRecord('customrecord_ncfar_altdepreciation', contextVal[e]);
                                break;
                        default  :
                                reverseJournal(contextVal[e], e);
                                break;
                    }
                }
                
            }catch(ex){
                
               log.error('Rollback Error', ex.toString());
               
               var logRec = record.create({ type : 'customrecord_bg_proclog'});
               logRec.setValue('custrecord_far_prolog_procinstance', procRec.getValue('id'));
               logRec.setValue('custrecord_far_prolog_type', fCustomList.BGLogMessageType.Error);
               logRec.setValue('custrecord_far_prolog_msg', ex.toString());
               logRec.save();
               
               procStatus = procRec.getValue('custrecord_far_proins_procstatus');
               if(procStatus == fCustomList.BGProcessStatus.Reverting){
                   procRec.setValue('custrecord_far_proins_procstatus', 
                                    fCustomList.BGProcessStatus.Failed);
                   procRec.save();
               }
            }
        },
        
        summarize: function summarize(summary) {
            log.debug('Summarize','Start');
            var procRec = this.loadProcessInstance(),
                procStatus = procRec.getValue('custrecord_far_proins_procstatus'),
                recFailed = procRec.getValue('custrecord_fam_proins_recfailed'),
                schedTask = task.create({ taskType : task.getTaskType().SCHEDULED_SCRIPT});

            if(procStatus == fCustomList.BGProcessStatus.Reverting){
                procRec.setValue('custrecord_far_proins_procstatus', 
                                 fCustomList.BGProcessStatus.CompletedError); 
            }
            else if(procStatus == fCustomList.BGProcessStatus.InProgress){
                if (recFailed === 0) {
                    procRec.setValue('custrecord_far_proins_procstatus', 
                        fCustomList.BGProcessStatus.Completed); 
                }
                else {
                    procRec.setValue('custrecord_far_proins_procstatus', 
                        fCustomList.BGProcessStatus.CompletedError);
                }
            }
            procRec.save();
            
            schedTask.scriptId = 'customscript_fam_bgp_ss';
            schedTask.submit();
        },
        
        loadProcessInstance: function loadProcessInstance() {
            var scriptObj = runtime.getCurrentScript(),
                procId = scriptObj.getParameter({ name : 'custscript_fam_mr_rollbackrecords_bgp'});
            
            return record.load({ type : 'customrecord_bg_procinstance', id : procId});
        }
    };
}
