/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.component = dunning.component || {};
dunning.component.su = dunning.component.su || {};

dunning.component.su.DunningProcedureRetrievalSU = function DunningProcedureRetrievalSuitelet () {
  var obj = {
    processRequest: processRequest
  };

  var DPRetrievalServiceProvider = dunning.component.su.DPRetrievalServiceProvider;

  function processRequest (requestString) {
    var serviceProvider = new DPRetrievalServiceProvider(requestString);
    return serviceProvider.processRequest();
  }

  return obj;
};

dunning.component.su.DPRetrievalServiceProvider = function DPRetrievalServiceProvider (requestString) {
  var autoAssignPL = autoAssignSvcPL.comp.pl;
  var ServiceProviderClass = suite_l10n.app.ServiceProvider;

  var serviceProvider = new ServiceProviderClass(requestString);
  serviceProvider.getProcessorClass = function getProcessorClass () {
    return autoAssignPL.AutoAssignmentService;
  };

  return serviceProvider;
};

dunning.component.su.retrieveDP = function retrieveDunningProcedure (request, response) {
  var wrRequest = new ns_wrapper.Request(request);
  var wrResponse = new ns_wrapper.Response(response);

  var requestString = wrRequest.getParameter('custparam_3805_retrieve_dp_data');

  var serviceProvider = new dunning.component.su.DunningProcedureRetrievalSU();
  var result = serviceProvider.processRequest(requestString);
  wrResponse.write(result);
  wrResponse.flush();
};
