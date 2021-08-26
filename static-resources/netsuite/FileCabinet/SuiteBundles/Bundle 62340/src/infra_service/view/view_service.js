/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var suite_l10n = suite_l10n || {};
suite_l10n.service = suite_l10n.service || {};
suite_l10n.service.view = suite_l10n.service.view || {};

suite_l10n.service.view.ServiceRequest = function () {
  var obj = {
    'pluginId': null,
    'requestDetails': null
  };

  Object.seal(obj);
  return obj;
};

suite_l10n.service.view.ServiceResponse = function () {
  var obj = {
    'success': false,
    'message': null,
    'responseDetails': null
  };

  Object.seal(obj);
  return obj;
};

suite_l10n.service.view.SearchServiceRequest = function SearchServiceRequest () {
  var obj = new suite_l10n.service.view.ServiceRequest();
  obj.pluginId = 'customscript_suite_l10n_search_service';
  return obj;
};
