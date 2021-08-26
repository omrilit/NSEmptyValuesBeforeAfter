/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../../vendor/tslib", "../../common/fn", "../../common/Maybe", "../../dashboard/permissions", "../../scheduler/index", "../../../lib/errors", "../expectations"], function (_exports, _tslib, _fn, _Maybe, _permissions, _index, _errors, _expectations) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.resolveUnmatchingHistory = resolveUnmatchingHistory;
  _exports.mapUnmatchingJob = mapUnmatchingJob;
  _exports.createUnmatchingJobConstructor = createUnmatchingJobConstructor;

  function resolveUnmatchingHistory(row) {
    if (row.job.type !== _index.JobType.UNMATCHING) {
      return row;
    }

    var _a = mapUnmatchingJob(row.job),
        input = _a.input,
        output = _a.output;

    return new _index.HistoryRow((0, _tslib.__assign)((0, _tslib.__assign)({}, row), {
      entries: input.entries,
      history: output
    }));
  }

  function mapUnmatchingJob(job) {
    if (job.type !== _index.JobType.UNMATCHING) {
      throw (0, _errors.createError)("Unexpected JobType. Expected: \"" + _index.JobType.UNMATCHING + "\" | Found: \"" + job.type + "\"");
    }

    return {
      id: job.id,
      input: (0, _expectations.expectUnmatchingRequest)(JSON.parse(job.input)),
      matchingDate: job.matchingDate,
      output: (0, _Maybe.maybe)(job.output).fmap(_fn.silentParse).filterType(Array.isArray).valueOrUndefined(),
      status: job.status,
      type: job.type,
      user: job.user
    };
  }

  function createUnmatchingJobConstructor(jobRepository, getCurrentDateTime, getCurrentUserId, getPermission) {
    return function (input) {
      var permission = getPermission();
      input.entries.forEach(function (entry) {
        return (0, _permissions.assertAuthorized)(permission, entry.isPeriodClosed);
      });
      return mapUnmatchingJob(jobRepository.create({
        account: input.account,
        input: JSON.stringify(input),
        matchingDate: getCurrentDateTime(),
        status: _index.JobStatus.PENDING,
        type: _index.JobType.UNMATCHING,
        user: getCurrentUserId()
      }));
    };
  }
});