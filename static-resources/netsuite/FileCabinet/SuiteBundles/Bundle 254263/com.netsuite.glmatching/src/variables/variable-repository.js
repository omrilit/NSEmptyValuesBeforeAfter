/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../common/expectations", "../common/fn", "../../lib/errors"], function (_exports, _expectations, _fn, _errors) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.fetchAllVariablesConstructor = fetchAllVariablesConstructor;
  _exports.findAllVariablesConstructor = findAllVariablesConstructor;
  _exports.getAsyncLimitConstructor = getAsyncLimitConstructor;
  _exports.getLastKnownMultiBookStatusConstructor = getLastKnownMultiBookStatusConstructor;
  _exports.getInProgressLimitConstructor = getInProgressLimitConstructor;
  _exports.VariableSchema = void 0;
  var VariableSchema = {
    fields: {
      name: "name",
      value: "custrecord_glm_var_value"
    },
    type: "customrecord_glm_variable"
  };
  _exports.VariableSchema = VariableSchema;

  function fetchAllVariablesConstructor(runQuery) {
    return function () {
      return runQuery("\n            SELECT id\n                 , " + VariableSchema.fields.name + "\n                 , " + VariableSchema.fields.value + "\n            FROM " + VariableSchema.type + "\n        ").map(function (row) {
        return {
          id: (0, _expectations.expectInternalId)(row[0]),
          name: (0, _expectations.expectString)(row[1]),
          value: (0, _fn.stringOrDefault)(row[2])
        };
      });
    };
  }

  function findAllVariablesConstructor(getCache, fetchAllVariables) {
    return function () {
      var value = getCache().get({
        key: "fetchAllVariables",
        loader: function loader() {
          return JSON.stringify(fetchAllVariables());
        }
      });
      return JSON.parse(value);
    };
  }

  function getAsyncLimitConstructor(findAllVariables) {
    return function () {
      for (var _i = 0, _a = findAllVariables(); _i < _a.length; _i++) {
        var variable = _a[_i];

        if (variable.name === "ASYNC_LIMIT") {
          return (0, _expectations.expectNumber)(parseInt(variable.value, 10));
        }
      }

      throw (0, _errors.createError)("The variable ASYNC_LIMIT not found");
    };
  }

  function getLastKnownMultiBookStatusConstructor(fetchAllVariables) {
    return function () {
      for (var _i = 0, _a = fetchAllVariables(); _i < _a.length; _i++) {
        var variable = _a[_i];

        if (variable.name === "LastMultiBookStatus") {
          switch (variable.value) {
            case "true":
              return true;

            case "false":
              return false;

            default:
              return undefined;
          }
        }
      }

      throw new Error("The variable LastMultiBookStatus not found");
    };
  }

  function getInProgressLimitConstructor(findAllVariables) {
    return function () {
      for (var _i = 0, _a = findAllVariables(); _i < _a.length; _i++) {
        var variable = _a[_i];

        if (variable.name === "IN_PROGRESS_LIMIT") {
          return (0, _expectations.expectNumber)(parseInt(variable.value, 10));
        }
      }

      return 60;
    };
  }
});