/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author mjaurigue
 */

var suite_l10n = suite_l10n || {};
suite_l10n.invoice = suite_l10n.invoice || {};

suite_l10n.invoice.DunningInvoiceAdaptor = function DunningInvoiceAdaptor () {
  var EVAL_SAVED_SEARCH = 'customsearch_3805_dl_eval_invoice_search';

  this.getDerivedInvoiceDetails = function getDerivedInvoiceDetails (invoiceID) {
    var details = {};

    var daysOverDueColumn = new nlobjSearchColumn('formulanumeric').setFormula('TRUNC(SYSDATE) - {duedate}');
    var sentDateCountdownColumn = new nlobjSearchColumn('formulanumeric').setFormula('TRUNC(SYSDATE) - {custbody_3805_last_dunning_letter_sent}');
    var filters = [new nlobjSearchFilter('internalid', null, 'anyof', invoiceID),
      new nlobjSearchFilter('mainline', null, 'is', 'T')];
    var columns = [daysOverDueColumn, sentDateCountdownColumn];
    var search = new ns_wrapper.Search('transaction');
    search.setSavedSearchId(EVAL_SAVED_SEARCH);
    search.addColumns(columns);
    search.addFilters(filters);
    var it = search.getIterator();

    if (it.hasNext()) {
      var res = it.next();
      details.computedDaysOverdue = res.getValue(daysOverDueColumn);
      details.sentDateCountdown = res.getValue(sentDateCountdownColumn);
    }

    return details;
  };

  this.getDunningLevelAssessmentInput = function getDunningLevelAssessmentInput (invoiceID) {
    var invoiceRec = nlapiLoadRecord('invoice', invoiceID);

    var assesorInput = new dunning.view.DunningLevelAssessmentInput();
    assesorInput.internalid = invoiceRec.getId();
    assesorInput.recordType = 'invoice';
    assesorInput.procedure = invoiceRec.getFieldValue('custbody_3805_dunning_procedure');
    assesorInput.level = invoiceRec.getFieldValue('custbody_3805_dunning_level');
    assesorInput.lastSentDate = invoiceRec.getFieldValue('custbody_3805_last_dunning_letter_sent');
    assesorInput.dunningPaused = invoiceRec.getFieldValue('custbody_3805_dunning_paused');

    assesorInput.amountDue = invoiceRec.getFieldValue('amountremaining');
    assesorInput.customer = invoiceRec.getFieldValue('entity');
    assesorInput.dunningManager = invoiceRec.getFieldValue('custbody_3805_dunning_manager');

    var derivedDetails = this.getDerivedInvoiceDetails(assesorInput.internalid);
    assesorInput.daysOverdue = derivedDetails.computedDaysOverdue;
    assesorInput.invoices = [{
      'internalid': invoiceRec.getId(),
      'daysOverdue': derivedDetails.computedDaysOverdue,
      'computedDaysOverdue': derivedDetails.computedDaysOverdue,
      'sentDateCountdown': derivedDetails.sentDateCountdown,
      'amountDue': invoiceRec.getFieldValue('amountremaining'),
      'dunningProcedure': invoiceRec.getFieldValue('custbody_3805_dunning_procedure'),
      'duedate': invoiceRec.getFieldValue('duedate')
    }];

    var customerRec = nlapiLoadRecord('customer', invoiceRec.getFieldValue('entity'));
    var custDPId = customerRec.getFieldValue('custentity_3805_dunning_procedure');

    var isOverride = false;

    if (custDPId) {
      var parentOverride = nlapiLookupField('customrecord_3805_dunning_procedure', custDPId, 'custrecord_3805_dp_override');
      isOverride = parentOverride === 'T';
    }
    assesorInput.parentDPOverride = isOverride;

    return assesorInput;
  };
};
