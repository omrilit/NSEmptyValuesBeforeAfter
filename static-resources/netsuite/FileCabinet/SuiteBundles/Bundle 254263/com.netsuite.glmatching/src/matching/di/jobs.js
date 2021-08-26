/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

define(["exports", "../../scheduler/di/jobRepository", "../../scheduler/di/scheduler", "../../suiteapi/di/format", "../../suiteapi/di/runtime", "../../variables/di/variables", "../executeJob", "../jobs/matching", "../jobs/referenceGroup", "../jobs/referenceSingle", "../jobs/referenceUnmatching", "../jobs/unmatching", "./commands", "./matchingRepository", "./tranLineSearch"], function (_exports, _jobRepository, _scheduler, _format, _runtime, _variables, _executeJob, _matching, _referenceGroup, _referenceSingle, _referenceUnmatching, _unmatching, commands, _matchingRepository, _tranLineSearch) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.executeReferenceUnmatchingJob = _exports.createReferenceUnmatchingJob = _exports.executeReferenceSingleJob = _exports.createReferenceSingleJob = _exports.executeReferenceGroupJob = _exports.createReferenceGroupJob = _exports.executeUnmatchingJob = _exports.createUnmatchingJob = _exports.executeMatchingJob = _exports.createMatchingJob = void 0;
  commands = _interopRequireWildcard(commands);

  function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

  var prepareMatching = (0, _matching.prepareMatchingConstructor)(_matchingRepository.matchingRepository.create.bind(_matchingRepository.matchingRepository), _matchingRepository.matchingRepository.load.bind(_matchingRepository.matchingRepository));
  var createMatchingJob = (0, _matching.createMatchingJobConstructor)(_jobRepository.jobRepository, prepareMatching, _format.getCurrentDateTime, _runtime.getCurrentUser, _runtime.getMatchingPermission);
  _exports.createMatchingJob = createMatchingJob;
  var executeMatchingJob = (0, _executeJob.executeJobConstructor)(_jobRepository.jobRepository, _scheduler.scheduler, commands.getMatchingCommands, commands.executeMatchingCommand, commands.executeRecalculationCommand, _matchingRepository.findMatchingByIds, _format.getCurrentDateTime, _runtime.getCurrentUser, _variables.getAsyncLimit);
  _exports.executeMatchingJob = executeMatchingJob;
  var createUnmatchingJob = (0, _unmatching.createUnmatchingJobConstructor)(_jobRepository.jobRepository, _format.getCurrentDateTime, _runtime.getCurrentUser, _runtime.getMatchingPermission);
  _exports.createUnmatchingJob = createUnmatchingJob;
  var executeUnmatchingJob = (0, _executeJob.executeJobConstructor)(_jobRepository.jobRepository, _scheduler.scheduler, commands.getUnmatchingCommands, commands.executeUnmatchingCommand, commands.executeRecalculationCommand, _matchingRepository.findMatchingByIds, _format.getCurrentDateTime, _runtime.getCurrentUser, _variables.getAsyncLimit);
  _exports.executeUnmatchingJob = executeUnmatchingJob;
  var createReferenceGroupJob = (0, _referenceGroup.createReferenceGroupJobConstructor)(_jobRepository.jobRepository, _format.getCurrentDateTime, _runtime.getCurrentUser, _tranLineSearch.tranLineSearch, _runtime.getReferencePermission);
  _exports.createReferenceGroupJob = createReferenceGroupJob;
  var executeReferenceGroupJob = (0, _executeJob.executeJobConstructor)(_jobRepository.jobRepository, _scheduler.scheduler, commands.getReferenceGroupCommands, commands.executeReferenceGroupCommand, commands.executeRecalculationCommand, _matchingRepository.findMatchingByIds, _format.getCurrentDateTime, _runtime.getCurrentUser, _variables.getAsyncLimit);
  _exports.executeReferenceGroupJob = executeReferenceGroupJob;
  var createReferenceSingleJob = (0, _referenceSingle.createReferenceSingleJobConstructor)(_jobRepository.jobRepository, _format.getCurrentDateTime, _runtime.getCurrentUser, _runtime.getReferencePermission);
  _exports.createReferenceSingleJob = createReferenceSingleJob;
  var executeReferenceSingleJob = (0, _executeJob.executeJobConstructor)(_jobRepository.jobRepository, _scheduler.scheduler, commands.getReferenceSingleCommands, commands.executeReferenceSingleCommand, commands.executeRecalculationCommand, _matchingRepository.findMatchingByIds, _format.getCurrentDateTime, _runtime.getCurrentUser, _variables.getAsyncLimit);
  _exports.executeReferenceSingleJob = executeReferenceSingleJob;
  var createReferenceUnmatchingJob = (0, _referenceUnmatching.createReferenceUnmatchingJobConstructor)(_jobRepository.jobRepository, _format.getCurrentDateTime, _runtime.getCurrentUser, {
    matching: _runtime.getMatchingPermission,
    reference: _runtime.getReferencePermission
  });
  _exports.createReferenceUnmatchingJob = createReferenceUnmatchingJob;
  var executeReferenceUnmatchingJob = (0, _executeJob.executeJobConstructor)(_jobRepository.jobRepository, _scheduler.scheduler, commands.getReferenceUnmatchingCommands, commands.executeReferenceUnmatchingCommand, commands.executeRecalculationCommand, _matchingRepository.findMatchingByIds, _format.getCurrentDateTime, _runtime.getCurrentUser, _variables.getAsyncLimit);
  _exports.executeReferenceUnmatchingJob = executeReferenceUnmatchingJob;
});