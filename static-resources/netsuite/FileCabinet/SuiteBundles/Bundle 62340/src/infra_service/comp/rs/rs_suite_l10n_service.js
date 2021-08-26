/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var suite_l10n = suite_l10n || {};
suite_l10n.comp = suite_l10n.comp || {};

suite_l10n.comp.processRequest = function processRequest (requestString) {
  var serviceProvider = new suite_l10n.app.ServiceProvider(requestString);
  return serviceProvider.processRequest();
};
