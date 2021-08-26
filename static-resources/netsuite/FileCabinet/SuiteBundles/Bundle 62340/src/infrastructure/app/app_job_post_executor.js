/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var infra = infra || {};
infra.app = infra.app || {};

infra.app.JOB_STATE = {
  JOB_NOT_STARTED: 0,
  JOB_RUNNING: 1,
  JOB_COMPLETED: 2,
  JOB_FAILED: 3,
  JOB_CANCELLED: 4,
  JOB_ABORTED: 5
};

infra.app.JobPostExecutor = function JobPostExecutor (jobId) {
  function isFinished (state) {
    var states = infra.app.JOB_STATE;
    state = Number(state);

    return state === states.JOB_COMPLETED ||
      state === states.JOB_FAILED ||
      state === states.JOB_CANCELLED ||
      state === states.JOB_ABORTED;
  }

  function convertToView (jobModel, jobRuleModel) {
    var jobView = new view.Job();

    jobView.id = jobModel.id;
    jobView.name = jobModel.name;
    jobView.state = jobModel.state;
    jobView.jobRuleId = jobModel.jobRuleId;
    jobView.govUsagePerTask = jobModel.govUsagePerTask;
    jobView.totalDataCount = jobModel.totalDataCount;
    jobView.startDate = jobModel.startDate;
    jobView.endDate = jobModel.endDate;

    var jobPropModels = jobModel.getJobProperties();
    for (var i in jobPropModels) {
      var jobPropModel = jobModel.getJobProperty(i);
      jobView.addPropertyFromModel(jobPropModel);
    }

    var jobRuleView = new view.JobRule();
    jobRuleView.id = jobRuleModel.id;
    jobRuleView.name = jobRuleModel.name;
    jobRuleView.pluginImpl = jobRuleModel.pluginImpl;
    jobRuleView.govUsagePerTask = jobRuleModel.govUsagePerTask;
    jobRuleView.jobConsumerClass = jobRuleModel.jobConsumerClass;
    jobRuleView.jobProducerClass = jobRuleModel.jobProducerClass;
    jobRuleView.taskListConsumerClass = jobRuleModel.taskListConsumerClass;
    jobRuleView.taskListProducerClass = jobRuleModel.taskListProducerClass;
    jobRuleView.dataSourceClass = jobRuleModel.dataSourceClass;
    jobRuleView.govUsageLimit = jobRuleModel.govUsageLimit;
    jobRuleView.pluginTypeClass = jobRuleModel.pluginTypeClass;
    jobRuleView.pluginTypeClassSrc = jobRuleModel.pluginTypeClassSrc;

    jobView.jobRule = jobRuleView;
    return jobView;
  }

  this.run = function run () {
    var jobDao = new dao.JobDAO();
    var job = jobDao.retrieve(jobId);
    var jobState = new suite_l10n.variable.LocalizationVariableList('job_state').getValueById(job.state);

    if (isFinished(jobState)) {
      var jobRuleId = job.jobRuleId;
      var jobRuleDao = new dao.JobRuleDAO();
      var jobRule = jobRuleDao.retrieve(jobRuleId);

      var plugIn = infra.app.PluginFactory(jobRule);
      var jobView = convertToView(job, jobRule);
      plugIn.postJobExecution(jobView);
    }
  };
};
