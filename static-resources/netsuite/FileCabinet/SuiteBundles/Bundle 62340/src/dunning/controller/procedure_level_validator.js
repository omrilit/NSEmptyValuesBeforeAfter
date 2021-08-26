/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */
// Imports
var ValidationResult = suite_l10n.validation.ValidationResult;
var StringFormatter = suite_l10n.string.StringFormatter;

var dunning = dunning || {};
dunning.controller = dunning.controller || {};

dunning.controller.ProcedureLevelValidator = function ProcedureLevelValidator () {
  var SUBLIST_ID = 'recmachcustrecord_3805_dl_procedure';
  var DAYS_OVERDUE_FIELD = 'custrecord_3805_dl_days';
  var MIN_OVERDUE_AMOUNT_FIELD = 'custrecord_3805_dl_amount';
  var MIN_DAYS_BETWEEN_FIELD = 'custrecord_3805_dp_days_between';

  var MESSAGE_DL_COUNT_EXCEED = 'dl.validateDL.dlCountExceeded'; // DL0001
  var MESSAGE_DAYSOVERDUE_MUST_BE_LOWER = 'dl.validateDL.lowerDaysOverDue'; // DL0002
  var MESSAGE_DAYSOVERDUE_MUST_BE_HIGHER = 'dl.validateDL.higherDaysOverdue'; // DL0003
  var MESSAGE_DAYSOVERDUE_ALREADY_EXIST = 'dl.validateDL.daysOverdueExist'; // DL0004
  var MESSAGE_CAN_DELETE_LAST_RECORD = 'dl.validateDL.lastRecordDeletion'; // DL0005
  var MESSAGE_DAYS_BET_SENDING_REQUIREMENT = 'dl.validateDL.daysBetSending'; // DL0006
  var MESSAGE_MIN_OUTS_BAL_GE_ZERO = 'dl.validateDL.minOutsBalGEZero'; // DL0007
  var MESSAGE_DAYSOVERDUE_LESS_PREV = 'dl.validateDL.daysOverdueLessPrevious'; // DL0008
  var MESSAGE_DL_REQUIRED = 'dl.validateDL.dlRequired'; // DL0009

  var systemParameters;
  var messages;
  var messageHandler;

  var sublistAPI = ns_wrapper.api.sublist;
  var fieldAPI = ns_wrapper.api.field;

  function loadMessageObjects () {
    if (!messages) {
      var stringCodes = [MESSAGE_DL_COUNT_EXCEED,
        MESSAGE_DAYSOVERDUE_MUST_BE_LOWER,
        MESSAGE_DAYSOVERDUE_MUST_BE_HIGHER,
        MESSAGE_DAYSOVERDUE_ALREADY_EXIST,
        MESSAGE_CAN_DELETE_LAST_RECORD,
        MESSAGE_DAYS_BET_SENDING_REQUIREMENT,
        MESSAGE_MIN_OUTS_BAL_GE_ZERO,
        MESSAGE_DAYSOVERDUE_LESS_PREV,
        MESSAGE_DL_REQUIRED];

      var messageLoaderContextCreator = new suite_l10n.app.MessageLoaderContextCreator();
      var messageLoaderContext = messageLoaderContextCreator.getLoaderContext(stringCodes);
      var messageLoader = new suite_l10n.app.MessageLoader(messageLoaderContext);
      messages = messageLoader.getMessageMap();
    }

    if (!messageHandler) {
      messageHandler = new suite_l10n.message.MessageHandler();
    }
  }

  function loadSystemParameters () {
    if (!systemParameters) {
      systemParameters = new suite_l10n.variable.LocalizationVariableList('syspar_type');
    }
  }

  function validateDunningLeveLCount () {
    var linenum = Number(sublistAPI.getCurrentLineItemIndex(SUBLIST_ID));// Number(nlapiGetCurrentLineItemIndex(SUBLIST_ID));
    var allowLineAdd = true;
    var message;

    loadSystemParameters();
    var maxDunningLevel = Number(systemParameters
      .getValue('MAX_DUNNING_LEVEL'));

    // Inserting a new line increases nlapiGetLineItemCount immediately
    // adding a line (at the end of the list) just increases the line num
    if (linenum > maxDunningLevel ||
      Number(sublistAPI.getLineItemCount(SUBLIST_ID)) > maxDunningLevel) {
      loadMessageObjects();
      message = messages[MESSAGE_DL_COUNT_EXCEED];
      allowLineAdd = false;
    }

    return new ValidationResult(allowLineAdd, message);
  }

  function validateDaysOverdueValue () {
    var linenum = Number(sublistAPI.getCurrentLineItemIndex(SUBLIST_ID));
    var currentAmount = Number(sublistAPI.getCurrentLineItemValue(SUBLIST_ID, DAYS_OVERDUE_FIELD));

    // Set amounts to null if it at the top or the end of the list
    var precedingAmount = linenum > 1 ? Number(sublistAPI.getLineItemValue(SUBLIST_ID, DAYS_OVERDUE_FIELD, linenum - 1)) : null;
    var succeedingAmount = linenum < sublistAPI.getLineItemCount(SUBLIST_ID) ? Number(sublistAPI.getLineItemValue(SUBLIST_ID, DAYS_OVERDUE_FIELD, linenum + 1)) : null;

    // Default preceding/succeeding amount to current amount on comparison
    var isHigherPreceding = (precedingAmount || currentAmount) > currentAmount;
    var isLowerSucceeding = (succeedingAmount || currentAmount) < currentAmount;
    var isDuplicate = precedingAmount === currentAmount ||
      succeedingAmount === currentAmount;

    var messageCode;
    var compareAmount = currentAmount;
    var message;
    var allowLineAdd = false;

    if (isLowerSucceeding) {
      messageCode = MESSAGE_DAYSOVERDUE_MUST_BE_LOWER;
      compareAmount = succeedingAmount;
    } else if (isHigherPreceding) {
      messageCode = MESSAGE_DAYSOVERDUE_MUST_BE_HIGHER;
      compareAmount = precedingAmount;
    } else if (isDuplicate) {
      messageCode = MESSAGE_DAYSOVERDUE_ALREADY_EXIST;
      compareAmount = currentAmount;
    } else {
      allowLineAdd = true;
    }

    if (messageCode) {
      loadMessageObjects();
      message = new StringFormatter(messages[messageCode])
        .replaceParameters({
          'DAYS': compareAmount
        });
    }

    return new ValidationResult(allowLineAdd, message);
  }

  function validateDaysOverdueValues () {
    var count = Number(sublistAPI.getLineItemCount(SUBLIST_ID));
    var prevOverDue = -100;
    var isValid = true;
    var message;

    for (var i = 1; i <= count; i++) {
      var overDue = Number(sublistAPI.getLineItemValue(SUBLIST_ID, DAYS_OVERDUE_FIELD, i));
      if (prevOverDue >= overDue) {
        prevOverDue = Number(sublistAPI.getLineItemValue(SUBLIST_ID, DAYS_OVERDUE_FIELD, i - 1));
        loadMessageObjects();
        message = new StringFormatter(messages[MESSAGE_DAYSOVERDUE_LESS_PREV])
          .replaceParameters({
            'LEVEL': i,
            'LEVEL_OVERDUE': overDue,
            'PREVLEVEL': i - 1,
            'PREVLEVEL_OVERDUE': prevOverDue
          });
        isValid = false;
        break;
      }
      prevOverDue = overDue;
    }
    return new ValidationResult(isValid, message);
  }

  function validateLevelCount () {
    var lineItems = Number(sublistAPI.getLineItemCount(SUBLIST_ID));
    var isValid = true;
    var message;

    if (lineItems == 0) {
      loadMessageObjects();
      message = messages[MESSAGE_DL_REQUIRED]; // find out the latest uniquename
      isValid = false;
    }

    return new ValidationResult(isValid, message);
  }

  function validateDaysOverdueDifferences () {
    var allowLineAdd = true;
    var linenum = Number(sublistAPI.getCurrentLineItemIndex(SUBLIST_ID));
    var currentAmount = Number(sublistAPI.getCurrentLineItemValue(SUBLIST_ID, DAYS_OVERDUE_FIELD));
    var minDaysBetween = Number(fieldAPI.getFieldValue(MIN_DAYS_BETWEEN_FIELD)) || 1;
    var message;

    // Set difference to minDaysBetween if at the top of bottom of the list
    var precedingDifference = linenum > 1 ? (currentAmount - sublistAPI.getLineItemValue(SUBLIST_ID, DAYS_OVERDUE_FIELD, linenum - 1)) : minDaysBetween;
    var succeedingDifference = linenum < sublistAPI.getLineItemCount(SUBLIST_ID) ? (sublistAPI.getLineItemValue(SUBLIST_ID, DAYS_OVERDUE_FIELD, linenum + 1) - currentAmount) : minDaysBetween;

    if (precedingDifference < minDaysBetween ||
      succeedingDifference < minDaysBetween) {
      loadMessageObjects();
      message = new StringFormatter(messages[MESSAGE_DAYS_BET_SENDING_REQUIREMENT])
        .replaceParameters({
          'DAYS': minDaysBetween
        });
      allowLineAdd = false;
    }
    return new ValidationResult(allowLineAdd, message);
  }

  function validateDelete () {
    var allowDelete = true;
    var message;
    var id = Number(sublistAPI.getCurrentLineItemIndex(SUBLIST_ID));
    var isNewLine = sublistAPI.getLineItemValue(SUBLIST_ID, DAYS_OVERDUE_FIELD, id) === '';
    var isLastLine = Number(id === sublistAPI.getLineItemCount(SUBLIST_ID));

    // Allow deletion if a new line is inserted
    if (!isNewLine && !isLastLine) {
      loadMessageObjects();
      message = messages[MESSAGE_CAN_DELETE_LAST_RECORD];
      allowDelete = false;
    }

    return new ValidationResult(allowDelete, message);
  }

  function validateMinOutstandingAmount () {
    var allowEdit = true;
    var minAmount = Number(sublistAPI.getCurrentLineItemValue(SUBLIST_ID, MIN_OVERDUE_AMOUNT_FIELD));
    var message;

    if (minAmount < 0) {
      loadMessageObjects();
      message = messages[MESSAGE_MIN_OUTS_BAL_GE_ZERO];
      allowEdit = false;
    }
    return new ValidationResult(allowEdit, message);
  }

  this.validateDunningLeveLCount = validateDunningLeveLCount;
  this.validateDaysOverdueValue = validateDaysOverdueValue;
  this.validateDaysOverdueValues = validateDaysOverdueValues;
  this.validateDaysOverdueDifferences = validateDaysOverdueDifferences;
  this.validateDelete = validateDelete;
  this.validateMinOutstandingAmount = validateMinOutstandingAmount;
  this.validateLevelCount = validateLevelCount;

  this.getParameters = function () {
    return {
      systemParameters: systemParameters,
      messages: messages,
      messageHandler: messageHandler
    };
  };
};
