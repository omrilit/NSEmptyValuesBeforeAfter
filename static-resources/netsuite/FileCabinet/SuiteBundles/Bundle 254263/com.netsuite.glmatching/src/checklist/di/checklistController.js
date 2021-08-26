/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

define(["exports", "../../common/expectations", "../../dashboard/di/currencyRepository", "../../dashboard/di/flash-messages", "../../dashboard/di/navigation", "../../suiteapi/index", "../../suiteapi/di/format", "../../suiteapi/di/runtime", "../../translator/di/translate", "N/runtime", "N/ui/message", "N/ui/serverWidget", "../checklistController", "../ChecklistFormBuilder", "../ChecklistResultTabBuilder", "./checklistSearch"], function (_exports, _expectations, _currencyRepository, _flashMessages, _navigation, _index, _format, _runtime, _translate, _runtime2, nMessage, nUi, _checklistController, _ChecklistFormBuilder, _ChecklistResultTabBuilder, _checklistSearch) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.checklistController = void 0;
  nMessage = _interopRequireWildcard(nMessage);
  nUi = _interopRequireWildcard(nUi);

  function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

  var session = (0, _runtime2.getCurrentSession)();
  var dateMinSession = new _index.Session(session, "glm_date_min", "", _expectations.expectString, String);
  var checklistFormBuilder = new _ChecklistFormBuilder.ChecklistFormBuilder(nUi, nMessage, _runtime.runtime, _translate.translate);
  var checklistResultTabBuilder = new _ChecklistResultTabBuilder.ChecklistResultTabBuilder(_format.format, nUi, _translate.translate, _navigation.resolveDashboard, _runtime.runtime, _currencyRepository.currencyRepository);
  var checklistController = (0, _checklistController.checklistControllerConstructor)({
    checklistFormBuilder: checklistFormBuilder,
    checklistResultTabBuilder: checklistResultTabBuilder,
    checklistSearch: _checklistSearch.checklistSearch,
    dateMinSession: dateMinSession,
    format: _format.format,
    getAndClearFlashMessages: _flashMessages.getAndClearFlashMessagesForChecklist,
    runtime: _runtime.runtime,
    translate: _translate.translate
  });
  _exports.checklistController = checklistController;
});