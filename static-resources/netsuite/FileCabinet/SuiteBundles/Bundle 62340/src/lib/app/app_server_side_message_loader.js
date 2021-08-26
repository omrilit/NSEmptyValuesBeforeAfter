/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author mjaurigue
 */

var suite_l10n = suite_l10n || {};
suite_l10n.app = suite_l10n.app || {};

suite_l10n.app.ServerSideMessageLoader = function ServerSideMessageLoader (messageLoaderContext) {
  var obj = new suite_l10n.app.ParentMessageLoader(messageLoaderContext);

  function init () {
    var translator = new ns_wrapper.Translator(messageLoaderContext.locale);
    obj.setMessageMap(translator.getStringMap(messageLoaderContext.stringCodes));
  }

  init();

  return obj;
};
