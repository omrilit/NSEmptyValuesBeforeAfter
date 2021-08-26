/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

/* eslint space-before-function-paren: ["error", {"named": "never"}] */
/* eslint no-unused-vars: 0 */
// @formatter:off

// Plugin Implementation and libraries cannot be placed under the same package(dunning)
// for some reason, the plugin overwrites the contents for its own packages
var dunningPL = dunningPL || {};
dunningPL.comp = dunningPL.comp || {};
dunningPL.comp.pl = dunningPL.comp.pl || {};

dunningPL.comp.pl.DunningProcedureProcessor = function DunningProcedureProcessor() {
  var DunningProcedureHandler = dunning.app.DunningProcedureHandler;
  var TemplateRenderer = ns_wrapper.TemplateRenderer;
  var DunningCustomerDAO = dao.DunningCustomerDAO;
  var DunningTemplate = dunning.model.DunningTemplate;
  var DunningResultHandler = dunning.app.DunningResultHandler;
  var DunningTemplateDAO = dao.DunningTemplateDAO;
  var Search = ns_wrapper.Search;
  var JobView = view.Job;

  var obj = {
    getJobDataSource: getJobDataSource,
    getJobList: getJobList,
    executeTask: executeTask,
    prepareTask: prepareTask,
    postTaskExecution: postTaskExecution,
    setupTaskList: setupTaskList
  };

  var DUNNING_PROCESSOR_ID = 'dunningProcedureId';

  function executeTask(task) {
    var procedureHandler = new DunningProcedureHandler();

    return procedureHandler.processDunning(task);

    // I assume this is a single task
  }

  function createJobView(res) {
    var jobView = new JobView();
    // these are the things we know right now
    jobView.name = res.getValue('name');
    jobView.govUsagePerTask = '100';
    jobView.startTime = res.getValue('custrecord_3805_dp_eval_time');
    jobView.addProperty(DUNNING_PROCESSOR_ID, res.getId());
    return jobView;
  }

  function getJobList() {
    var viewList = [];
    var search = new Search('customrecord_3805_dunning_procedure');
    search.addColumn('name');
    search.addColumn('custrecord_3805_dp_eval_time');
    search.addFilter('isinactive', 'is', 'F');
    var iterator = search.getIterator();

    while (iterator.hasNext()) {
      viewList.push(createJobView(iterator.next()));
    }

    return viewList;
  }

  function getJobDataSource(properties) {
    // TODO update to search. Temporary return value
    var search = new nlapiCreateSearch('customer');

    search.addColumn(new nlobjSearchColumn('custentity_3805_dunning_level'));
    search.addFilter(new nlobjSearchFilter('custentity_3805_dunning_level', null, 'noneof', '@NONE@'));

    if (properties) {
      search
        .addFilter(new nlobjSearchFilter('custentity_3805_dunning_procedure', null, 'is', properties[DUNNING_PROCESSOR_ID].value));
    }
    return search;
  }

  function getDunningTemplateId(dunningLevelId) {
    return dunning.model.DunningLevel.fromRecord(dunningLevelId).templateId;
  }

  function getDunningTemplate(tasklistObjects, templateId) {
    var tasklistTemplates = tasklistObjects.templates || {};

    // I don't want to loop through all tasks on setupTaskList
    if (!tasklistTemplates[templateId]) {
      var dunningTemplate = new DunningTemplate();
      dunningTemplate.id = templateId;
      var dunningTemplateDAO = new DunningTemplateDAO();
      dunningTemplate = dunningTemplateDAO.retrieve(dunningTemplate);

      tasklistTemplates[templateId] = dunningTemplate;
    }

    tasklistObjects.templates = tasklistTemplates;
    return tasklistTemplates[templateId];
  }

  function prepareTask(task, tasklist) {
    var taskObjects = task.objects;
    var taskData = task.data;
    var tasklistObjects = tasklist.objects;
    var record = task.record;

    taskObjects.renderer = tasklistObjects.renderer;
    taskObjects.sourceDAO = tasklistObjects.sourceDAO;
    var sourceDAO = taskObjects.sourceDAO;
    taskObjects.source = sourceDAO.retrieve(record.getId());
    taskData.templateId = getDunningTemplateId(record.getValue('custentity_3805_dunning_level'));
    taskObjects.template = getDunningTemplate(tasklistObjects, taskData.templateId);
    taskData.sendDate = tasklist.startDate;

    task.objects = taskObjects;
    task.data = taskData;
    return task;
  }

  function getSourceDAO(tasklist) {
    switch (tasklist.type) {
      case 'invoice':
      // return new DunningInvoiceDAO();
      case 'customer':
      default:
        return new DunningCustomerDAO();
    }
  }

  function postTaskExecution(task, result) {
    var resultHandler = new DunningResultHandler(task);
    resultHandler.processResult(result);
    return result;
  }

  function setupTaskList(tasklist) {
    var tasklistObjects = tasklist.objects || {};
    tasklistObjects.renderer = new TemplateRenderer();
    tasklistObjects.sourceDAO = getSourceDAO(tasklist);
    tasklist.objects = tasklistObjects;

    return tasklist;
  }

  return obj;
};

var DunningProcedureProcessor = dunningPL.comp.pl.DunningProcedureProcessor;

function getJobDataSource(properties) {
  var dunningProcessor = new DunningProcedureProcessor();
  return dunningProcessor.getJobDataSource(properties);
}

function getJobList() {
  var dunningProcessor = new DunningProcedureProcessor();
  return dunningProcessor.getJobList();
}

function executeTask(task) {
  var dunningProcessor = new DunningProcedureProcessor();
  return dunningProcessor.executeTask(task);
}

function setupTaskList(tasklist) {
  var dunningProcessor = new DunningProcedureProcessor();
  return dunningProcessor.setupTaskList(tasklist);
}

function prepareTask(task, tasklist) {
  var dunningProcessor = new DunningProcedureProcessor();
  return dunningProcessor.prepareTask(task, tasklist);
}

function postTaskExecution(task, result) {
  var dunningProcessor = new DunningProcedureProcessor();
  return dunningProcessor.postTaskExecution(task, result);
}

function tearDownTaskList(tasklist) {
  return tasklist;
}

// @formatter:on
