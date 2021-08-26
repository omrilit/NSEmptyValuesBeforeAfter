/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.SemiAutoAssignProcedure = function SemiAutoAssignProcedure () {
  var ProcessResult = suite_l10n.process.ProcessResult;

  function getDPAssignmentRequest (recType, id) {
    var request = new dunning.view.DunningAssignmentServiceRequest();
    var assignInput = new dunning.view.DunningAssignInput();
    assignInput.subsidiary = ns_wrapper.api.field.getFieldValue('subsidiary');
    assignInput.type = recType;
    assignInput.recordId = id;
    request.requestDetails = assignInput;
    return request;
  }

  function sendDunningMatchRequest (request) {
    var processor = new dunning.app.SemiAutoAssignRequestProcessor();
    return processor.sendRequest(request);
  }

  function handleResponse (response) {
    var successful = false;
    var dpView;

    if (response && response.success) {
      dpView = response.responseDetails;
      successful = true;
    }

    var result = new ProcessResult(successful);
    result.setData('NEW_DUNNING_PROCEDURE', dpView);

    return result;
  }

  this.assignDunningProcedure = function assignDunningProcedure () {
    var recType = ns_wrapper.api.record.getRecordType();
    var recId = ns_wrapper.api.record.getRecordId();
    var request = getDPAssignmentRequest(recType, recId);
    var response = sendDunningMatchRequest(request);
    return handleResponse(response);
  };
};

dunning.app.SemiAutoAssignRequestProcessor = function SemiAutoAssignRequestProcessor () {
  var urlApi = ns_wrapper.api.url;
  var processor = new suite_l10n.app.BaseServiceRequest();

  processor.getServiceURL = function getServiceURLCustom () {
    return urlApi
      .resolveUrl('SUITELET', 'customscript_3805_su_dp_retrieval', 'customdeploy_3805_su_dp_retrieval', false);
  };

  processor.buildPostData = function buildPostDataCustom (request) {
    return {
      'custparam_3805_retrieve_dp_data': processor.getRequestString(request)
    };
  };

  return processor;
};
