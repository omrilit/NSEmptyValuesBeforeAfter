/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.CustomerAssignmentSubListDefinition = function CustomerAssignmentSubListDefinition (input) {
  var dunningProcedure = input.dunningProcedureView;
  var translator = input.translator;
  var Search = ns_wrapper.Search;

  var RECORD_TYPE = 'customer';

  var context = ns_wrapper.context();

  var parent = new suite_l10n.app.SubListTabDefinitionGenerator(input);
  parent.summaryField = 'internalid';
  parent.summaryType = 'count';
  parent.converterClass = 'dunning.app.CustomerAssignmentSubListRowConverter';
  parent.tabListName = 'custpage_3805_customer';
  parent.type = 'list';
  parent.label = 'dba.sublist.customer';
  parent.addMarkAllButtons = true;
  parent.showResults = Boolean(dunningProcedure);
  parent.enablePagination = true;
  var request = input.request;
  parent.currPage = request['custpage_3805_customer_curr_page'];
  parent.pageManager = 'dunning.bulkAssignCS.getPageManager(\'custpage_3805_customer_curr_page\')';

  parent.getBaseSearch = function getBaseSearch () {
    var search = new Search(RECORD_TYPE);

    if (dunningProcedure.savedSearchCustomer) {
      search.setSavedSearchId(dunningProcedure.savedSearchCustomer);
    }

    search.addFilter('custentity_3805_dunning_procedure', 'noneof', [dunningProcedure.id]);
    search.addFilter('isinactive', 'is', 'F');

    if (context.isOW()) {
      if (dunningProcedure.subsidiaries) {
        search.addFilter('subsidiary', 'anyof', dunningProcedure.subsidiaries);
      }
    }

    return search;
  };

  parent.getLineItemSearch = function getCustomerLineItemSearch () {
    var search = parent.getBaseSearch();

    if (context.isOW()) {
      search.addColumn('subsidiary');
    }
    var columnNames = [
      'entityid',
      'custentity_3805_dunning_procedure',
      'custentity_3805_dunning_level',
      'custentity_3805_last_dunning_letter_sent',
      'custentity_3805_last_dunning_result'];

    for (var i = 0; i < columnNames.length; i++) {
      search.addColumn(columnNames[i]);
    }
    search.addJoinColumn('custrecord_3805_dp_sending_type', 'custentity_3805_dunning_procedure');
    return search;
  };

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
    'label': translator.getString('dba.sublist.common.customer'),
    'source': 'customer',
    'displayType': 'inline'
  }, {

    'name': 'subsidiary',
    'type': 'select',
    'label': translator.getString('dba.sublist.customer.subsidiary'),
    'source': 'subsidiary',
    'displayType': context.isOW() ? 'inline' : 'hidden'
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

  return parent;
};
