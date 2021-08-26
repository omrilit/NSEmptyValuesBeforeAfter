/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../../vendor/tslib", "../../common/Maybe", "../../scheduler/index"], function (_exports, _tslib, _Maybe, _index) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getUnmatchingCommandsConstructor = getUnmatchingCommandsConstructor;
  _exports.executeUnmatchingCommandConstructor = executeUnmatchingCommandConstructor;

  function getUnmatchingCommandsConstructor(tranLineSearch) {
    return function (job) {
      var input = job.input;
      return tranLineSearch.findByEntries(input.entries).filter(function (tranLine) {
        return (0, _Maybe.isJust)(tranLine.matching);
      }).map(function (tranLine) {
        return {
          command: _index.JobType.UNMATCHING,
          matchingDate: job.matchingDate,
          tranLine: tranLine,
          user: job.user
        };
      });
    };
  }

  function executeUnmatchingCommandConstructor(unMatch) {
    return function (command) {
      return unMatch(command.tranLine).map(function (history) {
        return (0, _tslib.__assign)((0, _tslib.__assign)({}, history), {
          comment: command.command,
          matchingDate: command.matchingDate
        });
      });
    };
  }
});