/**
 * @copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../common/MatchingStatus", "../../suiteapi/di/cache", "../../suiteapi/di/runQuery", "../../../lib/errors", "../variable-repository"], function (_exports, _MatchingStatus, _cache, _runQuery, _errors, _variableRepository) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getInProgressLimit = _exports.getLastKnownMultiBookStatus = _exports.matchingStatusMap = _exports.getAsyncLimit = void 0;
  var fetchAllVariables = (0, _variableRepository.fetchAllVariablesConstructor)(_runQuery.runQuery);
  var findAllVariables = (0, _variableRepository.findAllVariablesConstructor)(_cache.getCache, fetchAllVariables);
  var getAsyncLimit = (0, _variableRepository.getAsyncLimitConstructor)(findAllVariables);
  _exports.getAsyncLimit = getAsyncLimit;
  var matchingStatusMap = new _MatchingStatus.MatchingStatusMap(_errors.createError, findAllVariables);
  _exports.matchingStatusMap = matchingStatusMap;
  var getLastKnownMultiBookStatus = (0, _variableRepository.getLastKnownMultiBookStatusConstructor)(fetchAllVariables);
  _exports.getLastKnownMultiBookStatus = getLastKnownMultiBookStatus;
  var getInProgressLimit = (0, _variableRepository.getInProgressLimitConstructor)(fetchAllVariables);
  _exports.getInProgressLimit = getInProgressLimit;
});