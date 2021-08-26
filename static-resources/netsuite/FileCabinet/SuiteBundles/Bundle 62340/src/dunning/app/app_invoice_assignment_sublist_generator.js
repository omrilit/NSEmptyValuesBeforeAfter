/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.InvoiceAssignmentSubListGenerator = function InvoiceAssignmentSubListGenerator (dunningProcedure, translator) {
  var Field = suite_l10n.view.Field;
  var SubList = suite_l10n.view.SubList;
  var InvoiceRow = dunning.view.DunningAssignmentInvoiceSubListRow;

  function getSearch () {
    var recType = 'transaction';
    return dunningProcedure.savedSearchInvoice ? nlapiLoadSearch(recType, dunningProcedure.savedSearchInvoice) : nlapiCreateSearch(recType);
  }

  function getRestrictionFilters () {
    var filters = [
      new nlobjSearchFilter('custbody_3805_dunning_procedure', null, 'noneof', [dunningProcedure.id]),
      new nlobjSearchFilter('type', null, 'is', 'CustInvc'),
      new nlobjSearchFilter('mainline', null, 'is', 'T'),
      new nlobjSearchFilter('amountremaining', null, 'greaterthan', 0),
      new nlobjSearchFilter('custentity_3805_dunning_procedure', 'customer', 'noneof', '@NONE@')
    ];

    if (dunningProcedure.subsidiaries) {
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

    return filters;
  }

  function getInvoiceSubListValues (columnNames) {
    var search = getSearch();
    search.addFilters(getRestrictionFilters());
    search.addColumns(getColumns());

    var runSearch = search.runSearch();
    var results = [];
    var start = 0;
    var end = 1000;
    var newResults = [];
    do {
      newResults = runSearch.getResults(start, end) || [];
      start += 1000;
      end += 1000;
      var convertedResults = [];
      for (var i = 0; i < newResults.length; i++) {
        convertedResults.push(convertToRow(newResults[i]));
      }

      results = results.concat(convertedResults);
    } while (newResults.length >= 1000);

    return results;
  }

  function getRecordLink (record, id, name) {
    var link = [
      '<a href=\'javascript:dunning.bulkAssignCS.redirectToRecord("',
      record,
      '",',
      id,
      ')\'>',
      name,
      '</a>'];
    return link.join('');
  }

  function convertToRow (result) {
    var row = new InvoiceRow();

    row.id = result.getId();
    row.assign_dunning = 'F';
    row.customer = getRecordLink('customer', result.getValue('entity'), result.getText('entity'));
    row.invoice = getRecordLink('invoice', result.getId(), [result.getText('type'), result.getValue('tranid')]
      .join(' '));

    row.totalamount = result.getValue('totalamount');
    row.currency = result.getValue('currency');
    row.duedate = result.getValue('duedate');
    row.daysoverdue = result.getValue('daysoverdue');
    row.dunning_procedure = result.getValue('custbody_3805_dunning_procedure');
    row.dunning_level = result.getValue('custbody_3805_dunning_level');
    var lastResult = result.getValue('custbody_3805_last_dunning_result');
    row.dunning_letter_sent = result.getValue('custbody_3805_last_dunning_letter_sent') +
      ' ' +
      (lastResult ? getRecordLink('customrecord_3805_dunning_eval_result', lastResult, 'Dunning Letter') : '');
    row.dunning_sending_type = result
      .getValue('custrecord_3805_dp_sending_type', 'custbody_3805_dunning_procedure');

    return row;
  }

  function getColumns () {
    var columns = [];

    var basicColumnNameList = [
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

    for (var i = 0; i < basicColumnNameList.length; i++) {
      columns.push(new nlobjSearchColumn(basicColumnNameList[i]));
    }

    columns.push(new nlobjSearchColumn('custrecord_3805_dp_sending_type', 'custbody_3805_dunning_procedure'));

    return columns;
  }

  function getInvoiceSubListFields () {
    var idField = new Field();
    idField.name = 'id';
    idField.type = 'text';
    idField.label = translator.getString('dba.sublist.common.id');
    idField.displayType = 'hidden';

    var chkField = new Field();
    chkField.name = 'assign_dunning';
    chkField.type = 'checkbox';
    chkField.label = translator.getString('dba.sublist.common.assign_dunning');

    var custField = new Field();
    custField.name = 'customer';
    custField.type = 'text';
    custField.label = translator.getString('dba.sublist.common.customer');
    custField.displayType = 'inline';

    var transactionField = new Field();
    transactionField.name = 'invoice';
    transactionField.type = 'text';
    transactionField.label = translator.getString('dba.sublist.invoice.invoice');
    transactionField.displayType = 'inline';

    var amountField = new Field();
    amountField.name = 'totalamount';
    amountField.type = 'currency';
    amountField.label = translator.getString('dba.sublist.invoice.amount');
    amountField.displayType = 'inline';

    var currencyField = new Field();
    currencyField.name = 'currency';
    currencyField.type = 'select';
    currencyField.label = translator.getString('dba.sublist.invoice.currency');
    currencyField.displayType = 'inline';
    currencyField.source = 'currency';

    var dueDateField = new Field();
    dueDateField.name = 'duedate';
    dueDateField.type = 'date';
    dueDateField.label = translator.getString('dba.sublist.invoice.duedate');
    dueDateField.displayType = 'inline';

    var daysOverdueField = new Field();
    daysOverdueField.name = 'daysoverdue';
    daysOverdueField.type = 'integer';
    daysOverdueField.label = translator.getString('dba.sublist.invoice.days_overdue');
    daysOverdueField.displayType = 'inline';

    var dunningProcedureField = new Field();
    dunningProcedureField.name = 'dunning_procedure';
    dunningProcedureField.type = 'select';
    dunningProcedureField.label = translator.getString('dba.sublist.common.dunning_procedure');
    dunningProcedureField.source = 'customrecord_3805_dunning_procedure';
    dunningProcedureField.displayType = 'inline';

    var dunningLevelField = new Field();
    dunningLevelField.name = 'dunning_level';
    dunningLevelField.type = 'select';
    dunningLevelField.label = translator.getString('dba.sublist.common.dunning_level');
    dunningLevelField.source = 'customrecord_3805_dunning_level';
    dunningLevelField.displayType = 'inline';

    var lastLetterDateField = new Field();
    lastLetterDateField.name = 'dunning_letter_sent';
    lastLetterDateField.type = 'text';
    lastLetterDateField.label = translator.getString('dba.sublist.common.last_letter_sent');
    lastLetterDateField.displayType = 'inline';

    // this is a hack
    var sendingTypeField = new Field();
    sendingTypeField.name = 'dunning_sending_type';
    sendingTypeField.type = 'select';
    sendingTypeField.label = translator.getString('dba.sublist.common.dunning_sending_type');
    sendingTypeField.displayType = 'inline';
    sendingTypeField.source = 'customrecord_suite_l10n_variable';

    return [
      idField,
      chkField,
      custField,
      transactionField,
      amountField,
      currencyField,
      dueDateField,
      daysOverdueField,
      dunningProcedureField,
      dunningLevelField,
      lastLetterDateField,
      sendingTypeField];
  }

  function getInvoiceSubList () {
    var invoiceSubList = new SubList();
    invoiceSubList.name = 'custpage_3805_invoice_sl';
    invoiceSubList.label = translator.getString('dba.sublist.invoice');
    invoiceSubList.type = 'list';
    invoiceSubList.addMarkAllButtons = true;

    invoiceSubList.fields = getInvoiceSubListFields();

    if (dunningProcedure) {
      invoiceSubList.values = getInvoiceSubListValues();
    }

    return invoiceSubList;
  }

  return {
    getSubList: getInvoiceSubList
  };
};
