/**
 * � 2017 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or
 * otherwise make available this code.
 *
 */

define([],

function (){
    var module = {};
    
    module.formatForFPR = function(error) {
        var retVal = error;
        
        if (error) {
            var errorObj = error;
            
            try {
                errorObj = JSON.parse(error);            
            }
            catch (e) {
                // do nothing
            }
            
            retVal = {
                name: errorObj.name || 'UNEXPECTED_ERROR',
                message: errorObj.message || error
            };
        }
        
        return retVal;
    };
    
    return module;
});