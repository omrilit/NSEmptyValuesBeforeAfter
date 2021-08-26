/**
 * Copyright © 2017, 2017, Oracle and/or its affiliates. All rights reserved.
 */

define(["N/config"], adapterConfig);

function adapterConfig(config) {
    
    return {
        getType: function(param){
            return param ? config.Type[param] : config.Type;
        },
        load : function(options) {
            return config.load(options);
        }
    }
}