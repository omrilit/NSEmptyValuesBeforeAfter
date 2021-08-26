/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var ns_wrapper = ns_wrapper || {};

ns_wrapper.Request = function Request (nsRequest) {
  var request = nsRequest;

  function getAllHeaders () {
    return request.getAllHeaders();
  }

  function getAllParameters () {
    return request.getAllParameters();
  }

  function getBody () {
    return request.getBody();
  }

  function getFile (id) {
    return request.getFile(id);
  }

  function getHeader (name) {
    return request.getHeader(name);
  }

  function getLineItemCount (group) {
    return request.getLineItemCount(group);
  }

  function getLineItemValue (group, name, line) {
    return request.getLineItemValue(group, name, line);
  }

  function getMethod () {
    return request.getMethod();
  }

  function getParameter (name) {
    return request.getParameter(name);
  }

  function getParameterValues (name) {
    return request.getParameterValues(name);
  }

  function getURL () {
    return request.getURL();
  }

  return {
    getAllHeaders: getAllHeaders,
    getAllParameters: getAllParameters,
    getBody: getBody,
    getFile: getFile,
    getHeader: getHeader,
    getLineItemCount: getLineItemCount,
    getLineItemValue: getLineItemValue,
    getMethod: getMethod,
    getParameter: getParameter,
    getParameterValues: getParameterValues,
    getURL: getURL
  };
};
