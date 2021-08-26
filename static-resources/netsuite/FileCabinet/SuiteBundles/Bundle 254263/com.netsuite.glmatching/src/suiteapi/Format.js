/**
 * @copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.Format = void 0;

  var Format =
  /** @class */
  function () {
    function Format(format) {
      this.format = format;
    }

    Format.prototype.formatCurrency = function (value) {
      if (typeof value !== "number" && typeof value !== "string") {
        return String(value);
      }

      if (value === "") {
        return "";
      }

      return this.format.format({
        type: this.format.Type.CURRENCY,
        value: value
      });
    };

    Format.prototype.formatDate = function (value) {
      return this.format.format({
        type: this.format.Type.DATE,
        value: value
      });
    };

    Format.prototype.formatDateTime = function (value) {
      if (value === "" || value === undefined) {
        return "";
      }

      return this.format.format({
        type: this.format.Type.DATETIME,
        value: new Date(value)
      });
    };

    Format.prototype.parseStringToDate = function (value) {
      return this.format.parse({
        type: this.format.Type.DATETIMETZ,
        value: value
      });
    };

    Format.prototype.formatDateTimeFromDate = function (value) {
      return this.format.format({
        type: this.format.Type.DATETIME,
        value: value
      });
    };

    Format.prototype.getCurrentDateTime = function () {
      return this.format.parse({
        type: this.format.Type.DATETIMETZ,
        value: new Date()
      });
    };

    Format.prototype.getCurrentDate = function () {
      return this.formatDate(this.getCurrentDateTime());
    };

    Format.prototype.formatBalanceFields = function (selected, total) {
      return "<span style=\"font-weight: bold;\">" + this.formatCurrency(selected) + "</span> / " + this.formatCurrency(total);
    };

    return Format;
  }();

  _exports.Format = Format;
});