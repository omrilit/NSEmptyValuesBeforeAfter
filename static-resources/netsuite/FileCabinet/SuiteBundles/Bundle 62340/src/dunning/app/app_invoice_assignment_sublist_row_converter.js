/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.InvoiceAssignmentSubListRowConverter = function InvoiceAssignmentSubListRowConverter () {
  var InvoiceRow = dunning.view.DunningAssignmentInvoiceSubListRow;

  var obj = new dunning.app.DunningAssignmentSubListRowConverter();

  obj.convertToRow = function convertToRow (result) {
    var row = new InvoiceRow();

    row.id = result.getId();
    row.assign_dunning = 'F';

    row.customer = result.getValue('entity');
    row.invoice = result.getId();

    row.totalamount = result.getValue('totalamount');
    row.currency = result.getValue('currency');
    row.duedate = result.getValue('duedate');
    row.daysoverdue = result.getValue('daysoverdue');

    obj.setDunningFields(row, result, 'custbody');
    return row;
  };

  return obj;
};
