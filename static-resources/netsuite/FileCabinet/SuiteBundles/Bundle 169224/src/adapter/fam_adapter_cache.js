/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */
 
define(["N/cache",
        ],
    famAdapterCache);

function famAdapterCache(cache) {
    
    return {
        get : function(options) {
            return cache.getCache(options);
        },
        getScope : function(param){
            return param ? cache.Scope[param] : cache.Scope;
        }
    }
}