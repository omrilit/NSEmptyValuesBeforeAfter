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
  _exports.SequenceSchema = void 0;
  var SequenceSchema = {
    fields: {
      account: "custrecord_glm_seq_account",
      accountingBook: "custrecord_glm_seq_accounting_book",
      lastValue: "custrecord_glm_seq_value",
      subsidiary: "custrecord_glm_seq_subsidiary"
    },
    type: "customrecord_glm_sequence"
  };
  _exports.SequenceSchema = SequenceSchema;
});