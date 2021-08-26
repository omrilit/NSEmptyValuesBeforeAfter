/**
 * @copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope Public
 */

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

define(["exports", "../matching/TransactionClientHandler", "../suiteapi/di/runtime", "../translator/di/translate", "N/ui/dialog"], function (_exports, _TransactionClientHandler, _runtime, _translate, nDialog) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.fieldChanged = _exports.pageInit = void 0;
  nDialog = _interopRequireWildcard(nDialog);

  function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

  var pageInit = function pageInit(context) {
    try {
      var record = context.currentRecord;
      var transactionClientHandler = new _TransactionClientHandler.TransactionClientHandler(nDialog, _translate.translate, document, _runtime.getReferencePermission);
      transactionClientHandler.setAndCreateReferenceElement(record);
      transactionClientHandler.resolveReferenceField(record);
    } catch (e) {// intentionally swallowed
    }
  };

  _exports.pageInit = pageInit;

  var fieldChanged = function fieldChanged(context) {
    try {
      var transactionClientHandler = new _TransactionClientHandler.TransactionClientHandler(nDialog, _translate.translate, document, _runtime.getReferencePermission);
      transactionClientHandler.resolveReferenceChange(context);
    } catch (e) {// intentionally swallowed
    }
  };

  _exports.fieldChanged = fieldChanged;
});