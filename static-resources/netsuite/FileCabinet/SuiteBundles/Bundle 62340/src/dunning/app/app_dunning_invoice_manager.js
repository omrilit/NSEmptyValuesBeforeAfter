/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author fkyao
 *
 * Imports:
 * suite_l10n_validation_result.js
 * suite_l10n_variable_list.js
 * app_dunning_customer_validator.js
 * suite_l10n_message.js
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.InvoiceManager = function InvoiceManager () {
  var ValidationResult = suite_l10n.validation.ValidationResult;

  this.getValidationResult = function getValidationResult (useServerSideMsgLoader, isReloadRecordContext) {
    var validatorParams = {
      prefix: 'custbody',
      useServerSideMsgLoader: useServerSideMsgLoader,
      reloadRecord: isReloadRecordContext

    };
    var procedureValidator = new dunning.app.DunningProcedureValidator(validatorParams);
    var results = [];

    results.push(procedureValidator.validateDunningManager());
    results.push(procedureValidator.validateLetterSendingType());

    var validationResult = new ValidationResult();
    validationResult.consolidateResults(results);
    return validationResult;
  };

  this.validateInvoice = function validateInvoice () {
    var result = this.getValidationResult();
    if (!result.isValid()) {
      var messageHandler = dunningcs.getMessageHandler();
      messageHandler.showMessage(result.getMessage());
      return false;
    }
    return true;
  };
};
