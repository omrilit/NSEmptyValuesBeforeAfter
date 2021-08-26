/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var infra = infra || {};
infra.app = infra.app || {};

/**
 * Represents the process to "Consume" a Job.
 *
 * This is used by Job manager to process Jobs.
 *
 * @param {model.JobRule} jobRule
 * @constructor
 */
infra.app.JobConsumer = function (jobRule) {
  this.createTasklists = function (job) {
    var tasklistProducerFactory = new infra.app.TaskListProducerFactory(jobRule);
    var tasklistProducer = tasklistProducerFactory.getTaskListProducer();

    var dataSourceFactory = new infra.app.JobDataSourceFactory(jobRule);
    var dataSource = dataSourceFactory.getDataSource();
    tasklistProducer.setJobSource(dataSource);

    var tasklistManager = new infra.app.TaskListManager();
    tasklistManager.setTaskListProducer(tasklistProducer);

    var viewJob = this.convertToView(job, jobRule);
    tasklistManager.createTaskLists(viewJob);
  };

  this.convertToView = function (jobModel, jobRuleModel) {
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
  };
};
