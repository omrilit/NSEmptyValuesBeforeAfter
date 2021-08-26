/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "./variable-repository"], function (_exports, _variableRepository) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "VariableSchema", {
    enumerable: true,
    get: function get() {
      return _variableRepository.VariableSchema;
    }
  });
});