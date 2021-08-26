/**
 * @copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

define(["exports", "../account/account_handler", "../suiteapi/di/runtime", "N/file", "N/record", "N/ui/serverWidget"], function (_exports, _account_handler, _runtime, nFile, nRecord, _serverWidget) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.beforeLoad = void 0;
  nFile = _interopRequireWildcard(nFile);
  nRecord = _interopRequireWildcard(nRecord);

  function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

  var beforeLoad = function beforeLoad(context) {
    if (context && context.newRecord.type === nRecord.Type.ACCOUNT) {
      try {
        (0, _account_handler.resolveEUEnableDisableGLM)(context, _serverWidget.FieldDisplayType.DISABLED, nRecord);
        (0, _account_handler.addScriptFied)(context, _runtime.runtime, nFile, _serverWidget.FieldType.INLINEHTML);
      } catch (e) {// intentionally swallowed
      }
    }
  };

  _exports.beforeLoad = beforeLoad;
});