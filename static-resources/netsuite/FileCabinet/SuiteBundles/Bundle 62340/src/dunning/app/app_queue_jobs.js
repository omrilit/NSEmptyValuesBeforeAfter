/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

/**
 * @param {dao.JobRuleDAO} jobRuleDao
 * @param {infra.app.JobGenerator} jobGenerator
 * @constructor
 */
dunning.app.QueueJobs = function (jobRuleDao, jobGenerator) {
  /**
   * @param {string} implementation
   * @param {Object.<string,string>} properties
   */
  this.fileJob = function (implementation, properties) {
    var rules = jobRuleDao.getByImplementation(implementation);
    if (rules.length === 0) {
      throw new Error('Job Rule not found for Plug-in Implementation "' + implementation + '"');
    }

    var params = new view.JobParameters();
    params.jobRule = rules[0].id;

    Object.keys(properties).forEach(function (name) {
      params.addParameter(new view.Property(name, properties[name]));
    });

    jobGenerator.runWithParameters(params);
  };
};
