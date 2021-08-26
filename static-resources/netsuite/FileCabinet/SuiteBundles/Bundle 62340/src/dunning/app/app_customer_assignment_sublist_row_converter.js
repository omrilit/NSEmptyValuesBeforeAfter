/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.CustomerAssignmentSubListRowConverter = function CustomerAssignmentSubListRowConverter () {
  var CustomerRow = dunning.view.DunningAssignmentCustomerSubListRow;

  var obj = new dunning.app.DunningAssignmentSubListRowConverter();

  obj.convertToRow = function convertToRow (result) {
    var row = new CustomerRow();
    row.id = result.getId();
    row.customer = result.getId();// obj.getRecordLink(customerLinkInput);
    row.assign_dunning = 'F';
    row.subsidiary = result.getValue('subsidiary');

    obj.setDunningFields(row, result, 'custentity');
    return row;
  };

  return obj;
};
