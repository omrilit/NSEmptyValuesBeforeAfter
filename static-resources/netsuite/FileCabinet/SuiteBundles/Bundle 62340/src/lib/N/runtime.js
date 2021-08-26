/**
 * @license
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope public
 * @module N/runtime
 */

define(['N/runtime'], function (nRuntime) {
  const isOW = nRuntime.isFeatureInEffect({feature: 'subsidiary'});

  function isFakeRequested (name) {
    return Array.isArray(define.fake) && define.fake.indexOf(name) >= 0;
  }

  if (!isFakeRequested('N/runtime')) {
    return nRuntime;
  }

  function fake (name) {
    throw new Error('You are trying to call a Fake N/runtime. ' + name);
  }

  /**
   * @protected
   * @constructor
   */
  function Script () {
    /**
     * Current script log level
     * @type {string}
     * @readonly
     * @since 2015.2
     */
    this.logLevel = undefined;

    /**
     * Current script id
     * @type {string}
     * @readonly
     * @since 2015.2
     */
    this.id = undefined;

    /**
     * Current script runtime version
     * @type {string}
     * @readonly
     * @since 2015.2
     */
    this.apiVersion = undefined;

    /**
     * Percentage complete specified for the current scheduled script execution
     * @type {number}
     * @throws {SuiteScriptError} SSS_OPERATION_UNAVAILABLE
     * @since 2015.2
     */
    this.percentComplete = undefined;

    /**
     * The deploymentId for the current script deployment
     * @type {string}
     * @readonly
     * @since 2015.2
     */
    this.deploymentId = undefined;

    /**
     * The bundle IDs the current script belongs to
     * @type {string[]}
     * @readonly
     * @since 2015.2
     */
    this.bundleIds = undefined;
  }

  /**
   * Returns the remaining amount of unit usage for the current script
   * @returns {number}
   */
  Script.prototype.getRemainingUsage = function () { fake('getRemainingUsage'); };

  /**
   * Returns script parameter value which is defined per script
   *
   * @param {Object} options
   * @param {string} options.name The name of the parameter
   * @returns {number|Date|string|Array}
   */
  Script.prototype.getParameter = function (options) { fake('getParameter'); };

  /**
   * @protected
   * @constructor
   */
  function Session () {}

  /**
   * Get the value of a user-defined session object for the current user.
   * @param {Object} options
   * @param {string} options.name The key used to store the session object
   * @returns {string}
   *
   */
  Session.prototype.get = function (options) { fake('get'); };

  /**
   * Add or set the value of a user-defined session object for the current user.
   * @param {Object} options
   * @param {string} options.name The key used to store the session object
   * @param {string} options.value The value to associate with this key in the user's session
   * @returns {undefined}
   */
  Session.prototype.set = function (options) { fake('set'); };

  /**
   * @protected
   * @constructor
   */
  function User () {
    /**
     * Returns the currently logged in user's e-mail address
     * @type {string}
     * @readonly
     * @since 2015.2
     */
    this.email = undefined;

    /**
     * Returns the currently logged in user's name
     * @type {string}
     * @readonly
     * @since 2015.2
     */
    this.name = undefined;

    /**
     * Returns the internal ID of the currently logged in user's location
     * @type {number}
     * @readonly
     * @since 2015.2
     */
    this.location = undefined;

    /**
     * Returns the internal ID of the currently logged in user's department
     * @type {number}
     * @readonly
     * @since 2015.2
     */
    this.department = undefined;

    /**
     * Returns the internal ID of the currently logged in user's role
     * @type {number}
     * @readonly
     * @since 2015.2
     */
    this.role = undefined;

    /**
     * Returns the internal ID of the currently logged in user's center type (role center)
     * @type {string}
     * @readonly
     * @since 2015.2
     */
    this.roleCenter = undefined;

    /**
     * Returns the custom scriptId of the role (as opposed to the internal numerical ID).
     * @type {string}
     * @readonly
     * @since 2015.2
     */
    this.roleId = undefined;

    /**
     * Returns the currently logged in user's internal ID
     * @type {number}
     * @readonly
     * @since 2015.2
     */
    this.id = undefined;

    /**
     * Returns the internal ID of the currently logged in user's subsidiary
     * @type {number}
     * @readonly
     * @since 2015.2
     */
    this.subsidiary = undefined;
  }

  /**
   * Get a user's permission level for a given permission
   * @param {Object} options
   * @param {string} options.name The internal ID of a permission
   * @returns {number} one value of the Permission
   */
  User.prototype.getPermission = function (options) { fake('getPermission'); };

  /**
   * Get the value of a NetSuite preference
   * @param {Object} options
   * @param {string} options.name The internal ID of the preference
   * @returns {string} The value of a system or script preference for the current user
   */
  User.prototype.getPreference = function (options) { fake('getPreference'); };

  return {
    isOW: isOW,

    /**
     * Get the current log in user object
     * @returns {User}
     */
    getCurrentUser: function () { fake('getCurrentUser'); },

    /**
     * Get the current executing Script object
     * @returns {Script}
     */
    getCurrentScript: function () { fake('getCurrentScript'); },

    /**
     * Get the current session object
     * @returns {Session}
     */
    getCurrentSession: function () { fake('getCurrentSession'); },

    /**
     * Check if a feature is turned on and in effect
     * @param {Object} options
     * @param {string} options.feature id of the feature
     * @returns {boolean}
     */
    isFeatureInEffect: function (options) { fake('isFeatureInEffect'); },

    /**
     * @type {number}
     * @readonly
     * @since 2015.2
     */
    queueCount: 0,

    /**
     * @type {string}
     * @readonly
     * @since 2015.2
     */
    version: '',

    /**
     * @type {string}
     * @readonly
     * @since 2015.2
     */
    accountId: '',

    /**
     * @type {string}
     * @readonly
     * @since 2015.2
     */
    envType: '',

    /**
     * @type {string}
     * @readonly
     * @since 2015.2
     */
    executionContext: '',

    /**
     * @enum {string}
     * @constant
     */
    EnvType: {
      SANDBOX: 'SANDBOX',
      PRODUCTION: 'PRODUCTION',
      BETA: 'BETA',
      INTERNAL: 'INTERNAL'
    },

    /**
     * @enum {string}
     * @constant
     */
    ContextType: {
      USER_INTERFACE: 'USERINTERFACE',
      WEBSERVICES: 'WEBSERVICES',
      WEBSTORE: 'WEBSTORE',
      PORTLET: 'PORTLET',
      SCHEDULED: 'SCHEDULED',
      SUITELET: 'SUITELET',
      CSV_IMPORT: 'CSVIMPORT',
      CUSTOM_MASSUPDATE: 'CUSTOMMASSUPDATE',
      WORKFLOW: 'WORKFLOW',
      USEREVENT: 'USEREVENT',
      ACTION: 'ACTION',
      DEBUGGER: 'DEBUGGER',
      CLIENT: 'CLIENT',
      BUNDLE_INSTALLATION: 'BUNDLE_INSTALLATION',
      RESTLET: 'RESTLET',
      WEBAPPLICATION: 'WEBAPPLICATION',
      PAYMENTGATEWAY: 'PAYMENTGATEWAY',
      CONSOLRATEADJUSTOR: 'CONSOLRATEADJUSTOR',
      PROMOTIONS: 'PROMOTIONS',
      CUSTOMGLLINES: 'CUSTOMGLLINES',
      TAX_CALCULATION: 'TAXCALCULATION',
      SHIPPING_PARTNERS: 'SHIPPINGPARTNERS',
      EMAIL_CAPTURE: 'EMAILCAPTURE'
    },

    /**
     * @enum {number}
     * @constant
     */
    Permission: {
      FULL: 4,
      EDIT: 3,
      CREATE: 2,
      VIEW: 1,
      NONE: 0
    },

    User: User,
    Session: Session,
    Script: Script
  };
});
