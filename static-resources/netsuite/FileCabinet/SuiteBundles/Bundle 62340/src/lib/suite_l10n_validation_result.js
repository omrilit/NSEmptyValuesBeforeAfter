/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var suite_l10n = suite_l10n || {};
suite_l10n.validation = suite_l10n.validation || {};

suite_l10n.validation.ValidationResult = function (valid, message) {
  var obj = new suite_l10n.process.ProcessResult(valid, message);

  obj.setValid = function (newValid) {
    obj.success = newValid;
  };

  obj.isValid = function () {
    return obj.success;
  };

  obj.setMessage = function (newMessage) {
    obj.message = newMessage;
  };

  obj.getMessage = function () {
    return obj.message;
  };

  /**
   * @param {Array.<suite_l10n.validation.ValidationResult>} results
   */
  obj.consolidateResults = function (results) {
    var success = (results || []).reduce(function (a, x) { return a && x.success; }, true);
    var message = (results || []).filter(function (x) { return x.message; })
      .map(function (x) { return x.message; })
      .join('\n');

    obj.success = success;
    obj.message = message;
  };

  return obj;
};
