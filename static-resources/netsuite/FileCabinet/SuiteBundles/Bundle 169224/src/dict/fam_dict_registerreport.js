/**
 * © 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

define([
        '../util/fam_util_log'
    
], getRegisterReportDictionary);

function getRegisterReportDictionary(fLog) {
    var module = {
        desc: 'Register Report',
        type : 'SCHEDULED_SCRIPT',
        scriptId : 'customscript_fam_generateassetreg_ss',
        deploymentId : 'customdeploy_fam_generateassetreg_ss',
        displayId : 'registerreport'
    };
    
    module.validator = function(params) {
        return (params && !params.done);
    };
    
    module.getNextBatch = function (params, id) {
        fLog.debug('getNextBatch', 'params: ' + JSON.stringify(params));
        var retVal = null;
        
        if (params && id) {            
            retVal = {custscript_arreport_fprid: id};
        }
        
        return retVal;
    };
    
    return module;
}
