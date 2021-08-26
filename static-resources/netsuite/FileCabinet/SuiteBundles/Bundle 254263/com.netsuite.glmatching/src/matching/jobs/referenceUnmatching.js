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
  _exports.mapReferenceUnmatchingJob = mapReferenceUnmatchingJob;
  _exports.resolveReferenceUnmatchingHistory = resolveReferenceUnmatchingHistory;
  _exports.createReferenceUnmatchingJobConstructor = createReferenceUnmatchingJobConstructor;

  function mapReferenceUnmatchingJob(job) {
    if (job.type !== _index.JobType.REFERENCE_UNMATCH) {
      throw (0, _errors.createError)("Unexpected JobType. Expected: \"" + _index.JobType.REFERENCE_UNMATCH + "\" | Found: \"" + job.type + "\"");
    }

    return {
      id: job.id,
      input: (0, _expectations.expectReferenceUnmatchingRequest)(JSON.parse(job.input)),
      matchingDate: job.matchingDate,
      output: (0, _Maybe.maybe)(job.output).fmap(_fn.silentParse).filterType(Array.isArray).valueOrUndefined(),
      status: job.status,
      type: job.type,
      user: job.user
    };
  }

  function resolveReferenceUnmatchingHistory(row) {
    if (row.job.type !== _index.JobType.REFERENCE_UNMATCH) {
      return row;
    }

    var output = mapReferenceUnmatchingJob(row.job).output;
    return new _index.HistoryRow((0, _tslib.__assign)((0, _tslib.__assign)({}, row), {
      history: output
    }));
  }

  function createReferenceUnmatchingJobConstructor(jobRepository, getCurrentDateTime, getCurrentUserId, getPermissions) {
    return function (input) {
      var pReference = getPermissions.reference();
      var pMatching = getPermissions.matching();
      input.entries.forEach(function (entry) {
        (0, _permissions.assertAuthorized)(pReference, entry.isPeriodClosed);
        (0, _permissions.assertAuthorized)(pMatching, entry.isPeriodClosed);
      });
      return mapReferenceUnmatchingJob(jobRepository.create({
        account: input.account,
        input: JSON.stringify(input),
        matchingDate: getCurrentDateTime(),
        status: _index.JobStatus.PENDING,
        type: _index.JobType.REFERENCE_UNMATCH,
        user: getCurrentUserId()
      }));
    };
  }
});