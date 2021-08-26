/**
 * @copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(["exports", "../variables/di/variables"], function (_exports, _variables) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.beforeSubmit = void 0;

  var beforeSubmit = function beforeSubmit(context) {
    var statusId = context.newRecord.getValue({
      fieldId: "custrecord_glm_matching_status"
    });

    _variables.matchingStatusMap.getAll().filter(function (_a) {
      var id = _a.id;
      return String(id) === String(statusId);
    }).forEach(function (_a) {
      var value = _a.value;
      context.newRecord.setValue({
        fieldId: "custrecord_glm_matching_status_value",
        value: value
      });
    });
  };

  _exports.beforeSubmit = beforeSubmit;
});