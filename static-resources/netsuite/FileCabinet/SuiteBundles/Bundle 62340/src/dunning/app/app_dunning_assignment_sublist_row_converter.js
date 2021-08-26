/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningAssignmentSubListRowConverter = function DunningAssignmentSubListRowConverter () {
  var obj = new suite_l10n.app.AbstractSubListRowConverter();

  var DUNNING_REDIRECT_SCRIPT = 'dunning.bulkAssignCS.redirectToRecord';

  obj.getRecordLink = function getRecordLink (input) {
    var linkInput = new suite_l10n.view.RowConverterLink();

    linkInput.script = [DUNNING_REDIRECT_SCRIPT, '("', input.recordType, '",', input.recordId, ')'].join('');
    linkInput.text = input.text;

    return obj.getJSLink(linkInput);
  };

  obj.getCustomerLinkInput = function getCustomerLinkInput (id, text) {
    var customerLinkInput = new dunning.view.DunningAssignmentRecordRowLink();
    customerLinkInput.recordType = 'customer';
    customerLinkInput.recordId = id;
    customerLinkInput.text = text;

    return customerLinkInput;
  };

  obj.setDunningFields = function setDunningFields (row, result, fieldPrefix) {
    row.dunning_procedure = result.getValue(fieldPrefix + '_3805_dunning_procedure');
    row.dunning_level = result.getValue(fieldPrefix + '_3805_dunning_level');
    var lastResult = result.getValue(fieldPrefix + '_3805_last_dunning_result');
    var dunningResultLinkInput = {
      'recordType': 'customrecord_3805_dunning_eval_result',
      'recordId': lastResult,
      'text': 'Dunning Letter'
    };
    var dunningResultLink = obj.getRecordLink(dunningResultLinkInput);
    row.dunning_letter_sent = result.getValue(fieldPrefix + '_3805_last_dunning_letter_sent') +
      (lastResult ? ' ' + dunningResultLink : '');
    row.dunning_sending_type = result.getValue('custrecord_3805_dp_sending_type', fieldPrefix +
      '_3805_dunning_procedure');
  };

  return obj;
};
