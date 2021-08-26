/**
 * © 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
**/
define(function () {
    var module = {
        desc            : 'Post Process Records',
        type            : 'MAP_REDUCE',
        scriptId        : 'customscript_fam_mr_postprocess',
        deploymentId    : 'customdeploy_fam_mr_postprocess',
        displayId       : 'postprocess'
    };
    
    module.validator = function (params) {
        return (params && params.postprocess === 'T');
    };
    
    module.getNextBatch = function (params, id) {
        var ret = null;
        
        if (id) {
            ret = { 
                custscript_fam_mr_postprocess_fpr : id,
                custscript_fam_postprocess_rollback: 'T'  // default to T for now, unless postprocess will not be used for rollback
            };
        }
        
        return ret;
    };
    
    return module;
});
