/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var infra = infra || {};
infra.app = infra.app || {};

infra.app.WorkerManager = function WorkerManager () {
  var JobManager = infra.app.JobManager;
  var Scheduler = suite_l10n.services.app.Scheduler;
  var scheduler;

  var jobScriptDAO;

  function getScheduler () {
    scheduler = scheduler || new Scheduler();
    return scheduler;
  }

  function getDAO () {
    jobScriptDAO = jobScriptDAO || new dao.JobScriptDeploymentDAO();
    return jobScriptDAO;
  }

  function getRunningWorker () {
    var context = ns_wrapper.context();
    var jobScriptDAO = getDAO();

    return jobScriptDAO.retrieveByDeploymentId(context.getDeploymentId());
  }

  function getWorkerScripts () {
    var jobScriptDAO = getDAO();

    return jobScriptDAO.retrieveWorkerScripts();
  }

  function rerunWorker (worker) {
    var scheduler = getScheduler();
    scheduler.runScheduledScript(worker.scriptId, worker.deploymentId);
  }

  function rescheduleWorker (worker, nextJob) {
    var params = {};
    params.status = 'SCHEDULED';
    params.startDate = nextJob.startDate;
    params.startTime = nextJob.startTime;
    params.scriptId = worker.scriptId;
    params.deploymentId = worker.id;
    var scheduler = getScheduler();
    scheduler.requestReschedule(params);
  }

  function updateWorkerSchedule (worker) {
    var jobManager = new JobManager();
    var nextJob = jobManager.getNextJob();
    var newDate = new Date();
    var newDateStr = nlapiDateToString(newDate, 'datetimetz');
    if (!nextJob || !worker) {
      // do nothing
    } else if (nlapiStringToDate(nextJob.startDate, 'datetimetz') <=
      nlapiStringToDate(newDateStr, 'datetimetz')) {
      rerunWorker(worker);
    } else {
      rescheduleWorker(worker, nextJob);
    }
  }

  function rescheduleRunningWorker () {
    var worker = getRunningWorker();
    updateWorkerSchedule(worker);
  }

  function rescheduleWorkerScript (scriptId) {
    var jobScriptDAO = getDAO();
    var worker = jobScriptDAO.retrieve(scriptId);
    updateWorkerSchedule(worker);
  }

  return {
    getRunningWorker: getRunningWorker,
    getWorkerScripts: getWorkerScripts,
    rescheduleRunningWorker: rescheduleRunningWorker,
    rescheduleWorkerScript: rescheduleWorkerScript
  };
};
