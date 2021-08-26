/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */
var suite_l10n = suite_l10n || {};
suite_l10n.comp = suite_l10n.comp || {};

suite_l10n.comp.ServiceSuitelet = function ServiceSuitelet () {
  var ServiceProvider = suite_l10n.app.ServiceProvider;

  function getRequestString (request) {
    return request.getParameter('custparam_suite_l10n_request');
  }

  function processRequest (request, response) {
    var requestString = getRequestString(request);
    var serviceProvider = new ServiceProvider(requestString);

    var result = serviceProvider.processRequest();
    response.write(result);

    // Return updated result
    return response;
  }

  return {
    processRequest: processRequest
  };
};

suite_l10n.comp.processRequest = function processRequest (request, response) {
  var wrRequest = new ns_wrapper.Request(request);
  var wrResponse = new ns_wrapper.Response(response);

  var serviceProvider = new suite_l10n.comp.ServiceSuitelet();
  wrResponse = serviceProvider.processRequest(wrRequest, wrResponse);
  wrResponse.flush();
};
