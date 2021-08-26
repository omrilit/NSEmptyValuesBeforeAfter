/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 */
define(["exports", "../dashboard/dashboardHandler", "../dashboard/di/dashboardController", "../dashboard/di/exportCsvController", "../dashboard/di/flash-messages", "../dashboard/di/navigation", "../dashboard/matching-controller", "../matching/assertion", "../matching/di/jobs", "../scheduler/di/history", "../translator/di/translate", "N/log"], function (_exports, _dashboardHandler, _dashboardController, _exportCsvController, _flashMessages, _navigation, _matchingController, _assertion, _jobs, _history, _translate, _log) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.onRequest = void 0;
  var catchErrors = (0, _matchingController.catchErrorsConstructor)(_translate.translate, function (title, details) {
    return (0, _log.error)({
      title: title,
      details: details
    });
  }, _flashMessages.addFlashMessageForDashboard);
  var redirect = (0, _matchingController.redirectConstructor)(_navigation.redirectToDashboard);
  var assertThatEntriesAreNotInProgress = (0, _assertion.assertThatEntriesAreNotInProgressConstructor)(_history.findEntriesInProgress);
  var dashboardHandler = (0, _dashboardHandler.dashboardHandlerConstructor)({
    changeReferenceAndUnmatchTransaction: (0, _matchingController.changeReferenceAndUnmatchTransactionConstructor)(assertThatEntriesAreNotInProgress, _jobs.createReferenceUnmatchingJob, _jobs.executeReferenceUnmatchingJob, catchErrors, redirect),
    changeReferenceOnMatchedTransactions: (0, _matchingController.changeReferenceOnMatchedTransactionsConstructor)(assertThatEntriesAreNotInProgress, _jobs.createReferenceGroupJob, _jobs.executeReferenceGroupJob, catchErrors, redirect),
    changeReferenceOnSingleTransaction: (0, _matchingController.changeReferenceOnSingleTransactionConstructor)(assertThatEntriesAreNotInProgress, _jobs.createReferenceSingleJob, _jobs.executeReferenceSingleJob, catchErrors, redirect),
    dashboardController: _dashboardController.dashboardController,
    exportCsvController: _exportCsvController.exportCsvController,
    match: (0, _matchingController.matchConstructor)(assertThatEntriesAreNotInProgress, _jobs.createMatchingJob, _jobs.executeMatchingJob, catchErrors, redirect),
    unmatch: (0, _matchingController.unmatchConstructor)(assertThatEntriesAreNotInProgress, _jobs.createUnmatchingJob, _jobs.executeUnmatchingJob, catchErrors, redirect)
  });

  var onRequest = function onRequest(context) {
    dashboardHandler(context.request, context.response);
  };

  _exports.onRequest = onRequest;
});