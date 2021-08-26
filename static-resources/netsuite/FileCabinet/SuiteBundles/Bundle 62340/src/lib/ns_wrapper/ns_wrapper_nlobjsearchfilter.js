/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var ns_wrapper = ns_wrapper || {};

ns_wrapper.SearchFilter = function SearchFilter (definition) {
  var obj = {
    getRawObject: getRawObject
  };
  var filter = null;

  function setFormula (formula) {
    if (formula) {
      filter.setFormula(formula);
    }
  }

  function setSummaryType (summaryType) {
    if (summaryType) {
      filter.setSummaryType(summaryType);
    }
  }

  function getRawObject () {
    return filter;
  }

  function init () {
    if (!definition) {
      throw nlapiCreateError('DUNNING_SEARCH_FILTER_WRAPPER_PARAMETER_REQUIRED', 'SearchFilter requires a filterDefinition constructor parameter.');
    }

    filter = new nlobjSearchFilter(definition.name, definition.join, definition.operator, definition.value, definition.value2);

    setFormula(definition.formula);
    setSummaryType(definition.summaryType);
  }

  init();

  return obj;
};
