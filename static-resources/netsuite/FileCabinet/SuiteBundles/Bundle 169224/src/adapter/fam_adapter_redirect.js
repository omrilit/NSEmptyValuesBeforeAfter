/**
 * © 2016 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

define(["N/redirect"],
    famAdapterRedirect);

function famAdapterRedirect(redir) {
    var module = {};
    module.redirect = function(options) {
        return redir.redirect(options);
    };
    module.toRecord = function(options) {
        return redir.toRecord(options);
    };
    module.toSavedSearch = function(options) {
        return redir.toSavedSearch(options);
    };
    module.toSearch = function(options) {
        return redir.toSearch(options);
    };
    module.toSearchResult = function(options) {
        return redir.toSearchResult(options);
    };
    module.toSuitelet = function(options) {
        return redir.toSuitelet(options);
    };
    module.toTaskLink = function(options) {
        return redir.toTaskLink(options);
    };
    
    return module;
}