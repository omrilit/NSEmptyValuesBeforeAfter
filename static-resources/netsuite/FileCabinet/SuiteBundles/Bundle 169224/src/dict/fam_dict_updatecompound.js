/**
 * © 2017 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 * 
 */
define([
    '../adapter/fam_adapter_search',
    '../util/fam_util_assetvalues'
], function (search, utilAssetValues) {
    
    function validator (params) { 
        log.debug('Update Compound - Validator params', params);
        var maxSlaveID = getMaxIdForNextBatch(params);
        if (maxSlaveID){
            params.maxSlaveID = maxSlaveID;
            return true;
        }
        else{
            return false;
        }
    }
    
    function getNextBatch(params, id) {
        var scriptParams = {
                custscript_updcom_fprid : id
            };
        if (params){
            if (params.updCompLastID){
                scriptParams['custscript_updcom_lastid'] = params.updCompLastID;
            }
            if (params.maxSlaveID){
                scriptParams['custscript_updcom_maxid'] = params.maxSlaveID;
                delete params.maxSlaveID;
            }
        }
        return scriptParams;
    }
    
    function getMaxIdForNextBatch(params) { 
        var i, results, maxSlaveID = 0, start = 0, end = 0,
        searchObj = utilAssetValues.createUpdatedAssetValuesSearch(params);
        
        var resultSet = searchObj.run();
        var searchPage = 1000;
        var maxRecords = 200000;
        do {
            start = end;
            end = start + searchPage;
            if (end > maxRecords){
                break;
            }
            
            results = resultSet.getRange({ start : start, end : end }) || [];
            if (results.length > 0){
                maxSlaveID = results[results.length-1].id;
            }
            
        } while(results.length > 0);    
        return maxSlaveID;
    }
    
    return {
        desc : 'Update Compound Assets - PM',
        type : 'MAP_REDUCE',
        scriptId : 'customscript_fam_updcomass_mr',
        deploymentId : 'customdeploy_fam_updcomass_mr',
        displayId : 'updatecompound',
        validator : validator,
        getNextBatch : getNextBatch
    }
});
