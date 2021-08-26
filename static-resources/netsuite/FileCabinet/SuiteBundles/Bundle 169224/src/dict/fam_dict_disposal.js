/**
 * © 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 * 
**/
define(function () {
    var module = {
        desc: 'Asset Disposal',
        type : 'MAP_REDUCE',
        scriptId : 'customscript_fam_disposeasset_mr',
        deploymentId : 'customdeploy_fam_disposeasset_mr',
        displayId : 'disposal'
    };
    
    module.validator = function (params) {
        return (params && !params.done);
    };
    
    module.getNextBatch = function (params, id) {
        var ret = null;
        
        if (params && params.recsToProc && id) {
            ret = { custscript_dispose_procid : id };
        }
        
        return ret;
    };
    
    return module;
});
