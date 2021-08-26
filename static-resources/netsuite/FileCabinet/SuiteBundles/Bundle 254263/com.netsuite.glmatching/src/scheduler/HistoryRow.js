/**
 * @copyright © 2020, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../vendor/tslib", "../common/Maybe", "../common/NameCollection", "../../vendor/lodash-4.17.4"], function (_exports, _tslib, _Maybe, _NameCollection, _lodash) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.HistoryRow = void 0;

  function extractAccounts(row) {
    return (0, _lodash.compact)((0, _lodash.flattenDeep)([row.account.valueOrUndefined(), row.history.map(function (x) {
      return x.account;
    }), row.history.map(function (x) {
      var _a, _b;

      return [(_a = x === null || x === void 0 ? void 0 : x.accountChange) === null || _a === void 0 ? void 0 : _a.before, (_b = x === null || x === void 0 ? void 0 : x.accountChange) === null || _b === void 0 ? void 0 : _b.after];
    }), row.history.map(function (x) {
      return x.transactions.map(function (y) {
        return y.account;
      });
    }), row.job.account]));
  }

  function extractAccountingBooks(row) {
    return (0, _lodash.compact)((0, _lodash.flattenDeep)([row.history.map(function (x) {
      return x.transactions.map(function (y) {
        return y.accountingBook;
      });
    }), row.entries.map(function (x) {
      return x.accountingBook;
    })]));
  }

  function extractSubsidiaries(row) {
    return (0, _lodash.compact)((0, _lodash.flattenDeep)(row.history.map(function (x) {
      return x.transactions.map(function (y) {
        return y.subsidiary;
      });
    })));
  }

  function extractEntities(row) {
    return (0, _lodash.compact)((0, _lodash.flattenDeep)([row.history.map(function (x) {
      return x.user;
    }), row.job.user, row.user.valueOrUndefined()]));
  }

  function extractTransactions(row) {
    return (0, _lodash.compact)((0, _lodash.flattenDeep)((0, _tslib.__spreadArrays)([row.entries.map(function (x) {
      return x.id;
    })], row.history.map(function (x) {
      return x.transactions.map(function (y) {
        return y.transaction;
      });
    }), row.history.map(function (x) {
      var _a, _b;

      return [(_a = x === null || x === void 0 ? void 0 : x.transactionChange) === null || _a === void 0 ? void 0 : _a.before, (_b = x === null || x === void 0 ? void 0 : x.transactionChange) === null || _b === void 0 ? void 0 : _b.after];
    }))));
  }

  var HistoryRow =
  /** @class */
  function () {
    function HistoryRow(options) {
      var _a, _b;

      this.__TYPE__ = "HistoryRow";
      this.account = (_a = options.account) !== null && _a !== void 0 ? _a : (0, _Maybe.nothing)();
      this.history = options.history || [];
      this.entries = options.entries || [];
      this.job = options.job;
      this.user = (_b = options.user) !== null && _b !== void 0 ? _b : (0, _Maybe.nothing)();
    }

    HistoryRow.prototype.getIdentifiers = function () {
      return new _NameCollection.IdentifierCollection({
        account: extractAccounts(this),
        book: extractAccountingBooks(this),
        entity: extractEntities(this),
        subsidiary: extractSubsidiaries(this),
        transaction: extractTransactions(this)
      });
    };

    HistoryRow.prototype.toJSON = function () {
      return {
        account: this.account,
        history: this.history,
        entries: this.entries,
        job: this.job,
        user: this.user
      };
    };

    return HistoryRow;
  }();

  _exports.HistoryRow = HistoryRow;
});