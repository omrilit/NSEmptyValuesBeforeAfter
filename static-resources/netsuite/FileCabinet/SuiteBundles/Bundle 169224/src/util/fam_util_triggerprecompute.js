define([
    '../adapter/fam_adapter_record',
    '../adapter/fam_adapter_search',
    '../const/fam_const_customlist',
    '../util/fam_util_systemsetup'
], function utilTriggerPreCompute(record, search, constList, utilSysSetup) {
    
    function triggerPreCompute() {
        var procRec, preComputeId, hasPreCompute, preCompCreated = false;
        
        if (!utilSysSetup.getSetting('precompute')) {
            return false;
        }
        
        hasPreCompute = hasPreComputeFPR();
        log.debug('triggerPreCompute', 'Has Pre-compute FPR: ' + hasPreCompute);
        if (!hasPreCompute) {
            procRec = record.create({ type : 'customrecord_fam_process' });
            
            procRec.setValue({ fieldId : 'custrecord_fam_procid', value : 'precalc' });
            procRec.setValue({ fieldId : 'custrecord_fam_procstatus',
                value : constList.ProcessStatus.Queued });
            procRec.setValue({ fieldId : 'custrecord_fam_procstateval', value : '[]' });
            
            preComputeId = procRec.save();
            preCompCreated = true;
            log.debug('triggerPreCompute', 'Created Pre-compute FPR ID: ' + preComputeId);
        }
        
        return preCompCreated;
    }
    
    function hasPreComputeFPR() {
        var results, srchObj = search.load({ id : 'customsearch_fam_ongoingprocessrecord' });
        
        srchObj.filters.push(search.createFilter({ name : 'custrecord_fam_procid', operator : 'is',
            values : 'precalc' }));
        
        results = srchObj.run().getRange(0, 1);
        
        return results && results.length > 0;
    }
    
    return {
        triggerPreCompute : triggerPreCompute
    };
});
