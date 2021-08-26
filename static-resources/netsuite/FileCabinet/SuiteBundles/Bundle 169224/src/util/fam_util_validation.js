/**
 * © 2016 NetSuite Inc. 
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 *
 * @NScriptName FAM Validation Utility
 * @NScriptId _fam_util_validation
 * @NApiVersion 2.x
*/

define(['../adapter/fam_adapter_search',
        '../const/fam_const_customlist'],
        
function (search, fCustomList){
    return {
        /**
         * Checks if there is on-going process given a function name
         * @param {String} funcName - BGP function name to check
         * @return {boolean} true - no on-going process
         *                   false - has on-going process  
         */
        isValidProcess: function(funcName){
            var isValid = true,
                searchRes = [],
                filters = [['custrecord_far_proins_procstatus', 'anyof', 
                                [fCustomList.BGProcessStatus.InProgress,
                                 fCustomList.BGProcessStatus.Queued]],
                           'and',
                           ['custrecord_far_proins_functionname', 'is', funcName],
                           'and',
                           ['isinactive', 'is', 'F']];
        
            var searchObj = search.create({
                type : 'customrecord_bg_procinstance',
                filters : filters
            });
            
            var searchResultSet = searchObj.run();

            var res = searchResultSet.getRange(0,1);
            if (0 < res.length){
                isValid = false;
            }
            return isValid;
        }
    }
});