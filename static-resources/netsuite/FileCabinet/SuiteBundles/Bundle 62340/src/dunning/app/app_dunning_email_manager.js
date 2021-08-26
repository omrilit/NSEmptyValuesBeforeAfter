/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

/**
 * @constructor
 */
dunning.app.DunningEmailManager = function () {};

/**
 * @param {dunning.view.DunningEvaluationResult} view
 * @returns {suite_l10n.view.EmailDefinition}
 */
dunning.app.DunningEmailManager.prototype.getEmailParameters = function (view) {
  /**
   * @param {dunning.view.DunningEvaluationResult} view
   * @returns {*}
   */
  function retrieveAttachments (view) {
    var controller = new dunning.controller.LetterAttachmentController();
    return controller.retrieveAttachments(view);
  }

  /**
   * @param {dunning.view.DunningEvaluationResult} view
   * @returns {Object}
   */
  function createRecordAttachments (view) {
    return view.sourceType == dunning.view.CUSTOMER
      ? {entity: view.customer}
      : {transaction: view.invoices[0]};
  }

  var definition = new suite_l10n.view.EmailDefinition();
  definition.sender = view.dunningManager;
  definition.recipients = view.entity;
  definition.subject = view.subject;
  definition.body = view.message;
  definition.recordAttachments = createRecordAttachments(view);
  definition.attachments = retrieveAttachments(view);
  return definition;
};

/**
 * @param {suite_l10n.view.EmailDefinition} definition
 * @param {string} id
 * @returns {string}
 */
dunning.app.DunningEmailManager.prototype.sendEmail = function (definition, id) {
  /**
   * @param {boolean} success
   * @returns {string}
   */
  function getStatus (success) {
    var status = new suite_l10n.variable.LocalizationVariableList('dunning_eval_result_status');
    var value = success ? 'sent' : 'failed';
    return status.getIdByValue(value);
  }

  /**
   * @param {boolean} success
   * @param {string} id
   * @returns {string}
   */
  function updateStatus (success, id) {
    ns_wrapper.api.field.submitField(dunning.view.DUNNING_EVAL_RESULT_CUSTOM_RECORD, id,
      dunning.view.DUNNING_EVAL_RESULT_STATUS, getStatus(success));
    return success ? 'T' : 'F';
  }

  var mail = new suite_l10n.communication.Mail(definition);
  var result = mail.send();
  return updateStatus(result && result.success, id);
};
