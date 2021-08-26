/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This module wraps NetSuite Field APIs
 *
 * @author mmoya
 */

var ns_wrapper = ns_wrapper || {};
ns_wrapper.api = ns_wrapper.api || {};
ns_wrapper.api.field = ns_wrapper.api.field || {};

ns_wrapper.api.field.submitField = function submitField (type, id, fields, values, doSourcing) {
  try {
    return nlapiSubmitField(type, id, fields, values, doSourcing);
  } catch (e) {
    nlapiLogExecution('ERROR', 'EXCEPTION', JSON.stringify({
      error: e,
      arguments: arguments,
      function: 'ns_wrapper.api.field.submitField'
    }));

    throw e;
  }
};

ns_wrapper.api.field.lookupField = function lookupField (type, id, fields, isText) {
  return nlapiLookupField(type, id, fields, isText);
};

ns_wrapper.api.field.getFieldValue = function getFieldValue (name) {
  return nlapiGetFieldValue(name);
};

ns_wrapper.api.field.getFieldText = function getFieldText (name) {
  return nlapiGetFieldText(name);
};

ns_wrapper.api.field.getField = function getField (name) {
  return nlapiGetField(name);
};

ns_wrapper.api.field.setFieldValue = function setFieldValue (name, value, firefieldchanged, synchronous) {
  // if you don't pass a value for synchrounous, it will always be set to true;
  synchronous = (typeof synchronous === 'undefined') ? true : synchronous;
  nlapiSetFieldValue(name, value, firefieldchanged, synchronous);
};
