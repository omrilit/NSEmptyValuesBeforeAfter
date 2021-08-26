/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var view = view || {};

/**
 * @constructor
 */
view.Job = function () {
  /**
   * @type {Object.<string,view.JobProperty>}
   */
  var properties = {};

  this.id = null;
  this.name = null;
  this.state = null;
  this.jobRuleId = null;
  this.jobRule = null;
  this.govUsagePerTask = null;
  this.startDate = null;
  this.startTime = null;
  this.endDate = null;
  this.totalDataCount = null;

  /**
   * @type {string}
   */
  this.runNow = 'F';

  /**
   * Property names will be used as reference in the list as well to avoid using arrays.
   * And for easier access to the data. So names should be unique! ...unless you want to
   * override a similarly named property.
   * You have been warned...
   *
   * @param {string} name
   * @param {*} value
   * @param {boolean} [isSysProp=false]
   * @param {boolean} [isData=false]
   */
  this.addProperty = function (name, value, isSysProp, isData) {
    var jobProperty = new view.JobProperty();
    jobProperty.name = name;
    jobProperty.value = value;
    jobProperty.isSysProp = Boolean(isSysProp);
    jobProperty.isData = Boolean(isData);
    properties[name] = jobProperty;
  };

  /**
   * @param {model.JobProperty} jobPropModel
   */
  this.addPropertyFromModel = function (jobPropModel) {
    var jobPropView = new view.JobProperty();
    jobPropView.id = jobPropModel.id;
    jobPropView.name = jobPropModel.name;
    jobPropView.value = jobPropModel.value;
    jobPropView.isSysProp = Boolean(jobPropModel.isSysProp);
    jobPropView.isData = Boolean(jobPropModel.isData);
    jobPropView.jobId = jobPropModel.jobId;
    jobPropView.parentId = jobPropModel.parentId;
    properties[jobPropModel.name] = jobPropView;
  };

  /**
   * @param {string} name
   * @returns {view.JobProperty|undefined}
   */
  this.getJobProperty = function (name) {
    return properties[name];
  };

  /**
   * @returns {Object.<string,view.JobProperty>}
   */
  this.getJobProperties = function () {
    return properties;
  };
};

/**
 * @constructor
 */
view.JobRule = function () {
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

  /**
   * @type {string}
   */
  this.runNow = 'F';
};

/**
 * @constructor
 */
view.JobProperty = function () {
  this.id = null;
  this.name = null;
  this.value = null;
  /**
   * @type {boolean}
   */
  this.isSysProp = false;
  /**
   * @type {boolean}
   */
  this.isData = false;
  this.jobId = null;
};

/**
 * @constructor
 */
view.TaskList = function () {
  /**
   * @type {Object.<string,view.Property>}
   */
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
  this.startTime = null;
  this.jobRuleId = null;
  this.data = {};
  this.objects = {};

  /**
   * @param {view.Property} property
   */
  this.addTaskListProperty = function (property) {
    properties[property.name] = property;
  };

  /**
   * @param {string} name
   * @returns {view.Property|undefined}
   */
  this.getTaskListProperty = function (name) {
    return properties[name];
  };

  /**
   * @returns {Object.<string,view.Property>}
   */
  this.getTaskListProperties = function () {
    return properties;
  };
};

/**
 * @constructor
 */
view.Task = function () {
  this.record = null;
  this.data = {};
  this.objects = {};
  this.taskListProperties = {};

  /**
   * @param {view.Property} property
   */
  this.addTaskListProperty = function (property) {
    this.taskListProperties[property.name] = property;
  };

  /**
   * @param {string} name
   * @returns {view.Property|undefined}
   */
  this.getTaskListProperty = function (name) {
    return this.taskListProperties[name];
  };

  /**
   * @returns {Object.<string,view.Property>}
   */
  this.getTaskListProperties = function () {
    return this.taskListProperties;
  };
};

/**
 * @constructor
 */
view.JobParameters = function () {
  var parameters = {};

  this.jobRule = null;

  /**
   * @param {view.Property} property
   */
  this.addParameter = function (property) {
    parameters[property.name] = property;
  };

  /**
   * @param {string} name
   * @returns {view.Property|undefined}
   */
  this.getParameter = function (name) {
    return parameters[name];
  };

  /**
   * @returns {Object.<string,view.Property>}
   */
  this.getParameters = function () {
    return parameters;
  };

  this.toJSON = function () {
    return JSON.stringify({
      jobRule: this.jobRule,
      parameters: parameters
    });
  };
};

/**
 * @param {string} [name]
 * @param {string} [value]
 * @constructor
 */
view.Property = function (name, value) {
  this.name = name === undefined ? null : name;
  this.value = value === undefined ? null : value;
  this.isSysProp = false;
  this.isData = false;
  this.parentId = null;
};
