/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

/* eslint space-before-function-paren: ["error", {"named": "never"}] */
/* eslint no-unused-vars: 0 */
// @formatter:off

var suite_l10n_searchPL = suite_l10n_searchPL || {};

suite_l10n_searchPL.SearchService = function SearchService(searchDefinition) {
  function performSearch() {
    var searchBuilder = new suite_l10n.app.SearchBuilder(searchDefinition);
    var search = searchBuilder.buildSearch();
    var rs = search.getIterator();
    var results = [];
    var converter = new suite_l10n.app.SearchResultConverter(searchDefinition.columns);

    while (rs.hasNext()) {
      results.push(converter.convertSearchResult(rs.next()));
    }

    return results;
  }

  function processRequest() {
    var response = new suite_l10n.service.view.ServiceResponse();
    try {
      response.responseDetails = performSearch();
      response.success = true;
    } catch (e) {
      response.success = false;
      response.responseDetails = e;
    }

    return response;
  }

  return {
    performSearch: performSearch,
    processRequest: processRequest
  };
};

function processRequest(requestDetails) { // eslint-disable-line no-unused-vars
  var searchService = new suite_l10n_searchPL.SearchService(requestDetails);

  return searchService.processRequest();
}
// @formatter:off
