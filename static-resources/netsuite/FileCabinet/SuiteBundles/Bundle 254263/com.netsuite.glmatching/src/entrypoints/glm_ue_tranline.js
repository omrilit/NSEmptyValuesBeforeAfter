/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(["exports", "../dashboard/di/accountRepository", "../matching/types", "N/log"], function (_exports, _accountRepository, _types, _log) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.beforeSubmit = void 0;

  var beforeSubmit = function beforeSubmit(context) {
    try {
      // if empty fill up the account filed
      var account = context.newRecord.getValue({
        fieldId: _types.TranLineSchema.fields.account
      });

      if (!account) {
        var transactionId = String(context.newRecord.getValue({
          fieldId: _types.TranLineSchema.fields.transaction
        }));
        var lineId = String(context.newRecord.getValue({
          fieldId: _types.TranLineSchema.fields.line
        }));

        var value = _accountRepository.accountRepository.findAccountByTransactionLine(transactionId, lineId);

        context.newRecord.setValue({
          fieldId: _types.TranLineSchema.fields.account,
          value: value
        });
      }
    } catch (e) {
      (0, _log.error)("beforeSubmit", e);
    }
  };

  _exports.beforeSubmit = beforeSubmit;
});