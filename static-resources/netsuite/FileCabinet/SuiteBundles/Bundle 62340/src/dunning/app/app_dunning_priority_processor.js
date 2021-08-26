/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author mmoya
 */

var dunning = dunning || {};
dunning.priority = dunning.priority || {};

dunning.priority.RECORD_ID = 'customrecord_3805_dunning_proc_priority';
dunning.priority.VARTYPE_DUNNING_SOURCE = 'dunning_source';
dunning.priority.DUNNING_SOURCE_CUSTOMER = 'customer';
dunning.priority.FIELD_ID = 'internalid';
dunning.priority.FIELD_CUSTOMER_PRIORITY = 'custrecord_3805_dunning_cust_priority';
dunning.priority.FIELD_INVOICE_PRIORITY = 'custrecord_3805_dunning_invc_priority';
dunning.priority.SUBLIST_CUSTOMER_PRIORITY = 'recmachcustrecord_3805_dunning_cust_priority';
dunning.priority.SUBLIST_INVOICE_PRIORITY = 'recmachcustrecord_3805_dunning_invc_priority';

dunning.priority.DunningPriorityProcessor = function DunningPriorityProcessor () {
  function computeDunningPriority (view) {
    var dunningPriority = new dunning.view.DunningProcedurePriority();

    // find the dunning priority list record
    dunningPriority.priorityListId = getPriorityListId();

    // determine the sublist ID and which field to populate
    var sublistID = '';

    if (isDunningSourceCustomer(view.dunningSource)) {
      sublistID = dunning.priority.SUBLIST_CUSTOMER_PRIORITY;
      dunningPriority.priorityFieldName = dunning.priority.FIELD_CUSTOMER_PRIORITY;
    } else {
      sublistID = dunning.priority.SUBLIST_INVOICE_PRIORITY;
      dunningPriority.priorityFieldName = dunning.priority.FIELD_INVOICE_PRIORITY;
    }

    // determine dunning procedure priority based on source
    var priorityListRec =
      new ns_wrapper.Record(dunning.priority.RECORD_ID, dunningPriority.priorityListId);
    var lineItems = priorityListRec.getLineItems(sublistID);

    dunningPriority.priorityNumber = (lineItems.length + 1);

    return dunningPriority;
  }

  function isDunningSourceCustomer (dpType) {
    var LocalizationVariableList = suite_l10n.variable.LocalizationVariableList;
    var sourceTypeVarList = new LocalizationVariableList(dunning.priority.VARTYPE_DUNNING_SOURCE);
    var sourceType = sourceTypeVarList.getValueById(dpType);

    return sourceType == dunning.priority.DUNNING_SOURCE_CUSTOMER;
  }

  function getPriorityListId () {
    var priorityListId = -1;

    var search = new ns_wrapper.Search(dunning.priority.RECORD_ID);
    search.addColumn(dunning.priority.FIELD_ID);

    var priorityIterator = search.getIterator();

    if (priorityIterator.hasNext()) {
      var priorityListRS = priorityIterator.next(); // expect 1 result only
      priorityListId = priorityListRS.getId();
    }

    return priorityListId;
  }

  return {
    computeDunningPriority: computeDunningPriority
  };
};
