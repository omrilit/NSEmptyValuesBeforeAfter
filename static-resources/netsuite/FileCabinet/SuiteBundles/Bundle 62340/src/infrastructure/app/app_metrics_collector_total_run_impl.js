/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This is an implementation of infra.app.MetricsCollector.
 * This implementation gets the total run time of a metrics collection run.
 *
 * @author cboydon
 */

var infra = infra || {};
infra.app = infra.app || {};

infra.app.MetricsCollectorTotalRunImpl = function MetricsCollectorTotalRunImpl () {
  this.getMetrics = function (metricDef) {
    try {
      validateInput(metricDef);

      var properties = metricDef.properties;
      var startDate = properties.startDate;
      var endDate = properties.endDate;
      var runTime = endDate - startDate;

      var metricsCreator = new infra.app.MetricsCreator();
      return metricsCreator.createModel(metricDef.label, runTime, startDate, endDate);
    } catch (e) {
      nlapiLogExecution(
        'ERROR',
        'infra.app.MetricsCollectorTotalRunImpl',
        e);
    }
  };

  function validateInput (metricDef) {
    if (metricDef || metricDef.properties) {
      var properties = metricDef.properties;
      var startDate = properties.startDate;
      var endDate = properties.endDate;

      if (!startDate) {
        throw new Error('startDate cannot be 0, null or undefined.');
      } else if (!endDate) {
        throw new Error('endDate cannot be 0, null or undefined.');
      } else if (!(startDate instanceof Date)) {
        throw new Error('startDate must be an instance of Date.');
      } else if (!(endDate instanceof Date)) {
        throw new Error('endDate must be an instance of Date.');
      } else if (startDate > endDate) {
        throw new Error('startDate cannot be greater than endDate.');
      }
    } else {
      throw new Error('no or wrong input obj');
    }
  }
};
