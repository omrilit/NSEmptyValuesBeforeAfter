/**
 * @copyright © 2020, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../suiteapi/di/runQuery", "../../suiteapi/di/runtime", "../../translator/di/translate", "../../variables/di/variables", "../TransactionSearch", "./tranTypeRepository"], function (_exports, _runQuery, _runtime, _translate, _variables, _TransactionSearch, _tranTypeRepository) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.transactionSearch = void 0;
  var transactionSearch = new _TransactionSearch.TransactionSearch(_variables.matchingStatusMap, _runQuery.runQuery, _runtime.runtime, _tranTypeRepository.tranTypeRepository, _translate.translate);
  _exports.transactionSearch = transactionSearch;
});