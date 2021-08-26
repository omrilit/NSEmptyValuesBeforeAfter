/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../common/expectations", "../../common/NameCollection", "../../dashboard/di/accountRepository", "../../dashboard/di/navigation", "../../scheduler/di/scheduler", "../../scheduler/expectations", "../../suiteapi/index", "../../suiteapi/di/format", "../../suiteapi/di/runQuery", "../../suiteapi/di/runtime", "../../translator/di/translate", "N/log", "N/runtime", "N/ui/message", "../di/jobs", "../expectations", "../TransactionEventHandler", "../warning-message", "./matchingRepository", "./tranLineRepository", "./tranLineSearch"], function (_exports, _expectations, _NameCollection, _accountRepository, _navigation, _scheduler, _expectations2, _index, _format, _runQuery, _runtime, _translate, _log, _runtime2, _message, _jobs, _expectations3, _TransactionEventHandler, _warningMessage, _matchingRepository, _tranLineRepository, _tranLineSearch) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.transactionEventHandler = _exports.handleBeforeLoad = void 0;
  var findNames = (0, _NameCollection.findNamesConstructor)(_runQuery.runQuery, _runtime.runtime);
  var session = (0, _runtime2.getCurrentSession)();
  var balanceSession = new _index.Session(session, "tran_user_event_balance", {});
  var messageSession = new _index.Session(session, "tran_user_event_edited", [], function (xs) {
    return (0, _expectations.expectArrayOf)(_expectations2.expectHistoryData)(JSON.parse(xs));
  });
  var resultsSession = new _index.Session(session, "tran_user_event_result", [], function (xs) {
    return (0, _expectations.expectArrayOf)(_expectations3.expectTranLine)(JSON.parse(xs));
  });
  var isAnyLineMatchedSession = new _index.Session(session, "tran_line_match_control", true);
  var referenceChangedValueSession = new _index.Session(session, "reference_change_value", "");
  var handleBeforeLoad = (0, _TransactionEventHandler.handleBeforeLoadConstructor)(_log.error, messageSession, _translate.translate, _message.Type, (0, _warningMessage.warningMessageRendererConstructor)(_translate.translate, findNames, _format.format, _navigation.resolveDashboard), _tranLineSearch.tranLineSearch, isAnyLineMatchedSession, referenceChangedValueSession);
  _exports.handleBeforeLoad = handleBeforeLoad;
  var recalculateFromHistory = (0, _TransactionEventHandler.recalculateFromHistoryConstructor)(_tranLineSearch.tranLineSearch, _format.getCurrentDateTime, _runtime.getCurrentUser, _matchingRepository.matchingRepository);
  var updateTranLinesFromDifference = (0, _TransactionEventHandler.updateTranLinesFromDifferenceConstructor)(_tranLineRepository.tranLineRepository);
  var transactionEventHandler = new _TransactionEventHandler.TransactionEventHandler(balanceSession, messageSession, recalculateFromHistory, resultsSession, _tranLineRepository.tranLineRepository, _tranLineSearch.tranLineSearch, updateTranLinesFromDifference, isAnyLineMatchedSession, _runtime.runtime, _jobs.createReferenceSingleJob, _scheduler.scheduler, referenceChangedValueSession, _accountRepository.accountRepository);
  _exports.transactionEventHandler = transactionEventHandler;
});