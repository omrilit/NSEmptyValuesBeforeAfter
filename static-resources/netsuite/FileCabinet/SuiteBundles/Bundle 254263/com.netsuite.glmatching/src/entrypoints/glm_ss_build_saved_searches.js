/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NScriptType ScheduledScript
 */

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

define(["exports", "../matching/types", "N/log", "N/search"], function (_exports, _types, _log, nSearch) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.execute = void 0;
  nSearch = _interopRequireWildcard(nSearch);

  function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

  function createGLMSublistSearch() {
    try {
      var search = nSearch.create({
        columns: [nSearch.createColumn({
          label: "Line ID",
          name: "line",
          sort: nSearch.Sort.ASC,
          summary: nSearch.Summary.GROUP
        }), nSearch.createColumn({
          label: "Account",
          name: "account",
          summary: nSearch.Summary.GROUP
        }), nSearch.createColumn({
          formula: "CASE WHEN {debitamount} IS NULL THEN 0 ELSE {debitamount} END",
          label: "Amount (Debit)",
          name: "formulacurrency",
          summary: nSearch.Summary.MAX
        }), nSearch.createColumn({
          formula: "CASE WHEN {creditamount} IS NULL THEN 0 ELSE {creditamount} END",
          label: "Amount (Credit)",
          name: "formulacurrency",
          summary: nSearch.Summary.MAX
        }), nSearch.createColumn({
          label: "Posting",
          name: "posting",
          summary: nSearch.Summary.GROUP
        }), nSearch.createColumn({
          label: "Memo",
          name: "memo",
          summary: nSearch.Summary.GROUP
        }), nSearch.createColumn({
          label: "Name",
          name: "entity",
          summary: nSearch.Summary.GROUP
        }), nSearch.createColumn({
          label: "Subsidiary",
          name: "subsidiary",
          summary: nSearch.Summary.GROUP
        }), nSearch.createColumn({
          label: "Class",
          name: "class",
          summary: nSearch.Summary.GROUP
        }), nSearch.createColumn({
          formula: "CASE\n                            WHEN {" + _types.TranLineSchema.fields.transaction + "." + _types.TranLineSchema.fields.line + "} = {line}\n                            THEN {" + _types.TranLineSchema.fields.transaction + "." + _types.TranLineSchema.fields.code + "} END",
          label: "Matching Code",
          name: "formulatext",
          summary: nSearch.Summary.MAX
        }), nSearch.createColumn({
          formula: "CASE\n                            WHEN {" + _types.TranLineSchema.fields.transaction + "." + _types.TranLineSchema.fields.line + "} = {line}\n                            THEN {" + _types.TranLineSchema.fields.transaction + "." + _types.TranLineSchema.fields.status + "} END",
          label: "Matching Status",
          name: "formulatext",
          summary: nSearch.Summary.MAX
        }), nSearch.createColumn({
          formula: "CASE\n                            WHEN {" + _types.TranLineSchema.fields.transaction + "." + _types.TranLineSchema.fields.line + "} = {line}\n                            THEN {" + _types.TranLineSchema.fields.transaction + "." + _types.TranLineSchema.fields.reference + "} END",
          label: "Matching Reference",
          name: "formulatext",
          summary: nSearch.Summary.MAX
        }), nSearch.createColumn({
          formula: "CASE\n                            WHEN {" + _types.TranLineSchema.fields.transaction + "." + _types.TranLineSchema.fields.line + "} = {line}\n                            THEN {" + _types.TranLineSchema.fields.transaction + "." + _types.TranLineSchema.fields.date + "} END",
          label: "Matching Date",
          name: "formuladatetime",
          summary: nSearch.Summary.MAX
        })],
        filters: [["posting", "is", "T"], "AND", ["recordtype", "isnot", "intercompanyjournalentry"]],
        type: "transaction"
      });
      search.title = "GLM - GL Matching sublist search";
      search.id = "customsearch_glm_sublist";
      search.isPublic = true;
      search.save();
    } catch (e) {
      (0, _log.error)("Building of 'customsearch_glm_sublist' failed", e);
    }
  }

  function createGLMReportSearch() {
    try {
      var search = nSearch.create({
        columns: [nSearch.createColumn({
          join: "accountingTransaction",
          label: "Accounting Book",
          name: "accountingbook",
          summary: nSearch.Summary.GROUP
        }), nSearch.createColumn({
          label: "Line ID",
          name: "line",
          summary: nSearch.Summary.GROUP
        }), nSearch.createColumn({
          label: "Account",
          name: "account",
          sort: nSearch.Sort.ASC,
          summary: nSearch.Summary.GROUP
        }), nSearch.createColumn({
          label: "Subsidiary",
          name: "subsidiary",
          summary: nSearch.Summary.GROUP
        }), nSearch.createColumn({
          label: "Type",
          name: "type",
          summary: nSearch.Summary.GROUP
        }), nSearch.createColumn({
          label: "Document Number",
          name: "tranid",
          summary: nSearch.Summary.GROUP
        }), nSearch.createColumn({
          label: "Date",
          name: "trandate",
          sort: nSearch.Sort.ASC,
          summary: nSearch.Summary.GROUP
        }), nSearch.createColumn({
          label: "Name",
          name: "entity",
          summary: nSearch.Summary.GROUP
        }), nSearch.createColumn({
          label: "Currency",
          name: "currency",
          summary: nSearch.Summary.GROUP
        }), nSearch.createColumn({
          label: "Amount (Debit)",
          name: "debitamount",
          summary: nSearch.Summary.MAX
        }), nSearch.createColumn({
          label: "Amount (Credit)",
          name: "creditamount",
          summary: nSearch.Summary.MAX
        }), nSearch.createColumn({
          label: "Amount (Debit) (Foreign Currency)",
          name: "debitfxamount",
          summary: nSearch.Summary.MAX
        }), nSearch.createColumn({
          label: "Amount (Credit) (Foreign Currency)",
          name: "creditfxamount",
          summary: nSearch.Summary.MAX
        }), nSearch.createColumn({
          label: "Memo",
          name: "memo",
          summary: nSearch.Summary.GROUP
        }), nSearch.createColumn({
          formula: "CASE WHEN {custrecord_glm_transaction.custrecord_glm_line} = {line} AND {custrecord_glm_transaction.custrecord_glm_accounting_book} = {accountingtransaction.accountingbookid} THEN {custrecord_glm_transaction.custrecord_glm_code} END",
          label: "Matching Code",
          name: "formulatext",
          sort: nSearch.Sort.DESC,
          summary: nSearch.Summary.MAX
        }), nSearch.createColumn({
          formula: "CASE WHEN {custrecord_glm_transaction.custrecord_glm_line} = {line} AND {custrecord_glm_transaction.custrecord_glm_accounting_book} = {accountingtransaction.accountingbookid} THEN {custrecord_glm_transaction.custrecord_glm_status} END",
          label: "Matching Status",
          name: "formulatext",
          sort: nSearch.Sort.DESC,
          summary: nSearch.Summary.MAX
        }), nSearch.createColumn({
          formula: "CASE WHEN {custrecord_glm_transaction.custrecord_glm_line} = {line} AND {custrecord_glm_transaction.custrecord_glm_accounting_book} = {accountingtransaction.accountingbookid} THEN {custrecord_glm_transaction.custrecord_glm_date} END",
          label: "Matching Date",
          name: "formuladatetime",
          summary: nSearch.Summary.MAX
        }), nSearch.createColumn({
          formula: "CASE WHEN {custrecord_glm_transaction.custrecord_glm_line} = {line} AND {custrecord_glm_transaction.custrecord_glm_accounting_book} = {accountingtransaction.accountingbookid} THEN {custrecord_glm_transaction.custrecord_glm_reference} END",
          label: "Matching Reference",
          name: "formulatext",
          sort: nSearch.Sort.DESC,
          summary: nSearch.Summary.MAX
        }), nSearch.createColumn({
          formula: "CASE WHEN {custrecord_glm_transaction.custrecord_glm_line} = {line} AND {custrecord_glm_transaction.custrecord_glm_accounting_book} = {accountingtransaction.accountingbookid} THEN '<a target=\\\"_blank\\\" rel=\\\"noopener noreferrer\\\" href=\\\"'||{custrecord_glm_transaction.custrecord_glm_link}||'\\\">'||{custrecord_glm_transaction.custrecord_glm_link_name}||'</a>' END",
          label: "Group Details",
          name: "formulatext",
          sort: nSearch.Sort.DESC,
          summary: nSearch.Summary.MAX
        })],
        filters: [["posting", "is", "T"], "AND", ["recordtype", "isnot", "intercompanyjournalentry"], "AND", ["formulatext: CASE WHEN {custrecord_glm_transaction.custrecord_glm_line} = {line} AND {custrecord_glm_transaction.custrecord_glm_accounting_book} = {accountingtransaction.accountingbookid} THEN {custrecord_glm_transaction.custrecord_glm_status_value} END", "isnot", "matched"]],
        type: "transaction"
      });
      search.title = "GL Matching Report";
      search.id = "customsearch_glm_report";
      search.isPublic = true;
      search.save();
    } catch (e) {
      (0, _log.error)("Building of 'customsearch_glm_report' failed", e);
    }
  }
  /**
   * Preserve this function for ease creation of the saved search "customsearch_glm_sublist" & "customsearch_glm_report"
   */


  var execute = function execute() {
    createGLMSublistSearch();
    createGLMReportSearch();
  };

  _exports.execute = execute;
});