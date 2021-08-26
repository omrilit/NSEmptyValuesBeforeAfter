/**
 * © 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

define([
    '../util/fam_util_log',
    '../util/fam_util_reports'
], getDeprSchedDictionary);

function getDeprSchedDictionary(fLog, utilReports) {
    var module = {
        desc: 'Depreciation Schedule Report',
        type : 'MAP_REDUCE',
        scriptId : 'customscript_fam_generatedeprsched_mr',
        deploymentId : 'customdeploy_fam_generatedeprsched_mr',
        displayId : 'deprschedreport'
    };
    
    /**
     * Returns true if batches property is not yet initialized
     * If fileIds are not yet set, stitch file id's in batches property
     * 
     * @param {Object} params - Filters from UI
     * @returns {Boolean} True if batches property is not yet initialized
     *                    Otherwise, return false.
     */
    module.validator = function(params) {
        fLog.debug('validator', 'params: ' + JSON.stringify(params));
        var retVal = false;
        
        if (params) {
            // only call M/R if batches are not yet set
            if (!params.batches) {
                retVal = true;
            }
        }
        
        return retVal;
    };
    
    /**
     * Returns the parameters to be used for the depreciation sched report m/r.
     * 
     * @param {Object} params - Filters from UI
     * @param {Integer} id - FAM Process Record ID
     * @returns {Object} Script parameters
     */
    module.getNextBatch = function (params, id) {
        fLog.debug('getNextBatch', 'params: ' + JSON.stringify(params));
        var retVal = {
            custscript_deprschedreport_params : JSON.stringify(params)
        };
        
        if (id) {
            if (params && !params.fpr) {
                params.fpr = id;
            }
            retVal.custscript_deprschedreport_fprid = id;
        }
        
        return retVal;
    };
    
    return module;
}
