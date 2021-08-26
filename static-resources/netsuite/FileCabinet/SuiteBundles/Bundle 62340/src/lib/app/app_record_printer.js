/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var suite_l10n = suite_l10n || {};
suite_l10n.app = suite_l10n.app || {};

suite_l10n.app.RecordPrinter = function () {
  this._printer = new ns_wrapper.api.RecordPrinter();

  /**
   * @param {suite_l10n.view.RecordPrinterDefinition} definition
   * @returns {nlobjFile}
   */
  this.printRecord = function (definition) {
    return this._printer.printToFile(definition);
  };

  /**
   * @param {Array.<suite_l10n.view.RecordPrinterDefinition>} definitions
   * @returns {Array.<nlobjFile>}
   */
  this.printRecords = function (definitions) {
    return definitions.map(function (definition) { return this.printRecord(definition); }, this);
  };
};
