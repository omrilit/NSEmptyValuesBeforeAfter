/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "./InconsistencyReporter", "./MatchingRepository", "./TranLineRepository"], function (_exports, _InconsistencyReporter, _MatchingRepository, _TranLineRepository) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "InconsistencyReporter", {
    enumerable: true,
    get: function get() {
      return _InconsistencyReporter.InconsistencyReporter;
    }
  });
  Object.defineProperty(_exports, "MatchingRepository", {
    enumerable: true,
    get: function get() {
      return _MatchingRepository.MatchingRepository;
    }
  });
  Object.defineProperty(_exports, "TranLineRepository", {
    enumerable: true,
    get: function get() {
      return _TranLineRepository.TranLineRepository;
    }
  });
});