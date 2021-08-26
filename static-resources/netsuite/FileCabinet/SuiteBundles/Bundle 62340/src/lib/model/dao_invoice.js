/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var suite_l10n = suite_l10n || {};
suite_l10n.dao = suite_l10n.dao || {};

suite_l10n.dao.InvoiceDAO = function InvoiceDAO () {
  var RECORD_TYPE = 'invoice';

  var obj = new suite_l10n.dao.BasicDAO(RECORD_TYPE);
  var FIELD_MAP = {
    'name': 'name',
    'firstName': 'firstname',
    'lastName': 'lastname',
    'isPerson': 'isperson'
  };

  obj.setFieldMap(FIELD_MAP);

  var SEARCH_FILTERS = [
    new nlobjSearchFilter('type', null, 'is', 'invoice'),
    new nlobjSearchFilter('mainline', null, 'is', 'T')];
  obj.setRecordSearchFilters(SEARCH_FILTERS);

  obj.setModelClass(suite_l10n.model.Invoice);

  return obj;
};

suite_l10n.dao.InvoiceDAO.statusFilterValues = {
  Open: 'CustInvc:A',
  PaidInFull: 'CustInvc:B',
  PendingApproval: 'CustInvc:D',
  Rejected: 'CustInvc:E',
  Voided: 'CustInvc:V'
};
