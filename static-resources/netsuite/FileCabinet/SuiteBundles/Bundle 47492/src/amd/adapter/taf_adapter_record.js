/**
 * Copyright © 2017, 2017, Oracle and/or its affiliates. All rights reserved.
 */

define(["N/record"],
    adapterRecord);

function adapterRecord(record) {
    return {
        create: function(options) {
            return record.create(options);
        },
        'delete': function(options) {
            return record['delete'](options);
        },
        load: function(options){
            return record.load(options);
        },
        submitFields: function(options){
            return record.submitFields(options);
        }, 
        getType: function(options){
            return record.getType(options);
        }
    }    
}