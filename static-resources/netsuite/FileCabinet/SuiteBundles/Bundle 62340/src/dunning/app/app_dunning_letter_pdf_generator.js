/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author mjaurigue
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningLetterPDFGenerator = function DunningLetterPDFGenerator () {
  this.generateDunningLetterPDF = function generateDunningLetterPDF (content, folderId, fileName) {
    var file = ns_wrapper.api.xml.convertXMLToPDF(content);
    file.setName(fileName);
    file.setFolder(folderId);
    return ns_wrapper.api.file.submitFile(file);
  };

  this.generateAttachmentPDFs = function generateInvoiceAttachmentPDFs (evaluationResultView, folderId, custName) {
    var attachmentController = new dunning.controller.LetterAttachmentController();
    var fileAttachments = attachmentController.retrieveAttachments(evaluationResultView);
    var attachmentIds = [];
    var invoiceIdx = -1;

    for (var i = 0; i < fileAttachments.length; i++) {
      var file = fileAttachments[i];
      var prefix;

      if (file.getName().substring(0, 7) === 'Invoice') {
        prefix = 'Inv';
        invoiceIdx++;
      } else {
        prefix = 'Sta';
      }

      var fileName = evaluationResultView.id + '_' + prefix + '_' + custName;
      if (invoiceIdx > 0 && prefix === 'Inv') {
        fileName += '_' + invoiceIdx;
      }

      file.setFolder(folderId);
      file.setName(fileName + '.pdf');
      var fileId = ns_wrapper.api.file.submitFile(file);
      attachmentIds.push(fileId);
    }

    return attachmentIds;
  };
};
