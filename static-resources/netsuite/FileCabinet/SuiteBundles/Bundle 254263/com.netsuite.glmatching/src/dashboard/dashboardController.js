/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../vendor/tslib", "../common/fn", "../common/NameCollection", "../common/Summary", "../scheduler/index", "../../vendor/lodash-4.17.4", "./DashboardHistoryTabBuilder", "./request-parsers", "./TransactionResult"], function (_exports, _tslib, _fn, _NameCollection, _Summary, _index, _lodash, _DashboardHistoryTabBuilder, _requestParsers, _TransactionResult) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.dashboardControllerConstructor = dashboardControllerConstructor;
  var SUBLIST_LENGTH = 100;

  function dashboardControllerConstructor(deps) {
    function createError(e) {
      if ((0, _fn.isSuiteScriptError)(e)) {
        return {
          message: e.message + ("<!--\n" + JSON.stringify(e.stack) + "\n-->"),
          title: e.name
        };
      } else {
        return {
          message: String(e) + (e instanceof Error && typeof e.stack === "string" ? "<!--\n" + JSON.stringify(e.stack) + "\n-->" : ""),
          title: deps.translate("unknown_error")
        };
      }
    }

    function markProcessingResults(results, asyncData) {
      var entriesInProgress = (0, _lodash.flatten)(asyncData.filter(function (x) {
        return x.job.status === _index.JobStatus.PENDING || x.job.status === _index.JobStatus.PROCESSING;
      }).map(function (x) {
        return deps.historyResolver(x).entries;
      })); // a hash table will improve the performance

      var isResultInProgress = function isResultInProgress(result) {
        return (0, _lodash.some)(entriesInProgress, function (entry) {
          return entry.id === result.tranId && entry.line === result.tranLine && entry.accountingBook === result.accountingBook;
        });
      };

      var matchingCode = deps.translate(_index.JobStatus.PROCESSING);
      var matchingStatusName = deps.translate(_index.JobStatus.PROCESSING);
      var matchingReference = deps.translate(_index.JobStatus.PROCESSING);
      return results.map(function (result) {
        return isResultInProgress(result) ? new _TransactionResult.TransactionResult((0, _tslib.__assign)((0, _tslib.__assign)({}, result), {
          matchingCode: matchingCode,
          matchingStatusName: matchingStatusName,
          matchingReference: matchingReference
        })) : result;
      });
    }

    return function (request, response) {
      if (deps.runtime.checkMandatoryPermissions()) {
        deps.dashboardFormBuilder.addError({
          title: deps.translate("mandatory_per_title"),
          message: deps.translate("mandatory_per_message")
        });
        return response.writePage(deps.dashboardFormBuilder.buildEmpty());
      }

      var parameters = (0, _requestParsers.parseFilterParameters)(request);
      var page = {
        count: 0,
        results: [],
        summary: new _Summary.Summary(0, 0)
      };
      var historyData = [];
      var inProgressData = [];

      try {
        inProgressData = deps.findInProgress(SUBLIST_LENGTH);
      } catch (e) {
        deps.dashboardFormBuilder.addError(createError(e));
      }

      try {
        historyData = deps.findHistory(SUBLIST_LENGTH);
      } catch (e) {
        deps.dashboardFormBuilder.addError(createError(e));
      }

      try {
        if (parameters.isValid(deps.runtime.isOneWorld(), deps.runtime.isMultiBookEnabled())) {
          var fetchedSummary = deps.transactionSearch.fetchSummary(parameters);
          deps.logELKMetric4(fetchedSummary.count, parameters);
          page = (0, _tslib.__assign)((0, _tslib.__assign)({}, fetchedSummary), {
            results: deps.transactionSearch.fetchResults(parameters)
          });
        }
      } catch (e) {
        deps.dashboardFormBuilder.addError(createError(e));
      }

      deps.getAndClearFlashMessages().forEach(function (error) {
        return deps.dashboardFormBuilder.addError(error);
      });
      var results = markProcessingResults(page.results, inProgressData);
      var form = deps.dashboardFormBuilder.build(parameters);
      var nameCollection = deps.findNames(_NameCollection.IdentifierCollection.join((0, _tslib.__spreadArrays)(results.map(function (x) {
        return x.getIdentifiers();
      }), historyData.map(function (x) {
        return x.getIdentifiers();
      }), inProgressData.map(function (x) {
        return x.getIdentifiers();
      }))));
      deps.dashboardResultTabBuilder.build(parameters, (0, _tslib.__assign)((0, _tslib.__assign)({}, page), {
        results: results
      }), nameCollection, form);
      deps.dashboardInProgressTabBuilder.build(inProgressData, nameCollection, form);
      deps.dashboardHistoryTabBuilder.build((0, _lodash.flatten)(historyData.map(_DashboardHistoryTabBuilder.convertHistoryRow)).slice(0, SUBLIST_LENGTH), nameCollection, form);
      response.writePage(form);
    };
  }
});