/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * Client side script for Dunning Procedure
 *
 * @author cboydon
 */

var dunning = dunning || {};
dunning.procedure = dunning.procedure || {};

var MessageHandler = suite_l10n.message.MessageHandler;
var SublistAPI = ns_wrapper.api.sublist;
var FieldAPI = ns_wrapper.api.field;
var currencyConverter;

var messages;
var POSSIBLE_MULTIPLE_SENDING = 'dp.information.possibleMultipleSending';

dunning.procedure.fieldToggler = null;
dunning.procedure.loadFieldToggler = function loadFieldToggler () {
  if (!dunning.procedure.fieldToggler) {
    dunning.procedure.fieldToggler = new dunning.view.DunningProcedureFieldToggler();
  }
  return dunning.procedure.fieldToggler;
};

dunning.procedure._APPLIES_TO = 'custrecord_3805_dp_type';
dunning.procedure._SENDING_SCHED = 'custrecord_3805_dp_sending_type';
dunning.procedure._DISABLE_MIN_DUN_INTERVAL = 'custrecord_3805_dp_allow_multi_sending';

dunning.procedure.level = dunning.procedure.level || {};

dunning.procedure.level.validator = null;
dunning.procedure.level.ID = 'recmachcustrecord_3805_dl_procedure';
dunning.procedure.level.name = 'name';
dunning.procedure.level.MIN_OUTSTANDING_VALUE_FIELD = 'custrecord_3805_dl_amount';
dunning.procedure.level.DAYS_OVERDUE = 'custrecord_3805_dl_days';
dunning.procedure.level.RULE_ID = 'custrecord_3805_dl_rule';
dunning.procedure.level.MIA = 'custrecord_3805_dl_mia';
dunning.procedure.level.DEFAULT_CURRENCY = 'custrecord_3805_dl_default_currency';
dunning.procedure.level.CURRENCIES = 'custrecord_3805_dl_currencies';
dunning.procedure.level.TOB = 'custrecord_3805_dl_tob';

dunning.procedure.loadMessages = function loadMessages () {
  if (!messages) {
    var stringCodes = [POSSIBLE_MULTIPLE_SENDING];

    var messageLoaderContextCreator = new suite_l10n.app.MessageLoaderContextCreator();
    var messageLoaderContext = messageLoaderContextCreator.getLoaderContext(stringCodes);
    var messageLoader = new suite_l10n.app.MessageLoader(messageLoaderContext);
    messages = messageLoader.getMessageMap();
  }
  return messages;
};

dunning.procedure.level.loadValidator = function loadMessageHandler () {
  if (!dunning.procedure.level.validator) {
    dunning.procedure.level.validator = new dunning.controller.ProcedureLevelValidator();
  }
  return dunning.procedure.level.validator;
};

dunning.procedure.getMessageHandler = function loadMessageHandler () {
  if (!dunning.procedure.messageHandler) {
    dunning.procedure.messageHandler = new MessageHandler();
  }
  return dunning.procedure.messageHandler;
};

function populateDLFields (dlrId, lineItemNumber, isPageInit) {
  var dlraSearchHandler = new dunning.app.DunningLevelRuleAmountSearchHandler();
  var dlras = dlraSearchHandler.searchDunningLevelRuleAmount(dlrId);
  var dlraProcessor = new dunning.app.DunningLevelRuleAmountProcessor(dlras);

  SublistAPI.selectLineItem(dunning.procedure.level.ID, lineItemNumber);
  SublistAPI.setCurrentLineItemValue(dunning.procedure.level.ID,
    dunning.procedure.level.MIA,
    dlraProcessor.getMinimalInvoiceAmount());
  SublistAPI.setCurrentLineItemValue(dunning.procedure.level.ID,
    dunning.procedure.level.DEFAULT_CURRENCY,
    currencyConverter.convertIdToSymbol(dlraProcessor.getDefaultCurrency()));
  SublistAPI.setCurrentLineItemValue(dunning.procedure.level.ID,
    dunning.procedure.level.TOB,
    dlraProcessor.getTotalOverdueBalance());
  SublistAPI.setCurrentLineItemValue(dunning.procedure.level.ID,
    dunning.procedure.level.CURRENCIES,
    currencyConverter.convertIdsToSymbol(dlraProcessor.getCurrencies()));

  if (isPageInit) {
    SublistAPI.commitLineItem(dunning.procedure.level.ID);
  }
}

dunning.procedure.pageInit = function pageInit () {
  var toggler = dunning.procedure.loadFieldToggler();
  currencyConverter = new dunning.app.CurrencyConverter();

  toggler.toggleFieldsByAppliesTo(FieldAPI.getFieldValue(dunning.procedure._APPLIES_TO));
  toggler.toggleFieldsBySendingSched(FieldAPI.getFieldValue(dunning.procedure._SENDING_SCHED));
  toggler.toggleFieldsByDisablingMinDunInterval(FieldAPI.getFieldValue(dunning.procedure._DISABLE_MIN_DUN_INTERVAL));

  var lvlCount = Number(SublistAPI.getLineItemCount(dunning.procedure.level.ID));

  if (lvlCount > 0) {
    for (var i = 1; i <= lvlCount; i++) {
      var dlrId = SublistAPI.getLineItemValue(dunning.procedure.level.ID,
        dunning.procedure.level.RULE_ID, i);
      populateDLFields(dlrId, i, true);
    }
  }
};

dunning.procedure.saveRecord = function saveRecord () {
  var validator = dunning.procedure.level.loadValidator();
  var levelResult = validator.validateLevelCount();
  var daysOverdueResult = validator.validateDaysOverdueValues();
  var messageHandler;

  if (!levelResult.isValid()) {
    messageHandler = dunning.procedure.getMessageHandler();
    messageHandler.showMessage(levelResult.getMessage());
    return levelResult.isValid();
  }

  // code will not reach here if there is no Dunning Level
  if (!daysOverdueResult.isValid()) {
    messageHandler = dunning.procedure.getMessageHandler();
    messageHandler.showMessage(daysOverdueResult.getMessage());
  }

  return daysOverdueResult.isValid();
};

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 *
 * @appliedtorecord recordType
 *
 * @param {string} type Sublist internal id
 * @param {string} name Field internal id
 */
dunning.procedure.clientFieldChanged = function clientFieldChanged (type, name) {
  var toggler = dunning.procedure.loadFieldToggler();

  switch (name) {
    case dunning.procedure._APPLIES_TO:
      toggler.toggleFieldsByAppliesTo(FieldAPI.getFieldValue(dunning.procedure._APPLIES_TO));
      break;

    case dunning.procedure._SENDING_SCHED:
      toggler.toggleFieldsBySendingSched(FieldAPI.getFieldValue(dunning.procedure._SENDING_SCHED));
      break;

    case dunning.procedure.level.RULE_ID:
      var dlrId = SublistAPI.getCurrentLineItemValue(dunning.procedure.level.ID,
        dunning.procedure.level.RULE_ID);
      var lineNum = SublistAPI.getCurrentLineItemIndex(dunning.procedure.level.ID);
      populateDLFields(dlrId, lineNum, false);
      break;

    case dunning.procedure._DISABLE_MIN_DUN_INTERVAL:
      onDisablingMinimumDunningInterval();
  }

  function onDisablingMinimumDunningInterval () {
    var messageHandler = dunning.procedure.getMessageHandler();
    var disableMinDunInterval = FieldAPI.getFieldValue(dunning.procedure._DISABLE_MIN_DUN_INTERVAL);
    var confirm = false;

    if (disableMinDunInterval === 'T') {
      messages = dunning.procedure.loadMessages();
      confirm = messageHandler.showConfirmationMessage(messages[POSSIBLE_MULTIPLE_SENDING]);

      if (!confirm) {
        FieldAPI.setFieldValue(dunning.procedure._DISABLE_MIN_DUN_INTERVAL, 'F');
        disableMinDunInterval = 'F';
      }
    }

    toggler.toggleFieldsByDisablingMinDunInterval(disableMinDunInterval);
  }
};

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 *
 * @appliedtorecord recordType
 *
 * @param {string} type Sublist internal id
 * @param {string} name Field internal id
 * @param {number} linenum Optional line item number, starts from 1
 * @returns {boolean} True to continue changing field value, false to abort value change
 */
dunning.procedure.clientValidateField = function clientValidateField (type, name, linenum) {
  if (type == dunning.procedure.level.ID && name == dunning.procedure.level.MIN_OUTSTANDING_VALUE_FIELD) {
    var validator = dunning.procedure.level.loadValidator();
    var result = validator.validateMinOutstandingAmount();

    if (!result.isValid()) {
      dunning.procedure.getMessageHandler().showMessage(result.getMessage());
    }

    return result.isValid();
  }

  return true;
};

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 *
 * @appliedtorecord recordType
 *
 * @param {string} type Sublist internal id
 * @returns {boolean} True to continue line item delete, false to abort delete
 */
dunning.procedure.clientValidateDelete = function (type) {
  if (type === dunning.procedure.level.ID) {
    var validator = dunning.procedure.level.loadValidator();
    var result = validator.validateDelete();

    if (!result.isValid()) {
      dunning.procedure.getMessageHandler().showMessage(result.getMessage());
    }

    return result.isValid();
  }

  return true;
};

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 *
 * @appliedtorecord recordType
 *
 * @param {string} type Sublist internal id
 * @returns {boolean} True to save line item, false to abort save
 */
dunning.procedure.clientValidateLine = function (type) {
  if (type === dunning.procedure.level.ID) {
    var validator = dunning.procedure.level.loadValidator();
    var result = validator.validateDunningLeveLCount();

    if (!result.isValid()) {
      dunning.procedure.getMessageHandler().showMessage(result.getMessage());
      return result.isValid();
    }

    result = validator.validateDaysOverdueValue();
    if (!result.isValid()) {
      dunning.procedure.getMessageHandler().showMessage(result.getMessage());
    }

    return result.isValid();
  }
};
