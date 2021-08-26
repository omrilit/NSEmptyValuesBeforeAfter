/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../../vendor/tslib", "../../common/fn", "../../common/Maybe", "../../dashboard/permissions", "../../scheduler/index", "../../../lib/errors", "../../../vendor/lodash-4.17.4", "../expectations", "../MatchingRepository", "../utils"], function (_exports, _tslib, _fn, _Maybe, _permissions, _index, _errors, _lodash, _expectations, _MatchingRepository, _utils) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.prepareMatchingConstructor = prepareMatchingConstructor;
  _exports.resolveMatchingHistory = resolveMatchingHistory;
  _exports.mapMatchingJob = mapMatchingJob;
  _exports.createMatchingJobConstructor = createMatchingJobConstructor;

  function prepareMatchingConstructor(createMatching, loadMatching) {
    return function (entries, account, time, subsidiary, user, accountingBook) {
      if ((0, _MatchingRepository.isNewMatchingNeeded)(entries)) {
        return createMatching(account, time, subsidiary, user, accountingBook);
      }

      var matchingIds = (0, _lodash.compact)(entries.map(function (x) {
        return x.matching;
      }));

      if (matchingIds.length > 0) {
        return loadMatching(matchingIds[0]);
      }

      throw (0, _errors.createError)("Could not determine Matching ID");
    };
  }

  function resolveMatchingHistory(row) {
    if (row.job.type !== _index.JobType.MATCHING) {
      return row;
    }

    var _a = mapMatchingJob(row.job),
        input = _a.input,
        output = _a.output;

    return new _index.HistoryRow((0, _tslib.__assign)((0, _tslib.__assign)({}, row), {
      entries: input.entries,
      history: output
    }));
  }

  function mapMatchingJob(job) {
    if (job.type !== _index.JobType.MATCHING) {
      throw (0, _errors.createError)("Unexpected JobType. Expected: \"" + _index.JobType.MATCHING + "\" | Found: \"" + job.type + "\"");
    }

    return {
      id: job.id,
      input: (0, _expectations.expectMatchingRequest)(JSON.parse(job.input)),
      matchingDate: job.matchingDate,
      output: (0, _Maybe.maybe)(job.output).fmap(_fn.silentParse).filterType(Array.isArray).valueOrUndefined(),
      status: job.status,
      type: job.type,
      user: job.user
    };
  }

  function createMatchingJobConstructor(jobRepository, prepareMatching, getCurrentDateTime, getCurrentUserId, getPermission) {
    return function (input) {
      var permission = getPermission();
      input.entries.forEach(function (entry) {
        return (0, _permissions.assertAuthorized)(permission, entry.isPeriodClosed);
      });
      var matchingDate = getCurrentDateTime();
      var user = getCurrentUserId();
      var matching = input.forceNewCode ? prepareMatching((0, _utils.clearEntries)(input.entries), input.account, matchingDate, input.subsidiary, user, input.accountingBook) : prepareMatching(input.entries, input.account, matchingDate, input.subsidiary, user, input.accountingBook);
      return mapMatchingJob(jobRepository.create({
        account: input.account,
        input: JSON.stringify((0, _tslib.__assign)((0, _tslib.__assign)({}, input), {
          matching: matching
        })),
        matchingDate: matchingDate,
        status: _index.JobStatus.PENDING,
        type: _index.JobType.MATCHING,
        user: user
      }));
    };
  }
});