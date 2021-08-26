/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.ProcedureCurrencyManager = function ProcedureCurrencyManager (input) {
  var SUB_FIELD = 'custrecord_3805_dp_sub';
  var LEVEL_SUBLIST = 'recmachcustrecord_3805_dl_procedure';
  var RULE_FIELD = 'custrecord_3805_dl_rule';

  function isDelete () {
    return input.type == 'delete';
  }

  function isContextSupported () {
    var SUPPORTED_CONTEXTS = [
      'userinterface',
      'webservices',
      'suitelet',
      'userevent',
      'workflow',
      'custommassupdate',
      'portlet'];
    return SUPPORTED_CONTEXTS.indexOf(input.context) !== -1;
  }

  this.getSubsidiaryCurrencies = function getSubsidiaryCurrencies (record) {
    var currencies = [];
    if (record) {
      var subsidiaryDAO = new suite_l10n.dao.SubsidiaryDAO();
      var subIds = record.getFieldValues(SUB_FIELD);
      var subsidiaries = subsidiaryDAO.retrieveByIdList(subIds);

      nlapiLogExecution('DEBUG', 'subIds()', subIds.join());

      for (var i = 0; i < subsidiaries.length; i++) {
        var subsidiaryCurrency = subsidiaries[i].currency;
        if (currencies.indexOf(subsidiaryCurrency) === -1) {
          currencies.push(subsidiaryCurrency);
        }
      }
    }
    return currencies;
  };

  /**
   * Given a dunning procedure record, retrieve the list of supported base currencies by joining to the subsidiary record
   */
  this.getSupportedCurrencies = function getSupportedCurrencies (record) {
    var currencies = [];

    if (input.isOneWorld) {
      currencies = this.getSubsidiaryCurrencies(record);
    } else if (!input.isOneWorld) {
      var config = new ns_wrapper.api.config.Configuration('companyinformation');
      currencies.push(config.getFieldValue('basecurrency'));
    }

    return currencies;
  };

  /**
   * Retrieve a list of rules currently assigned to the dunning procedure
   */
  this.getAssignedRules = function getAssignedRules () {
    var record = input.newRecord;
    var levelCount = record.getLineItemCount(LEVEL_SUBLIST);
    var rules = [];

    for (var i = 1; i <= levelCount; i++) {
      rules.push(record.getLineItemValue(LEVEL_SUBLIST, RULE_FIELD, i));
    }

    nlapiLogExecution('DEBUG', 'levelCount()', levelCount);

    return rules;
  };

  this.addCurrencytoRules = function addCurrencytoRules (rules, currencies) {
    nlapiLogExecution('DEBUG', 'currencies()', currencies);
    nlapiLogExecution('DEBUG', 'rules()', rules);

    if (rules.length > 0) {
      var ruleManager = new dunning.app.DunningLevelRuleManager();
      var newRuleAmounts = [];
      for (var i = 0; i < currencies.length; i++) {
        var currency = currencies[i];
        newRuleAmounts = newRuleAmounts.concat(ruleManager.addCurrencySupport(rules, currency));
      }
    }
  };

  /**
   * This will begin adding support for new currencies given the constructor parameter
   */
  this.addSupportForNewCurrencies = function addSupportForNewCurrencies () {
    nlapiLogExecution('DEBUG', 'isContextSupported()', JSON.stringify(input));
    nlapiLogExecution('DEBUG', 'isContextSupported()', isContextSupported());

    // attempt to support all currencies regardless of previous support
    if (isContextSupported() && !isDelete()) {
      var record = input.newRecord;
      var currencies = this.getSupportedCurrencies(record);
      var rules = this.getAssignedRules();
      this.addCurrencytoRules(rules, currencies);
    }
  };
};
