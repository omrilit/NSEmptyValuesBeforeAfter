/**
 * © 2016 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or
 * otherwise make available this code.
 * 
 * @NScriptName FAM Location Utility
 * @NScriptId _fam_util_location
 * @NApiVersion 2.x
*/

define([
    '../adapter/fam_adapter_runtime', 
    '../const/fam_const_customlist'
], 

function (runtime, list){
    return {
        
        /*
         * Checks if location is mandatory based on the following conditions: 
         * - Disposal Type == Sale | Location is required if either:
         *      - MLI = T || Make Locations Mandatory = T
         * - Disposal Type == Write-off | Location is required if:
         *      -Make Locations Mandatory = T
         */
        isMandatory: function isMandatory(disposalType) {
            var userObj = runtime.getCurrentUser();
            var blnMultiLocInvt = runtime.isFeatureInEffect({feature :'MULTILOCINVT'});
            var blnLocMandatory = userObj.getPreference('LOCMANDATORY');

            var retVal = false;
            
            if (blnLocMandatory) {
                retVal = true;
            }
            else if (disposalType == list.DisposalType['Sale'] && blnMultiLocInvt) {
                retVal = true;
            }
            
            return retVal;
        }
    };
});