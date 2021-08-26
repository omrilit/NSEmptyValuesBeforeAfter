/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.component = dunning.component || {};
dunning.component.ue = dunning.component.ue || {};

dunning.component.ue.DunningLevelRuleUE = function DunningLevelRuleUE () {
  var DAYS_OVERDUE = 'custrecord_3805_der_days_overdue';
  var DLR_AMOUNT_TYPE = 'customrecord_3805_der_amount';
  var SUBLIST_PARENT_ID = 'custrecord_3805_dera_parent';
  var SUBLIST_ID = 'recmachcustrecord_3805_dera_parent';
  var SYSTEM_GENERATED = 'custrecord_3805_dera_system_gen';
  var STATEMENT = 'custrecord_3805_dra_cached_statement';
  var AMOUNT = 'custrecord_3805_dera_amount';
  var CURRENCY = 'custrecord_3805_dera_currency';
  var IS_DEFAULT = 'custrecord_3805_dera_default';
  var OVERDUE_BALANCE = 'custrecord_3805_dera_total_overdue_amt';

  var MESSAGE_ACCESS_ERROR = 'l10n.accessForDDandAccountant';

  var getLineItemCount = ns_wrapper.api.sublist.getLineItemCount;
  var getLineItemValue = ns_wrapper.api.sublist.getLineItemValue;
  var setLineItemValue = ns_wrapper.api.sublist.setLineItemValue;
  var getFieldValue = ns_wrapper.api.field.getFieldValue;
  var RecordAPI = ns_wrapper.api.record;
  var ChildRemoverSetting = suite_l10n.view.ChildRemoverSetting;
  var ChildRecordRemover = suite_l10n.app.ChildRecordRemover;
  var DunningLevelStatementGeneratorInput = dunning.view.DunningLevelStatementGeneratorInput;
  var DunningLevelStatementGenerator = dunning.app.DunningLevelStatementGenerator;
  var StatementUpdaterScheduler = dunning.app.StatementUpdaterScheduler;

  var defaultLineIndex;
  this.getDefaultLine = function getDefaultLine () {
    if (!defaultLineIndex) {
      var lineItemCount = getLineItemCount(SUBLIST_ID);
      for (var i = 1; i <= lineItemCount; i++) {
        if (getLineItemValue(SUBLIST_ID, IS_DEFAULT, i) === 'T') {
          defaultLineIndex = i;
          break;
        }
      }
    }
    return defaultLineIndex;
  };

  this.getPrecedingMonth = function getPrecedingMonth () {
    var date = new ns_wrapper.Date();
    date.setDate(0);
    return date.toString();
  };

  var currencyConverters = {};
  this.getCurrencyConverter = function getCurrencyConverter (currency) {
    if (!currencyConverters[currency]) {
      var defaultCurrency = getLineItemValue(SUBLIST_ID, CURRENCY, this.getDefaultLine());
      var input = new suite_l10n.view.CurrencyConverterSetting();
      input.sourceCurrency = defaultCurrency;
      input.targetCurrency = currency;
      input.effectiveDate = this.getPrecedingMonth();
      nlapiLogExecution('AUDIT', 'input', JSON.stringify(input));

      // If the exchange rate did not exist during the previous month
      // NetSuite automatically returns the current exchangeRate
      currencyConverters[currency] = new ns_wrapper.CurrencyConverter(input);
    }

    return currencyConverters[currency];
  };

  this.getStatementGeneratorInput = function getStatementGeneratorInput (index, daysOverdue) {
    var input = new DunningLevelStatementGeneratorInput();
    input.daysOverdue = daysOverdue;
    if (getLineItemValue(SUBLIST_ID, SYSTEM_GENERATED, index) === 'T') {
      var defaultLine = this.getDefaultLine();
      var defaultAmount = getLineItemValue(SUBLIST_ID, AMOUNT, defaultLine);
      var defaultOverdueBalance = getLineItemValue(SUBLIST_ID, OVERDUE_BALANCE, defaultLine);
      var lineCurrency = getLineItemValue(SUBLIST_ID, CURRENCY, index);
      var converter = this.getCurrencyConverter(lineCurrency);

      input.amount = converter.convert(defaultAmount);
      input.overdueBalance = converter.convert(defaultOverdueBalance);
      setLineItemValue(SUBLIST_ID, AMOUNT, index, input.amount);
      setLineItemValue(SUBLIST_ID, OVERDUE_BALANCE, index, input.overdueBalance);
    } else {
      input.amount = getLineItemValue(SUBLIST_ID, AMOUNT, index);
      input.overdueBalance = getLineItemValue(SUBLIST_ID, OVERDUE_BALANCE, index);
    }

    return input;
  };

  this.generateWhenStatements = function generateWhenStatements () {
    var lineItemCount = getLineItemCount(SUBLIST_ID);
    var daysOverdue = getFieldValue(DAYS_OVERDUE);
    var levelStatementGenerator = new DunningLevelStatementGenerator();

    for (var i = 1; i <= lineItemCount; i++) {
      var input = this.getStatementGeneratorInput(i, daysOverdue);
      var whenStatement = levelStatementGenerator.generateStatement(input);
      setLineItemValue(SUBLIST_ID, STATEMENT, i, whenStatement);
    }
  };

  this.removeRuleAmounts = function removeRuleAmounts () {
    var setting = new ChildRemoverSetting();
    setting.childRecordType = DLR_AMOUNT_TYPE;
    setting.parentFieldId = SUBLIST_PARENT_ID;
    setting.subListId = SUBLIST_ID;
    setting.record = RecordAPI.getNewRecord();

    var childRemover = new ChildRecordRemover(setting);
    childRemover.removeChildren();
  };

  this.beforeSubmit = function beforeSubmit (type) {
    if (type == 'delete') {
      var dlDAO = new dao.DunningLevelDAO();
      var levels = dlDAO.retrieveByRuleId(RecordAPI.getRecordId());
      if (levels.length === 0) {
        this.removeRuleAmounts();
      }
    } else {
      this.generateWhenStatements();
    }
  };

  this.afterSubmit = function afterSubmit () {
    var scheduler = new StatementUpdaterScheduler();
    var id = RecordAPI.getRecordId();
    scheduler.scheduleUpdaterByRules([id]);
  };

  this.beforeLoad = function beforeLoad (type) {
    loadMessageObjects();
    if (type == 'create' || type == 'edit') {
      var roleAssesor = new dunning.app.DunningRoleAssessor();
      if (!roleAssesor.isDunningDirector()) {
        throw nlapiCreateError('FOR_DUNNING_DIRECTOR_ACCOUNTANT_ADMIN_ACCESS_ONLY', messages[MESSAGE_ACCESS_ERROR]);
      }
    }
  };

  var messages;

  function loadMessageObjects () {
    if (!messages) {
      var stringCodes = [MESSAGE_ACCESS_ERROR];

      var messageLoaderContextCreator = new suite_l10n.app.MessageLoaderContextCreator();
      var messageLoaderContext = messageLoaderContextCreator.getLoaderContext(stringCodes);
      var messageLoader = new suite_l10n.app.ServerSideMessageLoader(messageLoaderContext);
      messages = messageLoader.getMessageMap();
    }
  }
};

dunning.component.ue.dlrUE = new dunning.component.ue.DunningLevelRuleUE();
