/**
 * @copyright © 2020, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../common/NameCollection", "../../suiteapi/di/runQuery", "../../suiteapi/di/runtime"], function (_exports, _NameCollection, _runQuery, _runtime) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.findNames = void 0;
  var findNames = (0, _NameCollection.findNamesConstructor)(_runQuery.runQuery, _runtime.runtime);
  _exports.findNames = findNames;
});