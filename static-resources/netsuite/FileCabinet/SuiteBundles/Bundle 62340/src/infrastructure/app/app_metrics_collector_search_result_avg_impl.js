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

infra.app.MetricsCollectorSearchResultAverageImpl = function MetricsCollectorSearchResultAverageImpl () {
  var parent = new infra.app.MetricsCollectorSearchResultCountImpl();

  parent.processResult = function execSearchAverage (iteratorRow) {
    var iteratorCols = iteratorRow.getAllColumns();
    var count = Number(iteratorRow.getValue(iteratorCols[0]));
    var group = Number(iteratorRow.getValue(iteratorCols[1]));

    var quotient = group == 0 ? 0 : count / group;

    return String(quotient.toFixed(2));
  };

  return parent;
};
