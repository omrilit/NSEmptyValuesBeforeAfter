/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var ns_wrapper = ns_wrapper || {};

ns_wrapper.Log = function Log () {
  var LOG_LEVELS = {
    'DEBUG': 'DEBUG',
    'ERROR': 'ERROR',
    'AUDIT': 'AUDIT',
    'EMERGENCY': 'EMERGENCY'
  };

  this.debug = function debug (title, details) {
    if (!details) {
      details = title;
      title = null;
    }

    nlapiLogExecution(LOG_LEVELS.DEBUG, title, details);
  };

  this.error = function error (title, details) {
    if (!details) {
      details = title;
      title = null;
    }

    nlapiLogExecution(LOG_LEVELS.ERROR, title, details);
  };

  this.audit = function audit (title, details) {
    if (!details) {
      details = title;
      title = null;
    }

    nlapiLogExecution(LOG_LEVELS.AUDIT, title, details);
  };

  this.emergency = function emergency (title, details) {
    if (!details) {
      details = title;
      title = null;
    }

    nlapiLogExecution(LOG_LEVELS.EMERGENCY, title, details);
  };
};
