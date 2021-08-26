/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var infra = infra || {};
infra.app = infra.app || {};

/**
 * Represents the process to "Consume" a TaskList.
 * The default TaskListConsumer for the Job Processor Engine.
 *
 * This is used by Task list manager to process Task Lists.
 *
 * There can be many different tasks types in the future so there should be
 * different tasks processors for each task type.
 *
 * @constructor
 */
infra.app.TaskListConsumer = function TaskListConsumer (jobRule) {
  var ProcessResult = suite_l10n.process.ProcessResult;

  var SCHEDULED_SCRIPT_GOV_LIMIT = 'Scheduled Script Governance Limit';

  var govLimitList = new suite_l10n.variable.LocalizationVariableList('gov_limit_type');

  var jobPlugin;

  this.setJobPlugin = function setJobPlugin (plugin) {
    jobPlugin = plugin;
  };

  this.setJobRule = function setJobRule (rule) {
    jobRule = rule;
  };

  /**
   * jobDataSource is an nlobjSearch object
   */
  function getJobData (taskListView) {
    var jobDataSource = jobPlugin.getJobDataSource(taskListView.getTaskListProperties());
    var lastIndex = parseInt(taskListView.endIndex || 0) + 1;

    // var startIndex = parseInt(taskListView.startIndex || 0)
    // var filterFormula = "case when {internalid} >= " + startIndex + "and {internalid} <= " + lastIndex + " then 1 else 0 end";
    // var filter = new nlobjSearchFilter("formulanumeric",null,"equalto", 1).setFormula(filterFormula);
    // jobDataSource.addFilter(filter);

    var recordset = jobDataSource.runSearch();

    return recordset.getResults(0, lastIndex);
  }

  this.process = function process (taskListView) {
    var failedObjects = [];

    taskListView = jobPlugin.setupTaskList(taskListView);

    var rs = getJobData(taskListView);

    var taskListProperties = taskListView.getTaskListProperties();

    taskListView.processedDataCount = 0;

    for (var i in rs) {
      var rec = rs[i];

      var viewTask = new view.Task();

      viewTask.record = rec;

      for (var j in taskListProperties) {
        viewTask.addTaskListProperty(taskListProperties[j]);
      }

      viewTask = jobPlugin.prepareTask(viewTask, taskListView);
      var taskExecutionResult = jobPlugin.executeTask(viewTask);

      updateLastRanIndex(taskListView.id, i);
      taskListView.processedDataCount++;

      if (taskExecutionResult.success) {
        var postTaskExecutionResult = jobPlugin.postTaskExecution(viewTask, taskExecutionResult);

        if (!postTaskExecutionResult.success) {
          failedObjects.push(postTaskExecutionResult);
        }
      } else {
        failedObjects.push(taskExecutionResult);
      }

      if (!isRemainingGovEnough(jobRule.govUsageLimit, jobRule.govUsagePerTask)) {
        doFaultTolerance(taskListView.id);
        var faultFailure = new ProcessResult(false, 'Current run has exceeded the usage amount ' + jobRule.govUsageLimit + (ns_wrapper.context()).getRemainingUsage());
        failedObjects.push(faultFailure);

        return failedObjects;
      }
    }

    taskListView = jobPlugin.tearDownTaskList(taskListView);

    return failedObjects;
  };

  function isRemainingGovEnough (govUsageLimit, govUsagePerTask) {
    var isRemainingGovEnough = true;

    // check remaining usage

    var remainingUsg = nlapiGetContext().getRemainingUsage();

    // get gov limit from var list

    var ssGovLimit = govLimitList.getValue(SCHEDULED_SCRIPT_GOV_LIMIT);

    var currentlyUsed = Number(ssGovLimit) - Number(remainingUsg);

    if ((currentlyUsed + govUsagePerTask) > govUsageLimit) {
      isRemainingGovEnough = false;
    }

    return isRemainingGovEnough;
  }

  function doFaultTolerance (taskListId) { // assume that the taskList ID is passed here
    createRemainderOfTaskList(taskListId);

    updateLimitReachedTaskList(taskListId);
  }

  function updateLimitReachedTaskList (taskListId) {
    // retrieve (supposedly) untouched tasklist via dao

    var taskListDao = new dao.TaskListDAO();

    var taskList = taskListDao.retrieve(taskListId);

    // Set end index to current processed (or last processed. whatever it's called)

    taskList.endIndex = taskList.lastRanIndex;

    // then don't forget to actually update the taskList

    taskListDao.update(taskList);
  }

  function createRemainderOfTaskList (taskListId) {
    // retrieve (supposedly) untouched tasklist via dao

    var taskListDao = new dao.TaskListDAO();

    var taskList = taskListDao.retrieve(taskListId);

    // get currently processed (or last processed. whatever it's called) index

    // add plus 1 to it and set it as the new start index of the new tasklist

    var newStartIndex = Number(taskList.lastRanIndex) + 1;

    // get the original end index of and set it as the new end index of the new task list

    var newEndIndex = taskList.endIndex;

    // then don't forget to actually create the tasklist

    var newTaskList = new model.TaskList();

    newTaskList.parentJob = taskList.parentJob;

    newTaskList.name = [taskList.name, '.1'].join('');

    newTaskList.state = model.TASKLIST_STATE.TASK_NOT_STARTED;

    newTaskList.startIndex = newStartIndex;

    newTaskList.endIndex = newEndIndex;

    newTaskList.dataCount = taskList.dataCount;

    newTaskList.startDate = taskList.startDate;

    newTaskList.endDate = taskList.endDate;

    // don't forget to copy the task list properties!

    var taskListProperties = taskList.getTaskListProperties();

    for (var i in taskListProperties) {
      var prop = taskListProperties[i];

      newTaskList.addTaskListProperty(prop);
    }

    // don't forget to commit it!

    taskListDao.create(newTaskList);
  }

  function updateLastRanIndex (taskListId, lastRanIndex) {
    var taskListDao = new dao.TaskListDAO();

    var taskList = taskListDao.retrieve(taskListId);

    taskList.lastRanIndex = lastRanIndex;

    taskListDao.update(taskList);
  }
};
