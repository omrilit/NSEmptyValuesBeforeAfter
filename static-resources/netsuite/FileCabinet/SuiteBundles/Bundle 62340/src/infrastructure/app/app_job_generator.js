/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var infra = infra || {};
infra.app = infra.app || {};

infra.app.JobGenerator = function () {
  this.run = function () {
    var jobManager = new infra.app.JobManager();

    var jobRules = this.getJobRules();
    for (var i = 0; i < jobRules.length; i++) {
      var rule = jobRules[i];

      var jobProducer = infra.app.JobProducerFactory(rule);
      var plugin = infra.app.PluginFactory(rule);

      jobProducer.setPlugin(plugin);

      jobManager.setJobProducer(jobProducer);
      jobManager.scheduleJobs();
    }
  };

  this.runWithParameters = function (jobParamView) {
    var jobManager = new infra.app.JobManager();

    var jobRule = this.getJobRule(jobParamView.jobRule);

    var jobProducer = infra.app.JobProducerFactory(jobRule);
    var plugin = infra.app.PluginFactory(jobRule);
    jobProducer.setPlugin(plugin);
    jobProducer.setJobParams(jobParamView);
    jobManager.setJobProducer(jobProducer);
    jobManager.scheduleJobs();
  };

  this.getJobRules = function () {
    return new dao.JobRuleDAO().retrieveAll();
  };

  this.getJobRule = function (id) {
    return new dao.JobRuleDAO().retrieve(id);
  };
};
