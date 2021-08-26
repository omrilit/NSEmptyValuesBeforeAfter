/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../lib/errors", "../../vendor/lodash-4.17.4", "./fn", "./types"], function (_exports, _errors, _lodash, _fn, _types) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.expectString = expectString;
  _exports.expectBoolean = expectBoolean;
  _exports.expectNumber = expectNumber;
  _exports.expectDate = expectDate;
  _exports.expectInternalId = expectInternalId;
  _exports.expectPlainObject = expectPlainObject;
  _exports.expectArrayOf = expectArrayOf;
  _exports.expectNonEmptyArrayOf = expectNonEmptyArrayOf;
  _exports.expectChangeOf = expectChangeOf;
  _exports.expectOptionalOf = expectOptionalOf;
  _exports.expectOptionalInternalId = expectOptionalInternalId;
  _exports.expectOptionalDate = expectOptionalDate;
  _exports.expectOptionalString = expectOptionalString;

  function expectString(value) {
    if (typeof value === "string") {
      return value;
    }

    throw (0, _errors.createTypeError)("Expected a string");
  }

  function expectBoolean(value) {
    if (typeof value === "boolean") {
      return value;
    }

    throw (0, _errors.createTypeError)("Expected a boolean");
  }

  function expectNumber(value) {
    if (typeof value === "number" && isFinite(value)) {
      return value;
    }

    throw (0, _errors.createTypeError)("Expected a number");
  }

  function expectDate(value) {
    if (value instanceof Date) {
      return value;
    }

    if (typeof value === "string") {
      return (0, _fn.parseDate)(value);
    }

    throw (0, _errors.createTypeError)("Expected a Date");
  }

  function expectInternalId(value) {
    if ((0, _fn.isInternalId)(value)) {
      return String(value);
    }

    throw (0, _errors.createTypeError)("Expected InternalId");
  }

  function expectPlainObject(x) {
    if ((0, _lodash.isPlainObject)(x)) {
      return x;
    }

    throw (0, _errors.createTypeError)("Expected a plain object");
  }

  function expectArrayOf(expectation) {
    return function (value) {
      if (Array.isArray(value)) {
        return value.map(expectation);
      }

      throw (0, _errors.createTypeError)("Expected an array");
    };
  }

  function expectNonEmptyArrayOf(expectation) {
    return function (value) {
      return (0, _types.NonEmptyArray)(expectArrayOf(expectation)(value));
    };
  }

  function expectChangeOf(expectation) {
    var optionalExpectation = expectOptionalOf(expectation);
    return function (value) {
      var object = expectPlainObject(value);
      var after = optionalExpectation(object.after);
      var before = optionalExpectation(object.before);
      return (0, _fn.compactObject)({
        after: after,
        before: before
      });
    };
  }

  function expectOptionalOf(expectation) {
    return function (value) {
      return value == null ? undefined : expectation(value);
    };
  }

  function expectOptionalInternalId(value) {
    // The empty string comes from N/record.Record.getValue().
    // For example customrecord_glm_tranline.custrecord_glm_tranline_credit returns
    // sometimes a number, a string or the empty string.
    return value === "" ? undefined : expectOptionalOf(expectInternalId)(value);
  }

  function expectOptionalDate(value) {
    // see expectOptionalInternalId
    return value === "" ? undefined : expectOptionalOf(expectDate)(value);
  }

  function expectOptionalString(value) {
    return expectOptionalOf(expectString)(value);
  }
});