/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

/**
 * @constructor
 * @extends {suite_l10n.app.BaseConverter<dunning.model.DunningTemplate, dunning.view.DunningTemplate>}
 */
dunning.app.DunningTemplateConverter = function () {
  return new suite_l10n.app.BaseConverter({
    model: dunning.model.DunningTemplate,
    view: dunning.view.DunningTemplate,
    modelViewMap: {
      id: 'id',
      name: 'name',
      description: 'description',
      attachStatement: 'attachStatement',
      attachCopiesOfInvoices: 'attachCopiesOfInvoices',
      onlyOpenInvoicesOnTheStatement: 'onlyOpenInvoicesOnTheStatement',
      onlyOverdueInvoices: 'onlyOverdueInvoices',
      statementDate: 'statementDate',
      statementStartDate: 'statementStartDate'
    },
    recordModelMap: {
      id: 'internalid',
      name: 'name',
      description: 'custrecord_3805_template_desc',
      attachStatement: 'custrecord_3805_template_statement',
      attachCopiesOfInvoices: 'custrecord_3805_template_invoice',
      onlyOpenInvoicesOnTheStatement: 'custrecord_3805_template_open_only_st',
      onlyOverdueInvoices: 'custrecord_3805_template_overdue_only',
      statementDate: 'custrecord_3805_statement_date',
      statementStartDate: 'custrecord_3805_statement_start_date'
    }
  });
};
