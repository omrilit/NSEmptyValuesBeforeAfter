/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This is the scheduled script that performs the collection of metrics
 *
 * @author cboydon
 */

var infra = infra || {};
infra.comp = infra.comp || {};
infra.comp.ss = infra.comp.ss || {};
infra.comp.ss.MetricsCollector = infra.comp.ss.MetricsCollector || {};

infra.comp.ss.MetricsCollector.run = function run () {
  var collector = new infra.MetricsCollector();
  collector.collectMetrics();
};

infra.MetricsCollector = function MetricsCollector () {
  this.collectMetrics = function () {
    var manager = new infra.app.MetricsCollectorManager();
    manager.getMetrics();
  };
};
