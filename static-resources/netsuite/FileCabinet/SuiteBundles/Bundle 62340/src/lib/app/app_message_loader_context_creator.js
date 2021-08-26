/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author ldimayuga
 */

var suite_l10n = suite_l10n || {};
suite_l10n.app = suite_l10n.app || {};

suite_l10n.app.MessageLoaderContextCreator = function () {
  this.getLoaderContext = function (stringCodes) {
    var messageLoaderContext = new suite_l10n.view.MessageLoaderContext();
    messageLoaderContext.locale = ns_wrapper.context().getUserLanguage();
    messageLoaderContext.stringCodes = stringCodes;
    return messageLoaderContext;
  };
};
