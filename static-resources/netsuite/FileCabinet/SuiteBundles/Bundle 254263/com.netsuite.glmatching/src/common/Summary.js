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
  _exports.Summary = void 0;

  var Summary =
  /** @class */
  function () {
    function Summary(credit, debit) {
      if (credit === void 0) {
        credit = 0;
      }

      if (debit === void 0) {
        debit = 0;
      }

      this.credit = credit;
      this.debit = debit;
    }

    Summary.sum = function (list) {
      return list.reduce(function (sum, x) {
        return sum.add(x);
      }, new Summary());
    };

    Summary.fromRecord = function (record) {
      return new Summary(Number(record.credit) || 0, Number(record.debit) || 0);
    };

    Object.defineProperty(Summary.prototype, "balance", {
      get: function get() {
        return Number((this.debit - this.credit).toFixed(2));
      },
      enumerable: false,
      configurable: true
    });

    Summary.prototype.add = function (summary) {
      return new Summary(this.credit + summary.credit, this.debit + summary.debit);
    };

    return Summary;
  }();

  _exports.Summary = Summary;
});