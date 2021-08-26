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
  _exports.getReferenceSingleCommandsConstructor = getReferenceSingleCommandsConstructor;
  _exports.executeReferenceSingleCommandConstructor = executeReferenceSingleCommandConstructor;

  function getReferenceSingleCommandsConstructor(tranLineSearch) {
    return function (_a) {
      var input = _a.input;
      return tranLineSearch.findByEntries(input.entries).filter((0, _utils.isReferenceDifferent)(input.reference)).map(function (tranLine) {
        return {
          command: _index.JobType.REFERENCE_SINGLE,
          reference: input.reference,
          tranLine: tranLine
        };
      });
    };
  }

  function executeReferenceSingleCommandConstructor(setReference) {
    return function (command) {
      return setReference(command.tranLine, command.reference).map(function (history) {
        return (0, _tslib.__assign)((0, _tslib.__assign)({}, history), {
          comment: command.command
        });
      });
    };
  }
});