/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.comp = dunning.comp || {};
dunning.comp.cs = dunning.comp.cs || {};

dunning.comp.cs.DunningLevelRuleCS = function DunningLevelRuleCS () {
  var messages;

  var SUBLIST = 'recmachcustrecord_3805_dera_parent';
  var DEFAULT_FIELD = 'custrecord_3805_dera_default';
  var SYSGEN_FIELD = 'custrecord_3805_dera_system_gen';
  var CURRENCY_FIELD = 'custrecord_3805_dera_currency';
  var AMOUNT_FIELD = 'custrecord_3805_dera_amount';
  var TOTAL_OVERDUE_BALANCE = 'custrecord_3805_dera_total_overdue_amt';
  var DAYS_OVERDUE_FIELD = 'custrecord_3805_der_days_overdue';

  var MESSAGE_NO_DLR_AMOUNT = 'dlr.validateDLR.noAmount'; // DLR001
  var MESSAGE_NO_DLR_DEFAULT_AMOUNT = 'dlr.validateDLR.noDefaultAmount'; // DLR002
  var MESSAGE_DUPLICATE_CURRENCY = 'dlr.validateDLR.duplicateCurrency'; // DLR003
  var MESSAGE_INVALID_AMOUNT = 'dlr.validateDLR.invalidAmount'; // DLR004
  var MESSAGE_CHANGE_DEFAULT_CURRENCY = 'dlr.validateDLR.changeDefaultCurrency'; // DLR005
  var MESSAGE_NEGATIVE_DAYS_OVERDUE = 'dlr.validateDLR.negativeDaysOverdue';
  var MESSAGE_DAYS_OVERDUE_CHANGED = 'dlr.validateDLR.daysOverdueChanged';

  var ValidationResult = suite_l10n.validation.ValidationResult;
  var MessageLoader = suite_l10n.app.MessageLoader;
  var MessageLoaderContextCreator = suite_l10n.app.MessageLoaderContextCreator;

  var getLineItemCount = ns_wrapper.api.sublist.getLineItemCount;
  var getLineItemValue = ns_wrapper.api.sublist.getLineItemValue;
  var setLineItemValue = ns_wrapper.api.sublist.setLineItemValue;
  var getCurrentLineItemIndex = ns_wrapper.api.sublist.getCurrentLineItemIndex;
  var getCurrentLineItemValue = ns_wrapper.api.sublist.getCurrentLineItemValue;
  var setCurrentLineItemValue = ns_wrapper.api.sublist.setCurrentLineItemValue;
  var getFieldValue = ns_wrapper.api.field.getFieldValue;
  var RecordAPI = ns_wrapper.api.record;

  this.proceduresNames = '';

  function loadMessageObject () {
    if (!messages) {
      var stringCodes = [MESSAGE_NO_DLR_AMOUNT,
        MESSAGE_NO_DLR_DEFAULT_AMOUNT,
        MESSAGE_DUPLICATE_CURRENCY,
        MESSAGE_INVALID_AMOUNT,
        MESSAGE_CHANGE_DEFAULT_CURRENCY,
        MESSAGE_NEGATIVE_DAYS_OVERDUE,
        MESSAGE_DAYS_OVERDUE_CHANGED
      ];

      var messageLoaderContextCreator = new MessageLoaderContextCreator();
      var messageLoaderContext = messageLoaderContextCreator.getLoaderContext(stringCodes);
      var messageLoader = new MessageLoader(messageLoaderContext);

      messages = messageLoader.getMessageMap();
    }
  }

  var messageHandler;

  function getMessageHandler () {
    if (!messageHandler) {
      messageHandler = new suite_l10n.message.MessageHandler();
    }
    return messageHandler;
  }

  function getMessage (code) {
    loadMessageObject();
    return messages[code];
  }

  function getSubListCount () {
    return getLineItemCount(SUBLIST);
  }

  // TODO validation functions should be moved to a validator object
  function validateSubListCount () {
    var isValid = getSubListCount() > 0;
    return new ValidationResult(isValid, isValid ? '' : getMessage(MESSAGE_NO_DLR_AMOUNT));
  }

  function getDefaultLine () {
    var count = getSubListCount();
    var defaultLine = 0;
    for (var i = 1; i <= count; i++) {
      if (getLineItemValue(SUBLIST, DEFAULT_FIELD, i) === 'T') {
        defaultLine = i;
        break;
      }
    }
    return defaultLine;
  }

  function validateDefaultLine () {
    var hasDefault = getDefaultLine() !== 0;

    return new ValidationResult(hasDefault, hasDefault ? '' : getMessage(MESSAGE_NO_DLR_DEFAULT_AMOUNT));
  }

  function validateCurrency (lineNum) {
    var currency = getCurrentLineItemValue(SUBLIST, CURRENCY_FIELD);
    var count = getSubListCount();
    var isValid = true;
    for (var i = 1; i <= count; i++) {
      if ((lineNum !== i) && (getLineItemValue(SUBLIST, CURRENCY_FIELD, i) === currency)) {
        isValid = false;
        break;
      }
    }
    return new ValidationResult(isValid, isValid ? '' : getMessage(MESSAGE_DUPLICATE_CURRENCY));
  }

  function validateAmount () {
    var amount = Number(getCurrentLineItemValue(SUBLIST, AMOUNT_FIELD));
    var isValid = Number(amount) >= 0;
    return new ValidationResult(isValid, isValid ? '' : getMessage(MESSAGE_INVALID_AMOUNT));
  }

  function validateTotalOverdueBalance () {
    var balance = Number(getCurrentLineItemValue(SUBLIST, TOTAL_OVERDUE_BALANCE));
    var isValid = Number(balance) >= 0;
    return new ValidationResult(isValid, isValid ? '' : getMessage(MESSAGE_INVALID_AMOUNT));
  }

  function isNegativeValue () {
    return Number(getFieldValue(DAYS_OVERDUE_FIELD)) < 0;
  }

  function getDunningProceduresNames () {
    var retProceduresNames = '';
    var dlDAO = new dao.DunningLevelDAO();
    var levels = dlDAO.retrieveByRuleId(RecordAPI.getRecordId());

    if (levels.length > 0) {
      var dunningProceduresIDs = levels.map(function (level) { return level.procedureID; });

      var dpDAO = new dao.DunningProcedureDAO();
      var procedures = dpDAO.retrieveByIds(dunningProceduresIDs);

      if (procedures.length > 0) {
        retProceduresNames = procedures.map(function (procedure) { return procedure.name; }).join();
      }
    }

    return retProceduresNames;
  }

  // end validations

  this.saveRecord = function saveRecord () {
    var isValidSubListCount = validateSubListCount();
    var isValidDefaultLine = validateDefaultLine();
    var validationMessage;
    if (!isValidSubListCount.isValid()) {
      validationMessage = isValidSubListCount.message;
    } else if (!isValidDefaultLine.isValid()) {
      validationMessage = isValidDefaultLine.message;
    }

    if (validationMessage) {
      getMessageHandler().showMessage(validationMessage);
    }

    return isValidSubListCount.isValid() && isValidDefaultLine.isValid();
  };

  this.fieldChanged = function fieldChanged (type, name, lineNum) {
    if (type == SUBLIST) {
      setCurrentLineItemValue(type, SYSGEN_FIELD, 'F', false);
    }

    if (name == DAYS_OVERDUE_FIELD) {
      if (this.proceduresNames) {
        var message = getMessage(MESSAGE_DAYS_OVERDUE_CHANGED);
        var messageParams = {
          'DP_LIST': this.proceduresNames
        };
        var formatter = new suite_l10n.string.StringFormatter(message);
        formatter.replaceParameters(messageParams);
        message = formatter.toString();

        getMessageHandler().showMessage(message);
      }

      if (isNegativeValue()) {
        getMessageHandler().showMessage(getMessage(MESSAGE_NEGATIVE_DAYS_OVERDUE));
      }
    }
  };

  this.handleDefaultLineChange = function handleDefaultLineChange (type, name, lineNum) {
    var defaultLine = getDefaultLine();
    var allowChange = true;
    var hasDefault = (defaultLine !== 0);

    if (hasDefault && defaultLine !== Number(lineNum)) {
      allowChange = getMessageHandler().showConfirmationMessage(getMessage(MESSAGE_CHANGE_DEFAULT_CURRENCY));
    }

    if (allowChange && hasDefault) {
      setLineItemValue(type, name, defaultLine, 'F');
    }

    return allowChange;
  };

  this.validateField = function validateField (type, name, lineNum) {
    var isValid = true;
    if (type == SUBLIST && name === DEFAULT_FIELD) {
      isValid = this.handleDefaultLineChange(type, name, lineNum);
    }

    return isValid;
  };

  this.validateLine = function validateLine (type) {
    var result = new ValidationResult(true);
    if (type == SUBLIST) {
      // dont use"new Number". "new Number" creates a wrapper object while Number returns a simple number
      var lineNum = Number(getCurrentLineItemIndex(type));
      var isValidCurrency = validateCurrency(lineNum);
      var isValidAmount = validateAmount();
      var isOverdueBalanceValid = validateTotalOverdueBalance();
      result.consolidateResults([isValidCurrency, isValidAmount, isOverdueBalanceValid]);
    }

    if (!result.isValid()) {
      getMessageHandler().showMessage(result.getMessage());
    }

    return result.isValid();
  };

  this.lineInit = function lineInit (type) {
    if (getLineItemCount(type) == 1) {
      setLineItemValue(type, DEFAULT_FIELD, 1, 'T');
    }
  };

  this.pageInit = function pageInit (type) {
    if (type == 'edit') {
      this.proceduresNames = getDunningProceduresNames();
    }
  };
};

dunning.comp.cs.dlRuleCS = new dunning.comp.cs.DunningLevelRuleCS();
