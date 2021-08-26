/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 */
define(["exports", "../checklist/di/checklistController"], function (_exports, _checklistController) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.onRequest = void 0;

  var onRequest = function onRequest(context) {
    (0, _checklistController.checklistController)(context.request, context.response);
  };

  _exports.onRequest = onRequest;
});