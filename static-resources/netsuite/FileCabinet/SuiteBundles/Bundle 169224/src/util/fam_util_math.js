/**
 * � 2016 NetSuite Inc. 
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 *
*/

define([],
function (){
    return {
        roundByPrecision: function(num, prcn) {
            var prcn = prcn || 0,
                roundedNum = 0;
                
            roundedNum = +(Math.round(num * Math.pow(10, prcn)) / Math.pow(10, prcn));
            
            return roundedNum;
        },
        
        /**
         * @deprecated Use fam_util_currency.round(num, currencyId)
         */
        roundByCurrency: function(num, curr, intCurr){
            if(curr && intCurr && (intCurr.indexOf(curr) != -1)) {
                return Math.round(num);
            }
            else {
                return this.roundToDec(num);
            }
        },
        
        roundToDec: function(num){
            return Math.round(num*100.00) / 100.00;
        },
        
        roundDownByCurrency: function(num, curr, intCurr) {
            if(curr && intCurr && (intCurr.indexOf(curr) != -1)) {
                return Math.floor(num);
            }
            else {
                return this.roundDownToDec(num);
            }
        },
        
        roundDownToDec: function(num) {
            return Math.floor(num*100.00) / 100.00;
        },
        
        roundDownByPrecision: function(num, prcn){
            if(0 == prcn) {
                return Math.floor(num);
            }
            else {
                return this.roundDownToDec(num);
            }
        }
    };
});