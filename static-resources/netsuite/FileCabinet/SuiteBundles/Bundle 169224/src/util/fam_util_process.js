/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
**/
define([
    '../adapter/fam_adapter_https',
    '../adapter/fam_adapter_record',		
    '../adapter/fam_adapter_search',
    '../adapter/fam_adapter_task',
    '../adapter/fam_adapter_url',
    '../const/fam_const_customlist',
    '../dict/fam_dict',
    '../record/fam_record_process',
    '../util/fam_util_log'
], utilProcess);

function utilProcess(https, record, search, task, url, fConst, dictProc, recProc, fLog) {
    var module = {
        Record: {},     // FPR record object
        Stage: {},      // Object used by sub-processes
        Producer: {},   // Object used to initialize processes
        Control: {},    // Object used to trigger process manager
        StateValues: {  // Object used to manage state values per stage
            STATEVAL_MAX_LENGTH: 1000000
        } 
    };
    
    const FPR_RECTYPE = 'customrecord_fam_process';
    
    module.Record.create = function(options) {
        var recId = null;
        
        if (options && options.procId) {
            try {
                var rec = record.create({type : FPR_RECTYPE});
                var procRec = new recProc(rec);
                
                procRec.setValue('procId', options.procId);
                
                if (options.stateValues) {
                    procRec.setValue('stateValues', options.stateValues);
                }
                if (options.params) {
                    var params = typeof options.params === 'object' ?
                        JSON.stringify(options.params) : options.params;
                        
                    procRec.setValue('params', params);
                }
                
                recId = procRec.save();
            }
            catch(ex) {
                fLog.error('process util create fpr', 'error occurred: ' + JSON.stringify(ex));
            }
        }
        
        return recId;
    };
    
    module.Record.getValue = function(options) {
        var value = null;
        
        if (options && options.fprId && options.column) {
            try {
                var lookupRes = search.lookupFields({
                    type: 'customrecord_fam_process',
                    id: options.fprId,
                    columns: [options.column]
                });
                if (lookupRes) {
                    value = lookupRes[options.column];
                }
            } catch(ex) {
                fLog.error('process util getValue', 'error occurred: ' + JSON.stringify(ex));
            }
        }
        
        return value;
    };
    
    //////////////////////
    // Stage functions
    //////////////////////
    /**
     * Sets the current stage status to In-Progress
     * 
     * @param {Object} options - Id of sub-process to start
     * @returns {Integer} recId or null
     */
    module.Stage.start = function(options) {
        var recId = null;
        if (options && options.fprId) {
            try {
                var rec = record.load({
                    type: FPR_RECTYPE, 
                    id: options.fprId
                });
                var procRec = new recProc(rec);
                
                procRec.setValue('currStageStatus', fConst.ProcStageStatus.InProgress);
                module.StateValues.update({ status: fConst.ProcStageStatus.InProgress, start: module.StateValues.getTimestamp() }, procRec);
                
                recId = procRec.save();
                fLog.debug('start process fpr', recId);
            }
            catch(ex) {
                fLog.error('process util start', 'error occurred: ' + JSON.stringify(ex));
            }
        }
        return recId;
    };
    
    /**
     * Sets the current stage status to Completed and sets parameters if specified
     * 
     * @param {Object} options - Id of sub-process to end
     * @returns {Integer} recId or null
     */
    module.Stage.end = function(options) {
        var recId = null;
        if (options && options.fprId) {
            try {
                var rec = record.load({
                    type: FPR_RECTYPE, 
                    id: options.fprId
                });
                var procRec = new recProc(rec);
                
                options.status = options.status || fConst.ProcStageStatus.Completed;
                var procStatus = options.status;
                procRec.setValue('currStageStatus', procStatus);
                
                var params = procRec.getValue('params') || '{}',
                    procRecFunc = procRec.getValue('procId');
                var paramsObj = JSON.parse(params);
                if (options.postProcessData) {
                    procRec.setValue('postProcessData', JSON.stringify(options.postProcessData));
                    if (JSON.stringify(options.postProcessData) === '{}') {
                        delete paramsObj.postprocess;
                        procRec.setValue('params', JSON.stringify(paramsObj));
                    }
                }
                if (options.params) {
                    for (var prop in options.params) {
                        paramsObj[prop] = options.params[prop];
                    }
                    procRec.setValue('params', JSON.stringify(paramsObj));
                }
                
                options.end = module.StateValues.getTimestamp();
                module.StateValues.update(options, procRec);
                recId = procRec.save();
                fLog.debug('end process fpr', recId);
            }
            catch(ex) {
                log.error('FAM Process State - END', 'ID: ' + options.fprId + ' | Process: ' +
                    procRecFunc + ' | Failure: ' + JSON.stringify(ex));
                // try to set status to failed
                try {
                    var tmpRecId = record.submitFields({
                        type: FPR_RECTYPE, 
                        id: options.fprId,
                        values: {
                            custrecord_fam_procstatus: fConst.ProcessStatus.Failed
                        }
                    });
                    fLog.debug('saved process as failed', 'id: ' + tmpRecId);
                } catch(ex1) {
                    fLog.error('process save as failed', 'error occurred: ' + JSON.stringify(ex1));
                }
            }
        }
        return recId;
    };
    
    module.Stage.getJsonData = function(options) {
        var data = '{}';
        
        if (options && options.fprId && options.column) {
            try {
                var lookupRes = search.lookupFields({
                    type: FPR_RECTYPE,
                    id: options.fprId,
                    columns: [options.column]
                });
                if (lookupRes) {
                    data = lookupRes[options.column];
                }
            } catch(ex) {
                fLog.error('process util get JSON data', 'error occurred: ' + JSON.stringify(ex));
            }
        }
        
        return JSON.parse(data);
    };
    
    module.Stage.addParameter = function(options) {
        if (options && options.fprId && options.key) {
            try {
                var parameters = this.getJsonData({
                    fprId: options.fprId,
                    column: 'custrecord_fam_procparams'});
                
                parameters[options.key] = options.value;
                
                recId = record.submitFields({
                    type: FPR_RECTYPE, 
                    id: options.fprId,
                    values: {
                        custrecord_fam_procparams: JSON.stringify(parameters)
                    }
                });
            } catch(ex) {
                fLog.error('process util add parameter', 'error occurred: ' + JSON.stringify(ex));
            }
        }
    }
    

    module.StateValues.initiate = function(procRec) {
        if (procRec) {
            var stateValues = this.deserialize(procRec);
            if (stateValues) {
                stateValues.push({ stage: +procRec.getValue('currStage'), status: fConst.ProcStageStatus.Initiated, created: this.getTimestamp() });
                this.serialize(procRec, stateValues);
            }
        }
    };
    
    module.StateValues.update = function (options, procRec) {
        if (!procRec || !options) {
            log.debug('module.StateValues.update', 'Incomplete Parameters | procRec: ' + procRec +
                ' | options: ' + options);
            return;
        }
        
        var stateValues = this.deserialize(procRec);
        
        if (!stateValues) {
            log.debug('module.StateValues.update', 'Could not retrieve state values');
            return;
        }
        
        var currStage = +procRec.getValue('currStage'),
            currStageElement = stateValues[stateValues.length - 1];
        
        if (!currStageElement || currStageElement.stage !== currStage) {
            currStageElement = { stage : currStage };
            stateValues[stateValues.length] = currStageElement;
        }
        
        var propToSet = ['status', 'errors', 'start', 'end', 'mapResult', 'reduceResult',
            'outputResult'];
        for (var i = 0; i < propToSet.length; i++) {
            if (options[propToSet[i]]) {
                currStageElement[propToSet[i]] = options[propToSet[i]];
            }
        }
        this.serialize(procRec, stateValues);
    };
    
    module.StateValues.skip = function(stage, procRec) {
        if (procRec && stage) {
            var stateValues = this.deserialize(procRec);
            if (stateValues) {
                var lastStageElement = stateValues[stateValues.length - 1];
                if (!lastStageElement || lastStageElement.stage !== stage) {  // if array is empty or stage is last element, stage was never initialized
                    stateValues.push({ stage: stage, status: fConst.ProcStageStatus.NotRequired, created: this.getTimestamp() });
                }
                this.serialize(procRec, stateValues);
            }
        }
    };
    
    module.StateValues.deserialize = function (procRec) {
        var stateValues = null;
        if (procRec) {
            try {
                var sv = procRec.getValue('stateValues') || '[]';
                stateValues = JSON.parse(sv);
            }
            catch (ex) {
                fLog.error('process util deserialize state values', 'error occurred: ' + ex.toString());
            }
        }
        return stateValues;
    };
    
    module.StateValues.serialize = function(procRec, stateValues) {
        if (procRec) {
            stateValues = stateValues || [];
            this.truncateErrors(stateValues);
            var newStateValuesStr = JSON.stringify(stateValues);
            procRec.setValue('stateValues', newStateValuesStr);
        }
    };
    
    module.StateValues.truncateErrors = function(stateValues) {
        // remove errors from each stage until length is less than max
        while (JSON.stringify(stateValues).length > this.STATEVAL_MAX_LENGTH) {
            // keep track of stages finished to avoid infinite loop if target size is not reached
            var doneStages = 0;  
            for (var i = stateValues.length - 1; i >= 0; i--) {
                if (JSON.stringify(stateValues).length <= this.STATEVAL_MAX_LENGTH) {
                    break;
                }
                else if (stateValues[i].errors && stateValues[i].errors.length > 1) {  // truncate from errors
                    var stageErrors = stateValues[i].errors;
                    
                    // add truncate error if not yet at end of error array
                    if (!stageErrors[stageErrors.length - 1].error || stageErrors[stageErrors.length - 1].error.name !== 'ERRORS_TRUNCATED') {
                        stageErrors.push({
                            error: {
                                name: 'ERRORS_TRUNCATED',
                                message: 'Cannot store all errors in FPR'
                            }
                        });
                    }
                    
                    // remove 2nd to the last entry from array
                    if (stageErrors.length > 2) {
                        stageErrors.splice(stageErrors.length - 2, 1);
                    }
                    
                    // set to done if length is already 2
                    if (stageErrors.length === 2) {
                        doneStages++;
                    }
                }
                else {
                    // set to done if stage was skipped
                    doneStages++;
                }
            }

            // exit loop if target is not reached even if all stages with long errors are truncated
            if (doneStages === stateValues.length && JSON.stringify(stateValues).length > this.STATEVAL_MAX_LENGTH) {
                fLog.error('truncate errors', 'truncated errors on all possible stages, cannot reach target size');
                break;
            }
        }
    };
    
    module.StateValues.getTimestamp = function() {
        return new Date().getTime();
    };
    
    //////////////////////
    // Producer functions
    //////////////////////
    /**
     * Searches queued or on-going processes
     *
     * @returns {search.Result[]}
     */
    module.Producer.getProcessQueue = function() {
        var searchResults = [];
        
        try {
            var searchToRun = search.load({ id : 'customsearch_fam_ongoingprocessrecord' });
            searchResults = searchToRun.run().getRange({ start : 0, end : 1000 }) || [];
        } catch(ex) {
            fLog.error('process util end', 'error occurred: ' + JSON.stringify(ex));
        }
        
        return searchResults;
    };
    
    /**
     * Returns the prioritized process given 2 processes
     *
     * @param {search.Result} process1
     * @param {search.Result} process2
     * @returns {record.Record} procRec - process record to execute
     */
    module.Producer.getPriorityProcess = function(process1, process2) {
        var procId, procData,
            priorityProcess = null,
            recToProcess = null,
            interruptibleBy = null;;
        
        // set process1 as default before checking for process2
        if (process1 && process1.id && process1.getValue && process1.getValue('custrecord_fam_procid')) {
            // set process1 only if it has dictionary
            procId = process1.getValue('custrecord_fam_procid');
            procData = dictProc[procId];
            if (procData) {
                recToProcess = process1.id;
                
                // get what processes can interrupt current stage
                var currStageIdx = (+process1.getValue('custrecord_fam_proccurrstage') || 1) - 1;
                var currStage = procData[currStageIdx];
                if (currStage) {
                    interruptibleBy = currStage.interruptibleBy;
                }
            }
            else {
                log.audit('FAM Process State - END', 'ID: ' + process1.id + ' | Process: ' +
                    procId + ' | Failure: No definition for process');
                record.submitFields({
                    type : FPR_RECTYPE,
                    id   :  process1.id,
                    values : { custrecord_fam_procstatus : fConst.ProcessStatus.Failed },
                    options : { enableSourcing : true }
                });
            }
        }
        
        // if with process2, check if it can interrupt process1
        if (process2 && process2.id && process2.getValue && process2.getValue('custrecord_fam_procid') && 
            ( ( interruptibleBy === 'all' && process1.getValue('custrecord_fam_procid') !== process2.getValue('custrecord_fam_procid') ) ||
              ( interruptibleBy && interruptibleBy instanceof Array && interruptibleBy.indexOf(process2.getValue('custrecord_fam_procid')) !== -1) )) {
            fLog.audit('Process interrupted', 'Process: ' + process1.getValue('custrecord_fam_procid') + ' | ID: ' + process1.id);
            record.submitFields({
                type : FPR_RECTYPE,
                id   :  process1.id,
                values : { custrecord_fam_procstatus : fConst.ProcessStatus.Interrupted },
                options : { enableSourcing : true }
            });
            recToProcess = process2.id;
        }
        
        if (recToProcess) {
            priorityProcess = record.load({
                type : FPR_RECTYPE,
                id   : recToProcess,
                isDynamic : true
            });
        }
        
        return priorityProcess;
    };
    
    /**
     * Executes the sub-process/es of a given process record based on its dictionary 
     *
     * @param {record.Record} procRec - process record to execute
     * @returns {Boolean} - script task
     */
    module.Producer.execute = function(procRec) {
        var taskCreated = false, scriptTask, scriptParams;
        try{
                if (procRec) {
                    var procRecValues = this.initialize(procRec);
                    var procId = procRec.getId();
                    
                    if (procRecValues.status !== fConst.ProcessStatus.Failed || procRecValues.continueOnFail){
                        if (procRecValues.status === fConst.ProcessStatus.Queued)
                            log.audit('FAM Process State - START', 'ID: ' + procId +
                                ' | Process: ' + procRecValues.id);
                                
                        while (!taskCreated && procRecValues.currStage < procRecValues.data.length) {
                            var currStageProc = procRecValues.data[procRecValues.currStage];
                            
                            if (currStageProc.validator(procRecValues.params, procId)) {
                                fLog.debug('Stage will be triggered',
                                    ' FPR ID: ' + procId +
                                    ' | Process: ' + procRecValues.id +
                                    ' | Title: ' + currStageProc.desc + 
                                    ' | Stage: ' +  (procRecValues.currStage + 1));
                                scriptParams = currStageProc.getNextBatch(procRecValues.params, procId);
                                scriptTask = task.create({ taskType : task.getTaskType()[currStageProc.type] });
                                scriptTask.scriptId = currStageProc.scriptId;
                                scriptTask.deploymentId = currStageProc.deploymentId;
                                scriptTask.params = scriptParams;
                                taskCreated = true;
                                
                                procRecValues.status = fConst.ProcessStatus.InProgress;
                                procRecValues.currStageStatus = fConst.ProcStageStatus.Initiated;
                            }
                            else {
                                fLog.debug('Stage will NOT be triggered',
                                    ' FPR ID: ' + procId +
                                    ' | Process: ' + procRecValues.id +
                                    ' | Title: ' + currStageProc.desc + 
                                    ' | Stage: ' +  (procRecValues.currStage + 1));
                                // add skipped process in state values
                                module.StateValues.skip(procRecValues.currStage + 1, procRec);
                                
                                // increment to go to next stage / exit loop
                                procRecValues.currStage++;
                                
                                // set process to completed if in final stage
                                if (procRecValues.currStage === procRecValues.data.length) {
                                    procRecValues.status = fConst.ProcessStatus.Completed;
                                    log.audit('FAM Process State - END', 'ID: ' + procId +
                                        ' | Process: ' + procRecValues.id);
                                }
                            }
                        }
                    }
                    this.finalize(procRec, procRecValues);
                }
        }
        catch(e){
            log.error('execute process', e);
        }
        return scriptTask;
    };
    
    /**
     * Returns object based on current record values that will be used for execution
     * 
     * @param {record.Record} procRec - record object to read
     * @returns {Object} procRecValues
     */
    module.Producer.initialize = function(procRec) {
        var procRecValues = {};
        
        if (procRec && procRec.getValue) { 
            procRecValues.id = procRec.getValue('procId');
            procRecValues.data = dictProc[procRecValues.id];
            procRecValues.status = +procRec.getValue('status'); 
            procRecValues.totStage = +procRec.getValue('totStages'); 
            procRecValues.params = procRec.getValue('params') || '';
            procRecValues.currStage = (+procRec.getValue('currStage') || 1) - 1;
            procRecValues.currStageStatus = procRec.getValue('currStageStatus');
            procRecValues.continueOnFail = false;
            
            // check for valid id and definition
            if (!procRecValues.id || !procRecValues.data || !procRecValues.data[procRecValues.currStage]) {
                procRecValues.status = fConst.ProcessStatus.Failed;
                log.error('FAM Process State - END', 'ID: ' + procRec.getId() + ' | Process: ' +
                    procRecValues.id + ' | Failure: Error in getting definition');
            }
            
            if (procRecValues.data && procRecValues.data[procRecValues.currStage]) {
                procRecValues.continueOnFail = procRecValues.data[procRecValues.currStage]['continueOnFail'];
            }
            
            // parse params
            if (procRecValues.params) {
                try {
                    procRecValues.params = JSON.parse(procRecValues.params);
                }
                catch (e) {
                    log.error('FAM Process State - END', 'ID: ' + procRec.getId() + ' | Process: ' +
                        procRecValues.id + ' | Failure: Error in parsing parameters');
                    procRecValues.status = fConst.ProcessStatus.Failed;
                }
            }
            else {
                procRecValues.params = {};
            }
            
            // auto-increment stage idx based on current stage status
            switch (+procRecValues.currStageStatus) {
                case fConst.ProcStageStatus.Failed : {
                    // set status to failed if flag is not set
                    if (!procRecValues.continueOnFail) {
                        procRecValues.status = fConst.ProcessStatus.Failed;
                        log.error('FAM Process State - END', 'ID: ' + procRec.getId() +
                            ' | Process: ' + procRecValues.id + ' | Failure: Stage Failed');
                    }
                    else {
                        procRecValues.currStage++;  // go to next stage
                    }
                    break;
                }
            }
        }
        
        fLog.debug('initialized values', JSON.stringify(procRecValues));
        return procRecValues;
    };
    
    /**
     * Sets state to the record after execution
     * 
     * @param {record.Record} procRec - record object to set
     * @param {Object} procRecValues - values to set
     */
    module.Producer.finalize = function(procRec, procRecValues) {
        if (procRec && procRec.setValue && procRecValues) {
            fLog.debug('final values', JSON.stringify(procRecValues));
            // set final state to record
            if (procRecValues.status === fConst.ProcessStatus.Failed ||
                procRecValues.status === fConst.ProcessStatus.Completed) {
                procRec.setValue('status', procRecValues.status);
                fLog.audit('Process finished', 'Process ID: ' + procRec.getId() + ', Status: ' + procRecValues.status);
            }
            // set status to in progress if not yet initialized
            else if (procRecValues.status === fConst.ProcessStatus.Queued ||
                procRecValues.status === fConst.ProcessStatus.Interrupted || 
                !procRecValues.totStage) {
                procRec.setValue('status', fConst.ProcessStatus.InProgress);
                procRec.setValue('totStages', procRecValues.data.length);
            }
            else if (procRecValues.status === fConst.ProcessStatus.InProgress && procRec.getValue('status') !== fConst.ProcessStatus.InProgress) {
                procRec.setValue('status', fConst.ProcessStatus.InProgress);
            }
            
            // update params
            if (JSON.stringify(procRecValues.params) !== '{}') {
                procRec.setValue('params', JSON.stringify(procRecValues.params));
            }
            
            // update current stage idx
            if ((procRecValues.currStage + 1) <= procRecValues.data.length) {
                procRec.setValue('currStage', procRecValues.currStage + 1);
            }
            
            // update current stage status
            procRec.setValue('currStageStatus', procRecValues.currStageStatus);
            
            // initiate state values if new script was started
            if (procRecValues.currStageStatus === fConst.ProcStageStatus.Initiated) {
                module.StateValues.initiate(procRec);
            }
        }
    };
    
    //////////////////////
    // Control functions
    //////////////////////
    /**
     * Starts the process manager scheduled script
     */
    module.Control.callProcessManager = function() {
        var procId = null;
        try {
            var schedTask = task.create({ taskType : task.getTaskType().SCHEDULED_SCRIPT });
            schedTask.scriptId = 'customscript_fam_processmanager_ss';
            schedTask.deploymentId = 'customdeploy_fam_processmanager_ss';
            
            procId = schedTask.submit();
        }
        catch(ex) {
            fLog.error('process util call proc mgr', 'error occurred: ' + JSON.stringify(ex));
        }
        return procId;
    };
    
    /**
     * Searches for ongoing scripts that may conflict other runs
     *
     * @returns {search.Result[]}
     */
    module.Control.searchOngoingProcesses = function() {
        var searchResults = [];
        
        try {
            var searchToRun = search.load({ id : 'customsearch_fam_ongoingprocessscript' });
            searchResults = searchToRun.run().getRange({ start : 0, end : 1 }) || [];
        } catch(ex) {
            fLog.error('process util end', 'error occurred: ' + JSON.stringify(ex));
        }
        
        return searchResults;
    };
    
    module.Control.initiate = function () {
        fLog.debug('trigger process manager', 'start');
            
        var taskId, newTask = task.create({ taskType : task.getTaskType().SCHEDULED_SCRIPT });
        
        newTask.scriptId = 'customscript_fam_triggerprocess_ss';
        newTask.deploymentId = 'customdeploy_fam_triggerprocess_ss';
        
        taskId = newTask.submit();
        
        fLog.audit('trigger process manager', 'task submitted, id: ' + taskId);
    };
    
    module.Control.invoke = function () {
        var urlSU = url.resolveScript({
            scriptId : 'customscript_fam_triggerprocess_su',
            deploymentId : 'customdeploy_fam_triggerprocess_su',
            returnExternalUrl : true
        });
        
        https.request({
            method : https.getMethod('GET'),
            url : urlSU
        });
    };

    return module;
}