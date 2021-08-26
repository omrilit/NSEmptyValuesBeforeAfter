/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(["exports", "../matching/types", "../suiteapi/di/runtime", "N/log", "N/ui/serverWidget"], function (_exports, _types, _runtime, _log, _serverWidget) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.beforeLoad = void 0;

  var beforeLoad = function beforeLoad(context) {
    try {
      if (!_runtime.runtime.doesItRunInCSVImport()) {
        context.form.getField({
          id: _types.csvReference
        }).updateDisplayType({
          displayType: _serverWidget.FieldDisplayType.HIDDEN
        });
      }

      context.form.getSublist({
        id: "recmachcustrecord_glm_transaction"
      }).displayType = _serverWidget.SublistDisplayType.HIDDEN;
    } catch (e) {
      (0, _log.debug)("glm_ue_hide_tab", e);
    }
  };

  _exports.beforeLoad = beforeLoad;
});