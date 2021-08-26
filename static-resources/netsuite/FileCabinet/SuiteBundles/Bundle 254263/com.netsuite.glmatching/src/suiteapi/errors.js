/**
 * @copyright © 2020, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 *
 * @description There is an problem with running unit-tests locally, because we do not have access to working
 * SuiteScript APIs. It would be too complicated to inject N/error-module and all its derived functions to all places.
 * So we put this fake, that is run only on dev-environmend. All its imports are resolved into dist/.../lib/errors.js
 * during compilation for production environment.
 */
define(["exports", "../../vendor/tslib"], function (_exports, _tslib) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.createError = createError;
  _exports.createTypeError = createTypeError;
  _exports.createPermissionError = createPermissionError;

  var FakeSuiteScriptError =
  /** @class */
  function (_super) {
    (0, _tslib.__extends)(FakeSuiteScriptError, _super);

    function FakeSuiteScriptError(message, name) {
      var _newTarget = this.constructor;

      var _this = _super.call(this, message) || this;

      _this.message = message;
      _this.name = name;
      _this.id = "It is a fake";
      _this.type = "error.SuiteScriptError";
      Object.setPrototypeOf(_this, _newTarget.prototype); // restore prototype chain

      _this.cause = {
        message: message,
        name: name
      };
      return _this;
    }

    return FakeSuiteScriptError;
  }(Error);

  function createError(message, name) {
    if (name === void 0) {
      name = "GLM_ERROR";
    }

    return new FakeSuiteScriptError(message, name);
  }

  function createTypeError(message) {
    return createError(message, "GLM_TYPE_ERROR");
  }

  function createPermissionError() {
    return createError("You do not have a permission", "GLM_ERROR_PERMISSION");
  }
});