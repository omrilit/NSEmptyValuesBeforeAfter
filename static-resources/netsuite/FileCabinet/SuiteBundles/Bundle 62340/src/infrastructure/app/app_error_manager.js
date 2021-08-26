/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */
var infra = infra || {};
infra.app = infra.app || {};

infra.app.Errors = {
  JEE001: 'Job class instance is different from what is expected',
  JEE002: 'Job Source instance is not defined',
  JEE003: 'Task Property instance is different from what is expected'
};

/**
 * Manages a error messaging system in job engine.
 *
 * @returns {infra.app.ErrorManager}
 */
infra.app.ErrorManager = function () {
  this.getMessage = function (errorCode) {
    return errorCode + '-' + infra.app.Errors[errorCode];
  };

  this.createError = function (errorCode) {
    return new Error(this.getMessage(errorCode));
  };
};
