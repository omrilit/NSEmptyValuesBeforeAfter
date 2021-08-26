/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../common/expectations", "./types"], function (_exports, _expectations, _types) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.SequenceRepository = void 0;

  var SequenceRepository =
  /** @class */
  function () {
    function SequenceRepository(runQuery, record) {
      this.runQuery = runQuery;
      this.record = record;
    }

    SequenceRepository.prototype.find = function (account, subsidiary, accountingBook) {
      var query = "\n            SELECT id\n                 , " + _types.SequenceSchema.fields.lastValue + "\n            FROM " + _types.SequenceSchema.type + "\n            WHERE rownum < 2\n              AND " + _types.SequenceSchema.fields.account + " = ?\n              AND " + _types.SequenceSchema.fields.subsidiary + " = ?\n              AND " + _types.SequenceSchema.fields.accountingBook + " = ?\n        ";
      return this.runQuery(query, [account, subsidiary, accountingBook]).map(function (row) {
        return {
          id: (0, _expectations.expectInternalId)(row[0]),
          lastSequenceNumber: (0, _expectations.expectString)(row[1])
        };
      });
    };

    SequenceRepository.prototype.create = function (code, account, subsidiary, accountingBook) {
      var r = this.record.create({
        type: _types.SequenceSchema.type
      });
      r.setValue({
        fieldId: _types.SequenceSchema.fields.account,
        value: account
      });
      r.setValue({
        fieldId: _types.SequenceSchema.fields.lastValue,
        value: code
      });
      r.setValue({
        fieldId: _types.SequenceSchema.fields.subsidiary,
        value: subsidiary
      });
      r.setValue({
        fieldId: _types.SequenceSchema.fields.accountingBook,
        value: accountingBook
      });
      r.save();
    };

    SequenceRepository.prototype.update = function (id, code) {
      var r = this.record.load({
        id: id,
        type: _types.SequenceSchema.type
      });
      r.setValue({
        fieldId: _types.SequenceSchema.fields.lastValue,
        value: code
      });
      r.save();
    };

    return SequenceRepository;
  }();

  _exports.SequenceRepository = SequenceRepository;
});