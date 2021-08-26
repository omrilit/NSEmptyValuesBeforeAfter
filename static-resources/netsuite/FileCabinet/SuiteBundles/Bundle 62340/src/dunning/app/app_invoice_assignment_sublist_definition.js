/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.InvoiceAssignmentSubListDefinition = function InvoiceAssignmentSubListDefinition (input) {
  var dunningProcedure = input.dunningProcedureView;
  var translator = input.translator;
  var Search = ns_wrapper.Search;

  var RECORD_TYPE = 'invoice';
  var context = ns_wrapper.context();

  var parent = new suite_l10n.app.SubListTabDefinitionGenerator(input);
  parent.summaryField = 'internalid';
  parent.summaryType = 'count';
  parent.converterClass = 'dunning.app.InvoiceAssignmentSubListRowConverter';
  parent.tabListName = 'custpage_3805_invoice';
  parent.type = 'list';
  parent.label = 'dba.sublist.invoice';
  parent.addMarkAllButtons = true;
  parent.showResults = Boolean(dunningProcedure);
  parent.enablePagination = true;
  var request = input.request;
  parent.currPage = request['custpage_3805_invoice_curr_page'];
  parent.pageManager = 'dunning.bulkAssignCS.getPageManager(\'custpage_3805_invoice_curr_page\')';

  parent.subListFields = [{
    'name': 'id',
    'type': 'text',
    'label': translator.getString('dba.sublist.common.id'),
    'displayType': 'hidden'
  }, {

    'name': 'assign_dunning',
    'type': 'checkbox',
    'label': translator.getString('dba.sublist.common.assign_dunning')
  }, {

    'name': 'customer',
    'type': 'select',
    'source': 'customer',
    'label': translator.getString('dba.sublist.common.customer'),
    'displayType': 'inline'
  }, {

    'name': 'invoice',
    'type': 'select',
    'label': translator.getString('dba.sublist.invoice.invoice'),
    'source': 'invoice',
    'displayType': 'inline'
  }, {

    'name': 'totalamount',
    'type': 'currency',
    'label': translator.getString('dba.sublist.invoice.amount'),
    'displayType': 'inline'
  }, {

    'name': 'currency',
    'type': 'select',
    'label': translator.getString('dba.sublist.invoice.currency'),
    'source': 'currency',
    'displayType': 'inline'
  }, {

    'name': 'daysoverdue',
    'type': 'integer',
    'label': translator.getString('dba.sublist.invoice.days_overdue'),
    'displayType': 'inline'
  }, {

    'name': 'dunning_procedure',
    'type': 'select',
    'label': translator.getString('dba.sublist.common.dunning_procedure'),
    'source': 'customrecord_3805_dunning_procedure',
    'displayType': 'inline'
  }, {
    'name': 'dunning_level',
    'type': 'select',
    'label': translator.getString('dba.sublist.common.dunning_level'),
    'source': 'customrecord_3805_dunning_level',
    'displayType': 'inline'
  }, {

    'name': 'dunning_letter_sent',
    'type': 'text',
    'label': translator.getString('dba.sublist.common.last_letter_sent'),
    'displayType': 'inline'
  }, {

    'name': 'dunning_sending_type',
    'type': 'select',
    'label': translator.getString('dba.sublist.common.dunning_sending_type'),
    'displayType': 'inline',
    'source': 'customrecord_suite_l10n_variable'
  }];

  parent.getBaseSearch = function getBaseSearch () {
    var search = new Search(RECORD_TYPE);

    if (dunningProcedure.savedSearchInvoice) {
      search.setSavedSearchId(dunningProcedure.savedSearchInvoice);
    }

    var filters = [
      new nlobjSearchFilter('custbody_3805_dunning_procedure', null, 'noneof', [dunningProcedure.id]),
      new nlobjSearchFilter('type', null, 'is', 'CustInvc'),
      new nlobjSearchFilter('mainline', null, 'is', 'T'),
      new nlobjSearchFilter('amountremaining', null, 'greaterthan', 0),
      new nlobjSearchFilter('custentity_3805_dunning_procedure', 'customer', 'noneof', '@NONE@')
    ];

    if (context.isOW()) {
      filters.push(new nlobjSearchFilter('subsidiary', 'customer', 'anyof', dunningProcedure.subsidiaries));
    }

    if (dunningProcedure.locations) {
      filters.push(new nlobjSearchFilter('location', null, 'anyof', dunningProcedure.locations));
    }

    if (dunningProcedure.departments) {
      filters.push(new nlobjSearchFilter('department', null, 'anyof', dunningProcedure.departments));
    }

    if (dunningProcedure.classes) {
      filters.push(new nlobjSearchFilter('class', null, 'anyof', dunningProcedure.classes));
    }
    search.addFilters(filters);

    return search;
  };

  parent.getLineItemSearch = function getCustomerLineItemSearch () {
    var search = parent.getBaseSearch();

    var columnNames = [
      'entity',
      'tranid',
      'totalamount',
      'duedate',
      'daysoverdue',
      'name',
      'type',
      'custbody_3805_dunning_procedure',
      'custbody_3805_dunning_level',
      'custbody_3805_last_dunning_letter_sent',
      'custbody_3805_last_dunning_result'];

    if (context.hasMultipleCurrencies()) {
      columnNames.push('currency');
    }

    for (var i = 0; i < columnNames.length; i++) {
      search.addColumn(columnNames[i]);
    }
    search.addJoinColumn('custrecord_3805_dp_sending_type', 'custbody_3805_dunning_procedure');

    return search;
  };

  return parent;
};
