/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NScriptType ScheduledScript
 */
define(["exports", "../scheduler/di/jobRepository", "../scheduler/di/scheduler"], function (_exports, _jobRepository, _scheduler) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.execute = void 0;

  var execute = function execute() {
    _jobRepository.jobRepository.fixStuckJobs();

    if (!_scheduler.scheduler.isAnyTaskInProgress()) {
      var upcomingJob = _jobRepository.jobRepository.findUpcomingJob();

      upcomingJob.forEach(function (job) {
        return _scheduler.scheduler.tryExecuteTask(job);
      });
    }
  };

  _exports.execute = execute;
});