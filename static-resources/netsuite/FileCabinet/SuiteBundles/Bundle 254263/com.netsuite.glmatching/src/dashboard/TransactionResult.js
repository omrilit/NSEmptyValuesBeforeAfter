/**
 * @copyright © 2020, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../common/Maybe", "../common/NameCollection", "./types"], function (_exports, _Maybe, _NameCollection, _types) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.TransactionResult = void 0;

  var TransactionResult =
  /** @class */
  function () {
    function TransactionResult(data) {
      var _a;

      this.__TYPE__ = "TransactionResult";
      this.accountingBook = data.accountingBook || _types.DEFAULT_ACCOUNTING_BOOK;
      this.account = data.account;
      this.credit = data.credit;
      this.creditFx = data.creditFx;
      this.currency = data.currency;
      this.date = data.date;
      this.debit = data.debit;
      this.debitFx = data.debitFx;
      this.entity = (_a = data.entity) !== null && _a !== void 0 ? _a : (0, _Maybe.nothing)();
      this.isPeriodClosed = Boolean(data.isPeriodClosed);
      this.isReversal = Boolean(data.isReversal);
      this.matchingCode = data.matchingCode;
      this.matchingId = data.matchingId;
      this.matchingReference = data.matchingReference;
      this.matchingStatusName = data.matchingStatusName;
      this.matchingStatusValue = data.matchingStatusValue;
      this.matchingDate = data.matchingDate;
      this.memoMain = data.memoMain;
      this.subsidiary = data.subsidiary || _types.DEFAULT_SUBSIDIARY;
      this.tranId = data.tranId;
      this.tranLine = data.tranLine;
      this.tranName = data.tranName;
      this.tranNumber = data.tranNumber;
      this.tranType = data.tranType;
      this.tranlineId = data.tranlineId;
    }

    TransactionResult.prototype.getIdentifiers = function () {
      return new _NameCollection.IdentifierCollection({
        account: [this.account],
        book: [this.accountingBook],
        entity: this.entity.caseOf({
          just: function just(_a) {
            var id = _a.id;
            return [id];
          },
          nothing: function nothing() {
            return [];
          }
        }),
        subsidiary: [this.subsidiary],
        transaction: [this.tranId]
      });
    };

    return TransactionResult;
  }();

  _exports.TransactionResult = TransactionResult;
});