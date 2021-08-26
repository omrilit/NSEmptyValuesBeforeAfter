/**
 * @copyright © 2020, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NScriptType ScheduledScript
 */

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

define(["exports", "../suiteapi/di/runtime", "../translator/di/translate", "../variables/di/variables", "N/email"], function (_exports, _runtime, _translate, _variables, nEmail) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.execute = void 0;
  nEmail = _interopRequireWildcard(nEmail);

  function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

  function handleMultiBook() {
    var isMultiBookEnabled = _runtime.runtime.isMultiBookEnabled();

    var lastKnownMultiBookStatus = (0, _variables.getLastKnownMultiBookStatus)();

    if (lastKnownMultiBookStatus === undefined) {
      throw new Error("lastKnownMultiBookStatus is undefined");
    } else {
      if (isMultiBookEnabled !== lastKnownMultiBookStatus) {
        nEmail.send({
          author: -5,
          body: (0, _translate.translate)("multibook_email_body"),
          recipients: [-5],
          subject: (0, _translate.translate)("multibook_email_subject")
        });
      }
    }
  }

  var execute = function execute() {
    handleMultiBook();
  };

  _exports.execute = execute;
});