/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This is the view objects of the usage metrics.
 *
 * @author cboydon
 */

var view = view || {};

view.MetricsDefinition = function MetricsDefinition () {
  var obj = {
    label: null,
    properties: {},
    metricsCollectorImpl: null
  };

  Object.seal(obj);
  return obj;
};
