/**
 * Copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 * @NModuleScope SameAccount
 */

define(["N/file"],
        adapterFile);

function adapterFile(file) {
    
    return {
        create : function(options) {
            return file.create(options);
        },
        'delete' : function(options) {
            return file['delete'](options);
        },
        getType : function(param){
            return param ? file.Type[param] : file.Type;
        },
        load : function(options) {
            return file.load(options);
        }
    };
}
