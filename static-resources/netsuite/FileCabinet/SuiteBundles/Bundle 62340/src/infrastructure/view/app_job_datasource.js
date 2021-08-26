/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var infra = infra || {};
infra.app = infra.app || {};

infra.app.JobDataSource = function JobDataSource (jobRule) {
  /**
   * @type {nlobjSearch}
   */
  var dataSource;

  this.getDataSource = function getDataSource (properties) {
    dataSource = dataSource || infra.app.PluginFactory(jobRule).getJobDataSource(properties);
    return dataSource;
  };

  // returns a search result that you can page through
  this.getJobData = function getJobData () {
    var dataSource = this.getDataSource();
    return dataSource.runSearch();
  };

  this.getRecordCount = function getRecordCount (properties) {
    var dataSource = this.getDataSource(properties);
    var recordId = dataSource.getSearchType();
    var filters = dataSource.getFilters();
    var column = [new nlobjSearchColumn('internalid', null, 'count')];
    var sumSearch = nlapiCreateSearch(recordId, filters, column);
    var rs = sumSearch.runSearch();
    var result = rs.getResults(0, 1);
    return result ? result[0].getValue('internalid', null, 'count') : 0;
  };
};
