/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */
var autoAssignSvcPL = autoAssignSvcPL || {};
autoAssignSvcPL.comp = autoAssignSvcPL.comp || {};
autoAssignSvcPL.comp.pl = autoAssignSvcPL.comp.pl || {};

autoAssignSvcPL.comp.pl.AutoAssignmentService = function AutoAssignmentService () {
  var AutoAssignProcedure = dunning.app.AutoAssignProcedure;
  var ServiceResponse = suite_l10n.service.view.ServiceResponse;
  var Translator = ns_wrapper.Translator;

  function processRequest (request) {
    var autoAssignInput = request;
    var autoAssign = new AutoAssignProcedure();
    var result = autoAssign.performAutoAssign(autoAssignInput);

    var response = new ServiceResponse();
    response.responseDetails = result;

    // Additional info on response
    response.success = !!(result && result.id);

    if (!response.success) {
      var translator = new Translator('tl_PH');
      response.message = translator.getString('dsa.response.none_found');
    }

    return response;
  }

  return {
    processRequest: processRequest
  };
};

// eslint-disable-next-line no-unused-vars
function processRequest (request) {
  var processor = new autoAssignSvcPL.comp.pl.AutoAssignmentService();
  return processor.processRequest(request);
}
