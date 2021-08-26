/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var suite_l10n = suite_l10n || {};
suite_l10n.message = suite_l10n.message || {};

suite_l10n.message.MessageHandler = function () {
  this.showMessage = function (message, parameters) {
    var formatter = new suite_l10n.string.StringFormatter(message);
    formatter.replaceParameters(parameters);
    alert(formatter.toString());
  };

  this.showConfirmationMessage = function (message, parameters) {
    var formatter = new suite_l10n.string.StringFormatter(message);
    formatter.replaceParameters(parameters);
    return confirm(formatter.toString());
  };
};
