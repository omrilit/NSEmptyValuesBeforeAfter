/**
 * Copyright © 2017, 2017, Oracle and/or its affiliates. All rights reserved.
 */

define(["N/format"],
    adapterFormat);

function adapterFormat(format) {
    
    return {
        dateToString : function (dateObj) {
            return this.format({ value: dateObj, type: this.getType('DATE') });
        },
        format : function(options) {
            return format.format(options);
        },
        getType : function(param) {
            return param ? format.Type[param] : format.Type;
        },
        parse : function(options) {
            return format.parse(options);
        },
        stringToDate : function (dateStr) {
            return this.parse({ value: dateStr, type: this.getType('DATE') });
        }
    };
}