/**
 * © 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
**/
define([
    '../adapter/fam_adapter_search'
], function (search) {
    var module = {
        desc: 'Delete Old Forecast Values',
        type : 'MAP_REDUCE',
        scriptId : 'customscript_fam_deleteoldforecast_mr',
        deploymentId : 'customdeploy_fam_deleteoldforecast_mr',
        displayId : 'deletedhr'
    };
    
    module.validator = function (params) {
        var searchObj = search.load({ id : 'customsearch_fam_oldforecastvalues' }),
            pagedData = searchObj.runPaged({ pageSize : 1000 });
        
        return pagedData.count > 0;
    };
    
    module.getNextBatch = function (params, id) {
        var ret = {};
        if (id) {
            ret['custscript_deleteforecast_procid'] = id;
        }
        
        return ret;
    };
    
    return module;
});
