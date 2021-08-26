/**
 * © 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 * 
 * @NModuleScope Public
**/
define(function () {
    var module = {
        desc: 'Asset Generation',
        type : 'MAP_REDUCE',
        scriptId : 'customscript_fam_generateasset_mr',
        deploymentId : 'customdeploy_fam_generateasset_mr',
        displayId : 'generate'
    };
    
    module.validator = function (params) {
        return (params && !params.generated &&  
                params.proplist && 
                params.proplist.length > 0);
    };
    
    module.getNextBatch = function (params, id) {
        var ret = {};
        
        if (params && id) {
            ret = { custscript_genassets_fprid : id,
                    custscript_genassets_propids : params.proplist };
        }

        return ret;
    };
    
    return module;
});
