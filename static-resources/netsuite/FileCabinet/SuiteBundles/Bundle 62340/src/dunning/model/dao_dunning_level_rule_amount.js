/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dao = dao || {};

dao.DunningLevelRuleAmountDAO = function DunningLevelRuleAmountDAO () {
  var RECORD_TYPE = 'customrecord_3805_der_amount';
  var CURRENCY_FIELD = 'custrecord_3805_dera_currency';
  var PARENT_RULE_FIELD = 'custrecord_3805_dera_parent';
  var DEFAULT_FIELD = 'custrecord_3805_dera_default';

  var obj = new suite_l10n.dao.BasicDAO(RECORD_TYPE);
  var FIELD_MAP = {
    'parent': 'custrecord_3805_dera_parent',
    'currency': 'custrecord_3805_dera_currency',
    'statement': 'custrecord_3805_dra_cached_statement',
    'amount': 'custrecord_3805_dera_amount',
    'totalOverdueBalance': 'custrecord_3805_dera_total_overdue_amt',
    'default': 'custrecord_3805_dera_default',
    'systemGenerated': 'custrecord_3805_dera_system_gen'
  };

  obj.setFieldMap(FIELD_MAP);
  obj.setModelClass(dunning.model.DunningLevelRuleAmount);

  obj.retrieveByParent = function retrieveByParent (ruleList, extraFilters) {
    var filters = [new nlobjSearchFilter(PARENT_RULE_FIELD, null, 'anyof', ruleList)];
    filters = filters.concat(extraFilters);
    return obj.retrieveWithFilters(filters);
  };

  obj.retrieveByParentAndCurrency = function retrieveByParentAndCurrency (ruleList, currencyId) {
    var filters = [new nlobjSearchFilter(CURRENCY_FIELD, null, 'is', currencyId)];
    return obj.retrieveByParent(ruleList, filters);
  };

  obj.retrieveDefaultByRuleIds = function retrieveDefaultByRuleIds (ruleList) {
    var filters = [new nlobjSearchFilter(DEFAULT_FIELD, null, 'is', 'T')];
    return obj.retrieveByParent(ruleList, filters);
  };

  return obj;
};
