/**
 * © 2016 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or
 * otherwise make available this code.
 * 
 * @NApiVersion 2.x
 */
define([],
function (){
    return {
        
        /**
         * Returns the total cost, total quantity, and split count of a given split items
         * @param {Array} splitItems - array of split details {Object}
         *                           - e.g.
         *                             [{
         *                                 cost : 100 
         *                                 qty  : 1
         *                             }]
         * @return {Object} - e.g. 
         *                    {
         *                        totalCost  : 200
         *                        totalQty   : 2
         *                        splitCount : 2
         *                    }
         */
        getSplitSummary : function(splitItems, prcn) {
            var cost        = 0.0,
                qty         = 0,
                splitRemLen = 0,
                retObj      = {};
                  
            for (var i=0; i < splitItems.length; i++){
                var splitItem = splitItems[i];
                if (splitItem.cost){
                    cost += (+splitItem.cost);
                }
                if (splitItem.qty){
                    qty += (+splitItem.qty);
                }
                
                // Counting goes here
                if (splitItem.split) {
                    splitRemLen = this.getSplitIterations(+splitItem.qty, +splitItem.split);
                }
            }
            if (splitRemLen){ // TODO Prepare for data input like '[{cost:50,qty:50,split:1},{cost:50,qty:50,split:2}]'
                splitRemLen -= 1;
            }
            
            retObj.totalCost = +cost.toFixed(prcn);
            retObj.totalQty = qty;
            retObj.splitCount = splitItems.length + splitRemLen;
            
            return retObj;
        },
        
        /**
         * Returns the number of split items a 'split remaining' object will be divided into 
         * @param {Number} qty - remaining quantity of the 'split remaining' object
         * @return {Number} splitInto - the quantity per new proposal created
         */
        getSplitIterations : function(qty, splitInto) {
            return Math.ceil(qty/splitInto);
        },
    }
});