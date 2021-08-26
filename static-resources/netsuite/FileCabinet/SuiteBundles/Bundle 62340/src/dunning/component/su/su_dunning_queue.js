/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.component = dunning.component || {};
dunning.component.su = dunning.component.su || {};

dunning.component.su.DunningQueue = function DunningQueue () {
  var Request = ns_wrapper.Request;
  var Response = ns_wrapper.Response;

  this.runSuitelet = function (request, response) {
    var wrRequest = new Request(request);
    var wrResponse = new Response(response);

    switch (wrRequest.getMethod()) {
      case 'POST':
        performDunningQueueAction(wrRequest);
        break;
      case 'GET':
      default:
        showForm(wrRequest, wrResponse);
    }
  };

  function showForm (wrRequest, wrResponse) {
    var dqfReqAdapter = new dunning.app.DunningQueueFormRequestAdapter(
      new dunning.app.DunningQueueFormRequestFiltersDefinition());
    var dunningQueueFormView = dqfReqAdapter.extract(wrRequest);

    var dqFormMgr = new dunning.app.DunningQueueFormManager();
    var form = dqFormMgr.generateForm(dunningQueueFormView);
    wrResponse.writeForm(form);
  }

  function performDunningQueueAction (wrRequest) {
    var delegate = new dunning.app.DunningQueueActionDelegate();
    delegate.performDunningQueueAction(wrRequest);
  }
};

function runSuitelet (request, response) { // eslint-disable-line no-unused-vars
  var dunningQueue = new dunning.component.su.DunningQueue();
  dunningQueue.runSuitelet(request, response);
}
