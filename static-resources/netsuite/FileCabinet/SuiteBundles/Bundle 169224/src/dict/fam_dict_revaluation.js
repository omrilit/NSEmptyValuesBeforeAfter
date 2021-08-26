/**
 * © 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
**/
define(function () {
    var module = {
        desc: 'Asset Revaluation',
        type : 'SCHEDULED_SCRIPT',
        scriptId : 'customscript_fam_revalueasset_ss',
        deploymentId : 'customdeploy_fam_revalueasset_ss',
        displayId : 'revaluation'
    };
    
    module.validator = function (params) {
        return (params && !params.done);
    };
    
    module.getNextBatch = function (params, id) {
        var ret = null;
        
        if (params && params.recsToProcess && id) {
            ret = { custscript_revalue_procid : id };
        }
        
        return ret;
    };
    
    return module;
});
