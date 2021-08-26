/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * A service for loading localization variables from client side
 *
 * @author mjaurigue
 */

var suite_l10n = suite_l10n || {};
suite_l10n.app = suite_l10n.app || {};

suite_l10n.app.LocalizationVariableListLoader = function LocalizationVariableListLoader () {
  var TYPE = 'SUITELET';
  var IDENTIFIER = 'customscript_suite_l10n_loc_var_loader';
  var ID = 'customdeploy_suite_l10n_loc_var_loader';
  var URLAPI = ns_wrapper.api.url;

  this.getLocalizationVariable = function getLocalizationVariable (definition) {
    try {
      var url = URLAPI.resolveUrl(TYPE, IDENTIFIER, ID);
      var responseObj = URLAPI.requestUrlCs(
        url,
        definition,
        null,
        null,
        'POST');

      var parser = new suite_l10n.parser.JSONParser();
      return parser.doParse(responseObj.getBody());
    } catch (e) {
      nlapiLogExecution('ERROR', 'DUNNING_LOCALIZATION_VARIABLE_LIST_LOADER_ERROR', 'An error has occurred in the LocalizationVariableListLoader class. Details: ' + JSON.stringify(e));
    }
  };
};
