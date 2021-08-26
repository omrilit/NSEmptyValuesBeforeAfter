/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * @author mjaurigue
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.CustomerFormHandler = function CustomerFormHandler () {
  this.getDunningRecipientIDs = function getDunningRecipientIDs (loadSubList) {
    var recipientIDs = [];

    var source = getSource(loadSubList);
    var count = source.getLineItemCount('recmachcustrecord_3805_dunning_recipient_cust');

    for (var i = 1; i <= count; i++) {
      recipientIDs.push(source.getLineItemValue('recmachcustrecord_3805_dunning_recipient_cust', 'custrecord_3805_dunning_recipient_cont', i));
    }

    return recipientIDs;
  };

  function getSource (loadSubList) {
    var source;
    var hasNoSubList = ns_wrapper.api.sublist.getLineItemCount('recmachcustrecord_3805_dunning_recipient_cust') === -1;

    if (loadSubList && hasNoSubList) {
      var recordAPI = ns_wrapper.api.record;
      source = new ns_wrapper.Record(recordAPI.getRecordType(), recordAPI.getRecordId());
    } else {
      source = ns_wrapper.api.sublist;
    }

    return source;
  }
};
