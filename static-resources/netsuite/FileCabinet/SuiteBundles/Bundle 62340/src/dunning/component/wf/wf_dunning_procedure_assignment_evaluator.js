/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author mjaurigue
 */

var dunning = dunning || {};
dunning.comp = dunning.comp || {};
dunning.comp.wf = dunning.comp.wf || {};

dunning.comp.wf.DunningProcAssignmentEvaluator = function () {
  var REC_CUSTOMER = 'customer';
  var DUNNING_PROCEDURE_FIELD = 'custentity_3805_dunning_procedure';
  var DUNNING_PROCEDURE_REC = 'customrecord_3805_dunning_procedure';
  var DUNNING_PROCEDURE_OVERRIDE = 'custrecord_3805_dp_override';
  var CONVERTER_CLASS = 'custscript_3805_eva_source_convert_class';

  var ConverterFactory = suite_l10n.app.factory.ConverterFactory;
  var context = ns_wrapper.context();

  function getRecordView () {
    var record = nlapiGetNewRecord();
    var converter = new ConverterFactory().getConverter(context.getScriptSetting(CONVERTER_CLASS));
    return converter.castRecordToView(record);
  }

  /* NOTE: This object is specific for evaluating dunning procedure assignment to invoice.
   * In case there is a need for evaluating dunning procedure assignment to customer,
   * you can use a factory and separate the evaluation methods proper to different classes. */
  function validateInvoiceDPAssignment (view) {
    var custDP = ns_wrapper.api.field.lookupField(REC_CUSTOMER, view.customer, DUNNING_PROCEDURE_FIELD);

    if (custDP) {
      return ns_wrapper.api.field.lookupField(DUNNING_PROCEDURE_REC, custDP, DUNNING_PROCEDURE_OVERRIDE);
    }
    return 'F';
  }

  this.evaluate = function evaluate () {
    var view = getRecordView();
    return validateInvoiceDPAssignment(view);
  };
};

dunning.comp.wf.evaluateDPAssignment = function evaluateDPAssignment () {
  var evaluator = new dunning.comp.wf.DunningProcAssignmentEvaluator();
  return evaluator.evaluate();
};
