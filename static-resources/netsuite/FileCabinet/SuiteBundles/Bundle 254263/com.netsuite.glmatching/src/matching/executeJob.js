/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../vendor/tslib", "../common/fn", "../dashboard/request-parsers", "../scheduler/index", "../../vendor/lodash-4.17.4", "./utils"], function (_exports, _tslib, _fn, _requestParsers, _index, _lodash, _utils) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.executeJobConstructor = executeJobConstructor;

  function isEntries(array) {
    return array.entries.map(function (o) {
      return (0, _requestParsers.expectEntry)(o);
    });
  }

  function isCommandsEmpty(commands) {
    return commands.length === 0;
  }

  function executeJobConstructor(jobRepository, scheduler, getJobCommands, executeJobCommand, executeRecalculationCommand, findMatchingByIds, getCurrentDateTime, getCurrentUser, getAsyncLimit) {
    return function (job) {
      try {
        var commands = [];

        if (job.type === _index.JobType.REFERENCE_GROUP) {
          commands = getJobCommands(job);
        }

        var asyncLimit = getAsyncLimit() - 1;

        if (isEntries(job.input).length > asyncLimit || commands.length > asyncLimit) {
          scheduler.tryReschedule();
        } else {
          jobRepository.setProcessing(job.id);

          if (isCommandsEmpty(commands)) {
            commands = getJobCommands(job);
          }

          if (isCommandsEmpty(commands)) {
            jobRepository.finishWithSuccess(job.id, []);
          } else {
            var commandsHistory = (0, _lodash.flatten)(commands.map(executeJobCommand));
            var changedMatchingIds = (0, _utils.getChangedMatchingIds)(commandsHistory);
            var recalculationHistory = executeRecalculationCommand({
              command: _index.JobType.RECALCULATION,
              matchingDate: commandsHistory[0] && commandsHistory[0].matchingDate || getCurrentDateTime(),
              matchings: findMatchingByIds(changedMatchingIds),
              user: commandsHistory[0] && commandsHistory[0].user || getCurrentUser()
            });
            jobRepository.finishWithSuccess(job.id, (0, _tslib.__spreadArrays)(commandsHistory, recalculationHistory));
          }
        }
      } catch (e) {
        if (e instanceof Error || (0, _fn.isSuiteScriptError)(e)) {
          jobRepository.finishWithFailure(job.id, JSON.stringify({
            message: e.message,
            name: e.name,
            stack: e.stack
          }));
        } else {
          jobRepository.finishWithFailure(job.id, JSON.stringify(e));
        }
      }
    };
  }
});