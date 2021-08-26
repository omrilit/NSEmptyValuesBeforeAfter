/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */
var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningQueueSubListRowConverter = function DunningQueueSubListRowConverter () {
  var obj = new suite_l10n.app.AbstractSubListRowConverter();

  obj.convertToRow = function convertToRow (result) {
    var RECORD = 'RECORD';
    var DUNNING_EVALUATION_RESULT = 'customrecord_3805_dunning_eval_result';

    var columns = result.getAllColumns();

    var row = new dunning.view.DunningQueueSubListRow();
    row.id = result.getId();

    row.view_link = ns_wrapper.api.url.resolveUrl(RECORD, DUNNING_EVALUATION_RESULT, result.getId());

    row.customer = result.getText(columns[0]);
    row.related_entity = result.getValue(columns[1]);
    row.applies_to = result.getText(columns[2]);
    row.dunning_procedure = result.getText(columns[3]);
    row.dunning_level = result.getText(columns[4]);
    row.last_letter_sent = result.getValue(columns[5]);
    row.to_email = tfHandler(result.getValue(columns[6]));
    row.to_print = tfHandler(result.getValue(columns[7]));
    row.evaluation_date = result.getValue(columns[8]);

    return row;
  };

  function tfHandler (value) {
    switch (value) {
      case 'T' :
        return 'Yes';
      case 'F' :
      default :
        return 'No';
    }
  }

  return obj;
};
