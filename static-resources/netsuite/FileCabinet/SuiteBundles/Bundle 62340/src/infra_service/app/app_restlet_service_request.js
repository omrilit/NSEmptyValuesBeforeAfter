/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */
var suite_l10n = suite_l10n || {};
suite_l10n.app = suite_l10n.app || {};

suite_l10n.app.RESTletServiceRequest = function RESTletServiceRequest () {
  var obj = new suite_l10n.app.BaseServiceRequest();

  var HEADER = {
    'Content-Type': 'application/json'
  };

  obj.getServiceURL = function getServiceURL () {
    return nlapiResolveURL('RESTLET', 'customscript_suite_l10n_rs_svc', 'customdeploy_suite_l10n_rs_svc');
  };

  obj.getHeader = function getHeader () {
    return HEADER;
  };

  obj.buildPostData = function buildPostData (request) {
    return obj.getRequestString(request);
  };

  return obj;
};
