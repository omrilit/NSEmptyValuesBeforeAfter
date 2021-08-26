/**
 * © 2016 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */
 
define(["N/error",
        ],
    famAdapterError);

function famAdapterError(error) {
    
    return {
        create : function(options) {
            return error.create(options);
        }
    }
}