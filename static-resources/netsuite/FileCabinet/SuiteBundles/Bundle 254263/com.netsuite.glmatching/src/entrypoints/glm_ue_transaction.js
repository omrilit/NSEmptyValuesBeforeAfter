/**
 * @copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(["exports", "../matching/di/transactionEventHandler", "N/log"], function (_exports, _transactionEventHandler, _log) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.afterSubmit = _exports.beforeSubmit = _exports.beforeLoad = void 0;

  var beforeLoad = function beforeLoad(context) {
    try {
      (0, _transactionEventHandler.handleBeforeLoad)(context);
    } catch (e) {
      (0, _log.error)("beforeLoad " + context.type, e);
    }
  };

  _exports.beforeLoad = beforeLoad;

  var beforeSubmit = function beforeSubmit(context) {
    try {
      _transactionEventHandler.transactionEventHandler.handleBeforeSubmit(context);
    } catch (e) {
      (0, _log.error)("beforeSubmit " + context.type, e);
    }
  };

  _exports.beforeSubmit = beforeSubmit;

  var afterSubmit = function afterSubmit(context) {
    try {
      _transactionEventHandler.transactionEventHandler.handleAfterSubmit(context);
    } catch (e) {
      (0, _log.error)("afterSubmit " + context.type, e);
    }
  };

  _exports.afterSubmit = afterSubmit;
});