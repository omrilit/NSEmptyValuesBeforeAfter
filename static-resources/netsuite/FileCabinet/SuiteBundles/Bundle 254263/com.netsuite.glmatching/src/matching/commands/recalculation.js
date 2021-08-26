/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../../vendor/tslib"], function (_exports, _tslib) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.executeRecalculationCommandConstructor = executeRecalculationCommandConstructor;

  function executeRecalculationCommandConstructor(tranLineSearch, recalculate) {
    return function (command) {
      var matchingIds = command.matchings.map(function (x) {
        return x.id;
      });
      var tranLines = tranLineSearch.findByMatchingIds(matchingIds);
      return recalculate(tranLines, command.matchingDate, command.user).map(function (history) {
        return (0, _tslib.__assign)((0, _tslib.__assign)({}, history), {
          comment: command.command,
          matchingDate: command.matchingDate,
          user: command.user
        });
      });
    };
  }
});