/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../vendor/tslib", "../account/index", "../common/fn", "../common/sql", "../../lib/errors", "../../vendor/lodash-4.17.4"], function (_exports, _tslib, _index, _fn, _sql, _errors, _lodash) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.AccountRepository = void 0;

  function toSelectBoxOption(row) {
    return {
      text: (0, _fn.stringOrDefault)(row[1]),
      value: (0, _fn.stringOrDefault)(row[0])
    };
  }

  var AccountRepository =
  /** @class */
  function () {
    function AccountRepository(runQuery) {
      this.runQuery = runQuery;
    }

    AccountRepository.prototype.findOptions = function () {
      var notAllowedTypes = (0, _index.getNotAllowedTypes)();
      var specialTypes = (0, _index.getSpecialTypes)();
      var query = "\n            SELECT a.id\n                 , a.accountsearchdisplayname\n            FROM account a\n            WHERE (a." + "custrecord_glm_include"
      /* INCLUDE */
      + " = 'T' AND a.accttype NOT IN (" + (0, _sql.toPlaceholders)(notAllowedTypes) + ")\n                 OR a.accttype IN (" + (0, _sql.toPlaceholders)(specialTypes) + "))\n                 AND isinactive = 'F'\n            ORDER BY a.accountsearchdisplayname ASC\n        ";
      return this.runQuery(query, (0, _tslib.__spreadArrays)(notAllowedTypes, specialTypes)).map(toSelectBoxOption);
    };

    AccountRepository.prototype.findOptionsBySubsidiaries = function (subsidiaries) {
      if (subsidiaries.length === 0) {
        return [];
      }

      var notAllowedTypes = (0, _index.getNotAllowedTypes)();
      var specialTypes = (0, _index.getSpecialTypes)();
      var query = "\n            SELECT a.id\n                , a.accountsearchdisplayname\n            FROM account a\n               , AccountSubsidiaryMap asm\n            WHERE a.id = asm.account\n              AND asm.subsidiary IN (" + (0, _sql.toPlaceholders)(subsidiaries) + ")\n              AND (\n                 a." + "custrecord_glm_include"
      /* INCLUDE */
      + " = 'T' AND a.accttype NOT IN (" + (0, _sql.toPlaceholders)(notAllowedTypes) + ")\n                 OR a.accttype IN (" + (0, _sql.toPlaceholders)(specialTypes) + ")\n              ) AND isinactive = 'F'\n            ORDER BY a.accountsearchdisplayname ASC\n        ";
      return this.runQuery(query, (0, _tslib.__spreadArrays)(subsidiaries, notAllowedTypes, specialTypes)).map(toSelectBoxOption);
    };

    AccountRepository.prototype.findAccountingContextNames = function (accountIds, accountingContextId) {
      if (accountIds.length === 0) {
        return [];
      }

      var query = "\n            SELECT l.account\n                 , a.accountsearchdisplayname\n            FROM accountlocalization l\n               , account a\n            WHERE a.id = l.account\n              AND l.accountingcontext = ?\n              AND l.account IN (" + (0, _sql.toPlaceholders)(accountIds) + ")\n            ORDER BY a.accountsearchdisplayname\n        ";
      var results = this.runQuery(query, (0, _tslib.__spreadArrays)([accountingContextId], accountIds)).map(toSelectBoxOption);
      return (0, _lodash.uniqBy)(results, function (o) {
        return o.value;
      });
    };

    AccountRepository.prototype.findAccountByTransactionLine = function (transactionId, lineId) {
      var query = "\n            SELECT  transactionaccountingline.account\n            FROM    transactionaccountingline\n            WHERE   transactionaccountingline.transaction = ?\n                AND transactionaccountingline.transactionline = ?\n        ";
      var results = this.runQuery(query, [transactionId, lineId]);

      if (results.length === 0) {
        throw (0, _errors.createError)("Account not found on transaction " + transactionId + " line " + lineId);
      }

      return String(results[0][0]);
    };

    AccountRepository.prototype.isBillingStatusDisabled = function (accountId) {
      var specialTypes = (0, _index.getSpecialTypes)();
      var query = "\n            SELECT NVL2(MAX(account.id), 'false', 'true')\n            FROM account\n            WHERE account.id = ?\n              AND account.accttype IN (" + (0, _sql.toPlaceholders)(specialTypes) + ")\n        ";
      var results = this.runQuery(query, (0, _tslib.__spreadArrays)([accountId], specialTypes));
      return results[0][0] === "true";
    };

    return AccountRepository;
  }();

  _exports.AccountRepository = AccountRepository;
});