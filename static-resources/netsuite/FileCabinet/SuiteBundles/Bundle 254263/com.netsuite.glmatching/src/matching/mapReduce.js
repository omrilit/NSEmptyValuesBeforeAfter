/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../vendor/tslib", "../common/expectations", "../scheduler/index", "../scheduler/expectations", "../../lib/errors", "./utils"], function (_exports, _tslib, _expectations, _index, _expectations2, _errors, _utils) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getInputDataConstructor = getInputDataConstructor;
  _exports.mapConstructor = mapConstructor;
  _exports.reduceConstructor = reduceConstructor;
  _exports.summarizeConstructor = summarizeConstructor;

  function getInputDataConstructor(getJobId, getJobCommands, jobRepository, logError, mapJob) {
    return function () {
      var job = mapJob(jobRepository.load(getJobId()));

      if (job.status !== _index.JobStatus.PENDING) {
        throw (0, _errors.createError)("JobStatus of the job #" + job.id + " must be \"" + _index.JobStatus.PENDING + "\"");
      }

      try {
        jobRepository.setProcessing(job.id);
        return getJobCommands(job).map(function (x) {
          return JSON.stringify(x);
        });
      } catch (e) {
        logError("getInputData", {
          message: e.message,
          name: e.name,
          stack: e.stack
        });
        throw e;
      }
    };
  }

  function mapConstructor(executeCommand, expectCommand, logError) {
    return function (context) {
      try {
        var command = expectCommand(JSON.parse(context.value));
        var history_1 = executeCommand(command);
        history_1.forEach(function (x) {
          return context.write("0", JSON.stringify(x));
        });
      } catch (e) {
        logError("map", {
          message: e.message,
          name: e.name,
          stack: e.stack
        });
        throw e;
      }
    };
  }

  function reduceConstructor(executeRecalculationCommand, findMatchingByIds, getCurrentDateTime, getCurrentUser, logError) {
    return function (context) {
      try {
        var matchingHistory = context.values.map(function (x) {
          return (0, _expectations2.expectHistoryData)(JSON.parse(x));
        });
        var changedMatchingIds = (0, _utils.getChangedMatchingIds)(matchingHistory);
        var recalculationHistory = executeRecalculationCommand({
          command: _index.JobType.RECALCULATION,
          matchingDate: matchingHistory[0] && matchingHistory[0].matchingDate || getCurrentDateTime(),
          matchings: findMatchingByIds(changedMatchingIds),
          user: matchingHistory[0] && matchingHistory[0].user || getCurrentUser()
        });
        context.write(context.key, JSON.stringify((0, _tslib.__spreadArrays)(matchingHistory, recalculationHistory)));
      } catch (e) {
        logError("reduce", {
          message: e.message,
          name: e.name,
          stack: e.stack
        });
        throw e;
      }
    };
  }

  function summarizeConstructor(getJobId, jobRepository, logError, scheduler) {
    return function (context) {
      try {
        var jobId = getJobId();
        var errors_1 = [];
        var history_2 = [];
        context.mapSummary.errors.iterator().each(function (key, error) {
          errors_1.push({
            key: key,
            error: error
          });
          return true;
        });
        context.reduceSummary.errors.iterator().each(function (key, error) {
          errors_1.push({
            key: key,
            error: error
          });
          return true;
        });
        context.output.iterator().each(function (key, value) {
          history_2.push.apply(history_2, (0, _expectations.expectArrayOf)(_expectations2.expectHistoryData)(JSON.parse(value)));
          return true;
        });

        if (errors_1.length === 0) {
          jobRepository.finishWithSuccess(jobId, history_2);
        } else {
          jobRepository.finishWithFailure(jobId, JSON.stringify(errors_1));
        }
      } catch (e) {
        logError("summarize", {
          message: e.message,
          name: e.name,
          stack: e.stack
        });
        throw e;
      } finally {
        scheduler.tryReschedule();
      }
    };
  }
});