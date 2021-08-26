/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var model = model || {};

/**
 * @enum {number}
 * @readonly
 */
model.JOB_STATE = {
  JOB_RUNNING: 1,
  JOB_COMPLETED: 2,
  JOB_NOT_STARTED: 0,
  JOB_CANCELLED: 3,
  JOB_FAILED: 4,
  JOB_ABORTED: 5
};

/**
 * @enum {number}
 * @readonly
 */
model.TASKLIST_STATE = {
  TASK_NOT_STARTED: 0,
  TASK_RUNNING: 1,
  TASK_COMPLETED: 2,
  TASK_CANCELLED: 3,
  TASK_FAILED: 4
};

/**
 * @constructor
 */
model.JobRule = function () {
  this.id = null;
  this.name = null;
  this.pluginImpl = null;
  this.govUsagePerTask = null;
  this.jobConsumerClass = null;
  this.jobProducerClass = null;
  this.taskListConsumerClass = null;
  this.taskListProducerClass = null;
  this.dataSourceClass = null;
  this.govUsageLimit = null;
  this.pluginTypeClass = null;
  this.pluginTypeClassSrc = null;
};

/**
 * @constructor
 */
model.Job = function () {
  var properties = {};

  this.id = null;
  this.name = null;
  this.state = null;
  this.jobRuleId = null;
  this.govUsagePerTask = null;
  this.startDate = null;
  this.endDate = null;
  this.totalDataCount = null;
  this.runNow = 'F';

  /**
   * @param {view.JobProperty} jobPropView
   */
  this.addJobProperty = function (jobPropView) {
    var jobPropModel = new model.JobProperty();
    jobPropModel.id = jobPropView.id;
    jobPropModel.name = jobPropView.name;
    jobPropModel.value = jobPropView.value;
    jobPropModel.isSysProp = jobPropView.isSysProp;
    jobPropModel.isData = jobPropView.isData;
    jobPropModel.jobId = jobPropView.jobId;
    properties[jobPropView.name] = jobPropModel;
  };

  /**
   * @param {string} name
   * @returns {model.JobProperty|undefined}
   */
  this.getJobProperty = function (name) {
    return properties[name];
  };

  /**
   * @returns {Object.<string,model.JobProperty>}
   */
  this.getJobProperties = function () {
    return properties;
  };
};

/**
 * @constructor
 */
model.JobProperty = function () {
  var fieldMap = {};

  this.id = null;
  this.name = null;
  this.value = null;
  this.isSysProp = false;
  this.isData = false;
  this.jobId = null;

  /**
   * @param {Object.<string,string>} map
   */
  this.setFieldMap = function (map) {
    fieldMap = map;
  };

  /**
   * @returns {Object.<string,string>}
   */
  this.getFieldMap = function () {
    return fieldMap;
  };
};

/**
 * @constructor
 */
model.TaskList = function () {
  var properties = {};

  this.parentJob = null;
  this.id = null;
  this.name = null;
  this.state = null;
  this.startIndex = null;
  this.endIndex = null;
  this.lastRanIndex = null;
  this.dataCount = null;
  this.startDate = null;
  this.endDate = null;
  this.processedDataCount = null;

  /**
   * @param {model.Property} parameter
   */
  this.addTaskListProperty = function (parameter) {
    properties[parameter.name] = parameter;
  };

  /**
   * @param {string} name
   * @returns {model.Property|undefined}
   */
  this.getTaskListProperty = function (name) {
    return properties[name];
  };

  /**
   * @returns {Object.<string,model.Property>}
   */
  this.getTaskListProperties = function () {
    return properties;
  };
};

/**
 * @constructor
 */
model.JobScriptDeployment = function () {
  this.id = null;
  this.scriptId = null;
  this.deploymentId = null;
  this.isDaemon = null;
  this.runStatus = null;
  this.status = null;
  this.startDate = null;
  this.startTime = null;
};

/**
 * @constructor
 */
model.JobParameters = function () {
  var parameters = {};

  this.jobRule = null;

  /**
   * @param {model.Property} property
   */
  this.addParameter = function (property) {
    parameters[property.name] = property;
  };

  /**
   * @param {string} name
   * @returns {model.Property|undefined}
   */
  this.getParameter = function (name) {
    return parameters[name];
  };

  /**
   * @returns {Object.<string,model.Property>}
   */
  this.getParameters = function () {
    return parameters;
  };
};

/**
 * @constructor
 */
model.Property = function () {
  var fieldMap = {};

  this.name = null;
  this.value = null;
  this.isSysProp = false;
  this.isData = false;
  this.parentId = null;

  /**
   * @param {Object.<string,string>} map
   */
  this.setFieldMap = function (map) {
    fieldMap = map;
  };

  /**
   * @returns {Object.<string,string>}
   */
  this.getFieldMap = function () {
    return fieldMap;
  };
};
