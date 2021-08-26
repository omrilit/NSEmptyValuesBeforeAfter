/**
 * © 2017 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */
 
define(['N/currency'], function (currency) {
    
    return {
        exchangeRate : function (options) {
            return currency.exchangeRate(options);
        }
    };
});
