/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var suite_l10n = suite_l10n || {};

suite_l10n.variables = {
  /**
   * @type {Object.<string,string>}
   * @private
   */
  _cache: {},

  /**
   * @param {string} value
   * @param {number} type
   * @returns {number}
   * @private
   */
  _variable: function (value, type) {
    this._cache[type] = this._cache[type] || {};
    if (this._cache[type][value]) {
      return this._cache[type][value];
    }
    var search = nlapiSearchRecord('customrecord_suite_l10n_variable', null, [
      new nlobjSearchFilter('custrecord_3805_variable_value', null, 'is', value),
      new nlobjSearchFilter('custrecord_3805_variable_type', null, 'is', type)
    ]);
    if (!search) {
      throw new Error('Localization Variable not found: ' + JSON.stringify({value: value, type: type}));
    }
    this._cache[type][value] = search[0].getId();
    return search[0].getId();
  },

  /**
   * @param {string} value The Value of Variable Type, ie. "dunning_eval_result_status"
   * @returns {number} Internal ID of record
   * @throws {Error}
   */
  variableType: function (value) {
    return this._variable(value, 1);
  },

  /**
   * @param {string} value The Value of Result Status, ie. "queued"
   * @returns {number} Internal ID of record
   * @throws {Error}
   */
  resultStatus: function (value) {
    return this._variable(value, this.variableType('dunning_eval_result_status'));
  },

  /**
   * @param {string} value The Value of Letter Type, ie. "email"
   * @returns {number} Internal ID of record
   * @throws {Error}
   */
  letterType: function (value) {
    return this._variable(value, this.variableType('letter_type'));
  },

  /**
   * @param {string} name The Name of Job State, ie. "Job Completed"
   * @returns {number} Internal ID of record
   * @throws {Error}
   */
  jobState: function (name) {
    var names = {
      'Job Aborted': 5,
      'Job Cancelled': 3,
      'Job Completed': 2,
      'Job Failed': 4,
      'Job Not Started': 0,
      'Job Running': 1
    };
    return this._variable(names[name], this.variableType('job_state'));
  },

  /**
   * @param {string} name The Name of Dunning Source, ie. "Customer"
   * @returns {number} Internal ID of record
   * @throws {Error}
   */
  dunningSource: function (name) {
    return this._variable(name, this.variableType('dunning_source'));
  },

  /**
   * @param {string} name The Name of Sending Schedule, ie. "Manual"
   * @returns {number} Internal ID of record
   * @throws {Error}
   */
  sendingSchedule: function (name) {
    return this._variable(name, this.variableType('sending_schedule'));
  }
};
