/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../../vendor/tslib", "../../scheduler/index", "../utils"], function (_exports, _tslib, _index, _utils) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getMatchingCommandsConstructor = getMatchingCommandsConstructor;
  _exports.executeMatchingCommandConstructor = executeMatchingCommandConstructor;

  function getMatchingCommandsConstructor(tranLineSearch) {
    return function (job) {
      var input = job.input;
      var tranLines = tranLineSearch.findByEntries(input.entries);

      if (tranLines.length === 0 || !input.matching) {
        return [];
      }

      var matching = input.matching;
      return tranLines.filter((0, _utils.hasDifferentMatching)(matching.id)).map(function (tranLine) {
        return {
          command: _index.JobType.MATCHING,
          matching: matching,
          matchingDate: job.matchingDate,
          tranLine: tranLine,
          user: job.user
        };
      });
    };
  }

  function executeMatchingCommandConstructor(match) {
    return function (command) {
      return match(command.tranLine, command.matching).map(function (history) {
        return (0, _tslib.__assign)((0, _tslib.__assign)({}, history), {
          comment: command.command,
          matchingDate: command.matchingDate,
          user: command.user
        });
      });
    };
  }
});