/**
 * � 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 * 
**/
define(function () {
    var module = {
        desc: 'Proposal Split',
        type : 'MAP_REDUCE',
        scriptId : 'customscript_fam_mr_proposalsplit',
        deploymentId : 'customdeploy_fam_mr_proposalsplit',
        displayId : 'proposalsplit'
    };
    
    module.validator = function (params) {
        return (params && !params.done);
    };
    
    module.getNextBatch = function (params, id) {
        var ret = null;
        
        if (params && id) {
            ret = { custscript_fam_mr_proposalsplit_fprid : id };
        }
        
        return ret;
    };
    
    return module;
});
