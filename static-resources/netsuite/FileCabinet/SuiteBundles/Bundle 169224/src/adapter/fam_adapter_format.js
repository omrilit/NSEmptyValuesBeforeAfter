/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code. 
 */

define(["N/format"],
    famAdapterFormat);

function famAdapterFormat(format) {
    
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