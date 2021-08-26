/**
 * © 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
**/

var FAM;
if (!FAM) { FAM = {}; }

FAM.BGProcess = function () {
    var crtName            = 'customrecord_bg_procinstance',
        scheduledScriptId  = 'customscript_fam_bgp_ss',
        scriptParams = {},
        scriptParamIds = {
            process_id    : 'custscript_fam_bgp_id',
            lowerLimit    : 'custscript_fam_search_lowerlimit',
            upperLimit    : 'custscript_fam_search_upperlimit',
            hasSpawned    : 'custscript_fam_multiq_hasspawned',
            isPost        : 'custscript_fam_multiq_ispost',
            componentTree : 'custscript_fam_component_tree'
        },
        migrationScripts = [
            'customscript_fam_setup_accountrecords',
            'customscript_ncfar_updatealtmsubs_ss',
            'customscript_fam_migratedefaulttaxmethod'
        ],
        statusList = {
            'In Progress'           : 1,
            'Completed'             : 2,
            'Completed with Errors' : 3,
            'Failed'                : 4,
            'Queued'                : 5
        },
        activityTypes = {
            'Direct Execution' : 1,
            'Custom Schedule'  : 2,
            'Planned Schedule' : 3
        },
        suiteletURL = nlapiResolveURL(
            'SUITELET',
            'customscript_fam_bgp_su',
            'customdeploy_fam_bgp_su',
            true
        ),
        fields = {
            internalid    : 'internalid',
            isinactive    : 'isinactive',
            proc_name     : 'custrecord_far_proins_processname',
            func_name     : 'custrecord_far_proins_functionname',
            activity_type : 'custrecord_far_proins_activitytype',
            status        : 'custrecord_far_proins_procstatus',
            user          : 'custrecord_far_proins_procuser',
            rec_count     : 'custrecord_far_proins_reccount',
            state_defn    : 'custrecord_far_proins_statedefn',
            state         : 'custrecord_far_proins_procstate',
            redirect      : 'custrecord_far_proins_redirect',
            message       : 'custrecord_far_proins_procmsg',
            recordid      : 'custrecord_far_proins_recordid',
            rec_total     : 'custrecord_fam_proins_rectotal',
            rec_failed    : 'custrecord_fam_proins_recfailed',
            rec_skipped   : 'custrecord_fam_proins_recskipped',
            rollback_data : 'custrecord_fam_proins_rollbackdata'
        };

    FAM.Record.apply(this, [crtName, fields]);

    this.stateValues = null;

    this.getStatusId = function (name) {
        return statusList[name] || null;
    };

    this.getStatusName = function (id) {
        var name = null;
        for (name in statusList) {
            if (statusList[name] == id) {
                return name;
            }
        }
        return null;
    };

    this.getActivityTypeId = function (name) {
        return activityTypes[name] || null;
    };

    this.getScriptParamId = function (name) {
        return scriptParamIds[name];
    };

    this.invoke = function (pid) {
        var params = {};
        params[scriptParamIds.process_id] = pid;
        nlapiLogExecution('DEBUG', 'invoke', '_suiteletURL: ' + suiteletURL + ' pid: ' + pid);
        return nlapiRequestURL(suiteletURL, null, params);
    };

    this.scheduleScript = function (pid, deployId) {
        var i = null, params = null;

        deployId = deployId || null;

        if (pid) {
            params = {};
            params[scriptParamIds.process_id] = pid;

            for (i in scriptParams) {
                params[scriptParamIds[i]] = scriptParams[i];
            }
        }

        return nlapiScheduleScript(scheduledScriptId, deployId, params);
    };

    this.parseStateValues = function () {
        var i, names, values;

        if (!this.record) {
            this.loadRecord();
        }
        this.stateValues = {};

        names  = this.getFieldValue('state_defn') || '';
        values = this.getFieldValue('state') || '';

        try {
            this.stateValues = JSON.parse(values);
            if (typeof this.stateValues !== 'object') {
                this.stateValues = {};
                throw 'should be object';
            }
        }
        catch (e) {
            
            names  = names && names.split(',');
            values = values && values.split(',');

            if (names) {
                for (i = 0; i < names.length; i++) {
                    this.stateValues[names[i]] = (typeof values[i] == 'undefined') ? null : values[i];
                }
            }
        }
    };

    this.writeToProcessLog = function (message, type, relatedRec) {
        var recLog = new FAM.BGProcessLog();
        
        if (message && message.length > 300) {
            nlapiLogExecution('debug', 'writeToProcessLog', 'Log message contained more than ' +
                'maximum number (300) characters, truncating message..');
            message = message.substring(0, 300);
        }
        
        recLog.createRecord({
            process_instance : +this.recordId,
            message_type     : recLog.getMessageTypeId(type),
            log_message      : message,
            related_record   : relatedRec || ''
        });
        
        recLog.submitRecord();
        return recLog;
    };

    this.catchError = function (e, status) {
        var msg = '', procmsg = e.toString();

        status = status || FAM.BGProcessStatus.Failed;
        
        if (typeof e.getStackTrace === 'function') {
            msg = procmsg + '<br />' + e.getStackTrace().join('<br />');
        }
        else if (e.stack) {
            msg = procmsg + e.stack.replace(/(^|\s)at(\s|$)/g, '<br />at ');
        }
        else {
            msg = procmsg;
        }

        if (typeof e.getId === 'function' && e.getId()) {
            msg += '<br />Reference Id: ' + e.getId();
            procmsg += ' | Reference Id: ' + e.getId();
        }

        nlapiLogExecution('ERROR', 'FAM.BGProcess.catchError', msg);

        if (procmsg && procmsg.length > 300) {
            nlapiLogExecution('DEBUG', 'catchError', 'Error Detail contained more than maximum ' +
                'number (300) characters, truncating message..');
            procmsg = procmsg.substring(0, 300);
        }

        this.submitField({ status : status, message: procmsg });
        this.writeToProcessLog(procmsg, 'Error');
    };

    this.setScriptParams = function (params) {
        scriptParams = params;
    };

    this.getScriptParam = function (paramName) {
        return FAM.Context.getSetting('SCRIPT', scriptParamIds[paramName]);
    };

    this.getInternalIds = function (searchResult) {
        return searchResult.getId();
    };

    this.getScriptInternalId = function (arrScriptIds) {
        var res       = [],
            scriptRec = new FAM.Script(),
            fSearch   = new FAM.Search(scriptRec);

        // anyof not working as of 12/04/2012!
        fSearch.addFilter('scriptid', null, 'is', arrScriptIds);
        fSearch.run();

        if (fSearch.results) {
            res = fSearch.results.map(this.getInternalIds);
        }

        return res;
    };

    /**
     * Retrieves a queue of the given script which satisfies the given status/es
     *
     * Parameters:
     *     scriptId {number} - internal id of the script record
     *     arrDep {nlobjSearchResult[]} - script deployments of the script
     *     checkStatus {string[]} - status/es to check
     * Returns:
     *     null - no queues found
     *     string - deployment id of the queue that satisfies the given status/es
    **/
    this.getQueueOfStatus = function (arrDep, checkStatus) {
        if (arrDep)
            for (var i = 0; i < arrDep.length; i++){
                if (checkStatus.indexOf(arrDep[i].status) >= 0){
                    return arrDep[i].depId;
                }
            }

        return null;
    };

    /**
     * Retrieves the next available queue for the given script
     * Returns:
     *     null - no queues found
     *     string - deployment id of the queue that is available
    **/
    this.getAvailableQueue = function () {
        var scriptId = this.getScriptInternalId(scheduledScriptId);
        var arrDep = this.searchDeployments(scriptId);

        return this.getQueueOfStatus(arrDep, ['Complete', 'Failed', 'NONE']);
    };

    /**
     * Checks if the given script has an on-going queue
     *
     * Parameters:
     *     none
     * Returns:
     *     true {boolean} - has on-going queue
     *     false {boolean} - has no on-going queue
    **/
    this.hasOnGoingQueue = function () {
        var results, filters = null;
        
        if (FAM.Context.getExecutionContext() === 'scheduled') {
            filters = new nlobjSearchFilter('scriptid', 'scriptdeployment', 'isnot',
                FAM.Context.getDeploymentId());
        }
        
        results = nlapiSearchRecord('scheduledscriptinstance', 'customsearch_fam_ongoingbgps',
            filters);
            
        return results;
    };

    /**
     * Search for Script Deployments of a given Script
     *
     * Parameters:
     *     scriptId {number} - internal id of the script
     * Returns:
     *     nlobjSearchResult[] - found deployments
    **/
    this.searchDeployments = function (scriptId) {
        var depRec  = new FAM.ScriptDeployment(),
            fSearch = new FAM.Search(depRec);

        fSearch.addFilter('script', null, 'is', scriptId);
        fSearch.addFilter('isdeployed', null, 'is', 'T');
        if (FAM.Context.getExecutionContext() === 'scheduled') {
            fSearch.addFilter('scriptid', null, 'isnot', FAM.Context.getDeploymentId());
        }

        fSearch.addColumn('scriptid');
        fSearch.run();
        var res = fSearch.results;
        var arrDep = new Array();
        if(res)
            for(var i = 0; i<res.length; i++){
                arrDep.push({depId: res[i].getValue('scriptid'), status: FAM.searchSSInstance(res[i].getId())});
            }
        return arrDep;
    };

    /**
     * Checks for migration scripts that are currently processing
     *
     * Parameters:
     *     none
     * Return:
     *     {string[]} - array of string names of currently processing migration scripts
    **/
    this.checkOnGoingMigration = function () {
        var i, arrDep, scriptId,
            res = [];

        for (i = 0; i < migrationScripts.length; i++) {
            scriptId = this.getScriptInternalId(migrationScripts[i]);
            arrDep = this.searchDeployments(scriptId);

            if (arrDep && this.getQueueOfStatus(arrDep, ['Processing', 'Pending', 'Deferred'])
                !== null) {
                    
                res.push(migrationScripts[i]);
            }
        }

        return res;
    };

    /**
     * Search Queue Records or sum up all records processed among all queues
     *
     * Parameters:
     *     blnCount {boolean} - flag if the function should count all records processed or retrieve
     *     depId {string} - script deployment id
     * Returns:
     *     object {FAM.Search}
    **/
    this.searchQueues = function (blnCount, depId) {
        var queueRec = new FAM.Queue(), fSearch = new FAM.Search(queueRec);

        depId = depId || FAM.Context.getDeploymentId();
        
        fSearch.addFilter('procInstance', null, 'is', this.getRecordId());

        if (blnCount) {
            fSearch.addColumn('recsProcessed', null, 'sum');
            fSearch.addColumn('recsFailed', null, 'sum');
        }
        else {
            fSearch.addFilter('deployment', null, 'is', depId);

            fSearch.addColumn('recsProcessed');
            fSearch.addColumn('recsFailed');
            fSearch.addColumn('state');
        }

        fSearch.run();
        return fSearch;
    };

    /**
     * Retrieves progress information and parameters for the currently executing queue
     *
     * Parameters:
     *     depId {string} - script deployment id
     *     addState {object} - JSON object to add to queue state values
     * Returns:
     *     {object} - hashmap of data retrieved from the queue
     *         > queueId {number} - internal id of the queue instance record
     *         > recsProcessed {number} - number of records processed by the current queue
     *         > recsFailed {number} - number of records that failed processing
     *         > stateValues {object} - hashmap of state definition x state
    **/
    this.getQueueDetails = function (depId, addState) {
        var srchQueues, stateStr, ret = {}, queueRec = new FAM.Queue();

        depId = depId || FAM.Context.getDeploymentId();
        
        srchQueues = this.searchQueues(false, depId);
        if (srchQueues.results) {
            ret.queueId = srchQueues.getId(0);
            ret.recsProcessed = +srchQueues.getValue(0, 'recsProcessed');
            ret.recsFailed = +srchQueues.getValue(0, 'recsFailed');
            ret.stateValues = {};

            if (srchQueues.getValue(0, 'state')) {
                ret.stateValues = JSON.parse(srchQueues.getValue(0, 'state'));
            }
            if (addState) {
                ret.stateValues = Object.assign(ret.stateValues, addState);
                
                queueRec.recordId = ret.queueId;
                queueRec.submitField({
                    state : JSON.stringify(ret.stateValues)
                });
            }
        }
        else {
            ret.recsProcessed = 0;
            ret.recsFailed = 0;
            ret.stateValues = addState || {};

            queueRec.createRecord({
                procInstance  : this.getRecordId(),
                deployment    : depId,
                recsProcessed : ret.recsProcessed,
                recsFailed    : ret.recsFailed,
                state         : JSON.stringify(ret.stateValues)
            });
            ret.queueId = queueRec.submitRecord();
        }

        return ret;
    };

    /**
     * Schecules another queue for multi-queueing
     *
     * Parameters:
     *     upperLimit {number} - 0 (number) or internal id of the last asset record the current queue
     *         will process
     * Returns:
     *     true {boolean} - successfully scheduled the next queue
     *     false {boolean} - failed scheduling the next queue
    **/
    this.scheduleNextQueue = function (upperLimit) {
        var ret = false, availableQueue = this.getAvailableQueue(), schedResult, queueAddState;

        if (availableQueue) {
            queueAddState = {
                hasSpawned : 'F',
                lowerLimit : upperLimit,
                upperLimit : 0
            };
            this.getQueueDetails(availableQueue, queueAddState);
            
            this.setScriptParams({ lowerLimit : upperLimit });
            schedResult = this.scheduleScript(this.getRecordId(), availableQueue);
            if (schedResult === 'QUEUED') {
                ret = true;
            }
            else {
                nlapiLogExecution('debug', 'scheduler', 'Could not schedule queue: ' +
                    availableQueue + ' | Status: ' + schedResult);
            }

            // clear script params after success/failed schedule
            this.setScriptParams({});
        }
        else {
            nlapiLogExecution('debug', 'scheduler', 'No available queues.');
        }

        return ret;
    };

    this.updateQueueState = function (queueId, stateDef, stateValues) {
        if (queueId) {
            var queueFields = {
                    stateDef : stateDef,
                    state : stateValues
                },
                queueRec = new FAM.Queue();

            queueRec.recordId = queueId;
            queueRec.submitField(queueFields);
        }
    };

};
