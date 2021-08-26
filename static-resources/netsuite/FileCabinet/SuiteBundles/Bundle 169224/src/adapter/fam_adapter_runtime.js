/**
 * © 2016 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

define(["N/runtime",
        ],
    famAdapterRuntime);

function famAdapterRuntime(runtime) {
    
    return {
        getCurrentScript : function() {
            return runtime.getCurrentScript();
        },
        
        getCurrentUser : function() {
            return runtime.getCurrentUser();
        },
        
        isFeatureInEffect : function(options) {
            return runtime.isFeatureInEffect(options);
        },
        
        getPreference : function(options) {
            return this.getCurrentUser().getPreference(options);
        },
        
        getExecutionContext : function(){
            return runtime.executionContext;
        },
        
        getContextType : function (param) {
            return param ? runtime.ContextType[param] : runtime.ContextType;
        }
    };
};