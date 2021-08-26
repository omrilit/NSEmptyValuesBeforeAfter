/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This workflow action performs post processing on the Dunning Evaluation Result.
 *
 * @author mmoya
 */

var dunning = dunning || {};
dunning.component = dunning.component || {};
dunning.component.wf = dunning.component.wf || {};

dunning.component.wf.DunningEvaluationResultPostProcessor = function DunningEvaluationResultPostProcessor () {
  function postProcess (record) {
    // check the source of the dunning procedure
    var dunningSourceType = record.getFieldValue('custrecord_3805_eval_result_source_type');
    var dateObj = new Date();
    var dateStr = nlapiDateToString(dateObj, 'datetimetz');
    var lastDunningFields;
    var lastDunningValues;

    if (dunningSourceType == 'customer') {
      // if customer, update the customer record
      var isCustomer = record.getFieldValue('custrecord_3805_eval_result_for_customer') == 'T';
      lastDunningFields = ['custentity_3805_last_dunning_letter_sent', 'custentity_3805_last_dunning_result'];
      lastDunningValues = [dateStr, record.getId()];

      if (isCustomer) {
        ns_wrapper.api.field.submitField('customer', record.getFieldValue('custrecord_3805_evaluation_result_entity'), lastDunningFields, lastDunningValues);
      } else {
        var dunningProcedure = record.getFieldValue('custrecord_3805_evaluation_result_dp');
        var disableDaysInterval = ns_wrapper.api.field.lookupField('customrecord_3805_dunning_procedure', dunningProcedure, 'custrecord_3805_dp_days_between');

        var customerId = record.getFieldValue('custrecord_3805_evaluation_result_cust');
        var interval = ns_wrapper.api.field.lookupField('customrecord_3805_dunning_procedure', dunningProcedure, 'custrecord_3805_dp_days_between');
        var currentLastLetterSent = ns_wrapper.api.field.lookupField('customer', customerId, 'custentity_3805_last_dunning_letter_sent');

        var dateWrapper = new ns_wrapper.Date();
        var currLastLetterSentDateObj = dateWrapper.toDate(currentLastLetterSent);
        var nextSendDate = new ns_wrapper.Date(currLastLetterSentDateObj).addDays(interval);

        if (disableDaysInterval || (dateObj >= nextSendDate)) {
          ns_wrapper.api.field.submitField('customer', customerId, lastDunningFields, lastDunningValues);
        }
      }
    } else {
      // if invoice, update the invoice record
      var invoiceList = record.getFieldValues('custrecord_3805_eval_result_invoice_list');

      lastDunningFields = ['custbody_3805_last_dunning_letter_sent', 'custbody_3805_last_dunning_result'];
      lastDunningValues = [dateStr, record.getId()];
      ns_wrapper.api.field.submitField('invoice', invoiceList[0], lastDunningFields, lastDunningValues);
    }
  }

  return {
    postProcess: postProcess
  };
};

dunning.component.wf.postProcess = function postProcess () {
  var postProcessor = new dunning.component.wf.DunningEvaluationResultPostProcessor();
  postProcessor.postProcess(nlapiGetNewRecord());
};
