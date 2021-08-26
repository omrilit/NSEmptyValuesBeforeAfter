/**
 * @copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

define(["exports", "../../dashboard/index", "N/runtime", "../di/findRecordInternalId", "../index"], function (_exports, _index, nRuntime, _findRecordInternalId, _index2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getReferencePermission = _exports.getMatchingPermission = _exports.getCurrentUser = _exports.runtime = void 0;
  nRuntime = _interopRequireWildcard(nRuntime);

  function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

  var runtime = new _index2.Runtime(nRuntime);
  _exports.runtime = runtime;

  var getCurrentUser = function getCurrentUser() {
    return runtime.getCurrentUser();
  };

  _exports.getCurrentUser = getCurrentUser;

  var getMatchingPermission = function getMatchingPermission() {
    return (0, _index.expectCustomPermission)(runtime.getCustomPermission((0, _findRecordInternalId.findRecordInternalId)(_index.PermissionId.D_MATCH_PERMISSION)));
  };

  _exports.getMatchingPermission = getMatchingPermission;

  var getReferencePermission = function getReferencePermission() {
    return (0, _index.expectCustomPermission)(runtime.getCustomPermission((0, _findRecordInternalId.findRecordInternalId)(_index.PermissionId.D_REF_PERMISSION)));
  };

  _exports.getReferencePermission = getReferencePermission;
});