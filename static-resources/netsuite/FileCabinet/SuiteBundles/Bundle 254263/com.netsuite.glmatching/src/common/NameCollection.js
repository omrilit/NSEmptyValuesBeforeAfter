/**
 * @copyright © 2020, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../vendor/tslib", "../../vendor/lodash-4.17.4", "./Maybe", "./sql"], function (_exports, _tslib, _lodash, _Maybe, _sql) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.findNamesConstructor = findNamesConstructor;
  _exports.NameCollection = _exports.IdentifierCollection = void 0;

  var IdentifierCollection =
  /** @class */
  function () {
    function IdentifierCollection(data) {
      if (data === void 0) {
        data = {};
      }

      this.account = data.account || [];
      this.book = data.book || [];
      this.entity = data.entity || [];
      this.subsidiary = data.subsidiary || [];
      this.transaction = data.transaction || [];
    }

    IdentifierCollection.join = function (xs) {
      return xs.reduce(function (a, x) {
        return a.concat(x);
      }, new IdentifierCollection());
    };

    IdentifierCollection.prototype.concat = function (row) {
      return new IdentifierCollection({
        account: (0, _tslib.__spreadArrays)(row.account, this.account),
        book: (0, _tslib.__spreadArrays)(row.book, this.book),
        entity: (0, _tslib.__spreadArrays)(row.entity, this.entity),
        subsidiary: (0, _tslib.__spreadArrays)(row.subsidiary, this.subsidiary),
        transaction: (0, _tslib.__spreadArrays)(row.transaction, this.transaction)
      });
    };

    return IdentifierCollection;
  }();

  _exports.IdentifierCollection = IdentifierCollection;

  var NameCollection =
  /** @class */
  function () {
    function NameCollection(collection) {
      if (collection === void 0) {
        collection = {};
      }

      this.collection = (0, _tslib.__assign)({
        account: {},
        book: {},
        entity: {},
        subsidiary: {},
        transaction: {}
      }, collection);
    }

    NameCollection.prototype.account = function (id) {
      return (0, _Maybe.maybe)(this.collection.account[id]);
    };

    NameCollection.prototype.accountingBook = function (id) {
      return (0, _Maybe.maybe)(this.collection.book[id]);
    };

    NameCollection.prototype.entity = function (id) {
      return (0, _Maybe.maybe)(this.collection.entity[id]);
    };

    NameCollection.prototype.subsidiary = function (id) {
      return (0, _Maybe.maybe)(this.collection.subsidiary[id]);
    };

    NameCollection.prototype.transaction = function (id) {
      return (0, _Maybe.maybe)(this.collection.transaction[id]);
    };

    return NameCollection;
  }();

  _exports.NameCollection = NameCollection;

  function findNamesConstructor(runQuery, runtime) {
    return function (identifiers) {
      var isOW = runtime.isOneWorld();
      var isMB = runtime.isMultiBookEnabled();
      var account = (0, _lodash.uniq)(identifiers.account);
      var book = (0, _lodash.uniq)(identifiers.book);
      var entity = (0, _lodash.uniq)(identifiers.entity);
      var subsidiary = (0, _lodash.uniq)(identifiers.subsidiary);
      var transaction = (0, _lodash.uniq)(identifiers.transaction);
      var query = (0, _Maybe.onlyJustValues)([(0, _sql.isIn)("id", account).fmap(function (q) {
        return "SELECT 'account', id, accountsearchdisplayname FROM account WHERE " + q;
      }), (0, _sql.isIn)("id", book).filter(function () {
        return isMB;
      }).fmap(function (q) {
        return "SELECT 'book', id, Builtin.DF(id) FROM accountingbook WHERE " + q;
      }), (0, _sql.isIn)("id", entity).fmap(function (q) {
        return "SELECT 'entity', id, entitytitle FROM entity WHERE " + q;
      }), (0, _sql.isIn)("id", subsidiary).filter(function () {
        return isOW;
      }).fmap(function (q) {
        return "SELECT 'subsidiary', id, Builtin.DF(id) FROM subsidiary WHERE " + q;
      }), (0, _sql.isIn)("id", transaction).fmap(function (q) {
        return "SELECT 'transaction', id, Builtin.DF(id) FROM transaction WHERE " + q;
      })]);

      if (query.length === 0) {
        return new NameCollection();
      }

      var results = runQuery(query.join("\nUNION ALL\n"), (0, _tslib.__spreadArrays)(account, book.filter(function () {
        return isMB;
      }), entity, subsidiary.filter(function () {
        return isOW;
      }), transaction));
      var collection = {
        account: {},
        book: {},
        entity: {},
        subsidiary: {},
        transaction: {}
      };

      for (var _i = 0, results_1 = results; _i < results_1.length; _i++) {
        var result = results_1[_i];
        collection[String(result[0])][String(result[1])] = String(result[2]);
      }

      return new NameCollection(collection);
    };
  }
});