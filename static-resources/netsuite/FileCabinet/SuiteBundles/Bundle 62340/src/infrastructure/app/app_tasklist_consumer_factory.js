/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */
var infra = infra || {};
infra.app = infra.app || {};

/**
 * Factory that creates different types of Task List Consumers depending on the Job Rule setting
 *
 * @param {view.JobRule} jobRule
 * @returns {infra.app.TaskListConsumerFactory}
 */
infra.app.TaskListConsumerFactory = function TaskListConsumerFactory (jobRule) {
  /**
   * Generates a Task List Consumer base from Job Rule Settings
   * @returns {infra.app.TaskListConsumer}
   */
  this.getTaskListConsumer = function getTaskListConsumer () {
    var method = ['return new ', jobRule.taskListConsumerClass, '(jobRule)'].join('');

    var callback = new Function('jobRule', method);

    return callback(jobRule);
  };
};
