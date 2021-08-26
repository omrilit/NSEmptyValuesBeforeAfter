/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../matching/di/historyResolver", "../../suiteapi/di/runQuery", "../history"], function (_exports, _historyResolver, _runQuery, _history) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.findEntriesInProgress = _exports.findInProgress = _exports.findHistory = void 0;
  var findHistory = (0, _history.findHistoryConstructor)(_runQuery.runQuery, _historyResolver.historyResolver);
  _exports.findHistory = findHistory;
  var findInProgress = (0, _history.findInProgressConstructor)(_runQuery.runQuery, _historyResolver.historyResolver);
  _exports.findInProgress = findInProgress;
  var findEntriesInProgress = (0, _history.findEntriesInProgressConstructor)(findInProgress);
  _exports.findEntriesInProgress = findEntriesInProgress;
});