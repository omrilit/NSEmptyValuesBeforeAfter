/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var ns_wrapper = ns_wrapper || {};

ns_wrapper.Response = function Response (nsResponse) {
  var response = nsResponse;
  var writeContent = [];

  function addHeader (name, value) {
    return response.addHeader(name, value);
  }

  function getAllHeaders () {
    return response.getAllHeaders();
  }

  function getBody () {
    return response.getBody();
  }

  function getCode () {
    return response.getCode();
  }

  function getError () {
    return response.getError();
  }

  function getHeader (name) {
    return response.getHeader(name);
  }

  function getHeaders (name) {
    return response.getHeaders(name);
  }

  function setCDNCacheable (type) {
    response.setCDNCacheable(type);
  }

  function setContentType (type, name, disposition) {
    response.setContentType(type, name, disposition);
  }

  function setEncoding (encodingType) {
    response.setEncoding(encodingType);
  }

  function setHeader (name, value) {
    response.setHeader(name, value);
  }

  function sendRedirect (type, identifier, id, editmode, parameters) {
    response.sendRedirect(type, identifier, id, editmode, parameters);
  }

  function write (output) {
    writeContent.push(output);
  }

  function writeLine (output) {
    writeContent.push(output);
    writeContent.push('\n');
  }

  function writeForm (nsForm) {
    response.writePage(nsForm.getFormObject());
  }

  function flush () {
    response.write(writeContent.join(''));
  }

  return {
    addHeader: addHeader,
    getAllHeaders: getAllHeaders,
    getBody: getBody,
    getCode: getCode,
    getError: getError,
    getHeader: getHeader,
    getHeaders: getHeaders,
    setCDNCacheable: setCDNCacheable,
    setContentType: setContentType,
    setEncoding: setEncoding,
    setHeader: setHeader,
    sendRedirect: sendRedirect,
    write: write,
    writeLine: writeLine,
    writeForm: writeForm,
    flush: flush
  };
};
