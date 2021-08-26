/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var infra = infra || {};
infra.app = infra.app || {};

/**
 * @param {string} pluginImpl
 * @implements {JobPlugin}
 * @constructor
 */
infra.app.BatchJobPlugin = function (pluginImpl) {
  var plugin = new JobPlugin(pluginImpl);

  /**
   * @param {Object.<string,view.JobProperty>} properties
   * @returns {*}
   */
  this.getJobDataSource = function (properties) {
    return plugin.getJobDataSource(properties);
  };

  /**
   * @param {view.Task} task
   * @returns {suite_l10n.process.ProcessResult}
   */
  this.executeTask = function (task) {
    return plugin.executeTask(task);
  };

  /**
   * @param {view.JobParameters} parameters
   * @returns {Array.<view.Job>}
   */
  this.getJobList = function (parameters) {
    return plugin.getJobList(parameters);
  };

  /**
   * @param {view.TaskList} taskList
   * @returns {view.TaskList}
   */
  this.setupTaskList = function (taskList) {
    return plugin.setupTaskList(taskList);
  };

  /**
   * @param {view.Task} task
   * @param {view.TaskList} taskList
   * @returns {view.Task}
   */
  this.prepareTask = function (task, taskList) {
    return plugin.prepareTask(task, taskList);
  };

  /**
   * @param {view.Task} task
   * @param {suite_l10n.process.ProcessResult} result
   * @returns {suite_l10n.process.ProcessResult}
   */
  this.postTaskExecution = function (task, result) {
    return plugin.postTaskExecution(task, result);
  };

  /**
   * @param {view.TaskList} taskList
   * @returns {void}
   */
  this.tearDownTaskList = function (taskList) {
    return plugin.tearDownTaskList(taskList);
  };

  /**
   * @param {view.Job} job
   * @returns {void}
   */
  this.postJobExecution = function (job) {
    return plugin.postJobExecution(job);
  };
};
