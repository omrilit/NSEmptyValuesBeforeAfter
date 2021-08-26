/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningConfigurationValidator = function DunningConfigurationValidator () {
  var configList = null;

  function getConfigurationList () {
    if (!configList) {
      var url = ns_wrapper.api.url.resolveUrl('SUITELET', 'customscript_3805_cs_config_retrieval', 'customdeploy_3805_cs_config_retrieval');
      var response = ns_wrapper.api.url.requestUrlCs(url);
      var parser = new suite_l10n.parser.JSONParser();
      var parseResult = parser.parse(response.getBody());
      configList = parseResult.getResult();
    }
    return configList;
  }

  function configurationExists (subsidiaryId) {
    function filterBySubsidiaryId (configuration) {
      return Number(configuration.subsidiary) === Number(subsidiaryId);
    }

    var list = getConfigurationList();
    var filteredList = list.filter(filterBySubsidiaryId);
    return filteredList.length > 0;
  }

  var MESSAGE_SUB_EXISTING_CONFIG = 'dc.validateSubsidiary.existingConfigSubsidiary';
  var DEFAULT_EXISTING_CONFIG_MESSAGE = 'A dunning configuration record for this subsidiary already exists.';
  var duplicateConfigMessage = null;
  this.getDuplicateConfigMessage = function getDuplicateConfigMessage () {
    if (!duplicateConfigMessage) {
      var stringCodes = [MESSAGE_SUB_EXISTING_CONFIG];
      var messageLoaderContextCreator = new suite_l10n.app.MessageLoaderContextCreator();
      var messageLoaderContext = messageLoaderContextCreator.getLoaderContext(stringCodes);
      var messageLoader = new suite_l10n.app.MessageLoader(messageLoaderContext);
      var messages = messageLoader.getMessageMap();
      duplicateConfigMessage = messages[MESSAGE_SUB_EXISTING_CONFIG] || DEFAULT_EXISTING_CONFIG_MESSAGE;
    }
    return duplicateConfigMessage;
  };

  this.validateSubsidiary = function validateSubsidiary (subsidiaryId) {
    var validationResult = new suite_l10n.validation.ValidationResult(true);
    if (subsidiaryId && configurationExists(subsidiaryId)) {
      validationResult.success = false;
      validationResult.message = this.getDuplicateConfigMessage();
    }
    return validationResult;
  };
};
