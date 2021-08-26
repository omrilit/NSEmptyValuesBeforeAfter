/**
 * @copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope Public
 */

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

define(["exports", "../account/account_handler", "../common/dom", "N/currentRecord", "N/record"], function (_exports, _account_handler, _dom, _currentRecord, nRecord) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.validateField = void 0;
  nRecord = _interopRequireWildcard(nRecord);

  function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

  var validateField = function validateField(context) {
    if (context && context.fieldId === "accttype"
    /* ACCOUNT_TYPE */
    ) {
        try {
          (0, _account_handler.resolveCSEnableDisableGLM)((0, _currentRecord.get)(), nRecord);
        } catch (e) {// intentionally swallowed
        }
      }

    return true;
  };

  _exports.validateField = validateField;

  try {
    /**
     * Because client script can not be add to account record we must add user event script
     * for connecting this script to form. This not add entry point to event so we do this in jQuery file and here add
     * object for external running functions on entry points.
     */
    publicClientScript = {
      getCurrentRecord: _currentRecord.get,
      validateField: validateField
    };
  } catch (e) {// swallow a ReferenceError on publicClientScript during mocha tests
  }
});