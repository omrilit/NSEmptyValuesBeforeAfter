/**
 * © 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
**/
define(function () {
    var module = {
        desc: 'Asset Proposal',
        type : 'SCHEDULED_SCRIPT',
        scriptId : 'customscript_fam_proposeasset_ss',
        deploymentId : 'customdeploy_fam_proposeasset_ss',
        displayId : 'proposal'
    };
    
    module.validator = function (params) {
        return (params && !params.done);
    };
    
    module.getNextBatch = function (params, id) {
        var ret = null;
        
        if (params && id) {
            ret = { custscript_proposal_procid : id };
        }
        
        return ret;
    };
    
    return module;
});
