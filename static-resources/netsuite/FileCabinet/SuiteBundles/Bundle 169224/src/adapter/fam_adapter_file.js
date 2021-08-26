/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

define(["N/file"],
    famAdapterFile);

function famAdapterFile(file) {
    
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