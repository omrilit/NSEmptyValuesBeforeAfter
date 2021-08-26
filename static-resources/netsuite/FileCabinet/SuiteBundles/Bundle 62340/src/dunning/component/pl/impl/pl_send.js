/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

/* eslint space-before-function-paren: ["error", {"named": "never"}] */
/* eslint no-unused-vars: 0 */
// @formatter:off

function getJobDataSource(properties) {
  return [];
}

/**
 * @param {view.JobParameters} parameters
 * @returns {view.Job[]}
 */
function getJobList(parameters) {
  var values = parameters.getParameter('recordIdsToUpdate').value.split(',');
  var ids = dunning.filter_results.filter(values, 'pending', 'email');

  if (ids.length === 0) {
    return [];
  }

  var job = new view.Job();
  job.name = 'Send ' + new Date();
  job.govUsagePerTask = parameters.jobRule.govUsagePerTask;
  job.totalDataCount = ids.length;
  job.startDate = nlapiDateToString(new Date(), 'datetimetz');
  job.runNow = 'T';
  job.jobRuleId = parameters.jobRule.id;
  job.jobRule = parameters.jobRule;
  job.addProperty('recordIdsToUpdate', ids.join(','));

  return [job];
}

/**
 * @param {view.Job} job
 */
function postJobExecution(job) {
}

/**
 * @param {view.TaskList} taskList
 * @returns {view.TaskList}
 */
function setupTaskList(taskList) {
  taskList.startTime = nlapiDateToString(new Date(), 'datetimetz');
  return taskList;
}

/**
 * @param {view.Task} task
 * @param {view.TaskList} taskList
 * @returns {view.Task}
 */
function prepareTask(task, taskList) {
  return task;
}

/**
 * @param {view.Task} task
 * @returns {suite_l10n.process.ProcessResult}
 */
function executeTask(task) {
  try {
    nlapiInitiateWorkflow('customrecord_3805_dunning_eval_result', task.record,
      'customworkflow_3805_dunning_email_wf');

    return new suite_l10n.process.ProcessResult(true);
  } catch (e) {
    return new suite_l10n.process.ProcessResult(false, e);
  }
}

/**
 * @param {view.Task} task
 * @param {suite_l10n.process.ProcessResult} result
 * @returns {suite_l10n.process.ProcessResult}
 */
function postTaskExecution(task, result) {
  return result;
}

function tearDownTaskList() {
}

// @formatter:on
