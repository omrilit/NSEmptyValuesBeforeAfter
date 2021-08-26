/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var infra = infra || {};
infra.app = infra.app || {};

/**
 * Represents the process to "Produce" a Job.
 * The default JobProducer for the Job Processor Engine.
 *
 * This is used by Job Manager to create Jobs.
 *
 * There can be many different job types in the future so there should be
 * different job producers depending on the specific job based on the job rule.
 *
 * @param {view.JobRule} jobRule
 * @constructor
 */
infra.app.JobProducer = function (jobRule) {
  var plugin;
  var jobParams;
  var jobDao = new dao.JobDAO();

  this.createJobs = function () {
    // call plugin here and gives you job views
    // Use job params if existing
    var jobViews = jobParams ? plugin.getJobList(jobParams) : plugin.getJobList();

    // use those views to create job records
    for (var i = 0; i < jobViews.length; i++) {
      var jobView = jobViews[i];

      var jobModel = this.convertToModel(jobView);

      // create job record using Job DAO
      jobDao.create(jobModel);
    }
  };

  /**
   * @param {view.Job} viewJob
   * @returns {model.Job}
   */
  this.convertToModel = function (viewJob) {
    var jobModel = new model.Job();
    jobModel.id = viewJob.id;
    jobModel.name = viewJob.name;
    jobModel.state = viewJob.state;
    jobModel.jobRuleId = jobRule.id;
    jobModel.govUsagePerTask = viewJob.govUsagePerTask || jobRule.govUsagePerTask;
    jobModel.totalDataCount = viewJob.totalDataCount;
    jobModel.startDate = viewJob.startDate;
    jobModel.startTime = viewJob.startTime;
    jobModel.endDate = viewJob.endDate;
    jobModel.runNow = (viewJob.runNow === 'T' || viewJob.runNow === true) ? 'T' : 'F';

    var jobProperties = viewJob.getJobProperties();
    for (var i in jobProperties) {
      jobModel.addJobProperty(jobProperties[i]);
    }

    return jobModel;
  };

  this.setPlugin = function (paramPlugin) {
    plugin = paramPlugin;
  };

  this.setJobParams = function (jobParamsObj) {
    jobParams = jobParamsObj;
  };
};
