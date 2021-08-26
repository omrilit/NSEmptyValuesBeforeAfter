/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */
var infra = infra || {};
infra.app = infra.app || {};

infra.app.JOB_STATE = {

  'JOB_NOT_STARTED': 0,

  'JOB_RUNNING': 1,

  'JOB_COMPLETED': 2,

  'JOB_FAILED': 3,

  'JOB_CANCELLED': 4,

  'JOB_ABORTED': 5
};

/**
 * Manages the Life Cycle of a Job, from creation to execution.
 * The life cycle is as follows:
 *
 * Not Started: Initial state of a Job as created by a Job Producer.
 * Running: The Job Consumer has picked it up and currently processing it.
 * Completed: The Job Consumer has successfully finished processing its tasks.
 * Failed: The Job Consumer has finished processing the tasks; but some failed.
 * Cancelled: Job has been cancelled, has been created but has been stopped.
 * Aborted: Job has been stopped by the user along the way.
 *
 * @returns {infra.app.JobManager}
 */
infra.app.JobManager = function JobManager () {
  var jobProducer;

  var jobConsumer;

  /**
   * Assign the Producer used by this Manager to Create the Jobs
   *
   * @param objProducer
   */
  this.setJobProducer = function setJobProducer (objProducer) {
    jobProducer = objProducer;
  };

  /**
   * Assign the Consumer used by this Manager to Process a Task List
   */
  this.setJobConsumer = function setJobConsumer (objConsumer) {
    jobConsumer = objConsumer;
  };

  this.scheduleJobs = function scheduleJobs () {
    // For future: may call other methods in the future aside from generateJobs -- in order to implement fair

    // scheduler

    this.generateJobs();
  };

  this.generateJobs = function generateJobs () {
    jobProducer.createJobs();
  };

  this.processJob = function processJob (job) {
    jobConsumer.createTasklists(job);
  };

  this.getQueuedJobs = function getQueuedJobs () {
    var jobDAO = new dao.JobDAO();
    return jobDAO.retrieveQueuedJobs();
  };

  this.getNextJob = function getNextJob () {
    return this.getQueuedJobs()[0];
  };
};
