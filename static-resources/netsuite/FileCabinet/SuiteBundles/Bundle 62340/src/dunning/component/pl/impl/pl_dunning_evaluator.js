/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunningPL = dunningPL || {};

dunningPL.DunningEvaluator = function DunningEvaluator () {
  var INTERNAL_ID = 'internalid';
  var DUE_DATE = 'duedate';
  var FORMULA_NUMERIC = 'formulanumeric';
  var LOCALIZATION_VAR_REC = 'customrecord_suite_l10n_variable';
  var LOCALIZATION_VAR_VALUE_FIELD = 'custrecord_3805_variable_value';
  var OPERATOR = 'operator';
  var CUSTOMER_OVERDUE_TAG = 'customer.daysoverdue';
  var INVOICE_OVERDUE_TAG = '(TRUNC(SYSDATE)-TRUNC({duedate}))';

  var SearchColumn = suite_l10n.view.SearchColumn;
  var SearchFilter = suite_l10n.view.SearchFilter;
  var SearchDef = suite_l10n.view.Search;
  var SearchBuilder = suite_l10n.app.SearchBuilder;
  var StringFormatter = suite_l10n.string.StringFormatter;
  var FieldAPI = ns_wrapper.api.field;

  var obj = {
    evaluateDunningLevel: evaluateDunningLevel
  };

  var SAVED_SEARCH_ID = 'customsearch_3805_dl_eval_invoice_search';

  function hasDunningProcedure (invoiceObject) {
    return invoiceObject.dunningProcedure && invoiceObject.dunningProcedure.length > 0;
  }

  function hasNoDueDate (res) {
    var dueDate = res.getValue(DUE_DATE);
    return !dueDate || dueDate.length === 0;
  }

  function getCurrency (customer) {
    var context = ns_wrapper.context();

    var currencyId = null;
    if (context.isOW()) {
      var customerDAO = new dao.DunningCustomerDAO();
      var customer = customerDAO.retrieve(customer);
      var subsidiaryDAO = new suite_l10n.dao.SubsidiaryDAO();
      var subsidiary = subsidiaryDAO.retrieve(customer.subsidiary);
      currencyId = subsidiary.currency;
    } else {
      nlapiLogExecution('DEBUG', ' ns_wrapper.api.config.Configuration');
      var config = new ns_wrapper.api.config.Configuration('companyinformation');
      currencyId = config.getFieldValue('basecurrency');
    }

    nlapiLogExecution('DEBUG', 'currencyId', currencyId);
    var currencyDAO = new suite_l10n.dao.CurrencyDAO();
    return currencyDAO.retrieve(currencyId);
  }

  function getEvaluationStatement (input) {
    var currency = getCurrency(input.customer);
    var dunningEvalStatementDAO = new dao.DunningEvaluationStatementDAO();
    var dunningEvalStatements = dunningEvalStatementDAO
      .retrieveByProcedureAndCurrency(input.procedure, currency.id);

    var statement;
    if (dunningEvalStatements.length > 0) {
      statement = dunningEvalStatements[0].statement;
    } else {
      statement = '';
      // generate statement here
    }
    return statement;
  }

  function getParentOverride (input) {
    var isOverride = false;
    switch (input.recordType) {
      case 'invoice':
        isOverride = input.parentDPOverride;
        break;
      case 'customer':
      default:
        isOverride = input.override;
    }
    return isOverride;
  }

  function isDunnable (type, isParentOverride, hasDP) {
    var dunnable = isParentOverride && hasDP;
    if (type === 'customer') {
      dunnable = !dunnable;
    }
    return dunnable;
  }

  function getInvoiceIDList (input) {
    var parentOverride = getParentOverride(input);
    var invoices = input.invoices;
    var idList = [];

    for (var i = 0; i < invoices.length; i++) {
      var invoice = invoices[i];
      var hasDP = hasDunningProcedure(invoice);
      if (isDunnable(input.recordType, parentOverride, hasDP)) {
        idList.push(invoice.internalid);
      }
    }

    return idList;
  }

  function getDunnableInvoiceList (input, procedure) {
    var dunnableInvoices = [];

    var invoiceIdList = getInvoiceIDList(input);

    if (invoiceIdList.length > 0) {
      var column = new SearchColumn();
      column.name = FORMULA_NUMERIC;

      var dunningProcedureOperator = FieldAPI.lookupField(LOCALIZATION_VAR_REC, procedure.operator, LOCALIZATION_VAR_VALUE_FIELD);

      var evaluationStatement = getEvaluationStatement(input);
      var statement = new StringFormatter(evaluationStatement);
      var operatorParameter = getParameterMapping(OPERATOR, dunningProcedureOperator);
      statement.replaceParameters(operatorParameter);

      if (input.recordType == 'invoice') {
        var overdueParameter = getParameterMapping(CUSTOMER_OVERDUE_TAG, INVOICE_OVERDUE_TAG);
        statement.replaceParameters(overdueParameter);
      }

      column.formula = statement.toString();

      nlapiLogExecution('DEBUG', 'getEvaluationStatement', JSON.stringify(column.formula));

      var idFilter = new SearchFilter();
      idFilter.name = INTERNAL_ID;
      idFilter.operator = 'anyof';
      idFilter.value = invoiceIdList;

      var mlFilter = new SearchFilter();
      mlFilter.name = 'mainline';
      mlFilter.operator = 'is';
      mlFilter.value = 'T';

      var postingFilter = new SearchFilter();
      postingFilter.name = 'posting';
      postingFilter.operator = 'is';
      postingFilter.value = 'T';

      var paidInFullFilter = new SearchFilter();
      paidInFullFilter.name = 'status';
      paidInFullFilter.operator = 'noneof';
      paidInFullFilter.value = [suite_l10n.dao.InvoiceDAO.statusFilterValues.PaidInFull];

      var searchDef = new SearchDef();
      searchDef.type = 'transaction';
      searchDef.id = SAVED_SEARCH_ID;
      searchDef.columns.push(column);
      searchDef.filters.push(idFilter);
      searchDef.filters.push(mlFilter);
      searchDef.filters.push(postingFilter);
      searchDef.filters.push(paidInFullFilter);

      var searchBuilder = new SearchBuilder(searchDef);
      var search = searchBuilder.buildSearch();

      var iterator = search.getIterator();

      while (iterator.hasNext()) {
        var res = iterator.next();
        var evaluatedLevel = res.getValue(FORMULA_NUMERIC);
        if (evaluatedLevel > -1 || hasNoDueDate(res)) {
          dunnableInvoices.push({
            id: res.getId(),
            level: evaluatedLevel
          });
        }
      }
    }
    return dunnableInvoices;
  }

  function getParameterMapping (key, value) {
    var parameter = {};
    parameter[key] = value;
    return parameter;
  }

  function getEvaluationResults (invoiceList) {
    var invoicesByLevel = {};
    var result = {
      level: -1,
      maxInvoices: []
    };

    // get max level here
    for (var i = 0; i < invoiceList.length; i++) {
      var currInvoice = invoiceList[i];
      if (currInvoice.level > result.level) {
        result.level = currInvoice.level;
      }
      invoicesByLevel[currInvoice.level] = invoicesByLevel[currInvoice.level] || [];
      invoicesByLevel[currInvoice.level].push(currInvoice.id);
    }

    // get max invoice list here
    result.maxInvoices = invoicesByLevel[result.level];
    nlapiLogExecution('DEBUG', 'invoicesByLevel', JSON.stringify(invoicesByLevel));
    return result;
  }

  /**
   * Given a dunning evaluation input object, return the evaluated dunning level
   */
  function evaluateDunningLevel (input) {
    var dunningLevels = new dao.DunningLevelDAO().retrieveByProcedure(input.procedure);
    var procedure = new dao.DunningProcedureDAO().retrieve(input.procedure);
    var invoiceList = getDunnableInvoiceList(input, procedure);
    var evalResult = getEvaluationResults(invoiceList);

    return dunningLevels[evalResult.level] || null;
  }

  return obj;
};

// eslint-disable-next-line no-unused-vars
function processRequest (request) {
  var processor = new dunningPL.DunningEvaluator();
  return processor.evaluateDunningLevel(request);
}
