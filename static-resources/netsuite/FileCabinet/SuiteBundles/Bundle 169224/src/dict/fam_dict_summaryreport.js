/**
 * © 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

define([
        '../util/fam_util_log'
    
], getSummaryReportDictionary);

function getSummaryReportDictionary(fLog) {
    var module = {
        desc: 'Summary Report SS',
        type : 'SCHEDULED_SCRIPT',
        scriptId : 'customscript_fam_generateassetsummary_ss',
        deploymentId : 'customdeploy_fam_generateassetsummary_ss',
        displayId : 'summaryreport'
    };
    
    module.validator = function(params) {
        return (params && !params.done);
    };
    
    module.getNextBatch = function (params, id) {
        fLog.debug('getNextBatch', 'params: ' + JSON.stringify(params));
        var retVal = null;
        
        if (params && id) {            
            retVal = {custscript_asreport_fprid: id};
        }
        
        return retVal;
    };
    
    return module;
}
