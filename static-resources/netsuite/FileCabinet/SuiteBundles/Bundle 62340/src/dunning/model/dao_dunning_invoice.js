/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dao = dao || {};

dao.DunningInvoiceDAO = function DunningInvoiceDAO () {
  var obj = new suite_l10n.dao.InvoiceDAO();
  var parentFieldMap = obj.getFieldMap();

  var FIELD_MAP = {
    'id': 'internalid',
    'dunningProcedureId': 'custbody_3805_dunning_procedure',
    'dunningLevelId': 'custbody_3805_dunning_level',
    'dunningManager': 'custbody_3805_dunning_manager',
    'sendByEmail': 'custbody_3805_dunning_letters_toemail',
    'sendByPrint': 'custbody_3805_dunning_letters_toprint'
  };

  obj.mergeFieldMaps(FIELD_MAP, parentFieldMap);
  obj.setFieldMap(FIELD_MAP);
  obj.setModelClass(dunning.model.DunningInvoice);

  return obj;
};
