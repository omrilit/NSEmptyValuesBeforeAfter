/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var suite_l10n = suite_l10n || {};
suite_l10n.app = suite_l10n.app || {};

suite_l10n.app.SearchBuilder = function SearchBuilder (searchDefinition) {
  var SearchFilter = ns_wrapper.SearchFilter;
  var SearchColumn = ns_wrapper.SearchColumn;

  function buildSearchObject () {
    var search = new ns_wrapper.Search(searchDefinition.type);

    search.setSavedSearchId(searchDefinition.id);
    // TODO add functions to ns_wrapper.Search
    // search.setPublic(searchDefinition.isPublic);
    // search.setRedirectToSearch(searchDefinition.isRedirectToSearch);
    // search.setRedirectToSearchResults(searchDefinition.isRedirectToResults);
    // search.setFilterExpression(searchDefinition.filterExpression);

    return search;
  }

  function buildFilters (filterDefs) {
    filterDefs = filterDefs || [];
    var filters = [];
    for (var i = 0; i < filterDefs.length; i++) {
      var currFilter = filterDefs[i];
      var hasValue = (currFilter.value && currFilter.value.length > 0);
      if (!currFilter.ignoreEmptyValue || hasValue) {
        filters.push((new SearchFilter(currFilter)).getRawObject());
      }
    }

    return filters;
  }

  function buildColumns (columnDefs) {
    columnDefs = columnDefs || [];
    var columns = [];
    for (var i = 0; i < columnDefs.length; i++) {
      columns.push((new SearchColumn(columnDefs[i])).getRawObject());
    }
    return columns;
  }

  function buildSearch () {
    var search = buildSearchObject(searchDefinition);
    var filters = buildFilters(searchDefinition.filters);
    var columns = buildColumns(searchDefinition.columns);

    search.addFilters(filters);
    search.addColumns(columns);

    return search;
  }

  return {
    buildSearch: buildSearch
  };
};
