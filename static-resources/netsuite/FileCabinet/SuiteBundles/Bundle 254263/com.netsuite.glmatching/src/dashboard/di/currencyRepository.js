/**
 * @copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../suiteapi/di/runQuery", "../../suiteapi/di/runtime", "../CurrencyRepository"], function (_exports, _runQuery, _runtime, _CurrencyRepository) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.currencyRepository = void 0;
  var currencyRepository = new _CurrencyRepository.CurrencyRepository(_runQuery.runQuery, _runtime.runtime);
  _exports.currencyRepository = currencyRepository;
});