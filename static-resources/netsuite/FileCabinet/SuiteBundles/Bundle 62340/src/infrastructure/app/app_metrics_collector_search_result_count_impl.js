/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This is an implementation of infra.app.MetricsCollector.
 * This implementation gets the metrics based on a saved search.
 *
 * @author cboydon
 */

var infra = infra || {};
infra.app = infra.app || {};

infra.app.MetricsCollectorSearchResultCountImpl = function MetricsCollectorSearchResultCountImpl () {
  this.getMetrics = function getMetrics (metricDef) {
    try {
      var startDate = new Date();
      var searchResult = execSearch(metricDef);
      var count = this.processResult(searchResult);
      var endDate = new Date();

      var metricsCreator = new infra.app.MetricsCreator();
      var metricModel = metricsCreator.createModel(metricDef.label, count, startDate, endDate);

      validateOutput(metricModel.value);

      return metricModel;
    } catch (e) {
      nlapiLogExecution(
        'ERROR',
        'infra.app.MetricsCollectorSearchResultCountImpl ',
        e + '\nSaved search ID: ' + metricDef.properties.savedSearchId);
    }
  };

  function validateOutput (value) {
    if (value == null || value == undefined ||
      value < 0 || isNaN(value)) {
      throw new Error('value cannot be null, undefined, less than 0 or non-numeric.');
    }
  }

  this.execSearch = execSearch;
  function execSearch (metricDef) {
    var properties = metricDef.properties;

    var savedSearchId = properties.savedSearchId;
    var savedSearchRec = properties.savedSearchRec;

    var searchDef = new suite_l10n.view.Search();
    searchDef.id = savedSearchId;
    searchDef.type = savedSearchRec;

    var searchBuilder = new suite_l10n.app.SearchBuilder(searchDef);
    var builtSearch = searchBuilder.buildSearch();
    var iterator = builtSearch.getIterator();
    return iterator.next();
  }

  this.processResult = processResult;
  function processResult (searchResult) {
    var iteratorCols = searchResult.getAllColumns();
    return searchResult.getValue(iteratorCols[0]);
  }
};
