/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.component = dunning.component || {};
dunning.component.su = dunning.component.su || {};

dunning.component.su.BulkAssignmentSuitelet = function BulkAssignmentSuitelet () {
  var Request = ns_wrapper.Request;
  var Response = ns_wrapper.Response;

  function showForm (request, response) {

  }

  function redirectPage (request, response) {

  }

  function bulkAssignDunningProcedure (request, response) {

  }

  function runSuitelet (request, response) {
    var wrRequest = new Request(request);
    var wrResponse = new Response(response);

    switch (wrRequest.getMethod()) {
      case 'POST':
        bulkAssignDunningProcedure(wrRequest);
        redirectPage();
        break;
      case 'GET':
      default:
        showForm(wrRequest, wrResponse);
    }
  }

  return {
    runSuitelet: runSuitelet
  };
};

/**
 * @param {nlobjRequest} request
 * @param {nlobjResponse} response
 */
function runSuitelet (request, response) { // eslint-disable-line no-unused-vars
  var suitelet = new dunning.component.su.BulkAssignmentSuitelet();
  suitelet.runSuitelet(request, response);
}
