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
 * @returns {infra.app.TaskListProducer}
 */
infra.app.TaskListProducer = function TaskListProducer () {
  var jobSource;

  this.setJobSource = function setJobSource (objSource) {
    jobSource = objSource;
  };

  this.createTaskLists = function createTaskLists (jobView) {
    /* TODO
     * Is checking of instanceof view.Job still done
     * Because the encapsulation to an obj var will make the
     * bean an instance of that obj and not of view.Job
     */
    //    if (!(jobView instanceof infra.app.Job)) { // TODO
    //      var errMgr = new infra.app.ErrorManager();
    //      throw errMgr.createError(infra.app.Errors.JEE001);
    //    } else if (!jobSource) {
    //      var errMgr = new infra.app.ErrorManager();
    //      throw errMgr.createError(infra.app.Errors.JEE002);
    //    }
    var properties = jobView.getJobProperties();
    var recordCount = jobSource.getRecordCount(properties);
    var tasklistCount = this.getTaskListCount(jobView, recordCount);
    var recordsPerTaskList = Math.ceil(recordCount / tasklistCount);

    var taskListDao = new dao.TaskListDAO();
    for (var ilist = 0; ilist < tasklistCount; ilist++) {
      var endIdx = (ilist * recordsPerTaskList) + recordsPerTaskList;
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
    var tasklist = new model.TaskList();
    tasklist.name = [jobView.name, seqNo].join('-');
    tasklist.state = model.TASKLIST_STATE.TASK_NOT_STARTED;
    tasklist.parentJob = jobView.id;
    tasklist.startIndex = startIdx;
    tasklist.endIndex = endIdx;

    var jobProperties = jobView.getJobProperties();

    for (var i in jobProperties) {
      var jobProp = jobProperties[i];
      var taskListProp = new model.Property();

      taskListProp.name = jobProp.name;
      taskListProp.value = jobProp.value;
      taskListProp.isSysProp = jobProp.isSysProp;
      taskListProp.isData = jobProp.isData;

      tasklist.addTaskListProperty(taskListProp);
    }

    return tasklist;
  }
};
