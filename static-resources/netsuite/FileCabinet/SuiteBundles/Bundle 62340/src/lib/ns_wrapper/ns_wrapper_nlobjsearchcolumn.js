/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var ns_wrapper = ns_wrapper || {};

ns_wrapper.SearchColumn = function SearchColumn (definition) {
  var obj = {
    getRawObject: getRawObject
  };
  var column = null;

  function setFormula (formula) {
    if (formula) {
      column.setFormula(formula);
    }
  }

  function setFunction (functionId) {
    if (functionId) {
      column.setFunction(functionId);
    }
  }

  function setLabel (label) {
    column.setLabel(label);
  }

  function setSort (isDescending) {
    column.setSort(isDescending);
  }

  function setWhenOrderedBy (name, join) {
    column.setWhenOrderedBy(name, join);
  }

  function getRawObject () {
    return column;
  }

  function init () {
    if (!definition) {
      throw nlapiCreateError('DUNNING_SEARCH_COLUMN_WRAPPER_PARAMETER_REQUIRED', 'SearchColumn requires a columnDefinition constructor parameter');
    }

    column = new nlobjSearchColumn(definition.name, definition.join, definition.summaryType);

    setFormula(definition.formula);
    setFunction(definition.functionId);
    setLabel(definition.label);

    if (definition.isSortColumn) {
      setSort(definition.isDescending);
    }

    if (definition.isWhenOrderedBy) {
      setWhenOrderedBy(definition.whenOrderName, definition.whenOrderJoin);
    }
  }

  init();

  return obj;
};
