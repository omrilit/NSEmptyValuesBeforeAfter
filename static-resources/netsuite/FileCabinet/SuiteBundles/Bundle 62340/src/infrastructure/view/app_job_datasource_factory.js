/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var infra = infra || {};
infra.app = infra.app || {};

/**
 * Factory that creates different types of Data Source depending on the Job Rule setting
 *
 * @param {view.JobRule} jobRule
 * @returns {infra.app.JobDataSourceFactory}
 */
infra.app.JobDataSourceFactory = function JobDataSourceFactory (jobRule) {
  /**
   * Generates a Job Data Source base from Job Rule Settings
   * @returns {infra.app.JobDataSourceFactory}
   */
  this.getDataSource = function getDataSource () {
    var method = ['return new ', jobRule.dataSourceClass, '(jobRule)'].join('');
    var callback = new Function('jobRule', method);
    return callback(jobRule);
  };
};
