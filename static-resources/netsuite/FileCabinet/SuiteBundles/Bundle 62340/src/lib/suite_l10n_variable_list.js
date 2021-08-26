/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var suite_l10n = suite_l10n || {};
suite_l10n.variable = suite_l10n.variable || {};

/**
 * @param {string} [type]
 * @constructor
 */
suite_l10n.variable.LocalizationVariableList = function (type) {
  /**
   * @param {nlobjSearchResultSet} searchResultSet
   * @param {function(nlobjSearchResult)} callback
   */
  function each (searchResultSet, callback) {
    var MAX_RESULTS_COUNT = 1000;
    var page = 0;

    do {
      var results = searchResultSet.getResults(page, page + MAX_RESULTS_COUNT);
      results.forEach(callback);
      page++;
    } while (results.length === MAX_RESULTS_COUNT);
  }

  /**
   * @param {string} [type]
   * @returns {Object.<string,{value:string,id:string}>}
   */
  function fetchItems (type) {
    var valueFieldId = 'custrecord_3805_variable_value';
    var items = {};

    var filters = [];
    var columns = [
      new nlobjSearchColumn('name'),
      new nlobjSearchColumn(valueFieldId)
    ];

    if (typeof type === 'string' && type !== '') {
      filters.push(new nlobjSearchFilter(valueFieldId, 'custrecord_3805_variable_type', 'is', type));
    }

    var search = nlapiCreateSearch('customrecord_suite_l10n_variable', filters, columns).runSearch();

    each(search, function (result) {
      items[result.getValue('name')] = {
        value: result.getValue(valueFieldId),
        id: result.getId()
      };
    });

    return items;
  }

  /**
   * @type {Object.<string,{value:string,id:string}>}
   */
  this._items = fetchItems(type);
};

/**
 * @param {string} name
 * @returns {string}
 */
suite_l10n.variable.LocalizationVariableList.prototype.getValue = function (name) {
  return this._items[name] ? this._items[name].value || '' : '';
};

/**
 * @param {string} name
 * @returns {string}
 */
suite_l10n.variable.LocalizationVariableList.prototype.getId = function (name) {
  return this._items[name] ? this._items[name].id || '' : '';
};

/**
 * @param {string} value
 * @returns {string}
 */
suite_l10n.variable.LocalizationVariableList.prototype.getIdByValue = function (value) {
  for (var i in this._items) {
    if (this._items.hasOwnProperty(i) && this._items[i].value == value) {
      return this._items[i].id;
    }
  }
};

/**
 * @param {string} id
 * @returns {string|undefined}
 */
suite_l10n.variable.LocalizationVariableList.prototype.getValueById = function (id) {
  for (var i in this._items) {
    if (this._items.hasOwnProperty(i) && this._items[i].id == id) {
      return this._items[i].value;
    }
  }
};

/**
 * @returns {Object.<string,{value:string,id:string}>}
 */
suite_l10n.variable.LocalizationVariableList.prototype.getAllVariables = function getAllVariables () {
  return this._items;
};
