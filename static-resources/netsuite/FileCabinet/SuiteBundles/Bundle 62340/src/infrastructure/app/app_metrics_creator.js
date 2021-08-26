/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This is the helper class for creating a metric model.
 *
 * @author cboydon
 */

var infra = infra || {};
infra.app = infra.app || {};

infra.app.MetricsCreator = function MetricsCreator () {
  this.createModel = function createModel (name, value, startDate, endDate) {
    var metricModel = new model.Metrics();

    metricModel.name = name;
    metricModel.value = value;
    metricModel.runTime = endDate - startDate;
    metricModel.startDateTime = new ns_wrapper.Date(startDate).toString('datetimetz');
    metricModel.endDateTime = new ns_wrapper.Date(endDate).toString('datetimetz');
    metricModel.month = processMonth(startDate.getMonth() - 1);
    metricModel.year = processYear(metricModel.month, startDate.getFullYear());

    return metricModel;
  };

  function processMonth (month) {
    month++;
    return month == 1 ? 12 : month;
  }

  function processYear (month, year) {
    return month == 1 ? year - 1 : year;
  }
};
