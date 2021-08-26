/**
 * @copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getNotAllowedTypes = getNotAllowedTypes;
  _exports.getSpecialTypes = getSpecialTypes;

  function getNotAllowedTypes() {
    return ["COGS", "Expense", "Income", "NonPosting", "OthExpense", "OthIncome"];
  }

  function getSpecialTypes() {
    return ["AcctPay", "AcctRec"];
  }
});