/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * Handles the search for contacts via url request
 *
 * @author mjaurigue
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.ContactSearchHandler = function ContactSearchHandler () {
  this.searchContacts = function searchContacts (contactIDs) {
    if (contactIDs.length === 0) return;
    var suiteletURL = ns_wrapper.api.url.resolveUrl('SUITELET', 'customscript_3805_search_contacts_su', 'customdeploy_3805_search_contacts_su');
    var strContactIDs = contactIDs.toString();
    var responseObj = ns_wrapper.api.url.requestUrlCs(suiteletURL, {'contactIDs': strContactIDs.toString()});
    return JSON.parse(responseObj.getBody());
  };
};
