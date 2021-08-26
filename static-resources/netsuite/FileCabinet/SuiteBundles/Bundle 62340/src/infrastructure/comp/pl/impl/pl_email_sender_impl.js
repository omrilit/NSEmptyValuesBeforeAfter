/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

/* eslint space-before-function-paren: ["error", {"named": "never"}] */
/* eslint no-unused-vars: 0 */
// @formatter:off

function getJobDataSource(properties) {
  return nlapiCreateSearch('customer');
}

function getJobList() {
  var jobList = [];

  var job = new view.Job();
  job.name = 'Job Test ' + new Date();
  job.govUsagePerTask = 1200;
  job.totalDataCount = 16;
  job.addProperty('dunningProcedureId', '133');
  job.addProperty('why', 'nothing');
  job.addProperty('test', 'TEST');
  jobList.push(job);

  return jobList;
}

function executeTask(taskView) {
  return new suite_l10n.process.ProcessResult(true);
}

function setupTaskList(taskListView) {
  return taskListView;
}

function prepareTask(taskView) {
  return taskView;
}

function postTaskExecution() {
}

function tearDownTaskList() {
}

// @formatter:on
