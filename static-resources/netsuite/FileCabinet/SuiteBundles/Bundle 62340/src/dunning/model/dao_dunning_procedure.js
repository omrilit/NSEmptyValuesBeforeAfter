/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dao = dao || {};

dao.DunningProcedureDAO = function DunningProcedureDAO () {
  var RECORD_TYPE = 'customrecord_3805_dunning_procedure';
  var obj = new suite_l10n.dao.BasicDAO(RECORD_TYPE);
  var FIELD_MAP = {
    'id': 'internalid',
    'name': 'name',
    'description': 'custrecord_3805_dp_description',
    'dunningSource': 'custrecord_3805_dp_type',
    'sendingSchedule': 'custrecord_3805_dp_sending_type',
    'daysBetweenSendingLetters': 'custrecord_3805_dp_days_between',
    'disableMinimumDunningInterval': 'custrecord_3805_dp_allow_multi_sending',
    'subsidiaries': 'custrecord_3805_dp_sub',
    'savedSearchCustomer': 'custrecord_3805_dp_cust_search',
    'savedSearchInvoice': 'custrecord_3805_dp_invoice_search',
    'savedSearchCustomerText': 'custrecord_3805_dp_cust_search',
    'savedSearchInvoiceText': 'custrecord_3805_dp_invoice_search',
    'weighting': 'custrecord_3805_dp_weighting',
    'allowOverride': 'custrecord_3805_dp_override',
    'departments': 'custrecord_3805_dp_dept',
    'classes': 'custrecord_3805_dp_classes',
    'locations': 'custrecord_3805_dp_locations',
    'assignAutomatically': 'custrecord_3805_dp_autoassign',
    'dunningManager': 'custrecord_3805_default_dunning_manager',
    'operator': 'custrecord_3805_dp_operator'

  };

  obj.setFieldMap(FIELD_MAP);
  obj.setModelClass(dunning.model.DunningProcedure);

  obj.postProcessModelRecord = function postProcessModelRecord (model, record) {
    model.departments = record.getFieldValues('custrecord_3805_dp_dept');
    model.classes = record.getFieldValues('custrecord_3805_dp_classes');
    model.locations = record.getFieldValues('custrecord_3805_dp_locations');
    model.subsidiaries = record.getFieldValues('custrecord_3805_dp_sub');
    model.savedSearchCustomerText = record.getFieldText('custrecord_3805_dp_cust_search');
    model.savedSearchInvoiceText = record.getFieldText('custrecord_3805_dp_invoice_search');

    return model;
  };

  obj.retrieveByTypeId = function retrieveByTypeId (typeId) {
    return obj.retrieveWithFilters([new nlobjSearchFilter('custrecord_3805_dp_type', null, 'is', typeId),
      new nlobjSearchFilter('isinactive', null, 'is', 'F')]);
  };

  obj.retrieveByIds = function retrieveByIds (Ids) {
    return obj.retrieveByIdList(Ids);
  };

  return obj;
};
