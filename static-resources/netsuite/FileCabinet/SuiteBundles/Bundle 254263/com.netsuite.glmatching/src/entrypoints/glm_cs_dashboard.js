/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope Public
 */

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

define(["exports", "../dashboard/DashboardClient", "../dashboard/DashboardDOM", "../dashboard/DashboardRecord", "../dashboard/di/accountRepository", "../dashboard/di/navigation", "../dashboard/Dialogs", "../dashboard/findTransactionNames", "../suiteapi/di/format", "../suiteapi/di/runtime", "../translator/di/translate", "N/currentRecord", "N/query", "N/ui/dialog"], function (_exports, _DashboardClient, _DashboardDOM, _DashboardRecord, _accountRepository, _navigation, _Dialogs, _findTransactionNames, _format, _runtime, _translate, nCurrentRecord, nQuery, nDialog) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pageInit = _exports.fieldChanged = _exports.goToChecklist = _exports.handleExportCsv = _exports.goToPreviousPage = _exports.goToNextPage = _exports.unmatch = _exports.match = _exports.refresh = _exports.unMarkAll = _exports.markAll = void 0;
  nCurrentRecord = _interopRequireWildcard(nCurrentRecord);
  nQuery = _interopRequireWildcard(nQuery);
  nDialog = _interopRequireWildcard(nDialog);

  function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

  var dashboard;

  var markAll = function markAll() {
    return dashboard.markAll();
  };

  _exports.markAll = markAll;

  var unMarkAll = function unMarkAll() {
    return dashboard.unMarkAll();
  };

  _exports.unMarkAll = unMarkAll;

  var refresh = function refresh() {
    return dashboard.refresh();
  };

  _exports.refresh = refresh;

  var match = function match() {
    return dashboard.match();
  };

  _exports.match = match;

  var unmatch = function unmatch() {
    return dashboard.unmatch();
  };

  _exports.unmatch = unmatch;

  var goToNextPage = function goToNextPage() {
    return dashboard.goToNextPage();
  };

  _exports.goToNextPage = goToNextPage;

  var goToPreviousPage = function goToPreviousPage() {
    return dashboard.goToPreviousPage();
  };

  _exports.goToPreviousPage = goToPreviousPage;

  var handleExportCsv = function handleExportCsv() {
    return dashboard.handleExportCsv();
  };

  _exports.handleExportCsv = handleExportCsv;

  var goToChecklist = function goToChecklist() {
    return dashboard.goToChecklist();
  };

  _exports.goToChecklist = goToChecklist;

  var fieldChanged = function fieldChanged(context) {
    return dashboard.fieldChanged(context);
  };

  _exports.fieldChanged = fieldChanged;

  var pageInit = function pageInit(context) {
    var findTransactionNames = (0, _findTransactionNames.findTransactionNamesConstructor)(nQuery);
    var dialogs = new _Dialogs.Dialogs(nDialog, _translate.translate);
    var dashboardDOM = new _DashboardDOM.DashboardDOM(document, jQuery, _navigation.resolveDashboard, function () {
      return setWindowChanged(window, false);
    }, _translate.translate, window, _navigation.resolveChecklist);
    var dashboardRecord = new _DashboardRecord.DashboardRecord(_format.format, _accountRepository.accountRepository.isBillingStatusDisabled.bind(_accountRepository.accountRepository), nCurrentRecord.get(), _runtime.runtime, _translate.translate);
    dashboard = new _DashboardClient.DashboardClient(dashboardDOM, dashboardRecord, dialogs, findTransactionNames, _navigation.resolveDashboard, _translate.translate);
    dashboard.pageInit(context.currentRecord);
  };

  _exports.pageInit = pageInit;
});