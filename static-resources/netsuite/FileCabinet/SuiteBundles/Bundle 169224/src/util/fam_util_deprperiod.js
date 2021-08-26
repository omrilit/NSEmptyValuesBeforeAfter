/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 */

define(['../adapter/fam_adapter_search',
        '../const/fam_const_customlist',],

function (search, constList){
    var module = {};
    
    /**
     * Checks the value of convention against depreciation period
     *
     * Parameters:
     *     deprMethodId
     *     deprPeriod
     *     convention
     * Returns:
     *     boolean
    **/
    module.validateConventionToDeprPeriod = function(options) {
        var deprMethodId = options.deprMethodId,
            deprPeriod = options.deprPeriod,
            convention = +options.convention || constList.Conventions.None;
        
        if (!deprPeriod) {
            if (!deprMethodId) {
                return true; // no values loaded yet
            }
            
            deprPeriodRes =  search.lookupFields({ 
                type: 'customrecord_ncfar_deprmethod',
                id: deprMethodId,
                columns: ['custrecord_deprmethoddeprperiod'] })['custrecord_deprmethoddeprperiod'];
            
            deprPeriod = deprPeriodRes[0] ? +deprPeriodRes[0].value : 0;
        }
        
        if ((deprPeriod === constList.DeprPeriod.Annually &&
                convention === constList.Conventions['Mid-Month']) ||
            (deprPeriod === constList.DeprPeriod.Monthly &&
                (convention === constList.Conventions['Half-Year'] ||
                convention === constList.Conventions['Mid-Quarter']))) {

            return false;
        }
        
        return true;
    }
    
    return module;
});