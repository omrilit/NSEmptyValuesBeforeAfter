/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunningAssignmentPL = dunningAssignmentPL || {};
dunningAssignmentPL.comp = dunningAssignmentPL.comp || {};
dunningAssignmentPL.comp.pl = dunningAssignmentPL.comp.pl || {};

dunningAssignmentPL.comp.pl.DunningAssignmentProcessor = function DunningAssignmentProcessor() {
  var ProcessResult = suite_l10n.process.ProcessResult;
  var BulkAssignerData = dunning.view.BulkAssignerData;
  var BulkAssigner = dunning.app.BulkAssigner;
  var JobView = view.Job;

  var obj = {
    getJobList: getJobList,
    getJobDataSource: getJobDataSource,
    setupTaskList: setupTaskList,
    prepareTask: prepareTask,
    executeTask: executeTask,
    postTaskExecution: postTaskExecution,
    postJobExecution: postJobExecution
  };

  var RECORD_LIST = 'recordList';
  var RECORD_TYPE = 'recordType';
  var DUNNING_PROCEDURE_ID = 'dunningProcedureId';
  var RECORD_IDS_TO_UPDATE = 'recordIdsToUpdate';

  function getJobList(jobParams) {
    var jobView = new JobView();
    var jobRule = jobParams.jobRule;

    jobView.name = 'Bulk Assignment for DP ID ' + jobParams.getParameter(DUNNING_PROCEDURE_ID).value;
    jobView.govUsagePerTask = jobRule.govUsagePerTask;
    jobView.jobRuleId = jobRule.id;
    jobView.jobRule = jobRule;
    jobView.runNow = 'T';

    var recordIdsToUpdateProp = jobParams.getParameter(RECORD_IDS_TO_UPDATE);
    var recordIdsToUpdatePropValue = recordIdsToUpdateProp.value;
    jobView.addProperty(RECORD_IDS_TO_UPDATE
      , recordIdsToUpdatePropValue.join(',')
      , recordIdsToUpdateProp.isSysProp
      , recordIdsToUpdateProp.isData);

    var dunningProcedureId = jobParams.getParameter(DUNNING_PROCEDURE_ID);
    jobView.addProperty(DUNNING_PROCEDURE_ID
      , dunningProcedureId.value
      , dunningProcedureId.isSysProp
      , dunningProcedureId.isData);

    var recordType = jobParams.getParameter(RECORD_TYPE);
    jobView.addProperty(RECORD_TYPE
      , recordType.value
      , recordType.isSysProp
      , recordType.isData);

    jobView.totalDataCount = recordIdsToUpdatePropValue.length;
    jobView.startDate = nlapiDateToString(new Date(), 'datetimetz');

    return [jobView];
  }

  function getJobDataSource(properties) {
    var recordList = properties[RECORD_LIST].value || '';

    return recordList.split(',');
  }

  function getDAO(recordType) {
    var recordDAO = null;
    switch (recordType) {
      case 'invoice':
        recordDAO = new dao.DunningInvoiceDAO();
        break;
      case 'customer':
      default:
        recordDAO = new dao.DunningCustomerDAO();
    }
    return recordDAO;
  }

  function getModelClass(recordType) {
    var modelClass = null;
    switch (recordType) {
      case 'invoice':
        modelClass = dunning.model.DunningInvoice;
        break;
      case 'customer':
      default:
        modelClass = dunning.model.DunningCustomer;
    }
    return modelClass;
  }

  function getAssignerInput(properties) {
    var input = new BulkAssignerData();
    input.dunningProcedureId = properties[DUNNING_PROCEDURE_ID].value;

    var recordType = properties[RECORD_TYPE];
    input.dao = getDAO(recordType.value);
    input.modelClass = getModelClass(recordType.value);

    return input;
  }

  function setupTaskList(tasklist) {
    var properties = tasklist.getTaskListProperties();
    var tasklistObjects = tasklist.objects;

    var assignerInput = getAssignerInput(properties);
    tasklistObjects.bulkAssigner = new BulkAssigner(assignerInput);

    tasklist.objects = tasklistObjects;

    return tasklist;
  }

  function prepareTask(task, tasklist) {
    var tasklistObjects = tasklist.objects;
    var taskObjects = task.objects;

    taskObjects.bulkAssigner = tasklistObjects.bulkAssigner;

    task.objects = taskObjects;
    return task;
  }

  function executeTask(task) {
    var recordId = task.record;
    var taskObjects = task.objects;
    var isSuccess = true;
    var message = null;
    var bulkAssigner = taskObjects.bulkAssigner;

    try {
      bulkAssigner.bulkAssignDunningProcedure([recordId]);
    } catch (e) {
      isSuccess = false;
      message = e;
    }

    return new ProcessResult(isSuccess, message);
  }

  function postJobExecution(jobView) {
    var input = {};
    input.sender = -5;
    input.recipients = -5;
    input.subject = [jobView.name,
      ' has finished. <EOM>'].join('');
    input.body = '';

    var mail = new suite_l10n.communication.Mail(input);
    mail.send();
  }

  return obj;
};

/* eslint space-before-function-paren: ["error", {"named": "never"}] */
/* eslint no-unused-vars: 0 */
// @formatter:off

function getJobDataSource(properties) {
  var processor = new dunningAssignmentPL.comp.pl.DunningAssignmentProcessor();
  return processor.getJobDataSource(properties);
}

function getJobList(jobParams) {
  var processor = new dunningAssignmentPL.comp.pl.DunningAssignmentProcessor();
  return processor.getJobList(jobParams);
}

function executeTask(task) {
  var processor = new dunningAssignmentPL.comp.pl.DunningAssignmentProcessor();
  return processor.executeTask(task);
}

function setupTaskList(tasklist) {
  var processor = new dunningAssignmentPL.comp.pl.DunningAssignmentProcessor();
  return processor.setupTaskList(tasklist);
}

function prepareTask(task, tasklist) {
  var processor = new dunningAssignmentPL.comp.pl.DunningAssignmentProcessor();
  return processor.prepareTask(task, tasklist);
}

function postTaskExecution(task, result) {
  return result;
}

function tearDownTaskList(tasklist) {
  return tasklist;
}

function postJobExecution(postJobData) {
  var processor = new dunningAssignmentPL.comp.pl.DunningAssignmentProcessor();
  return processor.postJobExecution(postJobData);
}

// @formatter:on
