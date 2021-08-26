/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../vendor/tslib", "../common/expectations", "../common/fn", "../common/MatchingStatus", "../common/Maybe", "../common/sql", "../common/Summary", "../matching/types", "../../lib/errors", "../variables/index", "../../vendor/lodash-4.17.4", "./TransactionResult", "./types"], function (_exports, _tslib, _expectations, _fn, _MatchingStatus, _Maybe, _sql, _Summary, _types, _errors, _index, _lodash, _TransactionResult, _types2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.TransactionSearch = void 0;
  var AIJE = "ADVANCED_INTERCOMPANY_JOURNAL";
  var DATETIME_FORMAT = "YYYY/MM/DD HH24:MI:SS TZH";
  var TAX_LIABILITY = "taxliab";

  function getEntity(id, type) {
    switch (type) {
      case "CustJob":
        return (0, _Maybe.maybe)({
          id: id,
          type: "customer"
        });

      case "Vendor":
        return (0, _Maybe.maybe)({
          id: id,
          type: "vendor"
        });

      case "Employee":
        return (0, _Maybe.maybe)({
          id: id,
          type: "employee"
        });

      default:
        return (0, _Maybe.nothing)();
    }
  }

  function toCondition(query) {
    return function (parameter) {
      return {
        parameters: [parameter],
        query: query
      };
    };
  }

  function entityCondition(filter) {
    var parameters = (0, _Maybe.onlyJustValues)([filter.customer, filter.employee, filter.vendor]);
    return (0, _sql.isIn)("tl.entity", parameters).fmap(function (query) {
      return {
        parameters: parameters,
        query: query
      };
    });
  }

  var TransactionSearch =
  /** @class */
  function () {
    function TransactionSearch(matchingStatusMap, runQuery, runtime, tranTypeRepository, translate) {
      this.matchingStatusMap = matchingStatusMap;
      this.runQuery = runQuery;
      this.runtime = runtime;
      this.tranTypeRepository = tranTypeRepository;
      this.translate = translate;
    }

    TransactionSearch.prototype.fetchResults = function (filter) {
      var _this = this;

      var isOW = this.runtime.isOneWorld();
      var isMB = this.runtime.isMultiBookEnabled();
      var commentAccountingContext = (0, _sql.uncommentIf)((0, _Maybe.isJust)(filter.accountingContext));
      var pageSize = filter.pageSize || _types2.DEFAULT_PAGE_SIZE;
      var pageNumber = Math.max(1, filter.pageNumber);
      var max = pageSize * pageNumber;
      var min = max - pageSize;
      var conditions = this.buildConditions(filter);
      var parameters = (0, _tslib.__spreadArrays)([max], (0, _lodash.flatMap)(conditions, function (x) {
        return x.parameters;
      }), [min]);
      var query = "\n            SELECT /*+ LEADING(x.\"ACCOUNT\") */\n            x.*\n            FROM (\n                SELECT a.id accountId\n                     , " + (isMB ? "tal.accountingbook" : _types2.DEFAULT_ACCOUNTING_BOOK) + " accountingBook\n                     , tal.credit credit\n                     , tal.credit / tal.exchangerate creditFx\n                     , c.symbol currency\n                     , t.trandate date\n                     , tal.debit debit\n                     , tal.debit / tal.exchangerate debitFx\n                     , e.id entityId\n                     , e.type entityType\n                     , ap.closed isPeriodClosed\n                     , t.isreversal isReversal\n                     , gm." + _types.MatchingSchema.fields.code + " matchingCode\n                     , TO_CHAR(gm." + _types.MatchingSchema.fields.date + ", '" + DATETIME_FORMAT + "') matchingDate\n                     , gt." + _types.TranLineSchema.fields.matching + " matchingId\n                     , gt." + _types.TranLineSchema.fields.reference + " matchingReference\n                     , gv." + _index.VariableSchema.fields.name + " matchingStatusName\n                     , gv." + _index.VariableSchema.fields.value + " matchingStatusValue\n                     , SUBSTR(t.memo, 0, 3999) memoMain\n                     , " + (isOW ? "tl.subsidiary" : _types2.DEFAULT_SUBSIDIARY) + " subsidiary\n                     , t.id tranId\n                     , tl.id tranLine\n                     , " + (isOW ? "CASE WHEN t.journaltype = '" + AIJE + "' THEN t.journaltype ELSE Builtin.DF(t.type) END" : "Builtin.DF(t.type)") + " tranName\n                     , t.tranid tranNumber\n                     , t.type tranType\n                     , gt.id tranlineId\n                     , rownum rn\n            FROM transaction t\n               , transactionline tl\n               , transactionaccountingline tal\n               , " + _types.TranLineSchema.type + " gt\n               , " + _types.MatchingSchema.type + " gm\n               , " + _index.VariableSchema.type + " gv\n               , accountingperiod ap\n               , account a\n               , currency c\n               , entity e\n               " + commentAccountingContext + ", accountlocalization al\n            WHERE t.id = tl.transaction\n              AND tl.transaction = tal.transaction\n              AND tl.id = tal.transactionline\n              AND t.currency = c.id\n              AND tal.account = a.id\n              AND t.postingperiod = ap.id(+)\n              " + commentAccountingContext + "AND a.id = al.account(+)\n              AND tl.entity = e.id(+)\n              AND tl.transaction = gt." + _types.TranLineSchema.fields.transaction + "(+)\n              AND tl.id = gt." + _types.TranLineSchema.fields.line + "(+)\n              AND gt." + _types.TranLineSchema.fields.matching + " = gm.id(+)\n              " + (0, _sql.uncommentIf)(isMB) + "AND tal.accountingbook = gt." + _types.TranLineSchema.fields.accountingBook + "(+)\n              AND gm." + _types.MatchingSchema.fields.status + " = gv.id(+)\n              AND rownum <= ?\n              AND " + conditions.map(function (x) {
        return x.query;
      }).join(" AND ") + "\n            ) x\n            WHERE x.rn > ?\n        ";
      var results = this.runQuery(query, parameters);
      return results.map(function (result) {
        var account = (0, _expectations.expectInternalId)(result[0]);
        var accountingBook = (0, _expectations.expectInternalId)(result[1]);
        var credit = (0, _fn.stringOrDefault)(result[2]);
        var creditFx = (0, _fn.stringOrDefault)(result[3]);
        var currency = (0, _fn.stringOrDefault)(result[4]);
        var date = (0, _fn.stringOrDefault)(result[5]);
        var debit = (0, _fn.stringOrDefault)(result[6]);
        var debitFx = (0, _fn.stringOrDefault)(result[7]);
        var entity = (0, _Maybe.maybe)((0, _expectations.expectOptionalInternalId)(result[8])).bind(function (id) {
          return getEntity(id, (0, _fn.stringOrDefault)(result[9]));
        });
        var isPeriodClosed = result[10] === "T";
        var isReversal = result[11] === "T";
        var matchingCode = (0, _fn.stringOrDefault)(result[12]);
        var matchingDate = (0, _fn.parseDateOrUndefined)((0, _fn.stringOrDefault)(result[13]));
        var matchingId = (0, _expectations.expectOptionalInternalId)(result[14]);
        var matchingReference = (0, _fn.stringOrDefault)(result[15]);
        var matchingStatusName = (0, _fn.stringOrDefault)(result[16]);
        var matchingStatusValue = (0, _MatchingStatus.parseMatchingStatus)((0, _fn.stringOrDefault)(result[17]));
        var memoMain = (0, _fn.stringOrDefault)(result[18]);
        var subsidiary = (0, _expectations.expectInternalId)(result[19]);
        var tranId = (0, _expectations.expectInternalId)(result[20]);
        var tranLine = (0, _expectations.expectInternalId)(result[21]);
        var tranName = (0, _expectations.expectString)(result[22]);
        var tranNumber = (0, _fn.stringOrDefault)(result[23]);
        var tranType = (0, _expectations.expectString)(result[24]);
        var tranlineId = (0, _expectations.expectOptionalInternalId)(result[25]);
        return new _TransactionResult.TransactionResult({
          account: account,
          accountingBook: accountingBook,
          credit: credit,
          creditFx: creditFx,
          currency: currency,
          date: date,
          debit: debit,
          debitFx: debitFx,
          entity: entity,
          isPeriodClosed: isPeriodClosed,
          isReversal: isReversal,
          matchingCode: matchingCode,
          matchingDate: matchingDate,
          matchingId: matchingId,
          matchingReference: matchingReference,
          matchingStatusName: matchingStatusName,
          matchingStatusValue: matchingStatusValue,
          memoMain: memoMain,
          subsidiary: subsidiary,
          tranId: tranId,
          tranLine: tranLine,
          tranName: tranName === AIJE ? _this.translate("advanced_intercompany_journal_entry") : tranName,
          tranNumber: tranNumber,
          tranType: tranType,
          tranlineId: tranlineId
        });
      });
    };

    TransactionSearch.prototype.fetchSummary = function (filter) {
      var isMB = this.runtime.isMultiBookEnabled();
      var commentAccountingContext = (0, _sql.uncommentIf)((0, _Maybe.isJust)(filter.accountingContext));
      var conditions = this.buildConditions(filter);
      var parameters = (0, _lodash.flatMap)(conditions, function (x) {
        return x.parameters;
      });
      var query = "\n            SELECT /*+ LEADING(\"ACCOUNT\") */\n            COUNT(*) count\n                 , SUM(tal.credit) credit\n                 , SUM(tal.debit) debit\n            FROM transaction t\n               , transactionline tl\n               , transactionaccountingline tal\n               , " + _types.TranLineSchema.type + " gt\n               , " + _types.MatchingSchema.type + " gm\n               , " + _index.VariableSchema.type + " gv\n               , account a\n               , entity e\n               " + commentAccountingContext + ", accountlocalization al\n            WHERE t.id = tl.transaction\n              AND tl.transaction = tal.transaction\n              AND tl.id = tal.transactionline\n              AND tal.account = a.id\n              " + commentAccountingContext + "AND a.id = al.account(+)\n              AND tl.entity = e.id(+)\n              AND tl.transaction = gt." + _types.TranLineSchema.fields.transaction + "(+)\n              AND tl.id = gt." + _types.TranLineSchema.fields.line + "(+)\n              AND gt." + _types.TranLineSchema.fields.matching + " = gm.id(+)\n              " + (0, _sql.uncommentIf)(isMB) + "AND tal.accountingbook = gt." + _types.TranLineSchema.fields.accountingBook + "(+)\n              AND gm." + _types.MatchingSchema.fields.status + " = gv.id(+)\n              AND " + conditions.map(function (x) {
        return x.query;
      }).join(" AND ") + "\n        ";
      var results = this.runQuery(query, parameters);

      if (results.length === 0) {
        throw (0, _errors.createError)("Cannot count results");
      }

      return {
        count: Number(results[0][0]),
        summary: new _Summary.Summary(Number(results[0][1]), Number(results[0][2]))
      };
    };

    TransactionSearch.prototype.buildConditions = function (filter) {
      var _this = this;

      return (0, _Maybe.onlyJustValues)([(0, _Maybe.maybe)({
        parameters: ["T"],
        query: "tal.posting = ?"
      }), filter.account.fmap(toCondition("tal.account = ?")), filter.accountingBook.filter(function () {
        return _this.runtime.isMultiBookEnabled();
      }).fmap(toCondition("tal.accountingbook = ?")), filter.accountingContext.fmap(toCondition("al.accountingcontext = ?")), filter.amountMax.fmap(toCondition("ABS(tl.netamount) <= ?")), filter.amountMin.fmap(toCondition("ABS(tl.netamount) >= ?")), filter.billingStatus.fmap(toCondition("t.billingstatus = ?")), filter.dateMax.fmap(toCondition("t.trandate <= ?")), filter.dateMin.fmap(toCondition("t.trandate >= ?")), filter.matchingCode.fmap(function (code) {
        return {
          parameters: [code, code],
          query: "(gm." + _types.MatchingSchema.fields.code + " = UPPER(?) OR gm." + _types.MatchingSchema.fields.code + " = LOWER(?))"
        };
      }), filter.matchingReference.fmap(toCondition("gt." + _types.TranLineSchema.fields.reference + " = ?")), filter.memo.fmap(toCondition("UPPER(t.memo) LIKE UPPER('%' || ? || '%')")), filter.memoLine.fmap(toCondition("UPPER(tl.memo) LIKE UPPER('%' || ? || '%')")), filter.subsidiary.filter(function () {
        return _this.runtime.isOneWorld();
      }).fmap(toCondition("tl.subsidiary = ?")), entityCondition(filter), this.matchingStatusCondition(filter.matchingStatus), this.transactionTypesCondition(filter.transactionTypes), filter.classification.fmap(toCondition("tl.class = ?")), filter.department.fmap(toCondition("tl.department = ?")), filter.location.fmap(toCondition("tl.location = ?"))]);
    };

    TransactionSearch.prototype.fetchRecordTypeById = function (id) {
      var result = (0, _Maybe.maybe)(this.runQuery("SELECT recordtype FROM transaction WHERE id = ?", [id])[0][0]);
      return result.caseOf({
        just: function just(e) {
          return (0, _expectations.expectString)(e);
        },
        nothing: function nothing() {
          return "taxliab";
        }
      });
    };

    TransactionSearch.prototype.matchingStatusCondition = function (options) {
      var _this = this;

      if (!options.isSelectedAnything() || options.isSelectedAll()) {
        return (0, _Maybe.nothing)();
      }

      var parameters = options.getSelected().map(function (x) {
        return _this.matchingStatusMap.getByStatus(x).id;
      });
      return (0, _sql.joinQueryConditions)("OR", [(0, _sql.isIn)("gm." + _types.MatchingSchema.fields.status, parameters), options.isSelected("none"
      /* NONE */
      ) ? (0, _Maybe.maybe)("gm." + _types.MatchingSchema.fields.status + " IS NULL") : (0, _Maybe.nothing)()]).fmap(function (query) {
        return {
          parameters: parameters,
          query: query
        };
      });
    };

    TransactionSearch.prototype.transactionTypesCondition = function (tranTypes) {
      if (tranTypes.length === 0) {
        tranTypes = this.tranTypeRepository.findAllowedTranTypes(this.runtime.getLanguage());
      }

      var types = tranTypes.map(function (x) {
        return x.type;
      });
      var taxLiability = types.filter(function (x) {
        return x === TAX_LIABILITY;
      });
      var regular = types.filter(function (x) {
        return x !== TAX_LIABILITY;
      });
      return (0, _sql.joinQueryConditions)("OR", [(0, _sql.isIn)("t.recordtype", regular), taxLiability.length > 0 ? (0, _Maybe.maybe)("LOWER(t.type) = ?") : (0, _Maybe.nothing)()]).fmap(function (query) {
        return {
          parameters: (0, _tslib.__spreadArrays)(regular, taxLiability),
          query: query
        };
      });
    };

    return TransactionSearch;
  }();

  _exports.TransactionSearch = TransactionSearch;
});