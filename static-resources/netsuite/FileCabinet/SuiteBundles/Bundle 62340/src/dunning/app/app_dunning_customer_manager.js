/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author mjaurigue
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.CustomerManager = function CustomerManager (contactList) {
  var contacts = contactList || [];
  var messages;
  var MESSAGE_NO_DP_MATCHED = 'dc.validateCustomer.noDPMatched'; // DC0005

  var ValidationResult = suite_l10n.validation.ValidationResult;
  var StringFormatter = suite_l10n.string.StringFormatter;

  var messageHandler;

  function getMessageHandler () {
    if (!messageHandler) {
      messageHandler = new suite_l10n.message.MessageHandler();
    }
    return messageHandler;
  }

  function loadMessageObject () {
    if (!messages) {
      var stringCodes = [MESSAGE_NO_DP_MATCHED];
      var messageLoaderContextCreator = new suite_l10n.app.MessageLoaderContextCreator();
      var messageLoaderContext = messageLoaderContextCreator.getLoaderContext(stringCodes);
      var messageLoader = new suite_l10n.app.MessageLoader(messageLoaderContext);
      messages = messageLoader.getMessageMap();
    }
  }

  this.getCustomerValidationResults = function getCustomerValidationResults (useServerSideMsgLoader, isReloadRecordContext) {
    var customerValidator = new dunning.app.DunningCustomerValidator(useServerSideMsgLoader);
    var results = [];

    /* 07.15.2015 change: Company behaviour is mirrored to Individual Customers.
     * We will no longer check if customer is individual or company and
     * do validation on both types - Grace D. Canlas
     */

    customerValidator.setContacts(contacts);

    results.push(customerValidator.validateDunningRecipientContact());
    results.push(customerValidator.hasEmailRecipient());

    var validatorParams = {
      prefix: 'custentity',
      useServerSideMsgLoader: useServerSideMsgLoader,
      reloadRecord: isReloadRecordContext
    };
    var procedureValidator = new dunning.app.DunningProcedureValidator(validatorParams);
    results.push(procedureValidator.validateDunningManager());
    results.push(procedureValidator.validateLetterSendingType());

    var validationResult = new ValidationResult();
    validationResult.consolidateResults(results);
    return validationResult;
  };

  this.validateCustomer = function validateCustomer () {
    var result = this.getCustomerValidationResults();

    if (!result.isValid()) {
      var messageHandler = getMessageHandler();
      messageHandler.showMessage(result.getMessage());
      return false;
    }

    return true;
  };

  function updateDunningProcedure (dp) {
    ns_wrapper.api.field.setFieldValue('custentity_3805_dunning_procedure', dp);
  }

  function dpAssignmentResultHandler (result) {
    var messageHandler = getMessageHandler();

    /* if no results */
    if (!result.success) {
      loadMessageObject();
      messageHandler.showMessage(new StringFormatter(messages[MESSAGE_NO_DP_MATCHED]));
      return;
    }

    var newDP = result.getData('NEW_DUNNING_PROCEDURE');
    var customerValidator = new dunning.app.DunningCustomerValidator();
    var validateUnassignedDPResult = customerValidator.validateUnassignedDP(newDP);
    var validateUniqueDPResult = customerValidator.validateUniqueDP(newDP);

    var isDPUnassigned = validateUnassignedDPResult.isValid();
    var isDPUnique = validateUniqueDPResult.isValid();

    if (!isDPUnassigned) {
      var confirmed = getMessageHandler().showConfirmationMessage(validateUnassignedDPResult.getMessage());
      if (confirmed) {
        updateDunningProcedure(newDP.id);
      }
    } else if (!isDPUnique) {
      getMessageHandler().showMessage(validateUniqueDPResult.getMessage());
    } else {
      updateDunningProcedure(newDP.id);
    }
  }

  this.assignDunningProcedure = function assignDunningProcedure () {
    var semiAutoAssignProcedure = new dunning.app.SemiAutoAssignProcedure();
    var result = semiAutoAssignProcedure.assignDunningProcedure();
    dpAssignmentResultHandler(result);
  };
};
