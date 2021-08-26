/**
 * Copyright © 2017, 2017, Oracle and/or its affiliates. All rights reserved.
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
