/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.comp = dunning.comp || {};
dunning.comp.wf = dunning.comp.wf || {};

dunning.comp.wf.DunningProcedureAssignmentWorkflow = function DunningProcedureAssignmentWorkflow (recType, id) {
  var obj = {
    doAction: doAction
  };

  var ConverterFactory = suite_l10n.app.factory.ConverterFactory;
  var Field = ns_wrapper.api.field;
  var getNewRecord = ns_wrapper.api.record.getNewRecord;
  var context = ns_wrapper.context();

  function getRecordView () {
    var record = getNewRecord();
    var converterClass = context.getScriptSetting('custscript_3805_source_convert_class');
    var converter = new ConverterFactory().getConverter(converterClass);
    return converter.castRecordToView(record);
  }

  function getDPAssignmentRequest (view) {
    var request = new dunning.view.DunningAssignmentServiceRequest();
    var assignInput = new dunning.view.DunningAssignInput();

    assignInput.subsidiary = view.subsidiary;
    assignInput.type = recType;
    assignInput.recordId = id;

    if (assignInput.type == dunning.view.INVOICE) {
      assignInput.classification = view.classification;
      assignInput.location = view.location;
      assignInput.department = view.department;
    }
    request.requestDetails = assignInput;

    return request;
  }

  function sendDunningMatchRequest (request) {
    var processor = new autoAssignSvcPL.comp.pl.AutoAssignmentService();
    return processor.processRequest(request.requestDetails);
  }

  function handleResponse (response) {
    // move to external object
    if (response && response.success) {
      var dpView = response.responseDetails;
      var dpField = context.getScriptSetting('custscript_3805_dp_assign_field');
      var dpToEmailField = context.getScriptSetting('custscript_3805_dp_toemail_field');
      var dpManagerField = context.getScriptSetting('custscript_3805_dp_manager_field');
      var dpManagerId = dpView.dunningManager;

      Field.submitField(recType,
        id,
        [dpField, dpToEmailField, dpManagerField],
        [dpView.id, 'T', dpManagerId]);
    }
  }

  function dunningAssigned (view) {
    return view.dunningProcedureId && view.dunningProcedureId.length > 0;
  }

  var CUSTOMER_TYPE = 'customer';
  var AUTO_ASSIGN_CUSTOMER_FIELD = 'autoAssignForCustomers';
  var AUTO_ASSIGN_INVOICE_FIELD = 'autoAssignForInvoices';

  function isAllowAutoAssign (recordView) {
    var configDAO = new dao.DunningConfigurationDAO();
    var configModel = configDAO.retrieveBySubsidiary(recordView.subsidiary);
    var configConverter = new dunning.app.DunningConfigurationConverter();
    var configView = configConverter.castToView(configModel);
    var autoAssignmentSetting = recType === CUSTOMER_TYPE ? AUTO_ASSIGN_CUSTOMER_FIELD : AUTO_ASSIGN_INVOICE_FIELD;

    return configView[autoAssignmentSetting];
  }

  function doAction () {
    var view = getRecordView();

    if (isAllowAutoAssign(view) && !dunningAssigned(view)) {
      var request = getDPAssignmentRequest(view);
      var response = sendDunningMatchRequest(request);
      handleResponse(response);
    }
  }

  return obj;
};

dunning.comp.wf.workflowAction = function workflowAction () {
  var recType = nlapiGetRecordType();
  var recId = nlapiGetRecordId();
  var workflowAction = new dunning.comp.wf.DunningProcedureAssignmentWorkflow(recType, recId);
  workflowAction.doAction();
};
