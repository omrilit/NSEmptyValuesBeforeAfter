/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.DEFAULT_ACCOUNTING_BOOK = _exports.DEFAULT_SUBSIDIARY = _exports.DEFAULT_PAGE_SIZE = _exports.PermissionId = void 0;
  var PermissionId;
  _exports.PermissionId = PermissionId;

  (function (PermissionId) {
    PermissionId["D_MATCH_PERMISSION"] = "customrecord_glm_dp_matching";
    PermissionId["D_REF_PERMISSION"] = "customrecord_glm_dp_reference";
  })(PermissionId || (_exports.PermissionId = PermissionId = {}));

  var DEFAULT_PAGE_SIZE = 10;
  _exports.DEFAULT_PAGE_SIZE = DEFAULT_PAGE_SIZE;
  var DEFAULT_SUBSIDIARY = "1";
  _exports.DEFAULT_SUBSIDIARY = DEFAULT_SUBSIDIARY;
  var DEFAULT_ACCOUNTING_BOOK = "1";
  _exports.DEFAULT_ACCOUNTING_BOOK = DEFAULT_ACCOUNTING_BOOK;
});