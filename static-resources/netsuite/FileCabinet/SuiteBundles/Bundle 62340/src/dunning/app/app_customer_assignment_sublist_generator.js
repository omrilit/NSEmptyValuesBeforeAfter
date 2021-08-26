/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.CustomerAssignmentSubListGenerator = function CustomerAssignmentSubListGenerator (dunningProcedure, translator) {
  var Field = suite_l10n.view.Field;
  var SubList = suite_l10n.view.SubList;
  var CustomerRow = dunning.view.DunningAssignmentCustomerSubListRow;

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
    var row = new CustomerRow();
    row.id = result.getId();
    row.customer = getRecordLink('customer', result.getId(), [
      result.getValue('entityid'),
      result.getValue('altname') || ''].join(' '));
    row.assign_dunning = 'F';
    row.subsidiary = result.getValue('subsidiary');
    row.dunning_procedure = result.getValue('custentity_3805_dunning_procedure');
    row.dunning_level = result.getValue('custentity_3805_dunning_level');

    var lastResult = result.getValue('custentity_3805_last_dunning_result');
    row.dunning_letter_sent = result.getValue('custentity_3805_last_dunning_letter_sent') +
      ' ' +
      (lastResult ? getRecordLink('customrecord_3805_dunning_eval_result', lastResult, 'Dunning Letter') : '');
    row.dunning_sending_type = result
      .getValue('custrecord_3805_dp_sending_type', 'custentity_3805_dunning_procedure');
    return row;
  }

  function getColumns () {
    var columnNames = [
      'entityid',
      'altname',
      'subsidiary',
      'custentity_3805_dunning_procedure',
      'custentity_3805_dunning_level',
      'custentity_3805_last_dunning_letter_sent',
      'custentity_3805_last_dunning_result'];
    var columns = [];

    for (var i = 0; i < columnNames.length; i++) {
      columns.push(new nlobjSearchColumn(columnNames[i]));
    }

    columns.push(new nlobjSearchColumn('custrecord_3805_dp_sending_type', 'custentity_3805_dunning_procedure'));

    return columns;
  }

  function getCustomerSubListFields () {
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

    var subsidiaryField = new Field();
    subsidiaryField.name = 'subsidiary';
    subsidiaryField.type = 'select';
    subsidiaryField.label = translator.getString('dba.sublist.customer.subsidiary');
    subsidiaryField.source = 'subsidiary';
    subsidiaryField.displayType = 'inline';

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
      subsidiaryField,
      dunningProcedureField,
      dunningLevelField,
      lastLetterDateField,
      sendingTypeField];
  }

  function getSearch () {
    var recType = 'customer';
    return dunningProcedure.savedSearchCustomer
      ? nlapiLoadSearch(recType, dunningProcedure.savedSearchCustomer)
      : nlapiCreateSearch(recType);
  }

  function getRestrictionFilters () {
    var filters = [new nlobjSearchFilter('custentity_3805_dunning_procedure', null, 'noneof', [dunningProcedure.id])];
    if (dunningProcedure.subsidiaries) {
      filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', dunningProcedure.subsidiaries));
    }
    return filters;
  }

  /**
   * For conversion to ns_wrapper.Search
   */
  function getCustomerSubListValues () {
    // use dao here later
    var search = getSearch();
    search.addColumns(getColumns());
    search.addFilters(getRestrictionFilters());

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

  function getCustomerSubList () {
    var customerSubList = new SubList();
    customerSubList.name = 'custpage_3805_customer_sl';
    customerSubList.label = translator.getString('dba.sublist.customer');
    customerSubList.type = 'list';
    customerSubList.addMarkAllButtons = true;
    customerSubList.fields = getCustomerSubListFields();

    if (dunningProcedure) {
      customerSubList.values = getCustomerSubListValues();
    }

    return customerSubList;
  }

  return {
    getSubList: getCustomerSubList
  };
};
