/**
 * © 2016 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 * 
 * @NAPIVersion 2.0
 */

define([
    '../adapter/fam_adapter_error',
    '../adapter/fam_adapter_search',
    '../util/fam_util_deprformula',
    '../util/fam_util_log'
], getDeprMethods);

function getDeprMethods(fError, fSearch, fDeprFormula, fLog) {
    var DepreciationMethods = {};
    
    /**
     * Load Depreciation Methods and Formulas
     *
     * Returns: {Object}
     *     deprMethods {FAM.SearchResult[]} - Depreciation Methods loaded
     *     deprFunctions {FAM.FunctionToken[]} - Depreciation Formulas loaded
     * Throws:
     *     Invalid formula expression
    **/
    DepreciationMethods.loadDeprMethodsFunctions = function () {
        fLog.startMethod('DepreciationMethods.loadDeprMethodsFunctions');
        var returnObj = {
            deprMethods: {},
            deprFunctions: {}
        };
        
        // search for all depreciation methods
        var searchObj = fSearch.create({
            type: 'customrecord_ncfar_deprmethod',
            // filters: TODO: filter inactives? filter for specific method based on asset ?
            columns: [
                fSearch.createColumn({ name: 'custrecord_deprmethodformula' }),
                fSearch.createColumn({ name: 'custrecord_deprmethodendperiod' }),
                fSearch.createColumn({ name: 'custrecord_deprmethodnextmethod' }),
                fSearch.createColumn({ name: 'custrecord_deprmethoddeprperiod' }),
                fSearch.createColumn({ name: 'custrecord_deprmethod_accrual_convention' }),
                fSearch.createColumn({ name: 'custrecord_deprmethod_final_convention' })
            ]
        });

        // initialize hashmap
        this.deprMethods = {};
        this.deprFunctions = {};
        
        // populate hashmap
        searchObj.run().each(function(res) {
            var deprMethodId = +res.id;
            returnObj.deprMethods[deprMethodId] = {
                id: deprMethodId,
                formula: res.getValue({name: 'custrecord_deprmethodformula'}),
                end_period: res.getValue({name: 'custrecord_deprmethodendperiod'}),
                next_method: res.getValue({name: 'custrecord_deprmethodnextmethod'}),
                depr_period: res.getValue({name: 'custrecord_deprmethoddeprperiod'}),
                accrual_convention: res.getValue({name: 'custrecord_deprmethod_accrual_convention'}),
                final_convention: res.getValue({name: 'custrecord_deprmethod_final_convention'})
            };
            returnObj.deprFunctions[deprMethodId] = new fDeprFormula.FunctionToken();
            deprFormula = returnObj.deprMethods[deprMethodId].formula;

            if (!fDeprFormula.DeprFormula.parseFormula(deprFormula, returnObj.deprFunctions[deprMethodId])) {
                throw fError.create({
                    name: 'INVALID_DATA', 
                    message: 'Invalid Formula expression: ' + deprFormula
                });
            }
            
            return true;
        });

        fLog.endMethod();
        return returnObj;
    };
    
    /**
     * Retrieves the depreciation method to be used on the given period
     *
     * Parameters:
     *     metId {number} - Internal Id of the depreciation method of the record to be depreciated
     *     period {number} - period wherein the record will be depreciated
     * Returns:
     *     {FAM.SearchResult[]} - Depreciation Method to be used
    **/
    DepreciationMethods.getDeprMethod = function (metId, period) {
        fLog.startMethod('DepreciationMethods.getDeprMethod');
        
        if (!this.deprMethods) {
            var methodsAndFunctions = this.loadDeprMethodsFunctions();
            this.deprMethods = methodsAndFunctions.deprMethods;
            this.deprFunctions = methodsAndFunctions.deprFunctions;
        }
        var ret = this.deprMethods[metId];
        var endPeriod = +ret.end_period || 0;
        
        if (endPeriod !== 0 && period > endPeriod) {
            ret = this.getDeprMethod(ret.next_method, period - endPeriod);
        }
        fLog.endMethod();
        return ret;
    };
    
    /**
     * Returns result of computation for method id's function and record values
     *
     * Parameters:
     *     deprMethodId {Integer} - depreciation method id
     *     recordValues {Object} - computation values
     * Returns:
     *     {number} - result amount from computation
    **/
    DepreciationMethods.executeFunction = function(deprMethodId, recordValues) {
        return fDeprFormula.DeprFormula.ExecFormula(this.deprFunctions[deprMethodId], recordValues);
    };

    return DepreciationMethods;
};