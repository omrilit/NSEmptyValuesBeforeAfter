/**
 * © 2017 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

define([
    '../adapter/fam_adapter_record',
    '../adapter/fam_adapter_search',
    '../const/fam_const_customlist',
    '../util/fam_util_systemsetup'
], function (record, search, constList, utilSysSetup) {
    var module = {};
    module.processIds = {};
    module.processIds[constList.ErrorHandlingScripts.CheckSummaries] = 'deprSummaryCheck';
    module.processIds[constList.ErrorHandlingScripts.AssetUpdate] = 'assetUpdateRecovery';
    
    
    module.triggerProcess = function(type, params) {
        var processCreated = false;
        
        try {
            if (utilSysSetup.getSetting('precompute') && type) {
                var processId = module.processIds[type];
                if (processId && !this.hasRunningProcess(processId)) {
                    var procRec = record.create({ type : 'customrecord_fam_process' });
                    procRec.setValue({ fieldId : 'custrecord_fam_procid', value : processId });
                    procRec.setValue({ fieldId : 'custrecord_fam_procstatus', value : constList.ProcessStatus.Queued });
                    if (params) {
                        procRec.setValue({ fieldId : 'custrecord_fam_procparams', value : params });
                    }
                    
                    var procId = procRec.save();
                    processCreated = true;
                    log.debug('Trigger error handling for ' + processId, 'Created FPR ID: ' + procId);
                }
            }
        } catch(ex) {
            log.error('Trigger error handling exception', ex);
        }
        
        return processCreated;
    };
    
    module.hasRunningProcess = function(processId) {
        var hasRunningProcess = false;
        if (processId) {
            var searchObj = search.load({ id : 'customsearch_fam_ongoingprocessrecord' });
            searchObj.filters.push(search.createFilter({ name : 'custrecord_fam_procid', operator : 'is', values : processId }));
            var results = searchObj.run().getRange(0, 1);
            hasRunningProcess = results && results.length > 0;
        }
        
        log.debug('hasRunningProcess', hasRunningProcess);
        return hasRunningProcess;
    };
    
    return module;
});
