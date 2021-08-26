/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This module wraps NetSuite URL APIs
 *
 * @author cboydon
 */

var ns_wrapper = ns_wrapper || {};
ns_wrapper.api = ns_wrapper.api || {};
ns_wrapper.api.url = ns_wrapper.api.url || {};

ns_wrapper.api.url.resolveUrl = function resolveUrl (type, identifier, id, displayMode) {
  return nlapiResolveURL(type, identifier, id, displayMode);
};

/* nlapiChangeCall substitute */
ns_wrapper.api.url.resolveUrlWithParams = function resolveUrlWithParams (obj) {
  var url = ns_wrapper.api.url.resolveUrl(obj.type, obj.identifier, obj.id, obj.displayMode, obj.parameters);
  var queryStringGenerator = new suite_l10n.string.QueryStringGenerator();
  return url + '&' + queryStringGenerator.generateQueryString(obj.parameters);
};

ns_wrapper.api.url.requestUrlCs = function requestUrlCs (url, postdata, headers, callback, httpMethod) {
  return nlapiRequestURL(url, postdata, headers, callback, httpMethod);
};

ns_wrapper.api.url.requestUrlSs = function requestUrlCs (url, postdata, headers, httpMethod) {
  return nlapiRequestURL(url, postdata, headers, httpMethod);
};

ns_wrapper.api.url.setRedirectURL = function setRedirectURL (urlType, recTypeOrScriptId, recIdOrDeployId, isEditMode, paramObj) {
  return nlapiSetRedirectURL(urlType, recTypeOrScriptId, recIdOrDeployId, isEditMode, paramObj);
};
