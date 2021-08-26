/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 * @see https://tools.ietf.org/html/rfc4180
 */
define(["exports", "../../vendor/tslib"], function (_exports, _tslib) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.csvBuilderConstructor = csvBuilderConstructor;

  function csvBuilderConstructor(translate, format, currencyRepository) {
    return function (results, nameCollection, subsidiary) {
      return (0, _tslib.__spreadArrays)([[translate("tran_name_column"), translate("number_column"), translate("date_column"), translate("entity_column"), translate("currency_column"), currencyRepository.getLabelWithCurrency(subsidiary, translate("debit_checked_column")), currencyRepository.getLabelWithCurrency(subsidiary, translate("credit_checked_column")), translate("debit_total_column"), translate("credit_total_column"), translate("memo_column"), translate("matching_code_column"), translate("matching_status_column"), translate("matching_date_column"), translate("matching_reference_column")]], results.map(function (result) {
        return [result.tranName, result.tranNumber, format.formatDate(result.date), result.entity.bind(function (_a) {
          var id = _a.id;
          return nameCollection.entity(id);
        }).valueOr(""), result.currency, format.formatCurrency(result.debit || "0.00"), format.formatCurrency(result.credit || "0.00"), format.formatCurrency(result.debitFx || "0.00"), format.formatCurrency(result.creditFx || "0.00"), result.memoMain, result.matchingCode, result.matchingStatusName, format.formatDateTime(result.matchingDate || ""), result.matchingReference];
      }));
    };
  }
});