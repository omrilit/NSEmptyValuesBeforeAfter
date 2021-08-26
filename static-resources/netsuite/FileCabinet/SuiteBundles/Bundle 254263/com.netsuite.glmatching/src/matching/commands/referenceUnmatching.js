/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../../vendor/tslib", "../../common/Maybe", "../../scheduler/index", "../utils"], function (_exports, _tslib, _Maybe, _index, _utils) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getReferenceUnmatchingCommandsConstructor = getReferenceUnmatchingCommandsConstructor;
  _exports.executeReferenceUnmatchingCommandConstructor = executeReferenceUnmatchingCommandConstructor;

  function getReferenceUnmatchingCommandsConstructor(getCurrentDateTime, getCurrentUser, tranLineSearch) {
    return function (_a) {
      var input = _a.input;
      var matchingDate = getCurrentDateTime();
      return tranLineSearch.findByEntries(input.entries).filter((0, _utils.isReferenceDifferent)(input.reference)).map(function (tranLine) {
        return {
          command: _index.JobType.REFERENCE_UNMATCH,
          matchingDate: matchingDate,
          reference: input.reference,
          tranLine: tranLine,
          user: getCurrentUser()
        };
      });
    };
  }

  function executeReferenceUnmatchingCommandConstructor(save) {
    return function (command) {
      return save((0, _tslib.__assign)((0, _tslib.__assign)({}, command.tranLine), {
        matching: (0, _Maybe.nothing)(),
        reference: command.reference
      })).map(function (history) {
        return (0, _tslib.__assign)((0, _tslib.__assign)({}, history), {
          comment: command.command,
          matchingDate: command.matchingDate
        });
      });
    };
  }
});