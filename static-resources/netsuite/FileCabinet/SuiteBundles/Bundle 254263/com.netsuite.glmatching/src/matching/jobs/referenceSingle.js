/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../../vendor/tslib", "../../dashboard/permissions", "../../scheduler/index", "../../../lib/errors", "../expectations"], function (_exports, _tslib, _permissions, _index, _errors, _expectations) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.mapReferenceSingleJob = mapReferenceSingleJob;
  _exports.createReferenceSingleJobConstructor = createReferenceSingleJobConstructor;
  _exports.resolveReferenceSingleHistory = resolveReferenceSingleHistory;

  function mapReferenceSingleJob(job) {
    if (job.type !== _index.JobType.REFERENCE_SINGLE) {
      throw (0, _errors.createError)("Unexpected JobType. Expected: \"" + _index.JobType.REFERENCE_SINGLE + "\" | Found: \"" + job.type + "\"");
    }

    return {
      id: job.id,
      input: (0, _expectations.expectReferenceSingleRequest)(JSON.parse(job.input)),
      matchingDate: job.matchingDate,
      output: undefined,
      status: job.status,
      type: job.type,
      user: job.user
    };
  }

  function createReferenceSingleJobConstructor(jobRepository, getCurrentDateTime, getCurrentUserId, getPermissions) {
    return function (input) {
      var permission = getPermissions();
      input.entries.forEach(function (entry) {
        return (0, _permissions.assertAuthorized)(permission, entry.isPeriodClosed);
      });
      return mapReferenceSingleJob(jobRepository.create({
        account: input.account,
        input: JSON.stringify(input),
        matchingDate: getCurrentDateTime(),
        status: _index.JobStatus.PENDING,
        type: _index.JobType.REFERENCE_SINGLE,
        user: getCurrentUserId()
      }));
    };
  }

  function resolveReferenceSingleHistory(row) {
    if (row.job.type !== _index.JobType.REFERENCE_SINGLE) {
      return row;
    }

    var _a = mapReferenceSingleJob(row.job),
        input = _a.input,
        output = _a.output;

    return new _index.HistoryRow((0, _tslib.__assign)((0, _tslib.__assign)({}, row), {
      entries: input.entries,
      history: output
    }));
  }
});