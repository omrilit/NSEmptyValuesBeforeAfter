/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../common/Maybe", "./types"], function (_exports, _Maybe, _types) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.Scheduler = void 0;

  var Scheduler =
  /** @class */
  function () {
    function Scheduler(record, search, task, log) {
      this.record = record;
      this.search = search;
      this.task = task;
      this.log = log;
    }

    Scheduler.prototype.createMatchingTask = function (jobId) {
      return this.createTask(jobId, "match");
    };

    Scheduler.prototype.createUnmatchingTask = function (jobId) {
      return this.createTask(jobId, "unmatch");
    };

    Scheduler.prototype.createReferenceGroupTask = function (jobId) {
      return this.createTask(jobId, "refg");
    };

    Scheduler.prototype.createReferenceSingleTask = function (jobId) {
      return this.createTask(jobId, "refs");
    };

    Scheduler.prototype.createReferenceUnmatchingTask = function (jobId) {
      return this.createTask(jobId, "refu");
    };

    Scheduler.prototype.createSchedulerTask = function () {
      return this.task.create({
        deploymentId: "customdeploy_glm_ss_scheduler",
        scriptId: "customscript_glm_ss_scheduler",
        taskType: this.task.TaskType.SCHEDULED_SCRIPT
      });
    };

    Scheduler.prototype.tryReschedule = function () {
      try {
        this.createSchedulerTask().submit();
      } catch (e) {
        this.log.error({
          details: e,
          title: "Task submission failed"
        });
      }
    };

    Scheduler.prototype.isAnyTaskInProgress = function () {
      return this.search.create({
        filters: [["isdeployed", "is", "T"], "and", [["scriptid", "is", "CUSTOMDEPLOY_GLM_MR_MATCH"], "or", ["scriptid", "is", "CUSTOMDEPLOY_GLM_MR_UNMATCH"], "or", ["scriptid", "is", "CUSTOMDEPLOY_GLM_MR_REFG"], "or", ["scriptid", "is", "CUSTOMDEPLOY_GLM_MR_REFU"]], "and", ["status", "anyof", ["INQUEUE", "INPROGRESS"]]],
        type: "scriptdeployment"
      }).run().getRange({
        start: 0,
        end: 1
      }).length > 0;
    };

    Scheduler.prototype.tryExecuteTask = function (job) {
      try {
        switch (job.type) {
          case _types.JobType.MATCHING:
            return (0, _Maybe.maybe)(this.createMatchingTask(job.id).submit());

          case _types.JobType.UNMATCHING:
            return (0, _Maybe.maybe)(this.createUnmatchingTask(job.id).submit());

          case _types.JobType.REFERENCE_GROUP:
            return (0, _Maybe.maybe)(this.createReferenceGroupTask(job.id).submit());

          case _types.JobType.REFERENCE_UNMATCH:
            return (0, _Maybe.maybe)(this.createReferenceUnmatchingTask(job.id).submit());

          case _types.JobType.REFERENCE_SINGLE:
            return (0, _Maybe.maybe)(this.createReferenceSingleTask(job.id).submit());

          default:
            return (0, _Maybe.nothing)();
        }
      } catch (e) {
        if (e.name === "MAP_REDUCE_ALREADY_RUNNING") {
          return (0, _Maybe.nothing)();
        }

        throw e;
      }
    };

    Scheduler.prototype.createTask = function (jobId, type) {
      var _a;

      return this.task.create({
        deploymentId: "customdeploy_glm_mr_" + type,
        params: (_a = {}, _a["custscript_glm_mr_" + type + "_job"] = jobId, _a),
        scriptId: "customscript_glm_mr_" + type,
        taskType: this.task.TaskType.MAP_REDUCE
      });
    };

    return Scheduler;
  }();

  _exports.Scheduler = Scheduler;
});