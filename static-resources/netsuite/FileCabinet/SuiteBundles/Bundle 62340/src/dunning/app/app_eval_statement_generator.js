/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningEvalStatementGenerator = function DunningEvalStatementGenerator () {
  var SearchColumn = suite_l10n.view.SearchColumn;
  var SearchFilter = suite_l10n.view.SearchFilter;
  var SearchDef = suite_l10n.view.Search;
  var SearchBuilder = suite_l10n.app.SearchBuilder;

  var SUBSIDIARY_CURRENCY = 'currency';

  var DUNNING_PROCEDURE_SUBSIDIARY = 'custrecord_3805_dp_sub';

  var DUNNING_LEVEL = 'customrecord_3805_dunning_level';
  var DUNNING_LEVEL_PARENT = 'custrecord_3805_dl_procedure';
  var DUNNING_LEVEL_RULE = 'custrecord_3805_dl_rule';
  var FORMULA_NUMERIC = 'formulanumeric';
  var DUNNING_LEVEL_DAYS_OVERDUE = 'custrecord_3805_dl_days';

  var DUNNING_RULE_DAYS_OVERDUE = 'custrecord_3805_der_days_overdue';
  var DUNNING_RULE_AMOUNT = 'customrecord_3805_der_amount';
  var DUNNING_RULE_AMOUNT_PARENT = 'custrecord_3805_dera_parent';
  var DUNNING_RULE_AMOUNT_CURRENCY = 'custrecord_3805_dera_currency';
  var DUNNING_CACHED_STATEMENT = 'custrecord_3805_dra_cached_statement';
  var DUNNING_RULE_AMOUNT_VALUE = 'custrecord_3805_dera_amount';
  var DUNNING_RULE_AMOUNT_IS_DEFAULT = 'custrecord_3805_dera_default';

  function getLevelSearch (procIdList) {
    var searchDef = new SearchDef();
    searchDef.type = DUNNING_LEVEL;
    var searchFilter = new SearchFilter();
    searchFilter.name = DUNNING_LEVEL_PARENT;
    searchFilter.operator = 'anyof';
    searchFilter.value = procIdList;

    var parentColumn = new SearchColumn();
    parentColumn.name = DUNNING_LEVEL_PARENT;
    parentColumn.isSortColumn = true;

    var daysOverdueColumn = new SearchColumn();
    daysOverdueColumn.name = DUNNING_LEVEL_DAYS_OVERDUE;
    daysOverdueColumn.isSortColumn = true;
    daysOverdueColumn.isDescending = true;

    var nameColumn = new SearchColumn();
    nameColumn.name = FORMULA_NUMERIC;
    nameColumn.isSortColumn = true;
    nameColumn.isDescending = true;
    nameColumn.formula = 'TO_NUMBER({name})';

    var evalRuleColumn = new SearchColumn();
    evalRuleColumn.name = DUNNING_LEVEL_RULE;

    searchDef.filters = [searchFilter];
    searchDef.columns = [parentColumn, daysOverdueColumn, nameColumn, evalRuleColumn];

    var searchBuilder = new SearchBuilder(searchDef);
    return searchBuilder.buildSearch();
  }

  /**
   *
   * Given a list of procedures, first retrieve a list of levels, being able to retrieve the assigned rules to each level
   */
  this.getLevelList = function getLevelList (procIdList) {
    var search = getLevelSearch(procIdList);
    var iterator = search.getIterator();
    var levels = [];

    while (iterator.hasNext()) {
      var currLevel = iterator.next();
      var view = {
        rule: currLevel.getValue(DUNNING_LEVEL_RULE),
        procedure: currLevel.getValue(DUNNING_LEVEL_PARENT),
        level: currLevel.getValue(FORMULA_NUMERIC)
      };
      levels.push(view);
    }

    return levels;
  };

  function getRuleAmountSearch (ruleList, currencyList) {
    var searchDef = new SearchDef();
    searchDef.type = DUNNING_RULE_AMOUNT;

    var currencyFilter = new SearchFilter();
    currencyFilter.name = DUNNING_RULE_AMOUNT_CURRENCY;
    currencyFilter.operator = 'anyof';
    currencyFilter.value = currencyList;

    var ruleFilter = new SearchFilter();
    ruleFilter.name = DUNNING_RULE_AMOUNT_PARENT;
    ruleFilter.operator = 'anyof';
    ruleFilter.value = ruleList;

    var currencyColumn = new SearchColumn();
    currencyColumn.name = DUNNING_RULE_AMOUNT_CURRENCY;
    currencyColumn.isSortColumn = true;

    var columnNames = [
      DUNNING_CACHED_STATEMENT,
      DUNNING_RULE_AMOUNT_VALUE,
      DUNNING_RULE_AMOUNT_IS_DEFAULT,
      DUNNING_RULE_AMOUNT_PARENT];
    var columns = [currencyColumn];
    for (var i = 0; i < columnNames.length; i++) {
      var column = new SearchColumn();
      column.name = columnNames[i];
      columns.push(column);
    }

    // var statementColumn = new SearchColumn();
    // statementColumn.name = DUNNING_CACHED_STATEMENT;
    //
    // var amountColumn = new SearchColumn();
    // amountColumn.name = DUNNING_RULE_AMOUNT_VALUE;
    //
    // var defaultColumn = new SearchColumn();
    // defaultColumn.name = DUNNING_RULE_AMOUNT_IS_DEFAULT;
    //
    // var parentColumn = new SearchColumn();
    // parentColumn.name = DUNNING_RULE_AMOUNT_PARENT;

    var daysOverdueColumn = new SearchColumn();
    daysOverdueColumn.name = DUNNING_RULE_DAYS_OVERDUE;
    daysOverdueColumn.join = DUNNING_RULE_AMOUNT_PARENT;

    columns.push(daysOverdueColumn);

    searchDef.filters = [currencyFilter, ruleFilter];
    searchDef.columns = columns;
    // [currencyColumn, amountColumn, statementColumn, parentColumn];

    var searchBuilder = new SearchBuilder(searchDef);
    return searchBuilder.buildSearch();
  }

  /**
   *  returns a list of Dunning evaluation rules and its attached amounts
   *  Each amount is mapped to a currency
   */
  this.getRuleAmounts = function getRuleAmounts (ruleList, currencyList) {
    var obj = {
      defaultMap: null,
      dunningRuleMap: null
    };

    if (currencyList.length > 0) {
      var search = getRuleAmountSearch(ruleList, currencyList);
      var iterator = search.getIterator();
      var defaultMap = {};
      var dunningRuleMap = {};

      while (iterator.hasNext()) {
        var result = iterator.next();
        var view = {
          id: result.getId(),
          parent: result.getValue(DUNNING_RULE_AMOUNT_PARENT),
          currency: result.getValue(DUNNING_RULE_AMOUNT_CURRENCY),
          amount: result.getValue(DUNNING_RULE_AMOUNT_VALUE),
          isDefault: result.getValue(DUNNING_RULE_AMOUNT_IS_DEFAULT) === 'T',
          statement: result.getValue(DUNNING_CACHED_STATEMENT)
        };

        // if this is the default amount for the dunning eval rule, add it to the defaultMap object
        if (view.isDefault) {
          defaultMap[view.parent] = view;
        }
        var parent = view.parent;
        if (!dunningRuleMap[parent]) {
          dunningRuleMap[parent] = {
            amounts: {}
          };
          dunningRuleMap[parent].id = view.parent;
        }
        var dunningRule = dunningRuleMap[parent];
        var currency = view.currency;
        dunningRule.amounts[currency] = view;
      }
      obj.defaultMap = defaultMap;
      obj.dunningRuleMap = dunningRuleMap;
    }

    return obj;
  };

  /**
   * returns a list of Currencies grouped by Dunning Procedure
   */
  this.getCurrenciesByProcedure = function getCurrenciesByProcedure (procList) {
    var searchDef = new SearchDef();
    searchDef.type = 'customrecord_3805_dunning_procedure';

    var idFilter = new SearchFilter();
    idFilter.name = 'internalid';
    idFilter.operator = 'anyof';
    idFilter.value = procList;

    var currencyColumn = new SearchColumn();
    currencyColumn.name = SUBSIDIARY_CURRENCY;
    currencyColumn.join = DUNNING_PROCEDURE_SUBSIDIARY;

    searchDef.filters.push(idFilter);
    searchDef.columns.push(currencyColumn);

    var searchBuilder = new SearchBuilder(searchDef);
    var search = searchBuilder.buildSearch();
    var it = search.getIterator();

    var currencyUseView = {};
    var currencyList = [];

    while (it.hasNext()) {
      var res = it.next();
      var currency = res.getValue(SUBSIDIARY_CURRENCY, DUNNING_PROCEDURE_SUBSIDIARY);

      if (!!currency && currency.length > 0) {
        var procId = res.getId();
        if (!currencyUseView[procId]) {
          currencyUseView[procId] = [];
        }

        currencyUseView[procId].push(currency);

        if (currencyList.indexOf(currency) === -1) {
          currencyList.push(currency);
        }
      }
    }
    currencyUseView.currencyList = currencyList;
    return currencyUseView;
  };

  /**
   * returns a list of Dunning Eval Rules grouped by Dunning Procedure
   *
   * Given a list of levels, process each level such that other functions can easily retrieve the list of rules (per procedure)
   * as well as a simple array of rule ids
   */
  this.getRulesByProcedure = function getRuleUseView (levelList) {
    var ruleUseView = {};
    var ruleList = [];

    for (var i = 0; i < levelList.length; i++) {
      var level = levelList[i];
      var procedure = level.procedure;
      var rule = level.rule;
      if (ruleList.indexOf(rule) === -1) {
        ruleList.push(rule);
      }

      if (!ruleUseView[procedure]) {
        ruleUseView[procedure] = [];
      }

      if (ruleUseView[procedure].indexOf(rule) === -1) {
        ruleUseView[procedure].push(rule);
      }
    }
    ruleUseView.ruleList = ruleList;
    return ruleUseView;
  };

  /**
   * Given a map of Dunning Level Rule Amounts (categorized by rule then by currency),
   * retrieve a when statement that uses the rule's number of days overdue and it's amount given the specified currency
   */
  this.getDunningRuleStatement = function getDunningRuleStatement (ruleAmounts, rule, currency) {
    var whenStatement = '';
    if (ruleAmounts.dunningRuleMap[rule]) {
      var ruleAmount = ruleAmounts.dunningRuleMap[rule].amounts[currency];
      if (ruleAmount) {
        whenStatement = ruleAmount.statement;
      }
    }

    return whenStatement;
  };

  /**
   * Retrieves a CASE statement given the list of currencies and rules of a given procedure
   */
  this.getStatementsByCurrency = function getStatementsByCurrency (currenciesUsedByProc, rulesUsedByProc, ruleAmounts) {
    var statementsByCurrency = {};
    for (var j = 0; j < currenciesUsedByProc.length; j++) {
      var currency = currenciesUsedByProc[j];
      var statement = ['case'];
      var numberOfRules = rulesUsedByProc.length;
      for (var k = 0; k < numberOfRules; k++) {
        statement.push(this.getDunningRuleStatement(ruleAmounts, rulesUsedByProc[k], currency));
        statement.push('then', numberOfRules - (k + 1));
      }
      statement.push('end');
      statementsByCurrency[currency] = statement.join(' ');
    }
    return statementsByCurrency;
  };

  /**
   * assembles case statements for the passed list of procedures
   *
   */
  this.getEvaluationStatements = function getEvaluationStatements (procList) {
    nlapiLogExecution('DEBUG', 'procList', procList);
    var levelList = this.getLevelList(procList);
    nlapiLogExecution('DEBUG', 'levelList', JSON.stringify(levelList));
    var rulesByProcedure = this.getRulesByProcedure(levelList);
    var currenciesByProcedure = this.getCurrenciesByProcedure(procList);
    nlapiLogExecution('DEBUG', 'rulesByProcedure', JSON.stringify(rulesByProcedure));
    nlapiLogExecution('DEBUG', 'currenciesByProcedure', JSON.stringify(currenciesByProcedure));
    var ruleAmounts = this.getRuleAmounts(rulesByProcedure.ruleList, currenciesByProcedure.currencyList);
    nlapiLogExecution('DEBUG', 'ruleAmountView', JSON.stringify(ruleAmounts));

    var statements = {};
    for (var i = 0; i < procList.length; i++) {
      var currProc = procList[i];
      var rulesUsedByProc = rulesByProcedure[currProc];
      var currenciesUsedByProc = currenciesByProcedure[currProc];
      if (rulesUsedByProc && currenciesUsedByProc) {
        statements[currProc] = this.getStatementsByCurrency(currenciesUsedByProc, rulesUsedByProc, ruleAmounts);
      }
    }
    nlapiLogExecution('DEBUG', 'statementsByProcedureAndCurrency', JSON.stringify(statements));

    return statements;
  };
};
