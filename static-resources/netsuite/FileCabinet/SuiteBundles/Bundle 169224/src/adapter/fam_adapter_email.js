/**
 * © 2016 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */
 
define(["N/email"],
    famAdapterEmail);

function famAdapterEmail(email) {
    
    return {
        send : function(options) {
            return email.send(options);
        }
    }
}