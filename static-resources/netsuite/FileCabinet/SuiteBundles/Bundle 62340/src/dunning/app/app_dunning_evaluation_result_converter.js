/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

/**
 * @constructor
 * @extends {suite_l10n.app.BaseConverter<dunning.model.DunningEvaluationResult, dunning.view.DunningEvaluationResult>}
 */
dunning.app.DunningEvaluationResultConverter = function () {
  var obj = new suite_l10n.app.BaseConverter({
    model: dunning.model.DunningEvaluationResult,
    view: dunning.view.DunningEvaluationResult,
    modelViewMap: {
      id: 'id',
      procedure: 'procedure',
      level: 'level',
      entity: 'entity',
      assignedToCustomer: 'assignedToCustomer',
      invoices: 'invoices',
      recipient: 'recipient',
      recipientEmail: 'recipientEmail',
      subject: 'subject',
      message: 'message',
      dunningManager: 'dunningManager',
      subsidiary: 'subsidiary',
      templateId: 'templateId',
      sourceType: 'sourceType',
      customer: 'customer'
    },
    recordModelMap: {
      internalid: 'id',
      custrecord_3805_evaluation_result_dp: 'procedure',
      custrecord_3805_evaluation_result_level: 'level',
      custrecord_3805_evaluation_result_entity: 'entity',
      custrecord_3805_eval_result_for_customer: 'assignedToCustomer',
      custrecord_3805_eval_result_message: 'message',
      custrecord_3805_eval_result_invoice_list: 'invoices',
      custrecord_3805_eval_result_recipient: 'recipientEmail',
      custrecord_3805_eval_result_subject: 'subject',
      custrecord_3805_eval_result_manager_id: 'dunningManager',
      custrecord_3805_eval_result_template: 'templateId',
      custrecord_3805_eval_result_source_type: 'sourceType',
      custrecord_3805_evaluation_result_cust: 'customer'
    }
  });

  /**
   * @param {nlobjRecord|ns_wrapper.Record} record
   * @returns {dunning.model.DunningEvaluationResult}
   */
  obj.castRecordToModel = function (record) {
    var model = suite_l10n.app.BaseConverter.prototype.castRecordToModel.call(obj, record);
    model.invoices = record.getFieldValues('custrecord_3805_eval_result_invoice_list');
    return model;
  };

  return obj;
};
