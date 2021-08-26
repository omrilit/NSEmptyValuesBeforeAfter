/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../vendor/tslib", "../common/expectations", "../common/fn", "../common/MatchingStatus", "../common/Maybe", "../dashboard/index", "./types"], function (_exports, _tslib, _expectations, _fn, _MatchingStatus, _Maybe, _index, _types) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.TranLineRepository = void 0;

  function changeOfString(before, after) {
    return (0, _fn.change)(before || undefined, after || undefined);
  }

  function toTranLine(record) {
    var getValue = function getValue(fieldId) {
      return record.getValue({
        fieldId: fieldId
      });
    }; // having lines separated from the object literal improves reading of an Error.stack


    var account = (0, _expectations.expectInternalId)(getValue(_types.TranLineSchema.fields.account));
    var accountingBook = (0, _expectations.expectInternalId)(getValue(_types.TranLineSchema.fields.accountingBook) || _index.DEFAULT_ACCOUNTING_BOOK);
    var credit = (0, _fn.stringOrDefault)(getValue(_types.TranLineSchema.fields.credit));
    var debit = (0, _fn.stringOrDefault)(getValue(_types.TranLineSchema.fields.debit));
    var id = (0, _expectations.expectOptionalInternalId)(record.id);
    var line = (0, _expectations.expectInternalId)(getValue(_types.TranLineSchema.fields.line));
    var matching = (0, _Maybe.maybe)((0, _expectations.expectOptionalInternalId)(getValue(_types.TranLineSchema.fields.matching))).fmap(function (matchingId) {
      return {
        code: (0, _fn.stringOrDefault)(getValue(_types.TranLineSchema.fields.code)),
        id: matchingId,
        status: (0, _MatchingStatus.expectMatchingStatus)(getValue(_types.TranLineSchema.fields.statusValue))
      };
    });
    var matchingDate = (0, _expectations.expectOptionalDate)(getValue(_types.TranLineSchema.fields.date));
    var reference = (0, _fn.stringOrDefault)(getValue(_types.TranLineSchema.fields.reference));
    var subsidiary = (0, _expectations.expectInternalId)(getValue(_types.TranLineSchema.fields.subsidiary) || _index.DEFAULT_SUBSIDIARY);
    var transaction = (0, _expectations.expectInternalId)(getValue(_types.TranLineSchema.fields.transaction));
    return (0, _fn.compactObject)({
      account: account,
      accountingBook: accountingBook,
      credit: credit,
      debit: debit,
      id: id,
      isPeriodClosed: false,
      line: line,
      matching: matching,
      matchingDate: matchingDate,
      reference: reference,
      subsidiary: subsidiary,
      transaction: transaction
    });
  }

  var TranLineRepository =
  /** @class */
  function () {
    function TranLineRepository(records) {
      this.records = records;
    }

    TranLineRepository.prototype.create = function (tranLine) {
      var record = this.records.create({
        type: _types.TranLineSchema.type
      });
      record.setValue({
        fieldId: _types.TranLineSchema.fields.account,
        value: tranLine.account
      });
      record.setValue({
        fieldId: _types.TranLineSchema.fields.credit,
        value: (0, _fn.stringOrDefault)(tranLine.credit)
      });
      record.setValue({
        fieldId: _types.TranLineSchema.fields.debit,
        value: (0, _fn.stringOrDefault)(tranLine.debit)
      });
      record.setValue({
        fieldId: _types.TranLineSchema.fields.line,
        value: tranLine.line
      });
      record.setValue({
        fieldId: _types.TranLineSchema.fields.matching,
        value: tranLine.matching.fmap(function (matching) {
          return matching.id;
        }).valueOr("")
      });
      record.setValue({
        fieldId: _types.TranLineSchema.fields.reference,
        value: tranLine.reference
      });
      record.setValue({
        fieldId: _types.TranLineSchema.fields.transaction,
        value: tranLine.transaction
      });
      record.setValue({
        fieldId: _types.TranLineSchema.fields.accountingBook,
        value: tranLine.accountingBook
      });
      record.setValue({
        fieldId: _types.TranLineSchema.fields.subsidiary,
        value: tranLine.subsidiary
      });
      var id = (0, _expectations.expectInternalId)(record.save());
      return [(0, _fn.compactObject)({
        account: tranLine.account,
        accountChange: changeOfString(undefined, tranLine.account),
        code: changeOfString(undefined, tranLine.matching.fmap(function (x) {
          return x.code;
        }).valueOrUndefined()),
        credit: changeOfString(undefined, tranLine.credit),
        debit: changeOfString(undefined, tranLine.debit),
        line: changeOfString(undefined, tranLine.line),
        matching: changeOfString(undefined, tranLine.matching.fmap(function (x) {
          return x.id;
        }).valueOrUndefined()),
        reference: changeOfString(undefined, tranLine.reference),
        status: changeOfString(undefined, tranLine.matching.fmap(function (x) {
          return x.status;
        }).valueOrUndefined()),
        transactionChange: changeOfString(undefined, tranLine.transaction),
        transactions: [(0, _tslib.__assign)((0, _tslib.__assign)({}, tranLine), {
          id: id
        })]
      })];
    };

    TranLineRepository.prototype.setReference = function (tranLine, reference) {
      return this.save((0, _tslib.__assign)((0, _tslib.__assign)({}, tranLine), {
        reference: reference
      }));
    };

    TranLineRepository.prototype.match = function (tranLine, matching) {
      return this.save((0, _tslib.__assign)((0, _tslib.__assign)({}, tranLine), {
        matching: (0, _Maybe.maybe)(matching)
      }));
    };

    TranLineRepository.prototype.unMatch = function (tranLine) {
      return this.save((0, _tslib.__assign)((0, _tslib.__assign)({}, tranLine), {
        matching: (0, _Maybe.nothing)()
      }));
    };

    TranLineRepository.prototype.save = function (tranLine) {
      if (!tranLine.id) {
        return this.create(tranLine);
      }

      var record = this.records.load({
        id: tranLine.id,
        type: _types.TranLineSchema.type
      });
      var oldTranLine = toTranLine(record);

      if (!oldTranLine.matching.equals(tranLine.matching)) {
        record.setValue({
          fieldId: _types.TranLineSchema.fields.matching,
          value: tranLine.matching.fmap(function (x) {
            return x.id;
          }).valueOr("")
        });
      }

      if (oldTranLine.reference !== tranLine.reference) {
        record.setValue({
          fieldId: _types.TranLineSchema.fields.reference,
          value: tranLine.reference
        });
      }

      if (oldTranLine.account !== tranLine.account) {
        record.setValue({
          fieldId: _types.TranLineSchema.fields.account,
          value: tranLine.account
        });
      }

      if (oldTranLine.line !== tranLine.line) {
        record.setValue({
          fieldId: _types.TranLineSchema.fields.line,
          value: tranLine.line
        });
      }

      if (oldTranLine.transaction !== tranLine.transaction) {
        record.setValue({
          fieldId: _types.TranLineSchema.fields.transaction,
          value: tranLine.transaction
        });
      }

      var oldCredit = (0, _fn.stringOrDefault)(oldTranLine.credit);
      var newCredit = (0, _fn.stringOrDefault)(tranLine.credit);

      if (oldCredit !== newCredit) {
        record.setValue({
          fieldId: _types.TranLineSchema.fields.credit,
          value: newCredit
        });
      }

      var oldDebit = (0, _fn.stringOrDefault)(oldTranLine.debit);
      var newDebit = (0, _fn.stringOrDefault)(tranLine.debit);

      if (oldDebit !== newDebit) {
        record.setValue({
          fieldId: _types.TranLineSchema.fields.debit,
          value: newDebit
        });
      }

      var oldSubsidiary = (0, _fn.stringOrDefault)(oldTranLine.subsidiary);
      var newSubsidiary = (0, _fn.stringOrDefault)(tranLine.subsidiary);

      if (oldSubsidiary !== newSubsidiary) {
        record.setValue({
          fieldId: _types.TranLineSchema.fields.subsidiary,
          value: newSubsidiary
        });
      }

      var id = (0, _expectations.expectInternalId)(record.save());
      return [(0, _fn.compactObject)({
        account: tranLine.account,
        accountChange: changeOfString(oldTranLine.account, tranLine.account),
        code: changeOfString(oldTranLine.matching.fmap(function (x) {
          return x.code;
        }).valueOrUndefined(), tranLine.matching.fmap(function (x) {
          return x.code;
        }).valueOrUndefined()),
        credit: changeOfString(oldCredit, newCredit),
        debit: changeOfString(oldDebit, newDebit),
        line: changeOfString(oldTranLine.line, tranLine.line),
        matching: changeOfString(oldTranLine.matching.fmap(function (x) {
          return x.id;
        }).valueOrUndefined(), tranLine.matching.fmap(function (x) {
          return x.id;
        }).valueOrUndefined()),
        reference: changeOfString(oldTranLine.reference, tranLine.reference),
        status: changeOfString(oldTranLine.matching.fmap(function (x) {
          return x.status;
        }).valueOrUndefined(), tranLine.matching.fmap(function (x) {
          return x.status;
        }).valueOrUndefined()),
        transactionChange: changeOfString(oldTranLine.transaction, tranLine.transaction),
        transactions: [(0, _tslib.__assign)((0, _tslib.__assign)({}, oldTranLine), {
          id: id
        })]
      })];
    };

    TranLineRepository.prototype.load = function (id) {
      return toTranLine(this.records.load({
        id: id,
        type: _types.TranLineSchema.type
      }));
    };

    TranLineRepository.prototype.remove = function (tranLine) {
      if (!tranLine.id) {
        return [];
      }

      this.records["delete"]({
        id: tranLine.id,
        type: _types.TranLineSchema.type
      });
      var newTranLine = (0, _tslib.__assign)({}, tranLine);
      delete newTranLine.id;
      return [(0, _tslib.__assign)((0, _tslib.__assign)({}, tranLine.matching.caseOf({
        just: function just(matching) {
          return {
            code: changeOfString(matching.code),
            matching: changeOfString(matching.id),
            status: changeOfString(matching.status)
          };
        },
        nothing: function nothing() {
          return {};
        }
      })), {
        account: tranLine.account,
        accountChange: changeOfString(tranLine.account),
        credit: changeOfString(tranLine.credit),
        debit: changeOfString(tranLine.debit),
        line: changeOfString(tranLine.line),
        reference: changeOfString(tranLine.reference),
        transactionChange: changeOfString(tranLine.transaction),
        transactions: [newTranLine]
      })];
    };

    return TranLineRepository;
  }();

  _exports.TranLineRepository = TranLineRepository;
});