/**
 * @copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "N/http", "N/url", "../navigation"], function (_exports, _http, _url, _navigation) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.redirectToDashboard = _exports.resolveChecklist = _exports.resolveDashboard = void 0;
  var resolveDashboard = (0, _navigation.resolveDashboardConstructor)(_url.resolveScript);
  _exports.resolveDashboard = resolveDashboard;
  var resolveChecklist = (0, _navigation.resolveChecklistConstructor)(_url.resolveScript);
  _exports.resolveChecklist = resolveChecklist;
  var redirectToDashboard = (0, _navigation.redirectToDashboardConstructor)(_http.RedirectType);
  _exports.redirectToDashboard = redirectToDashboard;
});