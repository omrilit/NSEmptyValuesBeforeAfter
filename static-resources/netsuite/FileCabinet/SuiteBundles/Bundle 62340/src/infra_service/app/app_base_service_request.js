/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var suite_l10n = suite_l10n || {};
suite_l10n.app = suite_l10n.app || {};

suite_l10n.app.BaseServiceRequest = function BaseServiceRequest () {
  var obj = {
    getServiceURL: getServiceURL,
    getRequestString: getRequestString,
    parseResponse: parseResponse,
    buildPostData: buildPostData,
    getHeader: getHeader,
    sendRequest: sendRequest,
    getCallback: getCallback,
    getMethod: getMethod,
    handleParsedResult: handleParsedResult
  };

  function getServiceURL () {
    throw new Error('Please override this function.');
  }

  function buildPostData (request) {
    return {
      'custparam_suite_l10n_request': obj.getRequestString(request)
    };
  }

  function getRequestString (request) {
    var formatter = new suite_l10n.string.StringFormatter();
    formatter.stringify(request);
    return formatter.toString();
  }

  function parseResponse (responseBody) {
    var parser = new suite_l10n.parser.JSONParser();
    return parser.parse(responseBody);
  }

  /**
   * Override getHeader when needed;
   */
  function getHeader () {
    return null;
  }

  /**
   * Override getCallback when needed;
   */
  function getCallback () {
    return null;
  }

  /**
   * Override getMethod when needed;
   */
  function getMethod () {
    return 'POST';
  }

  function handleParsedResult (parseResult) {
    var response = null;
    if (parseResult.success) {
      response = parseResult.getResult();
    } else {
      response = new suite_l10n.service.view.ServiceResponse();
      response.success = false;
      response.responseDetails = parseResult.message;
    }
    return response;
  }

  function sendRequest (request) {
    var url = obj.getServiceURL();
    var postData = obj.buildPostData(request);
    var header = obj.getHeader();
    var callback = obj.getCallback();
    var method = obj.getMethod();

    var response = nlapiRequestURL(url, postData, header, callback, method);
    var parseResult = obj.parseResponse(response.getBody());

    return obj.handleParsedResult(parseResult);
  }

  return obj;
};
