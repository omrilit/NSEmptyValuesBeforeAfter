/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var infra = infra || {};
infra.app = infra.app || {};

/**
 * Factory that creates different types of Job consumers depending on the Job Rule setting
 *
 * @param {view.JobRule} jobRule
 * @returns {infra.app.JobConsumer}
 */
infra.app.JobConsumerFactory = function JobConsumerFactory (jobRule) {
  /**
   * Generates a Job consumer based from the job rule setting
   * @returns {infra.app.JobConsumer}
   */
  this.getJobConsumer = function getJobConsumer () {
    var method = ['return new ', jobRule.jobConsumerClass, '(jobRule)'].join('');

    var callback = new Function('jobRule', method);

    return callback(jobRule);
  };
};
