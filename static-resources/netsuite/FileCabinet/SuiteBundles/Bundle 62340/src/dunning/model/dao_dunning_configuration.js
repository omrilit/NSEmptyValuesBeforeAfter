/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dao = dao || {};

dao.DunningConfigurationDAO = function DunningConfigurationDAO () {
  var RECORD_TYPE = 'customrecord_3805_dunning_config';
  var SUBSIDIARY_FIELD_ID = 'custrecord_3805_config_subsidiary';
  var FIELD_MAP = {
    'id': 'internalid',
    'subsidiary': SUBSIDIARY_FIELD_ID,
    'autoAssignForCustomers': 'custrecord_3805_auto_assign_customer',
    'autoAssignForInvoices': 'custrecord_3805_auto_assign_invoice'
  };

  var obj = new suite_l10n.dao.BasicDAO(RECORD_TYPE);

  obj.setFieldMap(FIELD_MAP);
  obj.setModelClass(dunning.model.DunningConfiguration);

  obj.retrieveBySubsidiary = function retrieveBySubsidiary (subsidiaryId) {
    var filters = [new nlobjSearchFilter(SUBSIDIARY_FIELD_ID, null, 'is', subsidiaryId)];
    var results = obj.retrieveWithFilters(filters);
    var config;
    if (results.length > 0) {
      config = results[0];
    } else {
      // return a config model with default settings if configuration record does not exist for the subsidiary
      config = new dunning.model.DunningConfiguration();
    }

    return config;
  };

  return obj;
};
