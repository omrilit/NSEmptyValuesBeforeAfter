/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */
var infra = infra || {};
infra.app = infra.app || {};

/**
 * Factory that creates different types of Task List Producers depending on the Job Rule setting
 *
 * @param {view.JobRule} jobRule
 * @returns {infra.app.TaskListProducerFactory}
 */
infra.app.TaskListProducerFactory = function TaskListProducerFactory (jobRule) {
  /**
   * Generates a Task List Producer base from job rule setting
   * @returns {infra.app.TaskListProducer}
   */
  this.getTaskListProducer = function getTaskListProducer () {
    var method = ['return new ', jobRule.taskListProducerClass, '(jobRule)'].join('');

    var callback = new Function('jobRule', method);

    return callback(jobRule);
  };
};
