/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 */

define([
    '../adapter/fam_adapter_file',
    '../adapter/fam_adapter_format',
    '../util/fam_util_fprparams',
    '../util/fam_util_precompute'
], function(file, format, utilFprParams, utilPrecompute) {
    var module = {
        TransferValidation : {
            desc            : 'Asset Transfer Validation',
            type            : 'MAP_REDUCE',
            scriptId        : 'customscript_fam_transfer_validate_mr',
            deploymentId    : 'customdeploy_fam_transfer_validate_mr',
            displayId       : 'transfervalidation'
        },
        TransferCSV : {
            desc            : 'Bulk Asset Transfer CSV',
            type            : 'SCHEDULED_SCRIPT',
            scriptId        : 'customscript_fam_transferassetscsv_ss',
            deploymentId    : 'customdeploy_fam_transferassetscsv_ss',
            displayId       : 'transfercsv'
        },
        Precompute : {
            desc            : 'Catch-up Precompute',
            type            : 'MAP_REDUCE',
            scriptId        : 'customscript_fam_precalc_mr',
            deploymentId    : 'customdeploy_fam_precalc_mr',
            displayId       : 'precompute',
        },
        TransferUpdate : {
            desc            : 'Asset Transfer',
            type            : 'MAP_REDUCE',
            scriptId        : 'customscript_fam_transferasset_mr',
            deploymentId    : 'customdeploy_fam_transferasset_mr',
            displayId       : 'transferasset'
        }
    };
    
    module.TransferValidation.validator = function(params) {
        return (params && !params.done);
    };    
    module.TransferValidation.getNextBatch = function (params, fprId) {
        var scriptParams = null;
        
        if (params && fprId) {
            scriptParams = { 
                custscript_transfer_validate_fprid : fprId,
                custscript_transfer_validate_recstoproc : JSON.stringify(params.recsToProcess),
                custscript_transfer_validate_date : params.date ? format.dateToString(new Date(params.date)) : '' };
        }
        
        return scriptParams;
    };
    
    module.formatDateFromFPR = function (date) {
        var ret;
        
        if (date === undefined)
            ret = '';
        else
            ret = format.dateToString(new Date(+date));
        
        return ret;
    };
    
    module.TransferCSV.validator = function(params) {
        return (params && params.fileid && !params.csvDone);
    };
    module.TransferCSV.getNextBatch = function (params, fprId) {
        var retVal = {
            custscript_transfercsv_fprid : fprId,
            custscript_transfercsv_fileid : params.fileid
        };
        
        if (params.lastRow)
            retVal.custscript_transfercsv_lastrow = params.lastRow;
        if (params.recsToProcess)
            retVal.custscript_transfercsv_totransfer = JSON.stringify(params.recsToProcess);
        
        return retVal;
    };
    
    module.Precompute.validator = function (params){
        var assetIDs, ret = false;
        
        if (params) {
            assetIDs = utilFprParams.getAssetList(params);
        
            if (this.hasRecsToProcess(params, assetIDs))
                ret = true;
        }
        
        return ret;
    };
    module.Precompute.getNextBatch = function (params, fprId){
        var assetIDs, scriptParams = null;
        
        if (params && fprId) {
            assetIDs = utilFprParams.getAssetList(params);
            
            scriptParams = { 
                custscript_precalc_fprid : fprId,
                custscript_precalc_maxdate : module.formatDateFromFPR(+params.date),
                custscript_precalc_is_ondemand : 'T',
                custscript_precalc_asset : assetIDs.join(',')
            };
        }
        
        return scriptParams; 
    };
    module.Precompute.hasRecsToProcess = function(params, assetIDs){
        var hasRecs = false;
        
        if (assetIDs.length > 0) {
            var filtersObj = {
                    date : module.formatDateFromFPR(+params.date),
                    maxSlaveId : params.maxSlaveId,
                    lastSlaveId : params.lastSlaveId,
                    recsToProcess : assetIDs
                }
            var searchObj = utilPrecompute.createSearchForSpecificRecs(filtersObj);
            if (searchObj){
                var searchRes = searchObj.run().getRange(0,1) || [];
                if (searchRes.length){
                    hasRecs = true;
                }
            }
        }
        return hasRecs;
    };
    
    module.TransferUpdate.validator = function (params) {
        return params && params.recsToProcess && Object.keys(params.recsToProcess).length > 0 &&
            params.date && !params.transferDone;
    };    
    module.TransferUpdate.getNextBatch = function (params, fprId) {
        var scriptParams = null;
        
        if (params && fprId) {
            scriptParams = {
                custscript_transfer_fprid : fprId,
                custscript_transfer_records : JSON.stringify(params.recsToProcess),
                custscript_transfer_date : format.dateToString(new Date(params.date)),
                custscript_transfer_permit : params.jrnPermit
            };
        }
        
        return scriptParams; 
    };
    
    return module;
});