/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author mjaurigue
 */

var suite_l10n = suite_l10n || {};
suite_l10n.comp = suite_l10n.comp || {};

suite_l10n.comp.LocalizationVariableLoaderService = function LocalizationVariableLoaderService () {
  this.loadVariable = function loadVariable (request, response) {
    var type = request.getParameter('type');
    var variable = request.getParameter('variable');
    var returnValue = {value: null};
    var stringFormatter = new suite_l10n.string.StringFormatter();

    var variableValues = new suite_l10n.variable.LocalizationVariableList(type);

    /* if "variable" is null, "returnValue" will have a list of localization variable values, otherwise single value */
    if (variable) {
      returnValue.value = Number(variableValues.getValue(variable));
    } else {
      returnValue = variableValues;
    }

    response.write(stringFormatter.stringify(returnValue));
    return response;
  };
};

/**
 * @param {nlobjRequest} request
 * @param {nlobjResponse} response
 */
suite_l10n.comp.loadLocalizationVariable = function loadLocalizationVariable (request, response) {
  var wrRequest = new ns_wrapper.Request(request);
  var wrResponse = new ns_wrapper.Response(response);

  var serviceProvider = new suite_l10n.comp.LocalizationVariableLoaderService();
  wrResponse = serviceProvider.loadVariable(wrRequest, wrResponse);
  wrResponse.flush();
  return true;
};
