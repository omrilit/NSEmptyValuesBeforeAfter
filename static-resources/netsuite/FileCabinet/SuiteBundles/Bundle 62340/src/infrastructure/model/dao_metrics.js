/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This is the DAO class of the usage metrics.
 *
 * @author cboydon
 */

var dao = dao || {};

dao.MetricsDAO = function MetricsDAO () {
  var RECORD_TYPE = 'customrecord_suite_l10n_metrics';
  var obj = new suite_l10n.dao.BasicDAO(RECORD_TYPE);

  var FIELD_MAP = {
    'id': 'internalid',
    'name': 'name',
    'value': 'custrecord_l10n_metrics_value',
    'startDateTime': 'custrecord_l10n_metrics_start_dt',
    'endDateTime': 'custrecord_l10n_metrics_end_dt',
    'runTime': 'custrecord_l10n_metrics_run_time',
    'month': 'custrecord_l10n_metrics_month',
    'year': 'custrecord_l10n_metrics_year'
  };

  obj.setFieldMap(FIELD_MAP);
  obj.setModelClass(model.Metrics);

  return obj;
};
