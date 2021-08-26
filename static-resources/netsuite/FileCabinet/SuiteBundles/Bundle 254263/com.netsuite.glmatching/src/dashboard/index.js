/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "./FilterParameters", "./permissions", "./types", "./TransactionResult"], function (_exports, _FilterParameters, _permissions, _types, _TransactionResult) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "FilterParameters", {
    enumerable: true,
    get: function get() {
      return _FilterParameters.FilterParameters;
    }
  });
  Object.defineProperty(_exports, "expectCustomPermission", {
    enumerable: true,
    get: function get() {
      return _permissions.expectCustomPermission;
    }
  });
  Object.defineProperty(_exports, "PermissionId", {
    enumerable: true,
    get: function get() {
      return _types.PermissionId;
    }
  });
  Object.defineProperty(_exports, "DEFAULT_ACCOUNTING_BOOK", {
    enumerable: true,
    get: function get() {
      return _types.DEFAULT_ACCOUNTING_BOOK;
    }
  });
  Object.defineProperty(_exports, "DEFAULT_SUBSIDIARY", {
    enumerable: true,
    get: function get() {
      return _types.DEFAULT_SUBSIDIARY;
    }
  });
  Object.defineProperty(_exports, "TransactionResult", {
    enumerable: true,
    get: function get() {
      return _TransactionResult.TransactionResult;
    }
  });
});