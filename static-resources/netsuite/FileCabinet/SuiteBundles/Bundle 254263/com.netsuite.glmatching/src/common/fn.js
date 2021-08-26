/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../vendor/tslib", "../../lib/errors", "../../vendor/lodash-4.17.4", "./expectations"], function (_exports, _tslib, _errors, _lodash, _expectations) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.intersperse = intersperse;
  _exports.and = and;
  _exports.or = or;
  _exports.splitMultiSelectValue = splitMultiSelectValue;
  _exports.joinMultiSelectValue = joinMultiSelectValue;
  _exports.isSuiteScriptError = isSuiteScriptError;
  _exports.stringOrDefault = stringOrDefault;
  _exports.isSetoid = isSetoid;
  _exports.eq = eq;
  _exports.isInternalId = isInternalId;
  _exports.parseDate = parseDate;
  _exports.parseDateOrUndefined = parseDateOrUndefined;
  _exports.getScriptParameter = getScriptParameter;
  _exports.change = change;
  _exports.compactObject = compactObject;
  _exports.isInternalEntity = isInternalEntity;
  _exports.silentParse = silentParse;
  _exports.MultiSelectValueSeparator = void 0;

  function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

  var MultiSelectValueSeparator = "\x05";
  _exports.MultiSelectValueSeparator = MultiSelectValueSeparator;

  function intersperse(list, separator) {
    return list.reduce(function (a, x, i) {
      return i > 0 ? (0, _tslib.__spreadArrays)(a, [separator, x]) : [x];
    }, []);
  }

  function and(xs) {
    return intersperse(xs, "and");
  }

  function or(xs) {
    return intersperse(xs, "or");
  }

  function splitMultiSelectValue(value) {
    return value.split(MultiSelectValueSeparator).filter(function (x) {
      return x !== "";
    });
  }

  function joinMultiSelectValue(values) {
    return values.join(MultiSelectValueSeparator);
  }

  function isSuiteScriptError(e) {
    return (_typeof(e) === "object" && e !== null || typeof e === "function") && e.type === "error.SuiteScriptError";
  }

  function stringOrDefault(value, defaultValue) {
    if (defaultValue === void 0) {
      defaultValue = "";
    }

    if (typeof value === "string") {
      return value || defaultValue;
    }

    if (typeof value === "number" && !isNaN(value)) {
      return String(value);
    }

    return defaultValue;
  }

  function isSetoid(value) {
    return value !== null && _typeof(value) === "object" && typeof value.equals === "function";
  }

  function eq(a, b) {
    return (0, _lodash.isEqualWith)(a, b, function (x, y) {
      if (isSetoid(x) && isSetoid(y)) {
        return x.equals(y);
      }
    });
  }

  function isInternalId(value) {
    return typeof value === "string" && value !== "" || typeof value === "number" && isFinite(value);
  }

  function parseDate(value) {
    var date = Date.parse(value);

    if (isNaN(date)) {
      throw (0, _errors.createTypeError)("Wrong date format");
    }

    return new Date(date);
  }

  function parseDateOrUndefined(value) {
    var date = Date.parse(value);

    if (!isNaN(date)) {
      return new Date(date);
    }
  }

  function getScriptParameter(script, name) {
    return (0, _expectations.expectInternalId)(script.getParameter({
      name: name
    }));
  }

  function change(before, after, fullChange) {
    if (fullChange === void 0) {
      fullChange = false;
    }

    if (before === after && !fullChange) {
      return undefined;
    }

    var output = {};

    if (before != null) {
      output.before = before;
    }

    if (after != null) {
      output.after = after;
    }

    return output;
  }
  /**
   * It removes null or undefined fields from an object
   */


  function compactObject(object) {
    return (0, _lodash.pickBy)(object, function (value) {
      return value != null;
    });
  }

  function isInternalEntity(id) {
    return id === "-4" || id === "-7";
  }

  function silentParse(value) {
    try {
      return JSON.parse(value);
    } catch (e) {// intentionally silenced
    }
  }
});