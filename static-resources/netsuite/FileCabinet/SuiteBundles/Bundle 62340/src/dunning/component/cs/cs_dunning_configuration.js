/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.component = dunning.component || {};
dunning.component.cs = dunning.component.cs || {};

dunning.component.cs.DunningConfigurationCS = function DunningConfigurationCS () {
  var SUBSIDIARY_FIELD_ID = 'custrecord_3805_config_subsidiary';
  var getFieldValue = ns_wrapper.api.field.getFieldValue;
  var ValidationResult = suite_l10n.validation.ValidationResult;
  var DunningConfigurationValidator = dunning.app.DunningConfigurationValidator;
  var MessageHandler = suite_l10n.message.MessageHandler;

  var validator = null;

  function getValidator () {
    if (!validator) {
      validator = new DunningConfigurationValidator();
    }
    return validator;
  }

  function validateSubsidiary () {
    var value = getFieldValue(SUBSIDIARY_FIELD_ID);

    return getValidator().validateSubsidiary(value);
  }

  function handleResult (result) {
    var messageHandler = new MessageHandler();
    if (result.message != '') {
      messageHandler.showMessage(result.message);
    }
  }

  this.validateField = function validateField (subList, type, lineNum) {
    var results = [];
    if (type == SUBSIDIARY_FIELD_ID) {
      results.push(validateSubsidiary());
    }
    var result = new ValidationResult();
    result.consolidateResults(results);
    handleResult(result);
    return result.isValid();
  };
};

dunning.component.cs.dcCS = new dunning.component.cs.DunningConfigurationCS();
