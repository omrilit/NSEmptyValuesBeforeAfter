/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This is the interface for collecting a specific type of metrics.
 *
 * @author cboydon
 */

var infra = infra || {};
infra.app = infra.app || {};

infra.app.MetricsCollector = function MetricsCollector (actionImpl) {
  function getMetrics (metricsDefinition) {
    if (actionImpl) {
      return actionImpl.getMetrics(metricsDefinition);
    } else {
      throw nlapiCreateError('DUNNING_METRICS_COLLECTOR_CLASS_NOT_IMPLEMENTED', 'Please implement a MetricsCollector');
    }
  }

  return {
    getMetrics: getMetrics
  };
};
