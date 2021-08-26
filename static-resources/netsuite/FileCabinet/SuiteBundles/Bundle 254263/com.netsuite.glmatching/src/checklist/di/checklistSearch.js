/**
 * @copyright © 2020, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../dashboard/di/transactionSearch", "../../suiteapi/di/format", "../../suiteapi/di/runQuery", "../../suiteapi/di/runtime", "../ChecklistSearch"], function (_exports, _transactionSearch, _format, _runQuery, _runtime, _ChecklistSearch) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.checklistSearch = void 0;
  var checklistSearch = new _ChecklistSearch.ChecklistSearch(_runQuery.runQuery, _transactionSearch.transactionSearch, _runtime.runtime, _format.format);
  _exports.checklistSearch = checklistSearch;
});