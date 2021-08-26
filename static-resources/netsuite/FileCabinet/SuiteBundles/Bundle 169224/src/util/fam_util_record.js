/**
 * � 2016 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or
 * otherwise make available this code.
 * 
 * @NScriptName FAM Record Utility
 * @NScriptId _fam_util_record
 * @NApiVersion 2.0
*/

define([
    '../adapter/fam_adapter_cache',
    '../adapter/fam_adapter_record',
    '../adapter/fam_adapter_search',
    '../util/fam_util_envcfg'
],
function (cache, record, search, envcfg){
    return {
        /**
         * Validates if the Subsidiary and record is a valid combination
         * Parameters:
         *     subId {number} - internal ID of the subsidiary record
         *     recordType {record.Type} - record type of the record to check the subsidiary of
         *     recordId {number} - internal ID of the record
         *     
         * Returns:
         *     boolean - TRUE if valid, FALSE if not
         */
        isValidSubsidiaryRecCombination : function (subId, recordType, recordId){
            if(envcfg.isOneWorld()) {
                // Check if record is existing before search to prevent fake false
                if(this.isRecordExisting(recordType, recordId)) {
                    var searchObj = search.create({
                        type : recordType,
                        filters : [["internalid", "is", recordId], "and",
                                   ["isinactive", "is", "F"], "and",
                                   ["subsidiary", "anyof", [subId]]],
                        columns : ["subsidiary"]
                    });
                    var searchResultSet = searchObj.run();
                    var res = searchResultSet.getRange(0,1);
                    
                    return (res && res.length > 0) ? true : false;
                }
                
            }
            return true;
        },
        
        /**
         * Validates if the record is existing
         * Parameters:
         *     recType {string} - record type of the record to check the subsidiary of
         *     recId {number} - internal ID of the record
         *     force {boolean} - force check; bypass cached results
         * Returns:
         *     boolean - TRUE if valid, FALSE if not
         */
        isRecordExisting : function (recType, recId, force) {
            var searchObj, searchResultSet, searchResult,
                cacheName = 'isRecordExisting',
                cacheKey = recType + '-' + recId,
                cacheObj = cache.get({ name : cacheName }),
                isActive = cacheObj.get({ key : cacheKey });
                
            if (force || !isActive) {
                searchObj = search.create({
                    type : recType,
                    filters : [['internalid', 'is', recId], 'and', ['isinactive', 'is', 'F']]
                });
                searchResultSet = searchObj.run();
                searchResult = searchResultSet.getRange(0, 1) || [];
                isActive = searchResult.length > 0 ? 'T' : 'F';
                
                cacheObj.put({
                    key : cacheKey,
                    value : isActive,
                    ttl : 60 * 60 * 1 // hour
                });
            }
            
            return isActive === 'T';
        }
    };
});