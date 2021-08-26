/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var ns_wrapper = ns_wrapper || {};

/**
 * @param {nlobjContext} context
 * @constructor
 */
ns_wrapper.Context = function (context) {
  this._context = context;
};

ns_wrapper.Context.prototype = {
  getDeploymentId: function () {
    return this._context.getDeploymentId();
  },

  /**
   * @param {string} type
   * @param {string} name
   * @returns {string|number}
   */
  getSetting: function (type, name) {
    return this._context.getSetting(type, name);
  },

  /**
   * @param {string} name
   * @returns {string}
   */
  getScriptSetting: function (name) {
    return this.getSetting('SCRIPT', name);
  },

  /**
   * @returns {string}
   */
  getUser: function () {
    return this._context.getUser();
  },

  /**
   * @returns {string}
   */
  getName: function () {
    return this._context.getName();
  },

  /**
   * @returns {string}
   */
  getScriptId: function () {
    return this._context.getScriptId();
  },

  /**
   * @returns {number}
   */
  getRemainingUsage: function () {
    return this._context.getRemainingUsage();
  },

  /**
   * @returns {string}
   */
  getExecutionContext: function () {
    return this._context.getExecutionContext();
  },

  /**
   * @returns {boolean}
   */
  getFeature: function (feature) {
    return this._context.getFeature(feature);
  },

  /**
   * @returns {number}
   */
  getSubsidiary: function () {
    return this._context.getSubsidiary();
  },

  /**
   * @returns {string}
   */
  getPreference: function (name) {
    return this._context.getPreference(name);
  },

  /**
   * @returns {string}
   */
  getRole: function () {
    return this._context.getRole();
  },

  /**
   * @returns {string}
   */
  getRoleId: function () {
    return this._context.getRoleId();
  },

  /**
   * @returns {boolean}
   */
  isOW: function () {
    return this._context.getFeature('SUBSIDIARIES');
  },

  /**
   * @returns {boolean}
   */
  hasMultipleCurrencies: function () {
    return this._context.getFeature('MULTICURRENCY');
  },

  /**
   * @returns {string}
   */
  getUserLanguage: function () {
    return this._context.getPreference('LANGUAGE');
  }
};

/**
 * @returns {ns_wrapper.Context}
 */
ns_wrapper.context = function () {
  if (!ns_wrapper._cached_context_instance) {
    ns_wrapper._cached_context_instance = new ns_wrapper.Context(nlapiGetContext());
  }
  return ns_wrapper._cached_context_instance;
};
