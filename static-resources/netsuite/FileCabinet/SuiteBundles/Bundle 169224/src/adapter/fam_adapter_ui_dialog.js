/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 *  
 */

define(['N/ui/dialog'],

function famAdapterUIDialog(ui) {
    return {
        alert : function(options){
            return ui.alert(options);
        },
        confirm : function(options){
            if (options.sync) {
                // Use browser-native confirm dialog but maintaining promise.then format
                // TODO will error when user tries to use promise.catch;
                var confRes = confirm(options.message);
                return {
                    then: function (f) {
                        return f(confRes);
                    }
                }
            }
            return ui.confirm(options);
        },
        create : function(options){
            return ui.create(options);
        }
    };
});