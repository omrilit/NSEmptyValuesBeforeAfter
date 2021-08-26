/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author ldimayuga
 *
 * reference to ns_wrapper_api_url.js
 */

var suite_l10n = suite_l10n || {};
suite_l10n.app = suite_l10n.app || {};

suite_l10n.app.MessageLoader = function MessageLoader (messageLoaderContext) {
  var obj = new suite_l10n.app.ParentMessageLoader(messageLoaderContext);

  var TYPE = 'SUITELET';
  var IDENTIFIER = 'customscript_suite_l10n_msg_loader_svc';
  var ID = 'customdeploy_suite_l10n_msg_loader_svc';
  var URLAPI = ns_wrapper.api.url;

  function init () {
    try {
      var url = URLAPI.resolveUrl(TYPE, IDENTIFIER, ID);
      var responseObj = URLAPI.requestUrlCs(
        url,
        messageLoaderContext,
        null,
        null,
        'POST');

      obj.setMessageMap(JSON.parse(responseObj.getBody()));
    } catch (e) {
      nlapiLogExecution('ERROR', 'DUNNING_MESSAGE_LOADER_ERROR', 'An error has occured in the MessageLoader class. Details: ' + JSON.stringify(e));
    }
  }

  init();

  return obj;
};

/**
 * @deprecated
 */
suite_l10n.app.ClientSideMessageLoader = function () {};
