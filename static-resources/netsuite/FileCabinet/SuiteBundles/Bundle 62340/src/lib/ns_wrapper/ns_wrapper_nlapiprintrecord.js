/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var ns_wrapper = ns_wrapper || {};
ns_wrapper.api = ns_wrapper.api || {};

ns_wrapper.api.RecordPrinter = function () {
  /**
   * @param {suite_l10n.view.RecordPrinterDefinition} definition
   * @returns {nlobjFile}
   * @throws {nlobjError}
   */
  this.printToFile = function (definition) {
    if (definition) {
      return nlapiPrintRecord(definition.type, definition.id, definition.mode, definition.properties);
    }
    throw nlapiCreateError('SRP001', 'Record Printer requires a recordPrinterDefinition object as a constructor parameter');
  };
};
