/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningQueueFormRequestAdapter = function DunningQueueFormRequestAdapter (definition) {
  this.extract = function (request) {
    var dqfInput = new dunning.view.DunningQueueFormInput();
    dqfInput.display = request.getParameter('disp') == 'T';
    dqfInput.dunningRole = request.getParameter('dr');

    if (dqfInput.display) {
      retrieveFilters(request, dqfInput);
    }

    return dqfInput;
  };

  function retrieveFilters (request, dqfInput) {
    var defList = definition;
    var filterList = [];
    var filterFieldValues = {};

    for (var i = 0; i < defList.length; i++) {
      var def = defList[i];
      var filter = createFilter(def, filterFieldValues, request);

      if (filter) {
        filterList.push(filter);
      }
    }

    dqfInput.queueFilters = filterList;
    dqfInput.queueFilterFieldValues = filterFieldValues;
  }

  function createFilter (def, filterFieldValues, request) {
    var defName = def.requestParameter;
    var defValuePostProcess = def.postProcess;
    var rawValue = request.getParameter(defName);
    var filter;

    if (rawValue) {
      filterFieldValues[def.fieldId] = decodeURIComponent(rawValue);
      filter = new suite_l10n.view.SearchFilter();
      filter.formula = def.colFormula;
      filter.name = def.colName;
      filter.join = def.join ? def.join : null;
      filter.operator = def.operator;
      filter.value = defValuePostProcess
        ? defValuePostProcess(rawValue) : rawValue;
    }

    return filter;
  }
};
