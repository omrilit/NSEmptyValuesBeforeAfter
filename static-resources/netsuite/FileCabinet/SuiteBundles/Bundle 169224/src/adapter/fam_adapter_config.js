/**
 * � 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

define(["N/config"],
    famAdapterConfig);

function famAdapterConfig(config) {
    
    return {
        getType: function(param){
            return param ? config.Type[param] : config.Type;
        },
        load : function(options) {
            return config.load(options);
        }
    }
}