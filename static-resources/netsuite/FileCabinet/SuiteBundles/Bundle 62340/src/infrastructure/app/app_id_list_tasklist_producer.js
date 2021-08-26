/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var infra = infra || {};
infra.app = infra.app || {};

/**
 * Represents the process to "Generate" a TaskList.
 * The default TaskListProducer for the Job Processor Engine.
 *
 * This is used by Task list manager to create new Task Lists.
 *
 * There can be many different tasks types in the future so there should be
 * different tasks processors for each task type.
 *
 * jobView.name
 * jobView.id
 * jobView.usagePerTask
 * jobView.totalRunUsage
 *
 * @constructor
 */
infra.app.IdListTaskListProducer = function () {
  this.createTaskLists = function createTaskLists (jobView) {
    var recordCount = jobView.totalDataCount;
    var tasklistCount = this.getTaskListCount(jobView, recordCount);
    var recordsPerTaskList = Math.ceil(recordCount / tasklistCount);

    var taskListDao = new dao.TaskListDAO();
    for (var ilist = 0; ilist < tasklistCount; ilist++) {
      var endIdx = ((ilist * recordsPerTaskList) + recordsPerTaskList) - 1;
      var startIdx = (ilist * recordsPerTaskList);

      var taskList = createTaskListModel(jobView, ilist + 1, startIdx, endIdx);
      taskListDao.create(taskList);
    }
  };

  this.getTaskListCount = function getTaskListCount (jobView, recordCount) {
    // basic computation for now, we can add more sophisticated computation later (ie. Queue Optimizer);
    var totalTaskListUsage = Number(jobView.govUsagePerTask) * Number(recordCount);

    var jobRule = jobView.jobRule;
    return Math.ceil(totalTaskListUsage / jobRule.govUsageLimit);
  };

  function createTaskListModel (jobView, seqNo, startIdx, endIdx) {
    var RECORD_IDS_TO_UPDATE = 'recordIdsToUpdate';

    var tasklist = new model.TaskList();
    tasklist.name = [jobView.name, seqNo].join('-');
    tasklist.state = model.TASKLIST_STATE.TASK_NOT_STARTED;
    tasklist.parentJob = jobView.id;
    tasklist.startIndex = startIdx;
    tasklist.endIndex = endIdx;
    tasklist.startDate = jobView.startDate;

    var jobProperties = jobView.getJobProperties();

    for (var i in jobProperties) {
      var jobProp = jobProperties[i];
      var taskListProp = new model.Property();

      taskListProp.name = jobProp.name;
      taskListProp.value = taskListProp.name == RECORD_IDS_TO_UPDATE
        ? createRecordIdsToUpdateValue(jobProp.value, startIdx, endIdx + 1)
        : jobProp.value;
      taskListProp.isSysProp = jobProp.isSysProp;
      taskListProp.isData = jobProp.isData;

      tasklist.addTaskListProperty(taskListProp);
    }

    return tasklist;
  }

  function createRecordIdsToUpdateValue (value, startIdx, endIdx) {
    var valueArray = value.split(',').map(Number);
    var taskListValueArray = valueArray.slice(startIdx, endIdx);
    return taskListValueArray.join(',');
  }
};
