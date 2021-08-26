/**
 * © 2017 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

define(['../util/fam_util_log'], getDeprMonthReportDictionary);

function getDeprMonthReportDictionary(fLog) {
    var module = {
        desc: 'Depreciation Monthly Report MR',
        type : 'MAP_REDUCE',
        scriptId : 'customscript_fam_generatedeprmonth_mr',
        deploymentId : 'customdeploy_fam_generatedeprmonth_mr',
        displayId : 'deprmonthreport'
    };
    
    module.validator = function(params) {
        return (params && !params.done);
    };
    
    module.getNextBatch = function (params, id) {
        fLog.debug('getNextBatch', 'params: ' + JSON.stringify(params));
        var retVal = null;
        
        if (params && id) {            
            retVal = {
                custscript_deprmonthreport_fprid: id,
                custscript_deprmonthreport_params: params
            };
            
        }
        
        return retVal;
    };
    
    return module;
}
