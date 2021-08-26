/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author mjaurigue
 */

var dunning = dunning || {};
dunning.controller = dunning.controller || {};

dunning.controller.LetterAttachmentInvoiceController = function LetterAttachmentInvoiceController () {
  this.getAttachments = function getAttachments (isOnlyOverdue, evaluationResultView) {
    var invoices = dunning.app.evaluateInvoiceAttachments(isOnlyOverdue, evaluationResultView);

    var attachmentListGenerator = new dunning.app.InvoiceAttachmentListGenerator();
    return attachmentListGenerator.buildAttachmentList(invoices);
  };
};
