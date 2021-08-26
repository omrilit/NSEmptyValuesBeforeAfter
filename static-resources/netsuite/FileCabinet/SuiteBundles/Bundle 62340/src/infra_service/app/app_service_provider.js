/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var suite_l10n = suite_l10n || {};
suite_l10n.app = suite_l10n.app || {};

suite_l10n.app.ServiceProvider = function ServiceProvider (requestString) {
  function getProcessorClass () {
    return SuiteL10NService;
  }

  function parseRequest () {
    var parser = new suite_l10n.parser.JSONParser();
    return parser.parse(requestString);
  }

  function getResultAsString (result) {
    var formatter = new suite_l10n.string.StringFormatter();
    formatter.stringify(result);
    return formatter.toString();
  }

  function processRequest () {
    var parseResult = parseRequest();
    var result = null;
    if (parseResult.success) {
      var request = parseResult.getResult();
      var processorClass = this.getProcessorClass();
      var processor = new processorClass(request.pluginId);
      result = processor.processRequest(request.requestDetails);
    } else {
      result = new suite_l10n.service.view.ServiceResponse();
      result.responseDetails = parseResult.message;
    }
    return getResultAsString(result);
  }

  return {
    processRequest: processRequest,
    getProcessorClass: getProcessorClass
  };
};
