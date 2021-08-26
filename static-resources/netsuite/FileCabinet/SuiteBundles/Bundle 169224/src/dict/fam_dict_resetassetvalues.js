/**
 * Copyright © 2016, 2017, Oracle and/or its affiliates. All rights reserved.
**/
define([
    '../adapter/fam_adapter_search'
], function (search) {
    var module = {
        desc: 'Reset Asset Values',
        type : 'MAP_REDUCE',
        scriptId : 'customscript_fam_resetassetvals_mr',
        deploymentId : 'customdeploy_fam_resetassetvals_mr',
        displayId : 'resetassetvals'
    };
    
    module.validator = function (params) {
        var assetIdList = params.assetIds || [],
            slaveIdList = params.slaveIds || [];

        var searchObj = this.buildSearchObj(assetIdList, slaveIdList, +params.lastId);
        
        var pagedData = searchObj.runPaged({ pageSize : 1000 });
        
        return pagedData.count > 0;
    };
    
    module.buildSearchObj = function (assetIdList, slaveIdList, lastId) {
        var idFilter = [],
            searchObj = search.load({ id: 'customsearch_fam_precomputedassetvals' });
        
        if (assetIdList.length > 0)
            idFilter.push(['custrecord_slaveparentasset', search.getOperator('ANYOF'), assetIdList]);
        if (slaveIdList.length > 0) {
            if (idFilter.length > 0)
                idFilter.push('or');
            idFilter.push(['internalid', search.getOperator('ANYOF'), slaveIdList]);
        }
        
        if (idFilter.length > 0)
            searchObj.filterExpression = searchObj.filterExpression.concat(['and', idFilter]);
        
        if (lastId) {
            searchObj.filterExpression = searchObj.filterExpression.concat(['and',
                ['internalidnumber', search.getOperator('GREATERTHAN'), lastId]
            ]);
        }
        
        return searchObj;
    };
    
    module.getNextBatch = function (params, id) {
        var ret = null;
        
        if (id) {
            ret = { custscript_resetassetvals_procid : id };
        }
        
        return ret;
    };
    
    return module;
});
