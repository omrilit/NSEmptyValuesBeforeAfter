/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */
var dao = dao || {};

dao.DunningBulkUpdateBatchDAO = function DunningBulkUpdateBatchDAO () {
  var RECORD_TYPE = 'customrecord_dunning_bulk_batch';
  var SUBSIDIARY = 'custrecord_3805_bulk_update_sub';
  var STATUS = 'custrecord_3805_bulk_update_status';
  var ALLOW_BY_EMAIL = 'custrecord_3805_bulk_update_allow_email';
  var ALLOW_BY_PRINT = 'custrecord_3805_bulk_update_allow_print';
  var DONT_SEND_TO_CUSTOMER = 'custrecord_3805_bulk_upd_dont_send_cust';
  var CREATE_DATE = 'created';
  var OWNER = 'owner';

  var PENDING = 1;
  var FIELD_MAP = {
    'id': 'internalid',
    'subsidiary': SUBSIDIARY,
    'status': STATUS,
    'allowByEmail': ALLOW_BY_EMAIL,
    'allowByPrint': ALLOW_BY_PRINT,
    'dontSendToCustomer': DONT_SEND_TO_CUSTOMER
  };

  var obj = new suite_l10n.dao.BasicDAO(RECORD_TYPE);

  obj.setFieldMap(FIELD_MAP);
  obj.setModelClass(dao.model.DunningBulkUpdateBatchModel);

  /**
   * Returns a model of the oldest unprocessed bulk update batch record
   */
  obj.retrieveNextBatch = function retrieveNextBatch () {
    var search = new ns_wrapper.Search(RECORD_TYPE);
    search.addFilter(STATUS, 'is', PENDING);
    search.addColumn(SUBSIDIARY);
    search.addColumn(STATUS);
    search.addColumn(ALLOW_BY_EMAIL);
    search.addColumn(ALLOW_BY_PRINT);
    search.addColumn(DONT_SEND_TO_CUSTOMER);
    search.addColumn(CREATE_DATE);
    search.addColumn(OWNER);

    search.setSort([{
      'name': CREATE_DATE
    }]);

    var rs = search.getIterator();
    var result;

    if (rs.hasNext()) {
      var curr = rs.next();

      result = new dao.model.DunningBulkUpdateBatchModel();
      result.id = curr.getId();
      result.subsidiary = curr.getValue(SUBSIDIARY);
      result.subsidiaryName = curr.getText(SUBSIDIARY);
      result.allowByEmail = curr.getValue(ALLOW_BY_EMAIL);
      result.allowByPrint = curr.getValue(ALLOW_BY_PRINT);
      result.dontSendToCustomer = curr.getValue(DONT_SEND_TO_CUSTOMER);
      result.status = curr.getValue(STATUS);
      result.owner = curr.getValue(OWNER);
    }

    return result;
  };

  return obj;
};

dao.model = dao.model || {};

dao.model.DunningBulkUpdateBatchModel = function DunningBulkUpdateBatchModel () {
  return {
    'id': null,
    'subsidiary': null,
    'subsidiaryName': null,
    'allowByEmail': null,
    'allowByPrint': null,
    'dontSendToCustomer': null,
    'status': null,
    'owner': null
  };
};
