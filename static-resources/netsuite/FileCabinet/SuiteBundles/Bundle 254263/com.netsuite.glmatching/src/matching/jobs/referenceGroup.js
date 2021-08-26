/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../../vendor/tslib", "../../dashboard/permissions", "../../scheduler/index", "../../../lib/errors", "../../../vendor/lodash-4.17.4", "../expectations"], function (_exports, _tslib, _permissions, _index, _errors, _lodash, _expectations) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.mapReferenceGroupJob = mapReferenceGroupJob;
  _exports.resolveReferenceGroupHistory = resolveReferenceGroupHistory;
  _exports.createReferenceGroupJobConstructor = createReferenceGroupJobConstructor;

  function mapReferenceGroupJob(job) {
    if (job.type !== _index.JobType.REFERENCE_GROUP) {
      throw (0, _errors.createError)("Unexpected JobType. Expected: \"" + _index.JobType.REFERENCE_GROUP + "\" | Found: \"" + job.type + "\"");
    }

    return {
      id: job.id,
      input: (0, _expectations.expectReferenceGroupRequest)(JSON.parse(job.input)),
      matchingDate: job.matchingDate,
      output: undefined,
      status: job.status,
      type: job.type,
      user: job.user
    };
  }

  function resolveReferenceGroupHistory(row) {
    if (row.job.type !== _index.JobType.REFERENCE_GROUP) {
      return row;
    }

    var _a = mapReferenceGroupJob(row.job),
        input = _a.input,
        output = _a.output;

    return new _index.HistoryRow((0, _tslib.__assign)((0, _tslib.__assign)({}, row), {
      entries: input.entries,
      history: output
    }));
  }

  function createReferenceGroupJobConstructor(jobRepository, getCurrentDateTime, getCurrentUserId, tranLineSearch, getPermissions) {
    return function (input) {
      var matchingIds = (0, _lodash.compact)(input.entries.map(function (x) {
        return x.matching;
      }));
      var permission = getPermissions();
      tranLineSearch.findByMatchingIds((0, _lodash.uniq)(matchingIds)).forEach(function (result) {
        return (0, _permissions.assertAuthorized)(permission, result.isPeriodClosed);
      });
      return mapReferenceGroupJob(jobRepository.create({
        account: input.account,
        input: JSON.stringify(input),
        matchingDate: getCurrentDateTime(),
        status: _index.JobStatus.PENDING,
        type: _index.JobType.REFERENCE_GROUP,
        user: getCurrentUserId()
      }));
    };
  }
});