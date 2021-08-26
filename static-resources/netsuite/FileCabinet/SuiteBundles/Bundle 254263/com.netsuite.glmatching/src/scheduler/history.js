/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../common/expectations", "../common/fn", "../common/Maybe", "../../vendor/lodash-4.17.4", "./expectations", "./HistoryRow", "./types"], function (_exports, _expectations, _fn, _Maybe, _lodash, _expectations2, _HistoryRow, _types) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.findHistoryConstructor = findHistoryConstructor;
  _exports.findInProgressConstructor = findInProgressConstructor;
  _exports.findEntriesInProgressConstructor = findEntriesInProgressConstructor;

  function buildQuery(condition) {
    return "\n        SELECT *\n        FROM (\n            SELECT " + _types.JobSchema.fields.account + " AS account\n                , id\n                , (" + _types.JobSchema.fields.inputs.join(" || ") + ") AS input\n                , TO_CHAR(" + _types.JobSchema.fields.matchingDate + ", 'YYYY/MM/DD HH24:MI:SS TZH') AS matchingDate\n                , (" + _types.JobSchema.fields.outputs.join(" || ") + ") AS output\n                , " + _types.JobSchema.fields.status + " AS status\n                , " + _types.JobSchema.fields.type + " AS type\n                , NVL(" + _types.JobSchema.fields.user + ", -5) AS user\n            FROM " + _types.JobSchema.type + "\n            WHERE " + condition + "\n            ORDER BY " + _types.JobSchema.fields.created + " DESC\n        )\n        WHERE rownum <= ?\n    ";
  }

  function createJobSearch(runQuery, query, historyResolver) {
    return function (count) {
      return runQuery(query, [count]).map(function (row) {
        var account = (0, _expectations.expectOptionalInternalId)(row[0]);
        var id = (0, _expectations.expectInternalId)(row[1]);
        var input = (0, _expectations.expectString)(row[2]);
        var matchingDate = (0, _fn.parseDate)((0, _fn.stringOrDefault)(row[3]));
        var output = (0, _fn.stringOrDefault)(row[4]);
        var status = (0, _expectations2.expectJobStatus)(row[5]);
        var type = (0, _expectations2.expectJobType)(row[6]);
        var user = (0, _expectations.expectInternalId)(row[7]);
        return new _HistoryRow.HistoryRow({
          account: (0, _Maybe.maybe)(account),
          job: {
            account: account,
            id: id,
            input: input,
            matchingDate: matchingDate,
            output: output,
            status: status,
            type: type,
            user: user
          },
          user: (0, _Maybe.maybe)(user)
        });
      }).map(historyResolver);
    };
  }

  function findHistoryConstructor(runQuery, historyResolver) {
    var query = buildQuery(_types.JobSchema.fields.type + " IN ('" + _types.JobType.UNMATCHING + "','" + _types.JobType.MATCHING + "') AND " + _types.JobSchema.fields.status + " = '" + _types.JobStatus.SUCCEEDED + "'");
    return createJobSearch(runQuery, query, historyResolver);
  }

  function findInProgressConstructor(runQuery, historyResolver) {
    var query = buildQuery(_types.JobSchema.fields.status + " IN ('" + _types.JobStatus.PENDING + "', '" + _types.JobStatus.PROCESSING + "')");
    return createJobSearch(runQuery, query, historyResolver);
  }

  function findEntriesInProgressConstructor(findInProgress) {
    return function () {
      return (0, _lodash.flatten)(findInProgress(1000).filter(function (x) {
        return x.job.status !== _types.JobStatus.FAILED;
      }).map(function (x) {
        return x.entries;
      }));
    };
  }
});