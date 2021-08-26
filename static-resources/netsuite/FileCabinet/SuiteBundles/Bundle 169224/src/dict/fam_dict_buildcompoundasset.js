/**
 * © 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 * @NModuleScope Public
**/
define(function () {
    var module = {
        desc: 'Build Compound Asset',
        type : 'MAP_REDUCE',
        scriptId : 'customscript_fam_createcompound_mr',
        deploymentId : 'customdeploy_fam_createcompound_mr',
        displayId : 'buildcompound'
    };
    
    module.validator = function (params) {
        return (params && !params.done);
    };
    
    module.getNextBatch = function (params, id) {
        var ret = null;
        
        if (params && id) {
            ret = { custscript_fam_createcompmr_fprid : id };
        }
        
        return ret;
    };
    
    return module;
});
