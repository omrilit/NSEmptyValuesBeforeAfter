/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

define(["exports", "../common/expectations", "../common/fn", "../common/MatchingStatus", "../common/Maybe", "../common/sql", "../dashboard/index", "../../vendor/lodash-4.17.4", "./types"], function (_exports, _expectations, _fn, _MatchingStatus, _Maybe, _sql, _index, _, _types) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.TranLineSearch = void 0;
  _ = _interopRequireWildcard(_);

  function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

  var TranLineSearch =
  /** @class */
  function () {
    function TranLineSearch(runQuery, runtime) {
      this.runQuery = runQuery;
      this.runtime = runtime;
    }

    TranLineSearch.prototype.findByEntries = function (entries) {
      var _this = this;

      if (entries.length === 0) {
        return [];
      }

      var isMB = this.runtime.isMultiBookEnabled();
      var mapper = isMB ? function (entry) {
        return [entry.id, entry.line, entry.accountingBook];
      } : function (entry) {
        return [entry.id, entry.line];
      };
      return _.flatMap(_.chunk(entries, isMB ? 333 : 500), function (xs) {
        return _this.fetch(_.flatMap(xs, mapper), [], xs.length);
      });
    };

    TranLineSearch.prototype.findByMatchingIds = function (matchingIds) {
      var _this = this;

      if (matchingIds.length === 0) {
        return [];
      }

      return (0, _sql.isIn)("gm.id", matchingIds).caseOf({
        just: function just(conditions) {
          return _this.fetch(matchingIds, [conditions]);
        },
        nothing: function nothing() {
          return [];
        }
      });
    };

    TranLineSearch.prototype.findByTransactionIds = function (transactionIds) {
      var _this = this;

      if (transactionIds.length === 0) {
        return [];
      }

      return (0, _sql.isIn)("t.id", transactionIds).caseOf({
        just: function just(conditions) {
          return _this.fetch(transactionIds, [conditions]);
        },
        nothing: function nothing() {
          return [];
        }
      });
    };

    TranLineSearch.prototype.findReferenceCSVLines = function () {
      return this.fetch([], ["t." + _types.csvReference + " IS NOT NULL"]);
    };

    TranLineSearch.prototype.fetch = function (parameters, conditions, entries) {
      if (entries === void 0) {
        entries = 0;
      }

      var isOW = this.runtime.isOneWorld();
      var isMB = this.runtime.isMultiBookEnabled();
      var entriesTable = "-- no entries";

      if (entries > 0) {
        conditions.push("tal.transaction = e.id", "tal.transactionline = e.line");

        if (isMB) {
          conditions.push("tal.accountingbook = e.book");
        }

        entriesTable = isMB ? ", (SELECT ? id, ? line, ? book FROM DUAL" + _.repeat(" UNION SELECT ?, ?, ? FROM DUAL", entries - 1) + ") e" : ", (SELECT ? id, ? line FROM DUAL" + _.repeat(" UNION SELECT ?, ? FROM DUAL", entries - 1) + ") e";
      }

      var query = "\n            SELECT /*+ OPT_PARAM('_simple_view_merging','false') */ tal.account accountId\n                 , " + (isMB ? "tal.accountingbook" : _index.DEFAULT_ACCOUNTING_BOOK) + " accountingBook\n                 , tal.credit\n                 , tal.debit\n                 , gt.id tranlineid\n                 , ap.closed isPeriodClosed\n                 , tl.id tranline\n                 , gm." + _types.MatchingSchema.fields.code + " matchingCode\n                 , gm.id matchingId\n                 , gm." + _types.MatchingSchema.fields.statusValue + " matchingStatusValue\n                 , TO_CHAR(gm." + _types.MatchingSchema.fields.date + ", 'YYYY/MM/DD HH24:MI:SS TZH') matchingDate\n                 , NVL(t." + _types.csvReference + ", gt." + _types.TranLineSchema.fields.reference + ") matchingReference\n                 , " + (isOW ? "tl.subsidiary" : _index.DEFAULT_SUBSIDIARY) + " subsidiary\n                 , tal.transaction tranId\n            FROM transactionaccountingline tal\n               , transactionline tl\n               , transaction t\n               , " + _types.TranLineSchema.type + " gt\n               , " + _types.MatchingSchema.type + " gm\n               , accountingperiod ap\n               " + entriesTable + "\n            WHERE tal.transaction = tl.transaction\n              AND tal.transactionline = tl.id\n              AND tal.transaction = gt." + _types.TranLineSchema.fields.transaction + "(+)\n              AND tal.transactionline = gt." + _types.TranLineSchema.fields.line + "(+)\n              " + (0, _sql.uncommentIf)(isMB) + "AND tal.accountingbook = gt." + _types.TranLineSchema.fields.accountingBook + "(+)\n              AND gt." + _types.TranLineSchema.fields.matching + " = gm.id(+)\n              AND tal.transaction = t.id\n              AND t.postingperiod = ap.id(+)\n              AND tal.account IS NOT NULL\n              AND tal.posting = 'T'\n              " + conditions.map(function (x) {
        return "AND " + x;
      }).join(" ");
      var results = this.runQuery(query, parameters);
      return results.map(function (data) {
        var account = (0, _expectations.expectInternalId)(data[0]);
        var accountingBook = (0, _expectations.expectInternalId)(data[1]);
        var credit = (0, _fn.stringOrDefault)(data[2]);
        var debit = (0, _fn.stringOrDefault)(data[3]);
        var id = (0, _expectations.expectOptionalInternalId)(data[4]);
        var isPeriodClosed = data[5] === "T";
        var line = (0, _expectations.expectInternalId)(data[6]);
        var matching = (0, _Maybe.maybe)((0, _expectations.expectOptionalInternalId)(data[8])).fmap(function (matchingId) {
          return {
            code: (0, _fn.stringOrDefault)(data[7]),
            id: matchingId,
            status: (0, _MatchingStatus.parseMatchingStatus)((0, _fn.stringOrDefault)(data[9]))
          };
        });
        var matchingDate = (0, _fn.parseDateOrUndefined)((0, _fn.stringOrDefault)(data[10]));
        var reference = (0, _fn.stringOrDefault)(data[11]);
        var subsidiary = (0, _expectations.expectInternalId)(data[12] || _index.DEFAULT_SUBSIDIARY);
        var transaction = (0, _expectations.expectInternalId)(data[13]);
        return (0, _fn.compactObject)({
          account: account,
          accountingBook: accountingBook,
          credit: credit,
          debit: debit,
          id: id,
          isPeriodClosed: isPeriodClosed,
          line: line,
          matching: matching,
          matchingDate: matchingDate,
          reference: reference,
          subsidiary: subsidiary,
          transaction: transaction
        });
      });
    };

    return TranLineSearch;
  }();

  _exports.TranLineSearch = TranLineSearch;
});