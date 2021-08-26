/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../vendor/tslib", "../account/index", "../common/expectations", "../common/fn", "../common/MatchingStatus", "../common/Maybe", "../common/sql", "../dashboard/index", "../matching/types", "../variables/index", "../../vendor/lodash-4.17.4"], function (_exports, _tslib, _index, _expectations, _fn, _MatchingStatus, _Maybe, _sql, _index2, _types, _index3, _lodash) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.ChecklistSearch = void 0;

  function toTotalAccount(data) {
    return (0, _fn.compactObject)({
      accountId: (0, _expectations.expectInternalId)(data[0]),
      accountName: (0, _expectations.expectString)(data[1]),
      accountingBookId: (0, _expectations.expectInternalId)(data[2]),
      accountingBookName: (0, _expectations.expectString)(data[3]),
      creditTotal: (0, _fn.stringOrDefault)(data[4]),
      debitTotal: (0, _fn.stringOrDefault)(data[5]),
      lastMatchingDate: (0, _fn.parseDateOrUndefined)((0, _fn.stringOrDefault)(data[6])),
      subsidiaryId: (0, _expectations.expectInternalId)(data[7]),
      subsidiaryName: (0, _expectations.expectString)(data[8])
    });
  }

  function toFilterParameters(data) {
    return new _index2.FilterParameters({
      dateMax: (0, _Maybe.maybe)((0, _expectations.expectString)(data[0])),
      dateMin: (0, _Maybe.maybe)((0, _expectations.expectString)(data[1]))
    });
  }

  var ChecklistSearch =
  /** @class */
  function () {
    function ChecklistSearch(runQuery, transactionSearch, runtime, format) {
      this.runQuery = runQuery;
      this.transactionSearch = transactionSearch;
      this.runtime = runtime;
      this.format = format;
    }

    ChecklistSearch.prototype.fetchTotalAccountAmount = function (filter) {
      var notAllowedTypes = (0, _index.getNotAllowedTypes)();
      var specialTypes = (0, _index.getSpecialTypes)();
      var conditions = this.transactionSearch.buildConditions(filter.set({
        matchingStatus: _MatchingStatus.MatchingStatusOptions.fromArray(["paired"
        /* PAIRED */
        , "none"
        /* NONE */
        ])
      }));
      var parameters = (0, _lodash.flatMap)(conditions, function (x) {
        return x.parameters;
      });
      var isOW = this.runtime.isOneWorld();
      var isMB = this.runtime.isMultiBookEnabled();
      var query = "\n         SELECT\n         a.id,\n         a.accountsearchdisplayname accountname,\n         " + (isMB ? "tal.accountingbook accountingBookId, Builtin.DF(tal.accountingbook) accountingBookName" : _index2.DEFAULT_ACCOUNTING_BOOK + " accountingBookId, 'BookName' accountingBookName") + ",\n         SUM(tal.credit) credit,\n         SUM(tal.debit) debit,\n         MAX(To_char(gm.custrecord_glm_matching_date, 'YYYY/MM/DD HH24:MI:SS TZH')) matchingdate,\n         " + (isOW ? "tl.subsidiary subsidiaryId, Builtin.DF(tl.subsidiary) subsidiaryName" : _index2.DEFAULT_SUBSIDIARY + " subsidiaryId, 'SubsidiaryName' subsidiaryName") + "\n            FROM transaction t\n               , transactionline tl\n               , transactionaccountingline tal\n               , " + _types.TranLineSchema.type + " gt\n               , " + _types.MatchingSchema.type + " gm\n               , " + _index3.VariableSchema.type + " gv\n               , account a\n            WHERE t.id = tl.transaction\n              AND tl.transaction = tal.transaction\n              AND tl.id = tal.transactionline\n              AND tal.account = a.id\n              AND tl.transaction = gt." + _types.TranLineSchema.fields.transaction + "(+)\n              AND tl.id = gt." + _types.TranLineSchema.fields.line + "(+)\n              AND gt." + _types.TranLineSchema.fields.matching + " = gm.id(+)\n              " + (0, _sql.uncommentIf)(this.runtime.isMultiBookEnabled()) + " AND tal.accountingbook = gt." + _types.TranLineSchema.fields.accountingBook + "(+)\n              AND gm." + _types.MatchingSchema.fields.status + " = gv.id(+)\n              AND " + conditions.map(function (x) {
        return x.query;
      }).join(" AND ") + "\n                      AND (\n                 a." + "custrecord_glm_include"
      /* INCLUDE */
      + " = ? AND a.accttype NOT IN (" + (0, _sql.toPlaceholders)(notAllowedTypes) + ")\n                 OR a.accttype IN (" + (0, _sql.toPlaceholders)(specialTypes) + ")\n              )\n              GROUP BY (a.id, a.accountsearchdisplayname\n              " + (0, _sql.uncommentIf)(isMB) + " , tal.accountingbook, Builtin.DF(tal.accountingbook)\n              " + (0, _sql.uncommentIf)(isOW) + " , Builtin.DF(tl.subsidiary), tl.subsidiary\n               )\n              " + (0, _sql.uncommentIf)(filter.isMatchable) + " HAVING (SUM(tal.credit) != 0 AND SUM(tal.debit) != 0)\n              ORDER BY (a.accountsearchdisplayname)\n        ";
      return this.runQuery(query, (0, _tslib.__spreadArrays)(parameters, ["T"], notAllowedTypes, specialTypes)).map(toTotalAccount);
    };

    ChecklistSearch.prototype.fetchDateFrom = function () {
      var currentDate = this.format.getCurrentDate();
      var query = "\n        SELECT MAX(startdate) FROM accountingperiod\n        WHERE isquarter = ?\n        AND isyear = ?\n        AND enddate < ?\n        ";
      return (0, _expectations.expectString)(this.runQuery(query, ["F", "F", currentDate])[0][0]);
    };

    return ChecklistSearch;
  }();

  _exports.ChecklistSearch = ChecklistSearch;
});