/**
 * © 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 * 
 * @NModuleScope Public
**/
define(function () {
    var module = {
            Propose   : {
                desc            : 'Prepare Data to Generate Assets',
                type            : 'SCHEDULED_SCRIPT',
                scriptId        : 'customscript_fam_proposeasset_ss',
                deploymentId    : 'customdeploy_fam_proposeasset_ss',
                displayId       : 'createprepare'
            },
            Generate : {
                desc            : 'Generate Assets',
                type            : 'MAP_REDUCE',
                scriptId        : 'customscript_fam_generateasset_mr',
                deploymentId    : 'customdeploy_fam_generateasset_mr',
                displayId       : 'creategenerate'
            }
        };
        
    module.Propose.validator = function (params) {
        return (params && !params.done);
    };
    
    module.Propose.getNextBatch = function (params, id) {
        var ret = null;
        
        if (params && id) {
            ret = { custscript_proposal_procid : id };
        }
        
        return ret;
    };
    
    module.Generate.validator = function (params) {
        return (params && !params.generated &&  
                params.proplist && 
                params.proplist.length > 0);
    };
    
    module.Generate.getNextBatch = function (params, id) {
        var ret = {};
        
        if (params && id) {
            ret = { custscript_genassets_fprid : id,
                    custscript_genassets_propids : params.proplist };
        }

        return ret;
    };
        
    return module;
});