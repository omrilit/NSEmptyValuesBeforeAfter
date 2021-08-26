/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author mjaurigue
 */

var dunning = dunning || {};
dunning.component = dunning.component || {};
dunning.component.cs = dunning.component.cs || {};

dunning.component.cs.DunningBulkUpdateCS = function DunningBulkUpdateCS () {
  var messageHandler;
  var messages;

  var SUBSIDIARY_FIELD = 'custpage_3805_dunning_bulk_update_sub';

  var TRANS_NO_SELECTION = 'dbu.validation.no_selection';
  var TRANS_NO_SENDING_MEDIA = 'dbu.validation.no_sending_media';
  var TRANS_SUBMISSION_VERIFICATION_OW = 'dbu.validation.verify_submit_ow';
  var TRANS_SUBMISSION_VERIFICATION_SI = 'dbu.validation.verify_submit_si';
  var TRANS_CONCURRENCY_VALIDATION_OW = 'dbu.validation.validate_concurrency_ow';
  var TRANS_CONCURRENCY_VALIDATION_SI = 'dbu.validation.validate_concurrency_si';

  var MSG_NO_SELECTION = 'There are no fields to be updated because - Unchanged - is selected for all the fields. A bulk update can be performed if a change in at least one field is specified (Checked or Not checked).';
  var MSG_NO_SENDING_MEDIA = 'Customer records cannot be saved if both the Allow Letters to be Emailed box and the Allow Letters to be Printed box are not checked. Select Checked in one or both of the following fields:\n- Allow Letters to be Emailed\n- Allow Letters to be Printed';
  var MSG_SUBMISSION_VERIFICATION_OW = 'All customer records with dunning procedures will be updated for the selected subsidiary {SUBSIDIARY}. You will receive an email message when the process is completed. Do you want to proceed with the bulk update?';
  var MSG_SUBMISSION_VERIFICATION_SI = 'All customer records with dunning procedures will be updated. You will receive an email message when the process is completed. Do you want to proceed with the bulk update?';
  var MSG_CONCURRENCY_VALIDATION_OW = 'A bulk update of customer records for dunning was initiated by {USER} for the subsidiary, {SUBSIDIARY}. The bulk update must be completed before you can perform another bulk update of customers for the same subsidiary.';
  var MSG_CONCURRENCY_VALIDATION_SI = 'The system can run only one bulk update at a time. A bulk update initiated by {USER} is currently running.';

  var context = ns_wrapper.context();
  var FieldAPI = ns_wrapper.api.field;

  function loadMessageObjects () {
    if (!messages) {
      var stringCodes = [TRANS_NO_SELECTION, TRANS_NO_SENDING_MEDIA,
        TRANS_SUBMISSION_VERIFICATION_OW,
        TRANS_SUBMISSION_VERIFICATION_SI,
        TRANS_CONCURRENCY_VALIDATION_OW,
        TRANS_CONCURRENCY_VALIDATION_SI];

      var messageLoaderContextCreator = new suite_l10n.app.MessageLoaderContextCreator();
      var messageLoaderContext = messageLoaderContextCreator
        .getLoaderContext(stringCodes);
      var messageLoader = new suite_l10n.app.MessageLoader(
        messageLoaderContext);
      messages = messageLoader.getMessageMap();

      messages[TRANS_NO_SELECTION] = messages[TRANS_NO_SELECTION] || MSG_NO_SELECTION;
      messages[TRANS_NO_SENDING_MEDIA] = messages[TRANS_NO_SENDING_MEDIA] || MSG_NO_SENDING_MEDIA;
      messages[TRANS_SUBMISSION_VERIFICATION_OW] = messages[TRANS_SUBMISSION_VERIFICATION_OW] || MSG_SUBMISSION_VERIFICATION_OW;
      messages[TRANS_SUBMISSION_VERIFICATION_SI] = messages[TRANS_SUBMISSION_VERIFICATION_SI] || MSG_SUBMISSION_VERIFICATION_SI;
      messages[TRANS_CONCURRENCY_VALIDATION_OW] = messages[TRANS_CONCURRENCY_VALIDATION_OW] || MSG_CONCURRENCY_VALIDATION_OW;
      messages[TRANS_CONCURRENCY_VALIDATION_SI] = messages[TRANS_CONCURRENCY_VALIDATION_SI] || MSG_CONCURRENCY_VALIDATION_SI;
    }
  }

  function loadMessageHandler () {
    if (!messageHandler) {
      messageHandler = new suite_l10n.message.MessageHandler();
    }
    return messageHandler;
  }

  this.update = function update () {
    var subsidiaryText = FieldAPI.getFieldText(SUBSIDIARY_FIELD);

    loadMessageObjects();
    loadMessageHandler();

    var pageValidator = new dunning.app.DunningBulkUpdatePageValidator(messages);
    var result = pageValidator.validate();
    var valid = result.success;

    if (!valid) {
      messageHandler.showMessage(result.message);
    } else {
      var msg = '';
      if (context.isOW()) {
        msg = messages[TRANS_SUBMISSION_VERIFICATION_OW];
      } else {
        msg = messages[TRANS_SUBMISSION_VERIFICATION_SI];
      }

      var stringFormatter = new suite_l10n.string.StringFormatter(msg);
      var parameters = {
        SUBSIDIARY: subsidiaryText
      };
      stringFormatter.replaceParameters(parameters);
      msg = stringFormatter.toString();

      valid = messageHandler.showConfirmationMessage(msg);
    }
    return valid;
  };
};

dunning.dunningBulkUpdateCS = new dunning.component.cs.DunningBulkUpdateCS();
