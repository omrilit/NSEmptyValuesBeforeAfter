/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author fkyao
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningProcedureValidator = function DunningProcedureValidator (params) {
  var messages;

  var MESSAGE_DUNNING_MANAGER_REQUIRED = 'dc.validateDP.managerRequired'; // DC0007
  var MESSAGE_SENDING_MODE = 'dc.validateDP.sendingModeRequired'; // DC0008

  var prefix = params.prefix;
  var useServerSideMsgLoader = params.useServerSideMsgLoader;
  var reloadRecord = params.reloadRecord;
  var procedureField = prefix + '_3805_dunning_procedure';
  var managerField = prefix + '_3805_dunning_manager';
  var emailField = prefix + '_3805_dunning_letters_toemail';
  var printField = prefix + '_3805_dunning_letters_toprint';

  var ValidationResult = suite_l10n.validation.ValidationResult;
  var StringFormatter = suite_l10n.string.StringFormatter;
  var FieldAPI = ns_wrapper.api.field;
  var RecordAPI = ns_wrapper.api.record;
  var reloadedRecord;
  var oldRecord;

  function loadMessageObject () {
    if (!messages) {
      var stringCodes = [MESSAGE_DUNNING_MANAGER_REQUIRED, MESSAGE_SENDING_MODE];

      var messageLoaderContextCreator = new suite_l10n.app.MessageLoaderContextCreator();
      var messageLoaderContext = messageLoaderContextCreator.getLoaderContext(stringCodes);
      var messageLoader;
      if (useServerSideMsgLoader) {
        messageLoader = new suite_l10n.app.ServerSideMessageLoader(messageLoaderContext);
      } else {
        messageLoader = new suite_l10n.app.MessageLoader(messageLoaderContext);
      }

      messages = messageLoader.getMessageMap();
    }
  }

  /**
   * Load the full record if this is a it's allowed by the context
   * This can only be done once
   */
  function loadFullRecord () {
    if (reloadRecord && !reloadedRecord) {
      reloadedRecord = new ns_wrapper.Record(RecordAPI.getRecordType(), RecordAPI.getRecordId());
    }
  }

  function getOldRecord () {
    if (!oldRecord) {
      oldRecord = RecordAPI.getOldRecord();
    }
    return oldRecord;
  }

  function hasChange (field, currValue) {
    var changed = true;

    var oldRecord = getOldRecord() || null;
    if (oldRecord) {
      changed = oldRecord.getFieldValue(field) !== currValue;
    }

    return changed;
  }

  /**
   * Retrieve the value of a field 1st given the current values
   * if the current value is null, there is no change in the field value and reloading the record is allowed, retrieve the historical value of the field.
   */
  function getFieldValue (field) {
    var value = FieldAPI.getFieldValue(field) || null;
    if (useServerSideMsgLoader && value === null && !hasChange(field, value) && reloadRecord) {
      loadFullRecord();
      value = reloadedRecord.getFieldValue(field);
    }
    return value;
  }

  function getCheckBoxValue (field) {
    var value = FieldAPI.getFieldValue(field) || 'F';
    if (useServerSideMsgLoader && value === 'F' && !hasChange(field, value) && reloadRecord) {
      loadFullRecord();
      value = reloadedRecord.getFieldValue(field);
    }
    return value;
  }

  // If a dunning procedure is selected and a dunning manager is not selected
  this.validateDunningManager = function validateDunningManager () {
    var dunningProcedure = getFieldValue(procedureField) || '';
    var dunningManager = getFieldValue(managerField) || '';
    var isValid = true;
    var message;

    if (dunningProcedure != '' && dunningManager == '') {
      loadMessageObject();
      message = new StringFormatter(messages[MESSAGE_DUNNING_MANAGER_REQUIRED]);
      isValid = false;
    }

    return new ValidationResult(isValid, message);
  };

  // At least one of allow letters to email or print should be selected
  this.validateLetterSendingType = function validateLetterSendingType () {
    var dunningProcedure = getFieldValue(procedureField) || '';
    var dunningThroughEmail = getCheckBoxValue(emailField) === 'T';
    var dunningThroughPrint = getCheckBoxValue(printField) === 'T';
    var isValid = true;
    var message;

    if (dunningProcedure != '' && (!dunningThroughEmail && !dunningThroughPrint)) {
      loadMessageObject();
      message = new StringFormatter(messages[MESSAGE_SENDING_MODE]);
      message.convertCRLFToLF();
      isValid = false;
    }

    return new ValidationResult(isValid, message);
  };
};
