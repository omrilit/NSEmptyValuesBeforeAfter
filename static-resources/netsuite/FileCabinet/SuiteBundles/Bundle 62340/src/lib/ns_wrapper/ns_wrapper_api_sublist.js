/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This wraps the Sublist API
 *
 * @author ldimayuga
 */

var ns_wrapper = ns_wrapper || {};
ns_wrapper.api = ns_wrapper.api || {};
ns_wrapper.api.sublist = ns_wrapper.api.sublist || {};

ns_wrapper.api.sublist.getLineItemCount = function getLineItemCount (group) {
  return nlapiGetLineItemCount(group);
};

ns_wrapper.api.sublist.getLineItemValue = function getLineItemValue (group, name, line) {
  return nlapiGetLineItemValue(group, name, line);
};

ns_wrapper.api.sublist.getCurrentLineItemIndex = function getCurrentLineItemIndex (type) {
  return nlapiGetCurrentLineItemIndex(type);
};

ns_wrapper.api.sublist.getCurrentLineItemValue = function getCurrentLineItemValue (group, name) {
  return nlapiGetCurrentLineItemValue(group, name);
};

ns_wrapper.api.sublist.setLineItemValue = function setLineItemValue (group, fldName, line, fldValue) {
  nlapiSetLineItemValue(group, fldName, line, fldValue);
};

ns_wrapper.api.sublist.getLineItemField = function getLineItemField (group, fldName, line) {
  return nlapiGetLineItemField(group, fldName, line);
};

ns_wrapper.api.sublist.setCurrentLineItemValue = function setCurrentLineItemValue (group, fldName, value, fireFieldChanged) {
  nlapiSetCurrentLineItemValue(group, fldName, value, fireFieldChanged);
};

ns_wrapper.api.sublist.disableLineItemField = function disableLineItemField (group, fldName, isDisabled) {
  nlapiDisableLineItemField(group, fldName, isDisabled);
};

ns_wrapper.api.sublist.selectLineItem = function selectLineItem (type, fldName) {
  nlapiSelectLineItem(type, fldName);
};

ns_wrapper.api.sublist.findLineItemValue = function findLineItemValue (type, fldName, value) {
  return nlapiFindLineItemValue(type, fldName, value);
};

ns_wrapper.api.sublist.commitLineItem = function commitLineItem (type) {
  try {
    nlapiCommitLineItem(type);
  } catch (e) {
    var errorCode = 'DUNNING_SUBLIST_API_WRAPPER_COMMIT_LINEITEM_ERROR';
    var errorDetails = 'An error has occurred in Sublist API Wrapper - ns_wrapper.api.sublist.commitLineItem. Details: ' + JSON.stringify(e);

    nlapiLogExecution('ERROR', errorCode, errorDetails);
    throw nlapiCreateError(errorCode, e.errorDetails);
  }
  return true;
};

ns_wrapper.api.sublist.removeLineItem = function removeLineItem (type, line) {
  nlapiRemoveLineItem(type, line);
  return true;
};
