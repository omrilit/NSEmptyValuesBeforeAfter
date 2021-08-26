/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dao = dao || {};

dao.DunningEvaluationResultDAO = function () {
  var RECORD_TYPE = 'customrecord_3805_dunning_eval_result';
  var obj = new suite_l10n.dao.BasicDAO(RECORD_TYPE);
  obj.create = create;
  obj.retrieve = retrieve;

  var Record = ns_wrapper.Record;
  var DunningEvaluationResult = dunning.model.DunningEvaluationResult;

  var fieldMap = {
    'id': 'internalid',
    'procedure': 'custrecord_3805_evaluation_result_dp',
    'level': 'custrecord_3805_evaluation_result_level',
    'entity': 'custrecord_3805_evaluation_result_entity',
    'assignedToCustomer': 'custrecord_3805_eval_result_for_customer',
    'invoices': 'custrecord_3805_eval_result_invoice_list',
    'recipient': 'custrecord_3805_eval_result_recipient',
    'subject': 'custrecord_3805_eval_result_subject',
    'message': 'custrecord_3805_eval_result_message',
    'dunningManager': 'custrecord_3805_eval_result_manager_id',
    'templateId': 'custrecord_3805_eval_result_template',
    'sourceType': 'custrecord_3805_eval_result_source_type',
    'customer': 'custrecord_3805_evaluation_result_cust',
    'letterType': 'custrecord_3805_eval_result_letter_type'
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

  function castToModel (source, isSearchResult) {
    var model = new DunningEvaluationResult();
    var getFunction = isSearchResult ? 'getValue' : 'getFieldValue';

    for (var i in fieldMap) {
      model[i] = source[getFunction](fieldMap[i]);
    }

    if (!isSearchResult) {
      postProcessModelRecord(model, source);
    }
    model.id = source.getId();
    return model;
  }

  function create (dunningEvaluationResult) {
    var record = new Record(RECORD_TYPE);
    var fieldDefs = createFieldDefinitions(dunningEvaluationResult);
    record.setRecordFields(fieldDefs);
    record.setFieldValues('custrecord_3805_eval_result_invoice_list', dunningEvaluationResult.invoices);
    return record.saveRecord();
  }

  function retrieve (id) {
    var record = new Record(RECORD_TYPE, id);

    return castToModel(record);
  }

  obj.postProcessModelRecord = postProcessModelRecord;
  function postProcessModelRecord (model, record) {
    model.invoices = record.getFieldValues('custrecord_3805_eval_result_invoice_list');
  }

  return obj;
};
