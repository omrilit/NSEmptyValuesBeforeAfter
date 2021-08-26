/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NScriptType MapReduceScript
 */

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

define(["exports", "../dashboard/di/accountRepository", "../dashboard/di/transactionSearch", "../matching/CSVReferenceResolver", "../matching/di/jobs", "../matching/di/tranLineSearch", "../scheduler/di/scheduler", "N/log", "N/record"], function (_exports, _accountRepository, _transactionSearch, _CSVReferenceResolver, _jobs, _tranLineSearch, _scheduler, nLog, nRecord) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.summarize = _exports.reduce = _exports.map = _exports.getInputData = void 0;
  nLog = _interopRequireWildcard(nLog);
  nRecord = _interopRequireWildcard(nRecord);

  function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

  var getInputData = (0, _CSVReferenceResolver.getInputCSVDataConstructor)(_tranLineSearch.tranLineSearch, nLog.error, _accountRepository.accountRepository);
  _exports.getInputData = getInputData;
  var map = (0, _CSVReferenceResolver.mapCSVConstructor)(nLog.error);
  _exports.map = map;
  var reduce = (0, _CSVReferenceResolver.reduceCSVConstructor)(_jobs.createReferenceSingleJob, nRecord, _transactionSearch.transactionSearch, nLog.error);
  _exports.reduce = reduce;
  var summarize = (0, _CSVReferenceResolver.summarizeCSVConstructor)(nLog.error, _scheduler.scheduler);
  _exports.summarize = summarize;
});