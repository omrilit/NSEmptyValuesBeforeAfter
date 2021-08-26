/**
 * Copyright © 2018, 2019, Oracle and/or its affiliates. All rights reserved.
 * @NModuleScope SameAccount
 */

define(["N/runtime"],
    adapterRuntime);

function adapterRuntime(runtime) {
    
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
        
        getContextType : function(){
            return runtime.ContextType;
        }
    };
};