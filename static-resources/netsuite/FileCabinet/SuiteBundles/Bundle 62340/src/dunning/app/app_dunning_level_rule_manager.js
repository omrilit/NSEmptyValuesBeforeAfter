/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningLevelRuleManager = function DunningLevelRuleManager () {
  var DUNNING_LEVEL_RULE = 'customrecord_3805_dunning_eval_rule';
  var DAYS_OVERDUE = 'custrecord_3805_der_days_overdue';

  var DunningLevelStatementGenerator = dunning.app.DunningLevelStatementGenerator;
  var DunningLevelStatementGeneratorInput = dunning.view.DunningLevelStatementGeneratorInput;

  var ruleAmountDAO;
  this.getRuleAmountDAO = function getRuleAmountDAO () {
    if (!ruleAmountDAO) {
      ruleAmountDAO = new dao.DunningLevelRuleAmountDAO();
    }
    return ruleAmountDAO;
  };

  var levelStatementGenerator;
  this.getLevelStatementGenerator = function getLevelStatementGenerator () {
    if (!levelStatementGenerator) {
      levelStatementGenerator = new DunningLevelStatementGenerator();
    }
    return levelStatementGenerator;
  };

  /**
   * Filter the given list of rules that currently support the given currency
   */
  this.getRulesWithExistingSupport = function (dunningLevelRuleList, currency) {
    var ruleList = [];
    var ruleAmountDAO = this.getRuleAmountDAO();
    var ruleAmountList = ruleAmountDAO.retrieveByParentAndCurrency(dunningLevelRuleList, currency);
    for (var i = 0; i < ruleAmountList.length; i++) {
      var currRuleAmount = ruleAmountList[i];
      if (ruleList.indexOf(currRuleAmount.parent) === -1) {
        ruleList.push(currRuleAmount.parent);
      }
    }

    return ruleList;
  };

  /**
   * Returns a currencyConverter given the ruleCurrency as the source currency and the given newCurrency as the target
   *
   */
  var ruleConverters = {};
  this.getCurrencyConverter = function getCurrencyConverter (ruleCurrency, newCurrency) {
    var input = new suite_l10n.view.CurrencyConverterSetting();
    input.sourceCurrency = ruleCurrency;
    input.targetCurrency = newCurrency;
    var date = new ns_wrapper.Date();
    date.setDate(0);
    input.effectiveDate = date.toString();

    if (!ruleConverters[ruleCurrency]) {
      ruleConverters[ruleCurrency] = {};
    }
    if (!ruleConverters[ruleCurrency][newCurrency]) {
      ruleConverters[ruleCurrency][newCurrency] = new ns_wrapper.CurrencyConverter(input);
    }

    return ruleConverters[ruleCurrency][newCurrency];
  };

  var daysOverduePerRule = {};

  function getRuleDaysOverdue (rule) {
    if (!daysOverduePerRule[rule]) {
      daysOverduePerRule[rule] = ns_wrapper.api.field.lookupField(DUNNING_LEVEL_RULE, rule, DAYS_OVERDUE);
    }
    return daysOverduePerRule[rule];
  }

  /**
   * Create a new rule amount given the defaultRuleAmount and the currency.
   * Amount will always be computed and the results of this function will always be a system generated Rule Amount
   */
  this.createRuleAmount = function createRuleAmount (defaultRuleAmount, currency) {
    var model = new dunning.model.DunningLevelRuleAmount();

    model.parent = defaultRuleAmount.parent;
    model.currency = currency;
    model.systemGenerated = 'T';
    var ruleCurrency = defaultRuleAmount.currency;
    var converter = this.getCurrencyConverter(ruleCurrency, currency);
    model.amount = converter.convert(defaultRuleAmount.amount);
    model.totalOverdueBalance = converter.convert(defaultRuleAmount.overdueBalance);

    var statementGenerator = this.getLevelStatementGenerator();

    var input = new DunningLevelStatementGeneratorInput();
    input.daysOverdue = getRuleDaysOverdue(model.parent);
    input.amount = model.amount;
    input.overdueBalance = model.totalOverdueBalance;

    model.statement = statementGenerator.generateStatement(input);

    var ruleAmountDAO = this.getRuleAmountDAO();
    return ruleAmountDAO.create(model);
  };

  /**
   * Retrieve a list of default rule amounts for each given dunning level rule
   */
  this.getDefaultRuleAmounts = function getDefaultRuleAmounts (dunningLevelRuleList) {
    var defaultRuleAmountMap = {};

    var ruleAmountDAO = this.getRuleAmountDAO();
    var ruleAmounts = ruleAmountDAO.retrieveDefaultByRuleIds(dunningLevelRuleList);

    for (var i = 0; i < ruleAmounts.length; i++) {
      var currRule = ruleAmounts[i];
      defaultRuleAmountMap[currRule.parent] = currRule;
    }

    return defaultRuleAmountMap;
  };

  /**
   * This function will add support for the given currency to each of the dunningLevelRules passed
   * This will return a list of ids for new records
   */
  this.addCurrencySupport = function addCurrencySupport (dunningLevelRuleList, currency) {
    var skipList = this.getRulesWithExistingSupport(dunningLevelRuleList, currency);
    var defaultRuleAmountList = this.getDefaultRuleAmounts(dunningLevelRuleList);
    var createList = [];

    for (var i = 0; i < dunningLevelRuleList.length; i++) {
      var currRule = dunningLevelRuleList[i];
      if (skipList.indexOf(dunningLevelRuleList[i]) === -1) {
        createList.push(this.createRuleAmount(defaultRuleAmountList[currRule], currency));
      }
    }

    return createList;
  };
};
