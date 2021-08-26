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
  _exports.renderCSV = renderCSV;
  var defaultCsvOptions = {
    doubleQuoteMark: "\"\"",
    lineDelimiter: "\r\n",
    quoteMark: "\"",
    valueDelimiter: ","
  };

  function renderCSV(csv, options) {
    if (options === void 0) {
      options = defaultCsvOptions;
    }

    var quoteRegex = new RegExp(options.quoteMark, "g");

    function makeCell(value) {
      if (value === null || value === undefined) {
        return "";
      }

      if (typeof value === "number") {
        return String(value);
      }

      var hasQuotes = value.indexOf(options.quoteMark) >= 0;
      var hasValueDelimiter = value.indexOf(options.valueDelimiter) >= 0;
      var hasLineDelimiter = value.indexOf("\n") >= 0;

      if (hasQuotes) {
        value = value.replace(quoteRegex, options.doubleQuoteMark);
      }

      if (hasQuotes || hasValueDelimiter || hasLineDelimiter) {
        value = options.quoteMark + value + options.quoteMark;
      }

      return value;
    }

    return csv.map(function (row) {
      return row.map(makeCell).join(options.valueDelimiter);
    }).join(options.lineDelimiter);
  }
});