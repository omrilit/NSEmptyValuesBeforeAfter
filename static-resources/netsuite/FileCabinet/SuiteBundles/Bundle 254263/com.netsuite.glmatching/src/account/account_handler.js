/**
 * @copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../common/expectations", "./index"], function (_exports, _expectations, _index) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.resolveEUEnableDisableGLM = resolveEUEnableDisableGLM;
  _exports.resolveCSEnableDisableGLM = resolveCSEnableDisableGLM;
  _exports.addScriptFied = addScriptFied;

  function getResolutionForEnableDisableGLM(account, record) {
    var accountType = account.getValue({
      fieldId: "accttype"
      /* ACCOUNT_TYPE */

    });

    if (!accountType) {
      var accountRec = record.load({
        id: account.id,
        type: record.Type.ACCOUNT
      });
      accountType = accountRec.getValue({
        fieldId: "accttype"
        /* ACCOUNT_TYPE */

      });
    }

    accountType = String(accountType);
    return {
      isDisabled: isSpecialType(accountType) || isNotAllowedType(accountType),
      isIncluded: isSpecialType(accountType)
    };
  }

  function isNotAllowedType(accountType) {
    return (0, _index.getNotAllowedTypes)().indexOf(accountType) !== -1;
  }

  function isSpecialType(accountType) {
    return (0, _index.getSpecialTypes)().indexOf(accountType) !== -1;
  }

  function resolveEUEnableDisableGLM(context, displayType, record) {
    var newRecord = context.newRecord;
    var data = getResolutionForEnableDisableGLM(newRecord, record);

    if (data.isDisabled) {
      if ((0, _expectations.expectBoolean)(newRecord.getValue({
        fieldId: "custrecord_glm_include"
        /* INCLUDE */

      })) !== data.isIncluded) {
        var account = record.load({
          id: newRecord.id,
          type: record.Type.ACCOUNT
        });
        account.setValue({
          fieldId: "custrecord_glm_include"
          /* INCLUDE */
          ,
          value: data.isIncluded
        });
        account.save();
      }

      context.form.getField({
        id: "custrecord_glm_include"
        /* INCLUDE */

      }).updateDisplayType({
        displayType: displayType
      });
    }
  }

  function resolveCSEnableDisableGLM(account, record) {
    var data = getResolutionForEnableDisableGLM(account, record);
    account.setValue({
      fieldId: "custrecord_glm_include"
      /* INCLUDE */
      ,
      value: data.isIncluded
    });
    account.getField({
      fieldId: "custrecord_glm_include"
      /* INCLUDE */

    }).isDisabled = data.isDisabled;
  }

  function addScriptFied(context, runtime, file, type) {
    context.form.clientScriptModulePath = runtime.getRealPath("src/entrypoints/glm_cs_account.js");
    var field = context.form.addField({
      id: "custpage_glm_cs_account_trigger",
      label: "glm_cs_account_trigger",
      type: type
    });
    var inlineScript = file.load({
      id: runtime.getRealPath("lib/glm_account_inline.js")
    });
    field.defaultValue = "<script type='text/javascript' " + "id='glm_account_inline_call' language='javascript' src='" + inlineScript.url + "'></script>";
  }
});