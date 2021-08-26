/**
 * © 2017 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

define([
    '../const/fam_const_customlist'
],

function(constList) {
    var module = {
        CheckSummaries: {},
        CreateSummaries: {}
    };
    
    module.CheckSummaries = {
        desc: 'Check for Missing Pre-compute Summaries',
        type : 'SCHEDULED_SCRIPT',
        scriptId : 'customscript_fam_checksummaries_ss',
        deploymentId : 'customdeploy_fam_checksummaries_ss',
        displayId : 'checksummaries'
    };
    
    module.CreateSummaries = {
        desc: 'Create Missing Pre-compute Summaries',
        type : 'MAP_REDUCE',
        scriptId : 'customscript_fam_createsummaries_mr',
        deploymentId : 'customdeploy_fam_createsummaries_mr',
        displayId : 'createsummaries'
    };
    
    module.CheckSummaries.validator = function (params) {
        return (params && params.done !== 'T');
    };
   
    module.CheckSummaries.getNextBatch = function (params, id) {
        var ret = null;
       
        if (params && id) {
            ret = { 
                custscript_checksummaries_fprid : id,
                custscript_checksummaries_params : JSON.stringify(params)
            };
        }
       
        return ret;
    };
   
    module.CreateSummaries.validator = function (params) {
        var result = false;

        if (params && params.summariesToCreate) {
            var summariesToCreateArr = params.summariesToCreate.split(',');
            result = summariesToCreateArr.length > 0;
        }
       
        return result;
   };
   
   module.CreateSummaries.getNextBatch = function (params, id) {
       var ret = null;
       
       if (params && params.summariesToCreate && id) {
           var summariesToCreateArr = params.summariesToCreate.split(',');
           var endIdx = Math.min(constList.BatchSize.Precalc, summariesToCreateArr.length);
           var summariesToCreate = summariesToCreateArr.splice(0, endIdx);
           ret = { 
               custscript_createsummaries_fprid : id,
               custscript_createsummaries_list : summariesToCreate.join(',')
           };
           params.summariesToCreate = summariesToCreateArr.join(',');
       }
       
       return ret;
    };
    
    return module;
});
