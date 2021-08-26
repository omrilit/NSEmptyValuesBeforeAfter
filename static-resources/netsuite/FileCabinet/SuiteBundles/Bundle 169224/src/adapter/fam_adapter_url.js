/**
 * © 2016 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

define(["N/url"],
    famAdapterUrl);

function famAdapterUrl(url) {
    return {
        format  : function(options) {
            return url.format(options);
        },
        resolveRecord  : function(options) {
            return url.resolveRecord(options);
        },
        resolveScript  : function(options) {
            return url.resolveScript(options);
        },
        resolveTaskLink : function(options) {
            return url.resolveTaskLink(options);
        }
    };
}