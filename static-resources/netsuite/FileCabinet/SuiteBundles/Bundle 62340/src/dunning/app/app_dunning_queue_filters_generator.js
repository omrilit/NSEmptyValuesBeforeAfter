/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author mjaurigue
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningQueueFiltersGenerator = function DunningQueueFiltersGenerator (formType, translator, definition) {
  var DunningProcedureDAO = dao.DunningProcedureDAO;
  var SelectOption = suite_l10n.view.SelectOption;
  var FieldGroup = suite_l10n.view.FieldGroup;
  var Button = suite_l10n.view.Button;
  var Field = suite_l10n.view.Field;
  var LocalizationVariableList = suite_l10n.variable.LocalizationVariableList;
  var Help = suite_l10n.view.Help;

  function createOption (value, text) {
    var option = new SelectOption();
    option.value = value;
    option.text = text;
    return option;
  }

  /* Retrieves procedures */
  function getDunningProcedureOptions () {
    var dpDao = new DunningProcedureDAO();
    var dpModels = dpDao.retrieveAll();
    var options = [createOption('', '')];
    for (var i = 0; i < dpModels.length; i++) {
      var dp = dpModels[i];
      options.push(createOption(dp.id, dp.name));
    }

    return options;
  }

  /* Retrieves dunning source types */
  function getSourceOptions () {
    var dunningSourceVariables = new LocalizationVariableList('dunning_source');
    var values = dunningSourceVariables.getAllVariables();
    var options = [createOption('', '')];

    for (var i in values) {
      options.push(createOption(values[i].id, i));
    }
    return options;
  }

  /* Retrieves the max dunning level and populates the list based on it */
  function getLevelOptions () {
    var SYS_PARAMS = 'syspar_type';
    var MAX_DUNNING_LEVEL = 'MAX_DUNNING_LEVEL';

    var options = [createOption('', '')];

    var levelList = new LocalizationVariableList(SYS_PARAMS);
    var maxLevel = levelList.getValue(MAX_DUNNING_LEVEL);

    maxLevel = maxLevel || 0;

    for (var ctr = 1; ctr <= maxLevel; ctr++) {
      options.push(createOption(ctr, ctr));
    }
    return options;
  }

  function createHelp (text, isInline) {
    var help = new Help();
    help.text = text;
    help.isInline = isInline || false;
    return help;
  }

  function createFilterFields () {
    var filterFields = [];

    var inlineHelp = new Field();
    inlineHelp.name = 'custpage_3805_dunning_qf_inline_help';
    inlineHelp.type = 'help';
    inlineHelp.displayType = 'normal';
    inlineHelp.label = translator.getString('dqf.filter.inlineHelp');
    filterFields.push(inlineHelp);

    var CUSTOMER_FIELD = 'custpage_3805_dunning_qf_cust';
    var customerField = new Field();
    customerField.name = CUSTOMER_FIELD;
    customerField.value = getFilterFieldValue(CUSTOMER_FIELD);
    customerField.type = 'select';
    customerField.source = 'customer';
    customerField.label = translator.getString('dqf.filter.customer');
    customerField.help = createHelp(translator.getString('dqf.filter.customer.help'));
    customerField.displayType = 'normal';
    filterFields.push(customerField);

    var PROCEDURE_FIELD = 'custpage_3805_dunning_qf_dp';
    var procedureField = new Field();
    procedureField.name = PROCEDURE_FIELD;
    procedureField.value = getFilterFieldValue(PROCEDURE_FIELD);
    procedureField.type = 'select';
    procedureField.options = getDunningProcedureOptions();
    procedureField.label = translator.getString('dqf.filter.procedure');
    procedureField.help = createHelp(translator.getString('dqf.filter.procedure.help'));
    procedureField.displayType = 'normal';
    filterFields.push(procedureField);

    var LEVEL_FIELD = 'custpage_3805_dunning_qf_dp_lvl';
    var dpLevelField = new Field();
    dpLevelField.name = LEVEL_FIELD;
    dpLevelField.value = getFilterFieldValue(LEVEL_FIELD);
    dpLevelField.type = 'select';
    dpLevelField.options = getLevelOptions();
    dpLevelField.label = translator.getString('dqf.filter.dpLevel');
    dpLevelField.help = createHelp(translator.getString('dqf.filter.dpLevel.help'));
    dpLevelField.displayType = 'normal';
    dpLevelField.size = {'width': 100, 'height': 7};
    filterFields.push(dpLevelField);

    var APPLIES_TO_FIELD = 'custpage_3805_dunning_qf_app_to';
    var appliesToField = new Field();
    appliesToField.name = APPLIES_TO_FIELD;
    appliesToField.value = getFilterFieldValue(APPLIES_TO_FIELD);
    appliesToField.type = 'select';
    appliesToField.options = getSourceOptions();// check if filters can be applied to "source"
    appliesToField.label = translator.getString('dqf.filter.appliesTo');
    appliesToField.help = createHelp(translator.getString('dqf.filter.appliesTo.help'));
    appliesToField.displayType = 'normal';
    filterFields.push(appliesToField);

    // translation thing, Last Letter Emailed
    var LAST_LETTER_SENT_START_DATE = 'custpage_3805_dunning_qf_lls_from';
    var lastLtrSentStartField = new Field();
    lastLtrSentStartField.name = LAST_LETTER_SENT_START_DATE;
    lastLtrSentStartField.value = getFilterFieldValue(LAST_LETTER_SENT_START_DATE);
    lastLtrSentStartField.type = 'date';
    lastLtrSentStartField.label = translator.getString('dqf.filter.lastLtrSentStart');
    lastLtrSentStartField.help = createHelp(translator.getString('dqf.filter.lastLtrSentStart.help'));
    lastLtrSentStartField.displayType = 'normal';
    lastLtrSentStartField.size = {'width': 30, 'height': 7};
    filterFields.push(lastLtrSentStartField);

    var LAST_LETTER_SENT_END_DATE = 'custpage_3805_dunning_qf_lls_to';
    var lastLtrSentEndField = new Field();
    lastLtrSentEndField.name = LAST_LETTER_SENT_END_DATE;
    lastLtrSentEndField.value = getFilterFieldValue(LAST_LETTER_SENT_END_DATE);
    lastLtrSentEndField.type = 'date';
    lastLtrSentEndField.label = translator.getString('dqf.filter.lastLtrSentEnd');
    lastLtrSentEndField.help = createHelp(translator.getString('dqf.filter.lastLtrSentEnd.help'));
    lastLtrSentEndField.displayType = 'normal';
    lastLtrSentEndField.size = {'width': 30, 'height': 7};
    filterFields.push(lastLtrSentEndField);

    var EVAL_START_DATE = 'custpage_3805_dunning_qf_ev_date_from';
    var evalDateStartField = new Field();
    evalDateStartField.name = EVAL_START_DATE;
    evalDateStartField.value = getFilterFieldValue(EVAL_START_DATE);
    evalDateStartField.type = 'date';
    evalDateStartField.label = translator.getString('dqf.filter.evalDateStart');
    evalDateStartField.help = createHelp(translator.getString('dqf.filter.evalDateStart.help'));
    evalDateStartField.displayType = 'normal';
    evalDateStartField.size = {'width': 30, 'height': 7};
    filterFields.push(evalDateStartField);

    var EVAL_END_DATE = 'custpage_3805_dunning_qf_ev_date_to';
    var evalDateEndField = new Field();
    evalDateEndField.name = EVAL_END_DATE;
    evalDateEndField.value = getFilterFieldValue(EVAL_END_DATE);
    evalDateEndField.type = 'date';
    evalDateEndField.label = translator.getString('dqf.filter.evalDateEnd');
    evalDateEndField.help = createHelp(translator.getString('dqf.filter.evalDateEnd.help'));
    evalDateEndField.displayType = 'normal';
    evalDateEndField.size = {'width': 30, 'height': 7};
    filterFields.push(evalDateEndField);

    return filterFields;
  }

  function createApplyFilterButton () {
    var applyFilterButton = new Button();
    applyFilterButton.name = 'custpage_3805_dunning_qf_apply_filters';
    applyFilterButton.label = translator.getString('dqf.filter.applyFiltersButton');
    applyFilterButton.script = 'dunning.dunningQueueCS.filter()';

    return applyFilterButton;
  }

  function createFilterFieldGroup () {
    var fldGroup = new FieldGroup();
    fldGroup.name = 'custpage_3805_restriction_group';
    fldGroup.label = translator.getString('dqf.filter.fieldGroup');
    fldGroup.collapsible = true;
    fldGroup.hidden = false;
    fldGroup.showBorder = true;

    return fldGroup;
  }

  function getFilterFieldValue (filterFieldName) {
    var fieldValues = definition.queueFilterFieldValues;
    var value;
    if (fieldValues) {
      value = fieldValues[filterFieldName];
    }
    return value;
  }

  this.getDunningQueueFilters = function getDunningQueueFilters () {
    var filterView = new dunning.view.DunningQueueFilter();
    filterView.filterFields = createFilterFields();
    filterView.fieldGroup = createFilterFieldGroup();
    filterView.applyFiltersButton = createApplyFilterButton();
    return filterView;
  };
};
