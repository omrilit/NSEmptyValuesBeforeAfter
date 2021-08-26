/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.csvReference = _exports.tReference = _exports.permissionBodyField = _exports.TranLineSchema = _exports.Reason = _exports.MatchingSchema = void 0;
  var MatchingSchema = {
    fields: {
      code: "custrecord_glm_matching_code",
      date: "custrecord_glm_matching_date",
      lastEdited: "custrecord_glm_last_edited",
      link: "custrecord_glm_matching_link",
      status: "custrecord_glm_matching_status",
      statusValue: "custrecord_glm_matching_status_value"
    },
    type: "customrecord_glm_matching"
  };
  _exports.MatchingSchema = MatchingSchema;
  var Reason;
  _exports.Reason = Reason;

  (function (Reason) {
    Reason["ACCOUNT_CHANGE"] = "edit_account_change";
    Reason["AMOUNT_CHANGE"] = "edit_amount_change";
    Reason["DELETED"] = "edit_deleted";
    Reason["NONE"] = "edit_none";
    Reason["SUBSIDIARY_CHANGE"] = "edit_subsidiary_change";
  })(Reason || (_exports.Reason = Reason = {}));

  var TranLineSchema = {
    fields: {
      account: "custrecord_glm_account",
      accountingBook: "custrecord_glm_accounting_book",
      code: "custrecord_glm_code",
      credit: "custrecord_glm_credit",
      date: "custrecord_glm_date",
      debit: "custrecord_glm_debit",
      id: "id",
      line: "custrecord_glm_line",
      matching: "custrecord_glm_matching",
      reference: "custrecord_glm_reference",
      status: "custrecord_glm_status",
      statusValue: "custrecord_glm_status_value",
      subsidiary: "custrecord_glm_subsidiary",
      transaction: "custrecord_glm_transaction"
    },
    type: "customrecord_glm_tranline"
  };
  _exports.TranLineSchema = TranLineSchema;
  var permissionBodyField = "custbody_glm_cs_permission";
  _exports.permissionBodyField = permissionBodyField;
  var tReference = "custbody_glm_reference";
  _exports.tReference = tReference;
  var csvReference = "custbody_glm_csv_reference";
  _exports.csvReference = csvReference;
});