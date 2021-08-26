/**
 * @copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "N/query", "../query"], function (_exports, _query, _query2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.runQuery = void 0;
  var runQuery = (0, _query2.runQueryConstructor)(_query.runSuiteQL);
  _exports.runQuery = runQuery;
});