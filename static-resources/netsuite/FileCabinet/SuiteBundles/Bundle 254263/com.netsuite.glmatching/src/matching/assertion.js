/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../lib/errors", "../../vendor/lodash-4.17.4"], function (_exports, _errors, _lodash) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.assertThatEntriesAreNotInProgressConstructor = assertThatEntriesAreNotInProgressConstructor;
  _exports.GLM_ERROR_ASYNC = void 0;

  var comparator = function comparator(a, b) {
    return a.id === b.id && a.line === b.line;
  };

  var GLM_ERROR_ASYNC = "GLM_ERROR_ASYNC";
  _exports.GLM_ERROR_ASYNC = GLM_ERROR_ASYNC;

  function assertThatEntriesAreNotInProgressConstructor(findEntriesInProgress) {
    return function (input) {
      var matches = (0, _lodash.intersectionWith)(findEntriesInProgress(), input.entries, comparator);

      if (matches.length > 0) {
        throw (0, _errors.createError)(GLM_ERROR_ASYNC);
      }

      return input;
    };
  }
});