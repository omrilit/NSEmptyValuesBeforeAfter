/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

define(["exports", "../../common/di/elasticLogger", "../../matching/di/historyResolver", "../../scheduler/di/history", "../../suiteapi/di/format", "../../suiteapi/di/runtime", "../../translator/di/translate", "../../variables/di/variables", "N/format", "N/ui/message", "N/ui/serverWidget", "N/url", "../dashboardController", "../DashboardFormBuilder", "../DashboardHistoryTabBuilder", "../DashboardInProgressTabBuilder", "../DashboardResultTabBuilder", "./accountRepository", "./currencyRepository", "./findNames", "./flash-messages", "./transactionSearch", "./tranTypeRepository"], function (_exports, _elasticLogger, _historyResolver, _history, _format, _runtime, _translate, _variables, nFormat, nMessage, nUi, nUrl, _dashboardController, _DashboardFormBuilder, _DashboardHistoryTabBuilder, _DashboardInProgressTabBuilder, _DashboardResultTabBuilder, _accountRepository, _currencyRepository, _findNames, _flashMessages, _transactionSearch, _tranTypeRepository) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.dashboardController = void 0;
  nFormat = _interopRequireWildcard(nFormat);
  nMessage = _interopRequireWildcard(nMessage);
  nUi = _interopRequireWildcard(nUi);
  nUrl = _interopRequireWildcard(nUrl);

  function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

  var dashboardFormBuilder = new _DashboardFormBuilder.DashboardFormBuilder(_accountRepository.accountRepository, _tranTypeRepository.tranTypeRepository, _variables.matchingStatusMap, nFormat, nUi, nMessage, _runtime.runtime, _translate.translate);
  var dashboardHistoryTabBuilder = new _DashboardHistoryTabBuilder.DashboardHistoryTabBuilder(_format.format, nUi, nUrl, _translate.translate, _runtime.runtime);
  var dashboardInProgressTabBuilder = new _DashboardInProgressTabBuilder.DashboardInProgressTabBuilder(_format.format, nUi, nUrl, _translate.translate);
  var dashboardResultTabBuilder = new _DashboardResultTabBuilder.DashboardResultTabBuilder(_format.format, nUi, nUrl, _translate.translate, _currencyRepository.currencyRepository);
  var dashboardController = (0, _dashboardController.dashboardControllerConstructor)({
    dashboardFormBuilder: dashboardFormBuilder,
    dashboardHistoryTabBuilder: dashboardHistoryTabBuilder,
    dashboardInProgressTabBuilder: dashboardInProgressTabBuilder,
    dashboardResultTabBuilder: dashboardResultTabBuilder,
    findHistory: _history.findHistory,
    findInProgress: _history.findInProgress,
    findNames: _findNames.findNames,
    getAndClearFlashMessages: _flashMessages.getAndClearFlashMessagesForDashboard,
    historyResolver: _historyResolver.historyResolver,
    runtime: _runtime.runtime,
    transactionSearch: _transactionSearch.transactionSearch,
    translate: _translate.translate,
    logELKMetric4: _elasticLogger.logELKMetric4
  });
  _exports.dashboardController = dashboardController;
});