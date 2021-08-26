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
 * @returns {infra.app.TaskListConsumer}
 */
infra.app.IdListTaskListConsumer = function IdListTaskListConsumer (jobRule) {
  var ProcessResult = suite_l10n.process.ProcessResult;

  var SCHEDULED_SCRIPT_GOV_LIMIT = 'Scheduled Script Governance Limit';
  var RECORD_IDS_TO_UPDATE = 'recordIdsToUpdate';

  var govLimitList = new suite_l10n.variable.LocalizationVariableList('gov_limit_type');

  var jobPlugin;

  this.setJobPlugin = function setJobPlugin (plugin) {
    jobPlugin = plugin;
  };

  this.setJobRule = function setJobRule (rule) {
    jobRule = rule;
  };

  this.process = function process (taskListView) {
    var failedObjects = [];

    taskListView = jobPlugin.setupTaskList(taskListView);
    var taskListProperties = taskListView.getTaskListProperties();

    var idsStr = taskListProperties[RECORD_IDS_TO_UPDATE].value || '';
    var ids = idsStr.split(',').map(Number);

    taskListView.processedDataCount = 0;
    var startIndex = 0;

    for (var i = startIndex; i < ids.length; i++) {
      var id = ids[i];
      var viewTask = new view.Task();
      viewTask.record = id;

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
    // check remaining usage
    var remainingUsg = nlapiGetContext().getRemainingUsage();

    // get gov limit from var list
    var ssGovLimit = govLimitList.getValue(SCHEDULED_SCRIPT_GOV_LIMIT);

    var currentlyUsed = Number(ssGovLimit) - Number(remainingUsg);
    return (currentlyUsed + Number(govUsagePerTask)) < govUsageLimit;
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
    taskList.endIndex = Number(taskList.lastRanIndex) + Number(taskList.startIndex);

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
    newTaskList.startIndex = newStartIndex + Number(taskList.startIndex);
    newTaskList.endIndex = newEndIndex;
    newTaskList.dataCount = taskList.dataCount;
    newTaskList.startDate = taskList.startDate;
    newTaskList.endDate = taskList.endDate;

    // don't forget to copy the task list properties!
    var taskListProperties = taskList.getTaskListProperties();

    // update the record ids to update value before creating a new task list 7/31/2015
    var ids = taskListProperties[RECORD_IDS_TO_UPDATE].value || '';
    ids = ids.split(',');
    ids = ids.splice(newStartIndex, newEndIndex);
    taskListProperties[RECORD_IDS_TO_UPDATE].value = ids.join();

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

    taskList.state = model.TASKLIST_STATE.TASK_RUNNING;
    taskList.lastRanIndex = lastRanIndex;

    taskListDao.update(taskList);
  }
};
