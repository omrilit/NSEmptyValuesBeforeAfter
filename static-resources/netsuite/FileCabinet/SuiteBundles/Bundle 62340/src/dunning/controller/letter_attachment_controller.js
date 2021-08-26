/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author mjaurigue
 */

var dunning = dunning || {};
dunning.controller = dunning.controller || {};

dunning.controller.LetterAttachmentController = function LetterAttachmentController () {
  var ATTACH_STATEMENT = 'custrecord_3805_template_statement';
  var ATTACH_STATEMENT_OPEN_INV = 'custrecord_3805_template_open_only_st';
  var ATTACH_STATEMENT_DATE = 'custrecord_3805_statement_date';
  var ATTACH_STATEMENT_START_DATE = 'custrecord_3805_statement_start_date';
  var ATTACH_INVOICES = 'custrecord_3805_template_invoice';
  var ATTACH_INVOICES_OVERDUE = 'custrecord_3805_template_overdue_only';
  var CUSTOM_FORM = 'custrecord_3805_template_cust_form';

  function getInvoiceAttachments (isOnlyOverdue, evaluationResultView) {
    var invoiceAC = new dunning.controller.LetterAttachmentInvoiceController();
    return invoiceAC.getAttachments(isOnlyOverdue, evaluationResultView);
  }

  function getStatementAttachment (statementForm, evaluationResultView) {
    var statementPrinter = new dunning.app.CustomerStatementPrinter();
    return statementPrinter.printCustomerStatement(statementForm, evaluationResultView);
  }

  function getAttachmentConditions (templateId) {
    var attCondFields = [ATTACH_STATEMENT, ATTACH_STATEMENT_OPEN_INV,
      ATTACH_STATEMENT_DATE, ATTACH_STATEMENT_START_DATE,
      ATTACH_INVOICES, ATTACH_INVOICES_OVERDUE,
      CUSTOM_FORM];
    return ns_wrapper.api.field.lookupField('customrecord_3805_dunning_template', templateId, attCondFields);
  }

  this.retrieveAttachments = function retrieveAttachments (evaluationResultView) {
    var attachments = [];
    var attachmentConditions = getAttachmentConditions(evaluationResultView.templateId);

    // if attaching invoices is enabled
    if (attachmentConditions[ATTACH_INVOICES] == 'T') {
      var isOnlyOverdue = attachmentConditions[ATTACH_INVOICES_OVERDUE] == 'T';
      var invoiceAttachments = getInvoiceAttachments(isOnlyOverdue, evaluationResultView);
      attachments = attachments.concat(invoiceAttachments);
    }

    // If attaching statement is enabled
    if (attachmentConditions[ATTACH_STATEMENT] == 'T' &&
      evaluationResultView.sourceType == dunning.view.CUSTOMER) {
      var statementForm = new dunning.view.DunningCustomerStatementForm();
      statementForm.isOpenOnly = attachmentConditions[ATTACH_STATEMENT_OPEN_INV];
      statementForm.customformid = attachmentConditions[CUSTOM_FORM];
      statementForm.statementDate = attachmentConditions[ATTACH_STATEMENT_DATE];
      statementForm.statementStartDate = attachmentConditions[ATTACH_STATEMENT_START_DATE];

      var statement = getStatementAttachment(statementForm, evaluationResultView);
      attachments = attachments.concat(statement);
    }

    return attachments;
  };
};
