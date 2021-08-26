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
 * @param {view.JobParameters} params
 * @returns {view.Job[]}
 */
function getJobList(params) {
  var values = params.getParameter('recordIdsToUpdate').value.split(',');
  var ids = dunning.filter_results.filter(values, 'pending', 'pdf');

  if (ids.length === 0) {
    return [];
  }

  var job = new view.Job();
  job.name = 'Print ' + new Date();
  job.govUsagePerTask = params.jobRule.govUsagePerTask;
  job.totalDataCount = ids.length;
  job.startDate = nlapiDateToString(new Date(), 'datetimetz');
  job.runNow = 'T';
  job.jobRuleId = params.jobRule.id;
  job.jobRule = params.jobRule;
  job.addProperty('recordIdsToUpdate', ids.join(','));

  return [job];
}

/**
 * @param {view.Job} job
 */
function postJobExecution(job) {
  var filter = new nlobjSearchFilter('custrecord_l10n_task_result_job', null, 'is', job.id);
  var column = new nlobjSearchColumn('custrecord_l10n_task_result_result');
  var search = nlapiSearchRecord('customrecord_l10n_task_result', null, filter, column);
  var paths = (search || []).map(function (item) {
    return suite_l10n.process.ProcessResult.parseJSON(item.getValue(column));
  });

  var userId = nlapiGetContext().getUser();
  var manager = new dunning.app.DunningPDFManager();

  var pdfIds = [];
  var tmp;

  for (var i = 0; i < paths.length; i++) {
    tmp = paths[i].getData('pdfIds');
    for (var j = 0; j < tmp.length; j++) {
      pdfIds.push(tmp[j]);
    }
  }

  var folderId;
  if (paths.length > 0) {
    folderId = paths[0].getData('folderId');
  }

  manager.notifyUser(paths, userId, pdfIds, folderId);
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
  task.data.job = taskList.parentJob;
  return task;
}

/**
 * @param {view.Task} task
 * @returns {suite_l10n.process.ProcessResult}
 */
function executeTask(task) {
  var result = new suite_l10n.process.ProcessResult();
  try {
    var manager = new dunning.app.DunningPDFManager();
    var jobFolderName, jobFolderId;

    [jobFolderName, jobFolderId] = manager.prepareDunningFolder(task.data.job);
    result = manager.generatePDFFiles(task.record, jobFolderId, jobFolderName);
  } catch (e) {
    nlapiLogExecution('ERROR', 'executeTask.error', JSON.stringify(e));
    result.success = false;
    result.message = JSON.stringify(e);
  }

  result.setData('record', task.record);
  result.setData('job', task.data.job);
  result.setData('folderId', jobFolderId);

  return result;
}

/**
 * @param {view.Task} task
 * @param {suite_l10n.process.ProcessResult} result
 * @returns {suite_l10n.process.ProcessResult}
 */
function postTaskExecution(task, result) {
  var taskResult = nlapiCreateRecord('customrecord_l10n_task_result');
  taskResult.setFieldValue('custrecord_l10n_task_result_job', result.getData('job'));
  taskResult.setFieldValue('custrecord_l10n_task_result_result', JSON.stringify(result));
  nlapiSubmitRecord(taskResult);
  return result;
}

function tearDownTaskList() {

}

// @formatter:on
