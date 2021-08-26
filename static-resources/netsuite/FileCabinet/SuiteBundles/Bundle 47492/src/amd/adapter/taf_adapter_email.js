/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
  * @NModuleScope Public
 */
 
define(["N/email",
        ],
    adapterEmail);

function adapterEmail(email) {
    
    return {
        send : function(options) {
            return email.send(options);
        }
    }
}