/**
 * © 2016 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or
 * otherwise make available this code.
 *
 */

define([
        '../adapter/fam_adapter_record',
        '../adapter/fam_adapter_runtime'
        ],

function (record, runtime){
    var module = {};
    
    module.load = function (bgpIdParam){
        var retVal = null,
            scriptObj = runtime.getCurrentScript(),
            procId = scriptObj.getParameter({ name : bgpIdParam });
            
        if (procId) {
            retVal = record.load({ type : 'customrecord_bg_procinstance', id : procId });
        }
        return retVal;
    };
    
    return module;
});