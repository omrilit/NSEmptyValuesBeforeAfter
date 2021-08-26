/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

/**
 * @param {boolean} isOnlyOverdue
 * @param {dunning.view.DunningEvaluationResult} evaluationResultView
 * @returns {dunning.view.DunningInvoiceForm[]}
 */
dunning.app.evaluateInvoiceAttachments = function (isOnlyOverdue, evaluationResultView) {
  var columns = [
    new nlobjSearchColumn('customform')
  ];
  var filters = [
    new nlobjSearchFilter('type', null, 'is', 'CustInvc'),
    new nlobjSearchFilter('mainline', null, 'is', 'T'),
    new nlobjSearchFilter('isreversal', null, 'is', 'F'),
    new nlobjSearchFilter('posting', null, 'is', 'T'),
    new nlobjSearchFilter('amountremaining', null, 'greaterthan', 0),
    new nlobjSearchFilter('internalid', 'customer', 'is', evaluationResultView.customer)
  ];

  if (isOnlyOverdue) {
    filters.push(new nlobjSearchFilter('daysoverdue', null, 'greaterthan', 0));
    filters.push(new nlobjSearchFilter('internalid', null, 'anyof', evaluationResultView.invoices));
  }

  var search = nlapiSearchRecord('transaction', null, filters, columns);

  return (search || []).map(function (r) {
    return {
      id: r.getId(),
      customformid: r.getValue(columns[0])
    };
  });
};
