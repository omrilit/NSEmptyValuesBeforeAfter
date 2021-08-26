/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */
var infra = infra || {};
infra.app = infra.app || {};

/**
 * Facade that is called from user event component to generate the Task Lists
 * @param {number} jobId
 */
infra.app.TaskListGenerator = function TaskListGenerator (jobId) {
  /**
   * function that executes the Generator
   *
   * @returns {infra.app.TaskListGenerator}
   */
  this.run = function run () {
    var jobDao = new dao.JobDAO();
    var job = jobDao.retrieve(jobId);

    var jobRuleId = job.jobRuleId;
    var jobRuleDao = new dao.JobRuleDAO();
    var jobRule = jobRuleDao.retrieve(jobRuleId);

    var jobConsumerFactory = new infra.app.JobConsumerFactory(jobRule);
    var jobConsumer = jobConsumerFactory.getJobConsumer();

    var jobManager = new infra.app.JobManager();
    jobManager.setJobConsumer(jobConsumer);

    jobManager.processJob(job);

    // Run tasklist upon creation if job.runNow == T
    if (job.runNow == 'T') {
      taskListRunNow();
    }
  };

  function taskListRunNow () {
    // PROBLEM: WON'T WORK IF NO FREE WORKERS
    var workerManager = new infra.app.WorkerManager();
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
};
