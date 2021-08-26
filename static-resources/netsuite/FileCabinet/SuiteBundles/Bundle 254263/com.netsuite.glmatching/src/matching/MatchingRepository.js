/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../common/expectations", "../common/fn", "../common/MatchingStatus", "../common/Maybe", "../common/sql", "../common/types", "../dashboard/index", "../../vendor/lodash-4.17.4", "./expectations", "./types", "./utils"], function (_exports, _expectations, _fn, _MatchingStatus, _Maybe, _sql, _types, _index, _lodash, _expectations2, _types2, _utils) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.findMatchingByIdsConstructor = findMatchingByIdsConstructor;
  _exports.isNewMatchingNeeded = isNewMatchingNeeded;
  _exports.findAllMatchingsWithWrongStatusConstructor = findAllMatchingsWithWrongStatusConstructor;
  _exports.findAllMatchingsWithWrongAccountConstructor = findAllMatchingsWithWrongAccountConstructor;
  _exports.MatchingRepository = void 0;

  function fromRecord(record) {
    return {
      code: (0, _expectations.expectString)(record.getValue({
        fieldId: _types2.MatchingSchema.fields.code
      })),
      id: (0, _expectations.expectInternalId)(record.id),
      status: (0, _MatchingStatus.expectMatchingStatus)(record.getValue({
        fieldId: _types2.MatchingSchema.fields.statusValue
      }))
    };
  }

  function findMatchingByIdsConstructor(runQuery) {
    return function (matchingIds) {
      return (0, _sql.isIn)("id", matchingIds).fmap(function (condition) {
        return "\n                SELECT id\n                     , " + _types2.MatchingSchema.fields.code + "\n                     , " + _types2.MatchingSchema.fields.statusValue + "\n                FROM " + _types2.MatchingSchema.type + "\n                WHERE " + condition + "\n            ";
      }).fmap(function (query) {
        return runQuery(query, matchingIds).map(function (_a) {
          var id = _a[0],
              code = _a[1],
              status = _a[2];
          return (0, _expectations2.expectMatching)({
            code: code,
            id: id,
            status: status
          });
        });
      }).valueOr([]);
    };
  }

  function isNewMatchingNeeded(entries) {
    var numberOfUnmatchedTransactions = 0;
    var matching;

    for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
      var entry = entries_1[_i];

      if (!entry.matching) {
        // this is an unmatched transaction
        numberOfUnmatchedTransactions++;
      } else if (!matching) {
        // this is a first matched transaction, remember the code
        matching = entry.matching;
      } else if (matching !== entry.matching) {
        // this is a first matched transaction that has a different code
        return true;
      }
    }

    return !matching || numberOfUnmatchedTransactions === 0;
  }

  function findAllMatchingsWithWrongStatusConstructor(runQuery, isMB) {
    return function () {
      return runQuery("\n            SELECT matching, code, status, amount\n            FROM (\n                SELECT gm.id matching\n                     , MAX(gm." + _types2.MatchingSchema.fields.code + ") code\n                     , MAX(gm." + _types2.MatchingSchema.fields.statusValue + ") status\n                     , SUM(ROUND(tal.netamount, 2)) amount\n                     , MIN(ap.closed) isClosed\n                FROM " + _types2.MatchingSchema.type + " gm\n                   , " + _types2.TranLineSchema.type + " gl\n                   , transactionline tl\n                   , transaction t\n                   , accountingperiod ap\n                   , transactionaccountingline tal\n                WHERE gl." + _types2.TranLineSchema.fields.matching + " = gm.id\n                  AND tl.transaction = tal.transaction\n                  AND tl.id = tal.transactionline\n                  AND tl.transaction = gl." + _types2.TranLineSchema.fields.transaction + "\n                  AND tl.id = gl." + _types2.TranLineSchema.fields.line + "\n                  AND t.id = tl.transaction\n                  AND t.postingperiod = ap.id\n                  " + (0, _sql.uncommentIf)(isMB) + " AND tal.accountingbook = gl." + _types2.TranLineSchema.fields.accountingBook + "(+)\n                  AND gl." + _types2.TranLineSchema.fields.matching + " IS NOT NULL\n                GROUP BY gm.id\n            )\n            WHERE (status = '" + "paired"
      /* PAIRED */
      + "' AND amount = 0\n               OR status = '" + "matched"
      /* MATCHED */
      + "' AND amount <> 0)\n               AND isClosed = 'F'\n        ").map(function (_a) {
        var id = _a[0],
            code = _a[1],
            status = _a[2];
        return (0, _expectations2.expectMatching)({
          code: code,
          id: id,
          status: status
        });
      });
    };
  }

  function findAllMatchingsWithWrongAccountConstructor(runQuery, isOneWorld) {
    return function () {
      return runQuery("\n            SELECT gl." + _types2.TranLineSchema.fields.matching + "\n            FROM " + _types2.TranLineSchema.type + " gl\n               , transactionaccountingline tal\n               , transaction t\n               , transactionline tl\n               , accountingperiod ap\n            WHERE tl.transaction = gl." + _types2.TranLineSchema.fields.transaction + "\n              AND tl.id = gl." + _types2.TranLineSchema.fields.line + "\n              AND tal.transaction = tl.transaction\n              AND tal.transactionline = tl.id\n              AND t.id = tal.transaction\n              AND ap.id = t.postingperiod\n              AND ap.closed = 'F'\n              AND gl." + _types2.TranLineSchema.fields.matching + " IS NOT NULL\n            GROUP BY gl." + _types2.TranLineSchema.fields.matching + "\n            HAVING COUNT(distinct tal.account) > 1\n                " + (isOneWorld ? "OR COUNT(distinct tl.subsidiary) > 1" : "") + "\n        ").map(function (result) {
        return (0, _expectations.expectInternalId)(result[0]);
      });
    };
  }

  var MatchingRepository =
  /** @class */
  function () {
    function MatchingRepository(sequences, record, matchingStatusMap, resolveDashboard) {
      this.sequences = sequences;
      this.record = record;
      this.matchingStatusMap = matchingStatusMap;
      this.resolveDashboard = resolveDashboard;
    }

    MatchingRepository.prototype.create = function (account, datetime, subsidiary, user, accountingBook) {
      var record = this.record.create({
        type: _types2.MatchingSchema.type
      });
      var code = this.sequences.nextMatchingCode(account, subsidiary, accountingBook).toLowerCase();
      var status = this.matchingStatusMap.getByStatus("paired"
      /* PAIRED */
      ).id;
      var parameters = new _index.FilterParameters({
        account: (0, _Maybe.maybe)(account),
        accountingBook: (0, _Maybe.maybe)(accountingBook),
        action: (0, _Maybe.maybe)("search"
        /* SEARCH */
        ),
        matchingCode: (0, _Maybe.maybe)(code),
        subsidiary: (0, _Maybe.maybe)(subsidiary)
      });
      record.setValue({
        fieldId: _types2.MatchingSchema.fields.code,
        value: code
      });
      record.setValue({
        fieldId: _types2.MatchingSchema.fields.status,
        value: status
      });
      record.setValue({
        fieldId: _types2.MatchingSchema.fields.date,
        value: datetime
      });
      record.setValue({
        fieldId: _types2.MatchingSchema.fields.link,
        value: this.resolveDashboard(parameters)
      });
      record.setValue({
        fieldId: _types2.MatchingSchema.fields.lastEdited,
        value: user
      });
      return {
        code: code,
        id: String(record.save()),
        status: "paired"
        /* PAIRED */

      };
    };

    MatchingRepository.prototype.load = function (id) {
      return fromRecord(this.record.load({
        id: id,
        type: _types2.MatchingSchema.type
      }));
    };

    MatchingRepository.prototype.remove = function (id) {
      this.record["delete"]({
        id: id,
        type: _types2.MatchingSchema.type
      });
    };

    MatchingRepository.prototype.recalculate = function (tranLines, matchingDate, user, getDataAlways) {
      var _this = this;

      if (getDataAlways === void 0) {
        getDataAlways = false;
      }

      return (0, _lodash.flatten)((0, _utils.getMatchingIds)(tranLines).map(function (matchingId) {
        return _this.update(tranLines, matchingId, matchingDate, user, getDataAlways);
      }));
    };

    MatchingRepository.prototype.setStatus = function (id, status) {
      var record = this.record.load({
        id: id,
        type: _types2.MatchingSchema.type
      });
      var matching = fromRecord(record);
      var save = false;
      var code = matching.code;

      if (matching.status !== status) {
        record.setValue({
          fieldId: _types2.MatchingSchema.fields.status,
          value: this.matchingStatusMap.getByStatus(status).id
        });
        save = true;
      }

      if (status !== "none"
      /* NONE */
      ) {
          code = status === "matched"
          /* MATCHED */
          ? matching.code.toUpperCase() : matching.code.toLowerCase();

          if (code !== matching.code) {
            record.setValue({
              fieldId: _types2.MatchingSchema.fields.code,
              value: code
            });
            save = true;
          }
        }

      if (save) {
        record.save();
      }

      return {
        code: code,
        id: id,
        status: status
      };
    };

    MatchingRepository.prototype.update = function (allTranLines, matchingId, matchingDate, user, getDataAlways) {
      if (getDataAlways === void 0) {
        getDataAlways = false;
      }

      var matchedTranLines = (0, _types.NonEmptyArray)(allTranLines.filter((0, _utils.isMatchingEqual)(matchingId)));
      var totals = (0, _utils.totalTranLines)(matchedTranLines);
      var matching = this.load(matchingId);

      var _a = totals.balance === 0 && matchedTranLines.length > 0 ? ["matched"
      /* MATCHED */
      , matching.code.toLocaleUpperCase()] : ["paired"
      /* PAIRED */
      , matching.code.toLocaleLowerCase()],
          newStatus = _a[0],
          newCode = _a[1];

      var values = {};

      if (newCode !== matching.code) {
        values[_types2.MatchingSchema.fields.code] = newCode;
      }

      if (newStatus !== matching.status) {
        values[_types2.MatchingSchema.fields.status] = this.matchingStatusMap.getByStatus(newStatus).id;
        values[_types2.MatchingSchema.fields.statusValue] = newStatus;
      }

      if (!(0, _lodash.isEmpty)(values) || getDataAlways) {
        if (!(0, _lodash.isEmpty)(values)) {
          values[_types2.MatchingSchema.fields.date] = matchingDate;
          values[_types2.MatchingSchema.fields.lastEdited] = user;
          this.record.submitFields({
            id: matchingId,
            type: _types2.MatchingSchema.type,
            values: values
          });
        }

        return [{
          account: matchedTranLines[0].account,
          balance: (0, _fn.change)(undefined, totals.balance, getDataAlways),
          code: (0, _fn.change)(matching.code, newCode, getDataAlways),
          status: (0, _fn.change)(matching.status, newStatus, getDataAlways),
          transactions: matchedTranLines
        }];
      }

      return [];
    };

    return MatchingRepository;
  }();

  _exports.MatchingRepository = MatchingRepository;
});