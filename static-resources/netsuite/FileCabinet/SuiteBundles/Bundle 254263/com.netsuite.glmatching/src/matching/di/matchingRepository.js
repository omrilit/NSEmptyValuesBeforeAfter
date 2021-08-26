/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

define(["exports", "../../dashboard/di/navigation", "../../sequence/di/sequenceService", "../../suiteapi/di/runQuery", "../../variables/di/variables", "N/record", "../MatchingRepository"], function (_exports, _navigation, _sequenceService, _runQuery, _variables, nRecord, _MatchingRepository) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.matchingRepository = _exports.findMatchingByIds = void 0;
  nRecord = _interopRequireWildcard(nRecord);

  function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

  var findMatchingByIds = (0, _MatchingRepository.findMatchingByIdsConstructor)(_runQuery.runQuery);
  _exports.findMatchingByIds = findMatchingByIds;
  var matchingRepository = new _MatchingRepository.MatchingRepository(_sequenceService.sequenceService, nRecord, _variables.matchingStatusMap, _navigation.resolveDashboard);
  _exports.matchingRepository = matchingRepository;
});