/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.InvoiceAttachmentListGenerator = function () {
  /**
   * @param {Array.<dunning.view.DunningInvoiceForm>} invoices
   * @returns {Array.<nlobjFile>}
   */
  this.buildAttachmentList = function (invoices) {
    var definitions = invoices.map(function (invoice) {
      var definition = new suite_l10n.view.RecordPrinterDefinition();
      definition.id = invoice.id;
      definition.mode = 'PDF';
      definition.properties = {formnumber: invoice.customformid};
      definition.type = 'TRANSACTION';
      return definition;
    });

    var printer = new suite_l10n.app.RecordPrinter();
    return printer.printRecords(definitions);
  };
};
