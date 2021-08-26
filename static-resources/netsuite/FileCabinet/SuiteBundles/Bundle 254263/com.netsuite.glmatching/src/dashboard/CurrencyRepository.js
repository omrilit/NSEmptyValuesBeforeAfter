/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../common/expectations", "../common/fn", "../common/Maybe", "../common/sql"], function (_exports, _expectations, _fn, _Maybe, _sql) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.CurrencyRepository = void 0;

  function toSubsidiaryWithCurrency(data) {
    return (0, _fn.compactObject)({
      currency: (0, _expectations.expectString)(data[0]),
      id: (0, _expectations.expectInternalId)(data[1])
    });
  }

  var CurrencyRepository =
  /** @class */
  function () {
    function CurrencyRepository(runQuery, runtime) {
      this.runQuery = runQuery;
      this.runtime = runtime;
    }

    CurrencyRepository.prototype.getLabelWithCurrency = function (subsidiary, label) {
      var _this = this;

      return subsidiary.filter(function () {
        return _this.runtime.isOneWorld();
      }).bind(function (id) {
        return _this.findCurrencyBySubsidiary(id);
      }).caseOf({
        just: function just(currencyName) {
          return label + " (" + currencyName + ")";
        },
        nothing: function nothing() {
          return label;
        }
      });
    };

    CurrencyRepository.prototype.fetchCurrencyBySubsidiaries = function (subsidiaryIds) {
      var _this = this;

      return (0, _sql.isIn)("s.id", subsidiaryIds).fmap(function (condition) {
        return "\n                SELECT c.symbol, s.id\n                FROM currency c, subsidiary s\n                WHERE c.id = s.currency\n                  AND " + condition + "\n            ";
      }).fmap(function (query) {
        return _this.runQuery(query, subsidiaryIds).map(toSubsidiaryWithCurrency);
      }).valueOr([]);
    };

    CurrencyRepository.prototype.findCurrencyBySubsidiary = function (subsidiaryId) {
      var results = this.runQuery("\n            SELECT currency.symbol\n            FROM currency, subsidiary\n            WHERE currency.id = subsidiary.currency\n            AND subsidiary.id = ?\n        ", [subsidiaryId]);
      return results.length > 0 && results[0].length === 1 ? (0, _Maybe.maybe)((0, _expectations.expectInternalId)(results[0][0])) : (0, _Maybe.nothing)();
    };

    return CurrencyRepository;
  }();

  _exports.CurrencyRepository = CurrencyRepository;
});