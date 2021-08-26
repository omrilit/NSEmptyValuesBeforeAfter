/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NScriptType MapReduceScript
 */

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

define(["exports", "../common/fn", "../matching/di/commands", "../matching/di/matchingRepository", "../matching/expectations", "../matching/jobs/referenceUnmatching", "../matching/mapReduce", "../scheduler/di/jobRepository", "../scheduler/di/scheduler", "../suiteapi/di/format", "../suiteapi/di/runtime", "N/log", "N/runtime"], function (_exports, _fn, _commands, _matchingRepository, _expectations, _referenceUnmatching, _mapReduce, _jobRepository, _scheduler, _format, _runtime, nLog, nRuntime) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.summarize = _exports.reduce = _exports.map = _exports.getInputData = void 0;
  nLog = _interopRequireWildcard(nLog);
  nRuntime = _interopRequireWildcard(nRuntime);

  function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

  var getJobId = function getJobId() {
    return (0, _fn.getScriptParameter)(nRuntime.getCurrentScript(), "custscript_glm_mr_refu_job");
  };

  var getInputData = (0, _mapReduce.getInputDataConstructor)(getJobId, _commands.getReferenceUnmatchingCommands, _jobRepository.jobRepository, nLog.error, _referenceUnmatching.mapReferenceUnmatchingJob);
  _exports.getInputData = getInputData;
  var map = (0, _mapReduce.mapConstructor)(_commands.executeReferenceUnmatchingCommand, _expectations.expectReferenceUnmatchingCommand, nLog.error);
  _exports.map = map;
  var reduce = (0, _mapReduce.reduceConstructor)(_commands.executeRecalculationCommand, _matchingRepository.findMatchingByIds, _format.getCurrentDateTime, _runtime.getCurrentUser, nLog.error);
  _exports.reduce = reduce;
  var summarize = (0, _mapReduce.summarizeConstructor)(getJobId, _jobRepository.jobRepository, nLog.error, _scheduler.scheduler);
  _exports.summarize = summarize;
});