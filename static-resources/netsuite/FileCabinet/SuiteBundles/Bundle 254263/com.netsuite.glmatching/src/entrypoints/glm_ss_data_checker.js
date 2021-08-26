/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NScriptType ScheduledScript
 */

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

define(["exports", "../matching/index", "../matching/di/matchingRepository", "../matching/InconsistencyReporter", "../matching/MatchingRepository", "../suiteapi/di/runQuery", "../suiteapi/di/runtime", "../translator/di/translate", "../variables/di/variables", "N/email", "N/log", "N/search"], function (_exports, _index, _matchingRepository, _InconsistencyReporter, _MatchingRepository, _runQuery, _runtime, _translate, _variables, nEmail, _log, nSearch) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.execute = void 0;
  nEmail = _interopRequireWildcard(nEmail);
  nSearch = _interopRequireWildcard(nSearch);

  function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

  var inconsistencyReporter = new _index.InconsistencyReporter(nEmail, (0, _InconsistencyReporter.getEntityLanguageConstructor)(nSearch), _variables.matchingStatusMap, _translate.getTranslator, _runtime.runtime.isMultiBookEnabled(), _runtime.runtime.isOneWorld(), _runQuery.runQuery, _translate.translate);

  function checkStatusInconsistency(findAllMatchingsWithWrongStatus, matchingRepo) {
    var matchings = findAllMatchingsWithWrongStatus();

    if (matchings.length === 0) {
      (0, _log.debug)("Data Checker", "No status inconsistency found");
      return;
    }

    for (var _i = 0, matchings_1 = matchings; _i < matchings_1.length; _i++) {
      var matching = matchings_1[_i];
      (0, _log.debug)("Data Checker", "Status inconsistency found with matching id: " + matching.id);
      matchingRepo.setStatus(matching.id, matching.status === "matched"
      /* MATCHED */
      ? "paired"
      /* PAIRED */
      : "matched"
      /* MATCHED */
      );
    }
  }

  function checkAccountInconsistency(findAllMatchinsWithWrongAccount) {
    var matchingIds = findAllMatchinsWithWrongAccount();

    if (matchingIds.length === 0) {
      (0, _log.debug)("Data Checker", "No cross-account matching inconsistency found");
    } else {
      inconsistencyReporter.sendErrorEmails(matchingIds);
    }
  }

  var execute = function execute() {
    checkStatusInconsistency((0, _MatchingRepository.findAllMatchingsWithWrongStatusConstructor)(_runQuery.runQuery, _runtime.runtime.isMultiBookEnabled()), _matchingRepository.matchingRepository);
    checkAccountInconsistency((0, _MatchingRepository.findAllMatchingsWithWrongAccountConstructor)(_runQuery.runQuery, _runtime.runtime.isOneWorld()));
  };

  _exports.execute = execute;
});