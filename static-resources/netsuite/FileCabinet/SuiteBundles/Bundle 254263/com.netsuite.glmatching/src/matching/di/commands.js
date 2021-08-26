/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../suiteapi/di/format", "../../suiteapi/di/runtime", "../commands/matching", "../commands/recalculation", "../commands/referenceGroup", "../commands/referenceSingle", "../commands/referenceUnmatching", "../commands/unmatching", "./matchingRepository", "./tranLineRepository", "./tranLineSearch"], function (_exports, _format, _runtime, _matching, _recalculation, _referenceGroup, _referenceSingle, _referenceUnmatching, _unmatching, _matchingRepository, _tranLineRepository, _tranLineSearch) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.executeReferenceUnmatchingCommand = _exports.getReferenceUnmatchingCommands = _exports.executeReferenceSingleCommand = _exports.getReferenceSingleCommands = _exports.executeReferenceGroupCommand = _exports.getReferenceGroupCommands = _exports.executeUnmatchingCommand = _exports.getUnmatchingCommands = _exports.getMatchingCommands = _exports.executeMatchingCommand = _exports.executeRecalculationCommand = void 0;
  var executeRecalculationCommand = (0, _recalculation.executeRecalculationCommandConstructor)(_tranLineSearch.tranLineSearch, _matchingRepository.matchingRepository.recalculate.bind(_matchingRepository.matchingRepository));
  _exports.executeRecalculationCommand = executeRecalculationCommand;
  var executeMatchingCommand = (0, _matching.executeMatchingCommandConstructor)(_tranLineRepository.tranLineRepository.match.bind(_tranLineRepository.tranLineRepository));
  _exports.executeMatchingCommand = executeMatchingCommand;
  var getMatchingCommands = (0, _matching.getMatchingCommandsConstructor)(_tranLineSearch.tranLineSearch);
  _exports.getMatchingCommands = getMatchingCommands;
  var getUnmatchingCommands = (0, _unmatching.getUnmatchingCommandsConstructor)(_tranLineSearch.tranLineSearch);
  _exports.getUnmatchingCommands = getUnmatchingCommands;
  var executeUnmatchingCommand = (0, _unmatching.executeUnmatchingCommandConstructor)(_tranLineRepository.tranLineRepository.unMatch.bind(_tranLineRepository.tranLineRepository));
  _exports.executeUnmatchingCommand = executeUnmatchingCommand;
  var getReferenceGroupCommands = (0, _referenceGroup.getReferenceGroupCommandsConstructor)(_tranLineSearch.tranLineSearch);
  _exports.getReferenceGroupCommands = getReferenceGroupCommands;
  var executeReferenceGroupCommand = (0, _referenceGroup.executeReferenceGroupCommandConstructor)(_tranLineRepository.tranLineRepository.setReference.bind(_tranLineRepository.tranLineRepository));
  _exports.executeReferenceGroupCommand = executeReferenceGroupCommand;
  var getReferenceSingleCommands = (0, _referenceSingle.getReferenceSingleCommandsConstructor)(_tranLineSearch.tranLineSearch);
  _exports.getReferenceSingleCommands = getReferenceSingleCommands;
  var executeReferenceSingleCommand = (0, _referenceSingle.executeReferenceSingleCommandConstructor)(_tranLineRepository.tranLineRepository.setReference.bind(_tranLineRepository.tranLineRepository));
  _exports.executeReferenceSingleCommand = executeReferenceSingleCommand;
  var getReferenceUnmatchingCommands = (0, _referenceUnmatching.getReferenceUnmatchingCommandsConstructor)(_format.getCurrentDateTime, _runtime.getCurrentUser, _tranLineSearch.tranLineSearch);
  _exports.getReferenceUnmatchingCommands = getReferenceUnmatchingCommands;
  var executeReferenceUnmatchingCommand = (0, _referenceUnmatching.executeReferenceUnmatchingCommandConstructor)(_tranLineRepository.tranLineRepository.save.bind(_tranLineRepository.tranLineRepository));
  _exports.executeReferenceUnmatchingCommand = executeReferenceUnmatchingCommand;
});