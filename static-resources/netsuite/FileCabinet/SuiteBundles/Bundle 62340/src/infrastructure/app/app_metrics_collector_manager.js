/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This is class manages the collection of usage metrics.
 *
 * @author cboydon
 */

var infra = infra || {};
infra.app = infra.app || {};

infra.app.MetricsCollectorManager = function MetricsCollectorManager () {
  var basicFactory = new suite_l10n.app.factory.BasicFactory();

  // Loop all metrics def and collect the metrics
  // This is the entry point
  this.getMetrics = getMetrics;
  function getMetrics () {
    // retrieveMetricsDefinitions()
    var metricDefList = retrieveMetricsDefinitions();

    // collectMetrics();
    var collectedMetricsList = collectMetrics(metricDefList);

    // createMetricsRecord()
    return createMetricsRecord(collectedMetricsList);
  }

  // Retrieve metrics def from somewhere
  this.retrieveMetricsDefinitions = retrieveMetricsDefinitions;
  function retrieveMetricsDefinitions () {
    var metricDefList = new view.MetricsDefinitionList();
    metricDefList = metricDefList || [];

    return metricDefList;
  }

  // Collect each metrics
  this.collectMetrics = collectMetrics;
  function collectMetrics (metricDefList) {
    var collectedMetricsList = [];

    var startDateTime = new Date();
    for (var i = 0; i < metricDefList.length; i++) {
      var metricDef = metricDefList[i];

      var metricCollectorImpl = basicFactory.getInstance(metricDef.metricsCollectorImpl);

      var collectedMetric = metricCollectorImpl.getMetrics(metricDef);

      if (collectedMetric) {
        collectedMetricsList.push(collectedMetric);
      }
    }
    var endDateTime = new Date();

    if (collectedMetricsList.length > 0) {
      collectedMetric = collectTotalRunMetrics(collectedMetricsList, startDateTime, endDateTime);
      if (collectedMetric) {
        collectedMetricsList.push(collectedMetric);
      }
    }

    return collectedMetricsList;
  }

  // Create metric def for total run
  this.collectTotalRunMetrics = collectTotalRunMetrics;
  function collectTotalRunMetrics (collectedMetricsList, startDateTime, endDateTime) {
    var metricDef = createTotalRunMetricsDefinition(
      collectedMetricsList, startDateTime, endDateTime);

    var metricCollectorImpl = basicFactory.getInstance(metricDef.metricsCollectorImpl);

    return metricCollectorImpl.getMetrics(metricDef);
  }

  function createTotalRunMetricsDefinition (collectedMetricsList, startDateTime, endDateTime) {
    var TOTAL_RUN_METRICS_LABEL = 'Total Run Metrics';
    var TOTAL_RUN_METRICS_IMPL = 'infra.app.MetricsCollectorTotalRunImpl';
    nlapiLogExecution('debug', 'startDateTime', startDateTime);
    nlapiLogExecution('debug', 'endDateTime', endDateTime);

    var metricDefProperties = {
      'startDate': startDateTime,
      'endDate': endDateTime
    };

    var metricDef = new view.MetricsDefinition();
    metricDef.label = TOTAL_RUN_METRICS_LABEL;
    metricDef.metricsCollectorImpl = TOTAL_RUN_METRICS_IMPL;
    metricDef.properties = metricDefProperties;

    return metricDef;
  }

  // Create metrics record
  this.createMetricsRecord = createMetricsRecord;
  function createMetricsRecord (collectedMetricsList) {
    var resultIdList = [];

    if (collectedMetricsList && collectedMetricsList.length > 1) {
      var metricsDao = new dao.MetricsDAO();

      for (var i = 0; i < collectedMetricsList.length; i++) {
        var collectedMetric = collectedMetricsList[i];
        var resultId = metricsDao.create(collectedMetric);

        resultIdList.push(resultId);
      }
    }

    return resultIdList;
  }
};
