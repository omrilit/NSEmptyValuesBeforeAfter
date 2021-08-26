/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../../vendor/tslib", "../../scheduler/index", "../../../vendor/lodash-4.17.4", "../utils"], function (_exports, _tslib, _index, _lodash, _utils) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getReferenceGroupCommandsConstructor = getReferenceGroupCommandsConstructor;
  _exports.executeReferenceGroupCommandConstructor = executeReferenceGroupCommandConstructor;

  function getReferenceGroupCommandsConstructor(tranLineSearch) {
    return function (_a) {
      var input = _a.input;
      var matchingIds = (0, _lodash.uniq)((0, _lodash.compact)(input.entries.map(function (x) {
        return x.matching;
      })));
      return tranLineSearch.findByMatchingIds(matchingIds).filter((0, _utils.isReferenceDifferent)(input.reference)).map(function (tranLine) {
        return {
          command: _index.JobType.REFERENCE_GROUP,
          reference: input.reference,
          tranLine: tranLine
        };
      });
    };
  }

  function executeReferenceGroupCommandConstructor(setReference) {
    return function (command) {
      return setReference(command.tranLine, command.reference).map(function (history) {
        return (0, _tslib.__assign)((0, _tslib.__assign)({}, history), {
          comment: command.command
        });
      });
    };
  }
});