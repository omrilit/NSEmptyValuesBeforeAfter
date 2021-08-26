/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dao = dao || {};

dao.DunningEvaluationStatementDAO = function DunningEvaluationStatementDAO () {
  var RECORD_TYPE = 'customrecord_3805_dunning_eval_statement';
  var PROCEDURE_FIELD = 'custrecord_3805_des_procedure';
  var CURRENCY_FIELD = 'custrecord_3805_des_currency';

  var obj = new suite_l10n.dao.BasicDAO(RECORD_TYPE);
  var FIELD_MAP = {
    'currency': 'custrecord_3805_des_currency',
    'statement': 'custrecord_3805_des_statement',
    'dunningProcedure': 'custrecord_3805_des_procedure'
  };

  obj.setFieldMap(FIELD_MAP);
  obj.setModelClass(dunning.model.DunningEvaluationStatement);

  obj.retrieveByProcedure = function (procedureId) {
    var filter = new nlobjSearchFilter(PROCEDURE_FIELD, null, 'is', procedureId);
    return obj.retrieveWithFilters([filter]);
  };

  obj.retrieveByProcedures = function (procedureIds) {
    var filter = new nlobjSearchFilter(PROCEDURE_FIELD, null, 'anyof', procedureIds);
    return obj.retrieveWithFilters([filter]);
  };

  obj.retrieveByProcedureAndCurrency = function retrieveByProcedureAndCurrency (procedureId, currencyId) {
    var filters = [new nlobjSearchFilter(PROCEDURE_FIELD, null, 'is', procedureId),
      new nlobjSearchFilter(CURRENCY_FIELD, null, 'is', currencyId)];

    return obj.retrieveWithFilters(filters);
  };

  return obj;
};
