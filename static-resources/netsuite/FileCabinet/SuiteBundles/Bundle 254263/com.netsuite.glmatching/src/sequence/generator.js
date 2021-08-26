/**
 * @copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.generateNextCode = generateNextCode;

  function generateNextCode(prevCode) {
    var code = prevCode.toLowerCase().split("");

    for (var i = code.length; i--;) {
      if (code[i] >= "a" && code[i] < "z") {
        code[i] = String.fromCharCode(code[i].charCodeAt(0) + 1);
        return code.join("");
      } else if (code[i] === "z") {
        code[i] = "a";
      }
    }

    return "a" + code.join("");
  }
});