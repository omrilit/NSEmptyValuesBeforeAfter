/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author mjaurigue
 */

var suite_l10n = suite_l10n || {};
suite_l10n.customer = suite_l10n.customer || {};

suite_l10n.customer.DunningCustomerAdaptor = function DunningCustomerAdaptor () {
  var EVAL_SAVED_SEARCH = 'customsearch_3805_dl_eval_invoice_search';

  this.getDunningLevelAssessmentInput = function getDunningLevelAssessmentInput (customerID) {
    var customerRecordWrapper = new ns_wrapper.Record('customer');
    var customerRec = customerRecordWrapper.loadRecord(customerID);

    var assesorInput = new dunning.view.DunningLevelAssessmentInput();
    assesorInput.internalid = customerRec.getId();
    assesorInput.recordType = 'customer';
    assesorInput.procedure = customerRec.getFieldValue('custentity_3805_dunning_procedure');
    assesorInput.level = customerRec.getFieldValue('custentity_3805_dunning_level');
    assesorInput.lastSentDate = customerRec.getFieldValue('custentity_3805_last_dunning_letter_sent');
    assesorInput.dunningPaused = customerRec.getFieldValue('custentity_3805_dunning_paused');
    assesorInput.daysOverdue = customerRec.getFieldValue('daysoverdue');
    assesorInput.customer = customerRec.getId();

    var procedureid = customerRec.getFieldValue('custentity_3805_dunning_procedure');
    var dpRecordWrapper = new ns_wrapper.Record('customrecord_3805_dunning_procedure');
    var dunningProcedureRec = dpRecordWrapper.loadRecord(procedureid);

    var daysOverdue = Math.min(1, getLowestLevelRuleDaysOverdue(dunningProcedureRec));

    assesorInput.override = dunningProcedureRec.getFieldValue('custrecord_3805_dp_override') === 'T';
    assesorInput.invoices = getInvoices(customerID, daysOverdue);
    assesorInput.dunningManager = customerRec.getFieldValue('custentity_3805_dunning_manager');

    return assesorInput;
  };

  function getLowestLevelRuleDaysOverdue (dunningProcedureRec) {
    var LEVEL_SUBLIST = 'recmachcustrecord_3805_dl_procedure';
    var DAYS_OVERDUE_FIELD = 'custrecord_3805_dl_days';
    return dunningProcedureRec.getLineItemValue(LEVEL_SUBLIST, DAYS_OVERDUE_FIELD, 1);
  }

  function getInvoices (customerId, daysOverdue) {
    var invoices = [];

    var daysOverDueColumn = new nlobjSearchColumn('formulanumeric').setFormula('TRUNC(SYSDATE) - {duedate}');
    var sentDateCountdownColumn = new nlobjSearchColumn('formulanumeric').setFormula('TRUNC(SYSDATE) - {custentity_3805_last_dunning_letter_sent}');

    var columns = [
      new nlobjSearchColumn('internalid'),
      new nlobjSearchColumn('amountremaining'),
      new nlobjSearchColumn('custbody_3805_dunning_procedure'),
      new nlobjSearchColumn('duedate'),
      new nlobjSearchColumn('daysoverdue'),
      daysOverDueColumn,
      sentDateCountdownColumn
    ];

    var filters = [
      [
        ['formulanumeric:TRUNC(SYSDATE) - {duedate}', 'greaterthanorequalto', daysOverdue],
        'or',
        ['duedate', 'isempty', null]
      ], 'and',
      ['customer.internalid', 'is', customerId], 'and',
      ['type', 'is', 'CustInvc'], 'and',
      ['mainline', 'is', 'T'], 'and',
      ['amountremaining', 'greaterthan', 0], 'and',
      ['isreversal', 'is', 'F'], 'and',
      ['posting', 'is', 'T']
    ];

    var search = new ns_wrapper.Search('transaction');
    search.setSavedSearchId(EVAL_SAVED_SEARCH);
    search.addColumns(columns);
    search.setFilterExpression(filters);

    var it = search.getIterator();

    if (it) {
      while (it.hasNext()) {
        var r = it.next();
        var invoiceData = getNewInvoiceData();
        invoiceData.internalid = r.getValue('internalid');
        invoiceData.daysOverdue = r.getValue('daysoverdue');
        invoiceData.duedate = r.getValue('duedate');
        invoiceData.amountDue = r.getValue('amountremaining');
        invoiceData.dunningProcedure = r.getValue('custbody_3805_dunning_procedure');
        invoiceData.computedDaysOverdue = r.getValue(daysOverDueColumn);
        invoiceData.sentDateCountdown = r.getValue(sentDateCountdownColumn);
        invoices.push(invoiceData);
      }
    }

    return invoices;
  }

  function getNewInvoiceData () {
    return {
      'internalid': null,
      'daysOverdue': null,
      'amountDue': null,
      'dunningProcedure': null,
      'duedate': null,
      'computedDaysOverdue': null
    };
  }
};
