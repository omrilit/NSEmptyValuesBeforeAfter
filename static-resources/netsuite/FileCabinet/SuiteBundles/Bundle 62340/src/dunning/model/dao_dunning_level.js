/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dao = dao || {};

dao.DunningLevelDAO = function DunningLevelDAO () {
  var Search = ns_wrapper.Search;
  var Record = ns_wrapper.Record;
  var RECORD_TYPE = 'customrecord_3805_dunning_level';

  var obj = {
    retrieveByProcedure: retrieveByProcedure,
    retrieveByProceduresIds: retrieveByProceduresIds,
    retrieveAll: retrieveAll,
    retrieve: retrieve,
    retrieveByRuleId: retrieveByRuleId,
    remove: remove,
    create: create,
    sortByDaysOverdue: sortByDaysOverdue
  };

  var fieldMap = {
    'id': 'internalid',
    'name': 'name',
    'procedureID': 'custrecord_3805_dl_procedure',
    'ruleID': 'custrecord_3805_dl_rule',
    'currencies': 'custrecord_3805_dl_currencies',
    'defaultCurrency': 'custrecord_3805_dl_default_currency',
    'minimalInvoiceAmount': 'custrecord_3805_dl_mia',
    'totalOverdueBalance': 'custrecord_3805_dl_tob',
    'daysOverdue': 'custrecord_3805_dl_days',
    'currency': 'custrecord_3805_dl_currency',
    'minOutstandingAmount': 'custrecord_3805_dl_amount',
    'templateId': 'custrecord_3805_dl_template_group'

  };

  function createFieldDefinitions (model) {
    var fields = [];

    for (var i in model) {
      fields.push({
        'id': fieldMap[i],
        'value': model[i]
      });
    }

    return fields;
  }

  function removeInternalIdFromFieldDefinition (fieldDefinitions) {
    var mappedFldDefs = fieldDefinitions.map(function (fldDef) {
      return fldDef.id.toLowerCase();
    });

    var index = mappedFldDefs.indexOf('internalid');

    if (index > -1) {
      fieldDefinitions.splice(index, 1);
    }

    return fieldDefinitions;
  }

  function retrieveByProcedure (procedureId) {
    var filters = [new nlobjSearchFilter('custrecord_3805_dl_procedure', null, 'is', procedureId)];
    return retrieveAll(filters);
  }

  function castToModel (source, isSearchResult) {
    var getFunction = isSearchResult ? 'getValue' : 'getFieldValue';
    var model = new dunning.model.Level();

    for (var i in fieldMap) {
      model[i] = source[getFunction](fieldMap[i]);
    }

    if (isSearchResult) {
      model.currency = source[getFunction]('custrecord_3805_dp_currency', 'custrecord_3805_dl_procedure');
    }

    model.id = source.getId();
    return model;
  }

  function getColumns () {
    var columns = [
      'internalid',
      'name',
      'custrecord_3805_dl_procedure',
      'custrecord_3805_dl_rule',
      'custrecord_3805_dl_currencies',
      'custrecord_3805_dl_default_currency',
      'custrecord_3805_dl_mia',
      'custrecord_3805_dl_tob',
      'custrecord_3805_dl_days',
      'custrecord_3805_dl_currency',
      'custrecord_3805_dl_amount',
      'custrecord_3805_dl_template_group'
    ];
    var columnObjects = [];
    for (var i = 0; i < columns.length; i++) {
      columnObjects.push(new nlobjSearchColumn(columns[i]));
    }
    columnObjects.push(new nlobjSearchColumn('custrecord_3805_dp_currency', 'custrecord_3805_dl_procedure'));

    var sortColumn = new nlobjSearchColumn('formulanumeric');
    sortColumn.setFormula('TO_NUMBER({name})');
    sortColumn.setSort();
    columnObjects.push(sortColumn);

    return columnObjects;
  }

  function retrieveAll (filters) {
    var search = new Search(RECORD_TYPE);
    search.addColumns(getColumns());
    search.addFilters(filters);
    var rs = search.getIterator();
    var returnValues = [];

    while (rs.hasNext()) {
      returnValues.push(castToModel(rs.next(), true));
    }
    return returnValues;
  }

  function retrieve (id) {
    var record = new Record(RECORD_TYPE, id);
    return castToModel(record);
  }

  function retrieveByRuleId (ruleIdList) {
    return retrieveAll([new nlobjSearchFilter('custrecord_3805_dl_rule', null, 'anyof', ruleIdList)]);
  }

  function retrieveByProceduresIds (procsIdList) {
    return retrieveAll([new nlobjSearchFilter('custrecord_3805_dl_procedure', null, 'anyof', procsIdList)]);
  }

  function sortByDaysOverdue (level1, level2) {
    if (parseInt(level1.daysOverdue) < parseInt(level2.daysOverdue)) {
      return -1;
    }
    if (parseInt(level1.daysOverdue) > parseInt(level2.daysOverdue)) {
      return 1;
    }
    return 0;
  }

  function remove (id) {
    new Record(RECORD_TYPE, id).deleteRecord(id);
  }

  function create (dunningLevel) {
    var record = new Record(RECORD_TYPE);
    var fieldDefs = createFieldDefinitions(dunningLevel);
    fieldDefs = removeInternalIdFromFieldDefinition(fieldDefs);
    record.setRecordFields(fieldDefs);
    return record.saveRecord();
  }

  return obj;
};
