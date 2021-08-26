/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author fkyao
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 */

var dunning = dunning || {};
dunning.priority = dunning.priority || {};

dunning.priority.SUBLIST_CUSTOMER = 'recmachcustrecord_3805_dunning_cust_priority';
dunning.priority.SUBLIST_INVOICE = 'recmachcustrecord_3805_dunning_invc_priority';
dunning.priority.DUNNING_PROCEDURE = 'customrecord_3805_dunning_procedure';

/**
 * @param {string} type Sublist internal id
 */
dunning.priority.clientPageInit = function clientLineInit (type) {
  var SublistAPI = ns_wrapper.api.sublist;
  var Record = ns_wrapper.Record;

  disableFields(dunning.priority.SUBLIST_CUSTOMER);
  disableFields(dunning.priority.SUBLIST_INVOICE);

  function disableFields (sublistID) {
    var count = SublistAPI.getLineItemCount(sublistID);

    if (count != 0) return;

    var record = new Record(dunning.priority.DUNNING_PROCEDURE, null);
    var sublistFields = record.getAllFields();

    if (!sublistFields) return;

    for (var i = 0; i < sublistFields.length; i++) {
      SublistAPI.disableLineItemField(sublistID, sublistFields[i], true);
    }
  }
};
