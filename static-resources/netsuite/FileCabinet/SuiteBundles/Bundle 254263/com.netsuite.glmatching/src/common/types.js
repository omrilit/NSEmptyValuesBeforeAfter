/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../vendor/tslib", "../../lib/errors"], function (_exports, _tslib, _errors) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.NonEmptyArray = NonEmptyArray;

  function NonEmptyArray(xs) {
    if (xs[0] === undefined) {
      throw (0, _errors.createTypeError)("NonEmptyArray must contain at least one item");
    }

    return (0, _tslib.__spreadArrays)([xs[0]], xs.slice(1, xs.length));
  }
});