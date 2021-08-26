/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */
var infra = infra || {};
infra.app = infra.app || {};

/**
 * Manages the Life Cycle of a Task List, from creation to execution.
 * The life cycle is as follows:
 *
 * Not Started: Initial state of a Task List as created by a Task List Producer.
 * Running: The Task List Consumer has picked it up and currently processing.
 * Completed: The Task List Consumer has successfully finished processing the tasks in the list.
 * Failed: The Task List Consumer has finished processing the tasks but some failed.
 * Cancelled: The Task List was never picked up by the Task List Consumer.
 *    Job has been cancelled, so all associated Task Lists are cancelled.
 *
 * There is no Aborted Task List state because a running scheduled script cannot be aborted.
 *
 * @returns {infra.app.TaskListManager}
 */
infra.app.TaskListManager = function TaskListManager () {
  var TaskListConverter = infra.app.TaskListConverter;

  var taskListProducer;
  var taskListConsumer;

  var jobId;

  function logErrors (results) {
    results.forEach(function (result) {
      nlapiLogExecution('ERROR', 'Failed Processing', JSON.stringify(result));
    });
  }

  /**
   * Assign the Producer used by this Manager to Create the Task Lists
   * This function is called after the Job is created and the Task Lists
   * is about to be generated.
   */
  this.setTaskListProducer = function setTaskListProducer (objProducer) {
    taskListProducer = objProducer;
  };

  /**
   * Assign the Consumer used by this Manager to Process a Task List
   */
  this.setTaskListConsumer = function setTaskListConsumer (objConsumer) {
    taskListConsumer = objConsumer;
  };

  /**
   * Creates a series of Tasks Lists base on the information passed by a job.
   * This function is called after
   */
  this.createTaskLists = function createTaskLists (objViewJob) {
    taskListProducer.createTaskLists(objViewJob);
  };

  this.getNextUnstartedTaskList = function getNextUnstartedTaskList () {
    /*
     * Must have some checking to make sure that the task list
     * that is supposed to run on this time slot is correct.
     * Retrieve the job attached to the task list and check the run date/time
     * on that job.
     *
     * Call the Job Manager to check the job
     * JobManager.hasStartingJob()?
     *
     */
    var taskListDao = new dao.TaskListDAO();
    return taskListDao.retrieveNextUnstartedTask();
  };

  this.startTaskList = function startTaskList (taskListView) {
    // this has no knowledge of the plugin currently, taskListconsumer will do this for now
    // taskList = jobPlugin.setupTaskList(taskList);
    var failedTasks = taskListConsumer.process(taskListView);

    var newStatus = model.JOB_STATE.JOB_COMPLETED;

    if (failedTasks.length > 0) {
      newStatus = model.JOB_STATE.JOB_FAILED;
      logErrors(failedTasks);
    }

    // taskList = jobPlugin.tearDownTaskList(taskList);
    var taskListDao = new dao.TaskListDAO();
    var taskListConverter = new TaskListConverter();

    // To override the new end index in case fault tolerance for overcapacity happens
    var tempTaskList = taskListDao.retrieve(taskListView.id);
    var newEndIndex = tempTaskList.endIndex;
    if (taskListView.endIndex != newEndIndex) {
      taskListView.endIndex = newEndIndex;
    }

    var taskListModel = taskListConverter.getAsModel(taskListView);

    taskListModel.state = newStatus;
    // TODO cannot set values for date/time fields
    // taskListModel.endDate = new Date();
    taskListDao.update(taskListModel);
  };

  this.setJobId = function setJobId (jobIdParam) {
    jobId = jobIdParam;
  };

  this.getJobId = function getJobId () {
    return jobId;
  };
};
