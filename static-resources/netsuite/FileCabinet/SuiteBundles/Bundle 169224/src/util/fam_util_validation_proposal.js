/**
 * © 2016 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or
 * otherwise make available this code.
 */

define(['../const/fam_const_customlist',
        './fam_util_math',
        '../adapter/fam_adapter_search',],
        
function (fCustomList, mathUtil, search){
    return {
        /**
         * Checks if the proposal quantity is >= the minimum requirement
         * @param {Number} qty - the quantity of the proposal
         * @param {Boolean} isOrigProp - original proposal
         * @return {Boolean} - quantity is valid
         */
        isValidQuantity: function(qty, isOrigProp){
            var min = 1;
            if (isOrigProp){
                min = 2;
            }
            return +qty >= min;
        },
        
        /**
         * Checks if the proposal quantity is >= the minimum requirement
         * @param {Number} cost - the cost of the proposal 
         * @return {Boolean} - cost is valid
         */
        isValidCost: function(cost){
            var low = 0;
            return +cost > low;
        },
        
        /**
         * Checks if the remaining cost/quantity enough 
         * for the proposed split 
         */
        isValueEnough: function(value, remain){
            return value<=remain;
        },
        
        /**
         * Checks if the proposal status is New (1)
         * @param {Number} status - the status of the proposal 
         * @return {Boolean} - status is valid
         */
        isValidStatus: function(status){
            return (+status == fCustomList.ProposalStatus.New);
        },
        
        /**
         * Checks if the number of split items >= the minimum requirement
         * @param {List} splitObjs - the list of split items
         * @return {Boolean} - split count is valid
         */
        isValidSplitCount : function(splitObjs){
            var isValid = false,
                splitCount = splitObjs.length,
                min = 2;
            
            if (splitCount >= min ||
                (splitCount === 1 && splitObjs[0].split)) {
                isValid = true;
            }
            return isValid;
        },

        /**
         * Checks if the number of split items >= the minimum requirement
         * NOTE: Only for CS.
         * @param {Number} sublistCount - the list of split items
         * @param {Boolean} isSplitRem - flag if Split Remaining is checked
         * @return {Boolean} - split count is valid
         */
        isValidSplitSublistCount : function (sublistCount, isSplitRem, remCost, remQty) {
            var isValid = false,
                min = 2;
            if ((isSplitRem && remCost>0 && remQty>0) ||
                (sublistCount >= min)) {
                isValid = true;
            }
            return isValid;
        },
        
        /**
         * Checks if the total cost = original cost
         * @param {Number} totalCost - sub proposals total cost
         * @param {Number} origCost - original proposal cost
         * @return {Boolean} - total cost is valid
         */
        isValidTotalCost : function(totalCost, origCost){
            return totalCost == origCost;
        },
        
        /**
         * Checks if the total qty = original qty
         * @param {Number} totalqty - sub proposals total qty
         * @param {Number} origqty - original proposal qty
         * @return {Boolean} - total qty is valid
         */
        isValidTotalQty : function(totalQty, origQty){
            return totalQty == origQty;
        },
        
        /**
         * Checks for matching Split BGPs
         * @param {array} propIds - list of proposal ids for checking
         * @param {boolean} useFPR - indicates whether FPR should be checked instead of BGP
         * @return {array} - list of proposal ids with existing split bgps
         */
        getMatchedProposalsForSplitting: function(propIds, useFPR){
            var bgpSearch,
                stateField = useFPR ? 'custrecord_fam_procparams' : 'custrecord_far_proins_procstate',
                baseFilters = useFPR ?
                              [['custrecord_fam_procstatus','anyof',
                                  fCustomList.ProcessStatus.InProgress,
                                  fCustomList.ProcessStatus.Queued],
                              'and',
                              ['custrecord_fam_procid','is','proposalSplit'],
                               'and'] :
                              [['custrecord_far_proins_procstatus','anyof',
                                    fCustomList.BGProcessStatus.InProgress,
                                    fCustomList.BGProcessStatus.Queued],
                               'and',
                               ['custrecord_far_proins_functionname','is',
                                    'customscript_fam_mr_proposalsplit'],
                               'and'],
                propFilters = [],
                res, resSet, propInProc = [];

            baseFilters.push(['isinactive','is','F']);
            baseFilters.push('and');
            //construct filter expressions for search
            for(var i = 0; i<propIds.length; i++){
                propFilters.push([stateField,'contains','"' + propIds[i] + '":[{']);
                propFilters.push('or');
            }
            propFilters.pop();
            baseFilters.push(propFilters);
            
            //create search
            bgpSearch = search.create({
                type    : useFPR ? 'customrecord_fam_process' : 'customrecord_bg_procinstance',
                columns : ['internalid',
                          stateField],
                filters : baseFilters
            }); 
            
            res = bgpSearch.run();
            resSet = res.getRange(0,10);
            
            for(var i = 0; i<resSet.length; i++){
                var svData = resSet[i].getValue(res.columns[1]).match(/"(\d+)":/);
                svData = svData[0].match(/\d+/);
                propInProc.push(+svData[0]);
            }
            return propInProc;
        },
        
        /**
         * Checks for matching Asset Generation BGPs
         * @param {array} propIds - list of proposal ids for checking
         * @param {boolean} useFPR - indicates whether FPR should be checked instead of BGP
         * @return {array} - list of proposal ids with existing asset generation bgps
         */
        getMatchedProposalsForGeneration: function(propIds, useFPR){
            var bgpSearch,
                stateField = useFPR ? 'custrecord_fam_procparams' : 'custrecord_far_proins_procstate',
                baseFilters = useFPR ?
                        [['custrecord_fam_procstatus','anyof',
                            fCustomList.ProcessStatus.InProgress,
                            fCustomList.ProcessStatus.Queued],
                        'and',
                        ['custrecord_fam_procid','is','assetGeneration'],
                         'and'] :
                        [['custrecord_far_proins_procstatus','anyof',
                              fCustomList.BGProcessStatus.InProgress,
                              fCustomList.BGProcessStatus.Queued],
                         'and',
                         ['custrecord_far_proins_functionname','is',
                              'ncFAR_GenerateAssetsFromPropList'],
                         'and'],
                propFilters = [], 
                propInProc = [],
                copyPropIds = propIds.slice(0),
                res, resSet;
            
            baseFilters.push(['isinactive','is','F']);
            baseFilters.push('and');
            
            //construct filter expressions for search
            for(var i = 0; i<copyPropIds.length; i++){
                propFilters.push([stateField,'is', copyPropIds[i].toString()]);
                propFilters.push('or');
                propFilters.push([stateField,'contains', copyPropIds[i] + ':']);
                propFilters.push('or');
                propFilters.push([stateField,'contains',':' + copyPropIds[i]]);
                propFilters.push('or');
            }
            propFilters.pop();
            baseFilters.push(propFilters);
            
            //create search
            bgpSearch = search.create({
                type    : useFPR ? 'customrecord_fam_process' : 'customrecord_bg_procinstance',
                columns : ['internalid',
                          stateField],
                filters : baseFilters
            }); 
            
            res = bgpSearch.run();
            resSet = res.getRange(0,10);
            for(var i = 0; i<resSet.length; i++){
                for(var j = 0; j<copyPropIds.length; j++){
                    var matches = resSet[i].getValue(res.columns[1]).split(':');
                    if(matches.indexOf(copyPropIds[j]+'')>-1){
                        propInProc.push(copyPropIds[j]);
                        copyPropIds.splice(j,1);
                        resSet.splice(i,1);
                    }
                }
            }
            return propInProc;
        },

        /**
         * Checks if minimum amount of the cost is the minimum amount allowed in that 
         * currency (1 for 0 DP and 0.01 for those with DP)
         * @param {Number} totalqty - sub proposals total qty
         * @param {Number} origqty - original proposal qty
         * @return {Boolean} - total qty is valid
         */
        isMinAmountValid:  function(cost, iterations, prcn) {
            var ret = true;
            if (cost > 0) {
                var minAmount = 1 / Math.pow(10, prcn);
                var computedCost = mathUtil.roundDownByPrecision((cost/iterations), prcn);
                ret = (computedCost >= minAmount);
            }
            
            return ret;
        }
    }
});