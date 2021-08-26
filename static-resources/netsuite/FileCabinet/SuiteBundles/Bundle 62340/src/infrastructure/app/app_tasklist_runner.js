/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */
var infra = infra || {};
infra.app = infra.app || {};

/**
 * Facade that encapsulate a running instance of a Worker Scheduled Script.
 * This class is called by infra.JobProcessor.Worker.
 *
 * @constructor
 */
infra.app.TaskListRunner = function () {
  this.getTaskList = function (taskListMgr) {
    var taskListModel = taskListMgr.getNextUnstartedTaskList();

    if (!taskListModel) {
      return null;
    }

    taskListModel.startDate = taskListModel.startDate || nlapiDateToString(new Date());

    var taskListConverter = new infra.app.TaskListConverter();
    return taskListConverter.getAsView(taskListModel);
  };

  this.getJobRule = function (taskList) {
    var jobDAO = new dao.JobDAO();
    var job = jobDAO.retrieve(taskList.parentJob);
    var jobRuleDAO = new dao.JobRuleDAO();
    var jobRule = jobRuleDAO.retrieve(job.jobRuleId);
    taskList.jobRuleId = job.jobRuleId;
    return jobRule;
  };

  this.getTaskListConsumer = function (jobRule) {
    var consumerFactory = new infra.app.TaskListConsumerFactory(jobRule);
    return consumerFactory.getTaskListConsumer();
  };

  /**
   * Method to execute the Runner class
   *
   * Developer must inject the instance of TaskListConsumer to the TaskListManager.
   * This dependency injection was done so that if new Job Types exist,
   * TaskListManager will not be affected.
   */
  this.run = function () {
    var taskListMgr = new infra.app.TaskListManager();
    var taskList = this.getTaskList(taskListMgr);

    if (taskList) {
      var jobRule = this.getJobRule(taskList);
      var taskListConsumer = this.getTaskListConsumer(jobRule);
      var jobPlugin = infra.app.PluginFactory(jobRule);

      taskListConsumer.setJobPlugin(jobPlugin);
      taskListMgr.setTaskListConsumer(taskListConsumer);
      taskListMgr.startTaskList(taskList);
    }

    var workerManager = new infra.app.WorkerManager();
    workerManager.rescheduleRunningWorker();
  };
};
