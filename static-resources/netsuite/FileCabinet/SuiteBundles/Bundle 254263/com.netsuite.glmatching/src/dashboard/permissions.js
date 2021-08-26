/**
 * @copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../lib/errors"], function (_exports, _errors) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.expectCustomPermission = expectCustomPermission;
  _exports.assertAuthorized = assertAuthorized;
  _exports.checkAuthorized = checkAuthorized;

  function expectCustomPermission(value) {
    if (typeof value === "string") {
      value = parseInt(value, 10);
    }

    if (typeof value !== "number") {
      return 0
      /* NONE */
      ;
    }

    switch (value) {
      case 4
      /* FULL */
      :
      case 3
      /* EDIT */
      :
      case 2
      /* CREATE */
      :
      case 1
      /* VIEW */
      :
        return value;

      default:
        return 0
        /* NONE */
        ;
    }
  }

  function assertAuthorized(permission, periodClosed) {
    if (permission !== 4
    /* FULL */
    && periodClosed || permission < 3
    /* EDIT */
    && !periodClosed) {
      throw (0, _errors.createPermissionError)();
    }
  }

  function checkAuthorized(permission, periodClosed) {
    return permission !== 4
    /* FULL */
    && periodClosed || permission === 0
    /* NONE */
    && !periodClosed;
  }
});