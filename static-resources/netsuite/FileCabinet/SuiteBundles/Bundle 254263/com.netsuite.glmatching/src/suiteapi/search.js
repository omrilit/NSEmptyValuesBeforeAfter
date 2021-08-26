/**
 * @copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "./errors"], function (_exports, _errors) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.findRecordInternalIdConstructor = findRecordInternalIdConstructor;

  /**
   * @throws Error
   */
  function findRecordInternalIdConstructor(search) {
    return function (recordId) {
      var results = search.create({
        filters: [search.createFilter({
          name: "scriptid",
          operator: search.Operator.IS,
          values: recordId
        })],
        type: "customrecordtype"
      }).run().getRange({
        start: 0,
        end: 1
      });

      if (results.length === 0) {
        throw (0, _errors.createError)("Record Type not found: " + recordId);
      }

      return results[0].id;
    };
  }
});