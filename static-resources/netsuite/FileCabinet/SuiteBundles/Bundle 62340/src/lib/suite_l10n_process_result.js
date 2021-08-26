/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var suite_l10n = suite_l10n || {};
suite_l10n.process = suite_l10n.process || {};

/**
 * @param {boolean} [success=false]
 * @param {string} [message]
 * @constructor
 */
suite_l10n.process.ProcessResult = function (success, message) {
  /**
   * @type {boolean}
   */
  this.success = Boolean(success);

  /**
   * @type {string}
   */
  this.message = message || '';

  /**
   * @type {Object.<string,*>}
   * @private
   */
  this.data = {};

  /**
   * @param {string} type
   * @param {*} value
   */
  this.setData = function (type, value) {
    this.data[type] = value;
  };

  /**
   * @param {string} type
   * @returns {*}
   */
  this.getData = function (type) {
    return this.data[type];
  };
};

/**
 * @param {Array.<suite_l10n.process.ProcessResult>} results
 * @returns {suite_l10n.process.ProcessResult}
 * @static
 */
suite_l10n.process.ProcessResult.consolidateResults = function (results) {
  var success = (results || []).reduce(function (a, x) { return a && x.success; }, true);
  var message = (results || []).filter(function (x) { return x.message; })
    .map(function (x) { return x.message; })
    .join('\n');

  return new suite_l10n.process.ProcessResult(success, message);
};

/**
 * @param {string} json
 * @returns {suite_l10n.process.ProcessResult}
 */
suite_l10n.process.ProcessResult.parseJSON = function (json) {
  var result = new suite_l10n.process.ProcessResult(false);

  try {
    var object = JSON.parse(json);

    if (typeof object === 'object') {
      result.success = Boolean(object.success);
      if (typeof object.message === 'string') {
        result.message = object.message;
      }
      if (typeof object.data === 'object') {
        result.data = object.data;
      }
    } else {
      result.message = 'Unexpected Type: Plain JS Object expected';
    }
  } catch (e) {
    result.success = false;
    result.message = JSON.stringify(e);
  }

  return result;
};
