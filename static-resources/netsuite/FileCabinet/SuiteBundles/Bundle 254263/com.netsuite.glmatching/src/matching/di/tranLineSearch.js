/**
 * @copyright © 2020, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../suiteapi/di/runQuery", "../../suiteapi/di/runtime", "../TranLineSearch"], function (_exports, _runQuery, _runtime, _TranLineSearch) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.tranLineSearch = void 0;
  var tranLineSearch = new _TranLineSearch.TranLineSearch(_runQuery.runQuery, _runtime.runtime);
  _exports.tranLineSearch = tranLineSearch;
});