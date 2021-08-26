/**
 * @copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "./Format", "./Runtime", "./Session"], function (_exports, _Format, _Runtime, _Session) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "Format", {
    enumerable: true,
    get: function get() {
      return _Format.Format;
    }
  });
  Object.defineProperty(_exports, "Runtime", {
    enumerable: true,
    get: function get() {
      return _Runtime.Runtime;
    }
  });
  Object.defineProperty(_exports, "Session", {
    enumerable: true,
    get: function get() {
      return _Session.Session;
    }
  });
});