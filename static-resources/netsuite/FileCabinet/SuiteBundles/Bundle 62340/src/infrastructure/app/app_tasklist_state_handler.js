/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This module performs operations based on the task list's status
 *
 * @author mmoya
 */

var infra = infra || {};
infra.app = infra.app || {};

infra.app.TaskListStateHandler = function TaskListStateHandler () {
  var jobStatusMap = {
    '0': model.JOB_STATE.JOB_NOT_STARTED,
    '1': model.JOB_STATE.JOB_RUNNING,
    '2': model.JOB_STATE.JOB_COMPLETED,
    '3': model.JOB_STATE.JOB_CANCELLED,
    '4': model.JOB_STATE.JOB_FAILED
  };

  var taskListStatusMap = {
    '0': model.TASKLIST_STATE.TASK_NOT_STARTED,
    '1': model.TASKLIST_STATE.TASK_RUNNING,
    '2': model.TASKLIST_STATE.TASK_COMPLETED,
    '3': model.TASKLIST_STATE.TASK_CANCELLED,
    '4': model.TASKLIST_STATE.TASK_FAILED
  };

  this.processTaskListState = function processTaskListState (record) {
    var taskListDAO = new dao.TaskListDAO();
    var taskListModel = new taskListDAO.castAsTaskList(record);

    if (taskListModel.state) {
      var taskListConverter = new infra.app.TaskListConverter();
      var taskListView = taskListConverter.getAsView(taskListModel);

      var parentJob = taskListView.parentJob;

      // call the tasklist state handler to update the job
      var updatedJobStatus = this.updateJobStatus(taskListView,
        getJobStatusFromSiblings(parentJob));

      // 5/19/2014 3:32PM
      // First of all, I know that this should not be here. I know, this should be called by
      // a user event or workflow (or whatever that is equivalent) deployed to the job -- not
      // in the task list. But the sad part is, this task list state handler, that updates
      // its parent job, is triggered by a user event and therefore, another user event (the
      // one deployed to its parent job) cannot be triggered anymore (refer to "unli-chaining
      // of user events"). And thus, we come to the conclusion that this JobPostExecutor must
      // be called here. *sob*
      if (model.JOB_STATE.JOB_COMPLETED == jobStatusMap[updatedJobStatus]) {
        var jobPostExecutor = new infra.app.JobPostExecutor(parentJob);
        jobPostExecutor.run();
      }
    }
  };

  this.updateJobStatus = function updateJobStatus (taskListView, jobStatus) {
    var jobDAO = new dao.JobDAO();

    var jobStatusID = lookupJobStatusID(jobStatus);
    // change to updateJobStatus
    jobDAO.updateJobStatus(taskListView.parentJob, jobStatusID);

    if (taskListView.state == model.TASKLIST_STATE.TASK_COMPLETED ||
      taskListView.state == model.TASKLIST_STATE.TASK_FAILED) { rescheduleWorker(taskListView.parentJob); }

    return jobStatus;
  };

  function rescheduleWorker (parentJobId) {
    var jobDAO = new dao.JobDAO();
    var jobModel = jobDAO.retrieve(parentJobId);

    if (jobModel.runNow == 'T') {
      var workerManager = new infra.app.WorkerManager();

      // PROBLEM: WON'T WORK IF NO FREE WORKERS
      var workers = workerManager.getWorkerScripts();
      var worker;
      for (var i = 0; i < workers.length; i++) {
        var iWorker = workers[i];
        if (iWorker.runStatus != 'INPROGRESS') {
          worker = iWorker;
          break;
        }
      }

      if (worker) {
        workerManager.rescheduleWorkerScript(worker.id);
      }
    }
  }

  function lookupJobStatusID (jobStatusValue) {
    var jobStatesVariableList = new suite_l10n.variable.LocalizationVariableList('job_state');
    return jobStatesVariableList.getIdByValue(jobStatusValue);
  }

  function getJobStatusFromSiblings (parentJobId) {
    var taskListDAO = new dao.TaskListDAO();
    var taskLists = taskListDAO.retrieveByParentJobId(parentJobId);
    var status = jobStatusMap['2'];

    for (var i = 0; i < taskLists.length; i++) {
      var taskList = taskLists[i];
      var state = taskList.state;

      if (state == model.TASKLIST_STATE.TASK_RUNNING || state == model.TASKLIST_STATE.TASK_NOT_STARTED) {
        status = jobStatusMap['1'];
        break;
      } else if (state == model.TASKLIST_STATE.TASK_FAILED) {
        status = jobStatusMap['4'];
      }
    }

    return status;
  }
};
