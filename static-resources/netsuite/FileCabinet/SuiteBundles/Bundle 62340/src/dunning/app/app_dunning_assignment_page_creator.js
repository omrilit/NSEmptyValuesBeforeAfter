/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningAssignmentPageCreator = function DunningAssignmentPageCreator (request) {
  var Translator = ns_wrapper.Translator;
  var FormBuilder = suite_l10n.app.FormBuilder;
  var Field = suite_l10n.view.Field;
  var Form = suite_l10n.view.Form;
  var FieldGroup = suite_l10n.view.FieldGroup;
  var Button = suite_l10n.view.Button;
  var DunningProcedureDAO = dao.DunningProcedureDAO;
  var translator = null;
  var LocalizationVariableList = suite_l10n.variable.LocalizationVariableList;
  var Configuration = ns_wrapper.api.config.Configuration;
  var SelectOption = suite_l10n.view.SelectOption;
  var Help = suite_l10n.view.Help;

  var PROCEDURE_FIELD = 'custpage_3805_dunning_procedure';

  var obj = {
    createPage: createPage,
    getTranslator: getTranslator
  };

  obj.FORM_BUTTONS = [{
    'name': 'custpage_3805_cancel',
    'label': 'dba.form.action.cancel',
    'script': 'dunning.bulkAssignCS.doCancel()'
  }];

  function createHelp (text, isInline) {
    var help = new Help();
    help.text = text;
    help.isInline = isInline || false;
    return help;
  }

  function createOption (value, text) {
    var option = new SelectOption();
    option.value = value;
    option.text = text;
    return option;
  }

  function getDunningSourceVariables () {
    return new LocalizationVariableList('dunning_source');
  }

  function getSourceOptions (dunningSourceVariables) {
    var values = dunningSourceVariables.getAllVariables();
    var options = [createOption('', '')];
    for (var i in values) {
      options.push(createOption(values[i].id, i));
    }
    return options;
  }

  function getProcedureOptions (type) {
    var procedureDAO = new DunningProcedureDAO();
    var procedures = procedureDAO.retrieveByTypeId(type);
    var options = [createOption('', '')];

    for (var i = 0; i < procedures.length; i++) {
      var procedure = procedures[i];
      options.push(createOption(procedure.id, procedure.name));
    }

    return options;
  }

  function getDunningManagerText (dunningManagerId) {
    return ns_wrapper.api.field.lookupField('employee', dunningManagerId, 'entityid');
  }

  function getSelectionFields (dunningSourceVariables, dunningProcedure, translator) {
    var fromProcedureField = new Field();
    fromProcedureField.name = 'custpage_3805_from_procedure';
    fromProcedureField.value = request[fromProcedureField.name];
    fromProcedureField.type = 'checkbox';
    fromProcedureField.displayType = 'hidden';

    var isDisableSelection = fromProcedureField.value === 'T';
    var selectionDisplayType = isDisableSelection ? 'inline' : 'normal';

    var sourceField = new Field();
    sourceField.name = 'custpage_3805_dunning_source';
    sourceField.type = 'select';
    sourceField.options = getSourceOptions(dunningSourceVariables);
    sourceField.value = request[sourceField.name];
    sourceField.label = translator.getString('dba.form.source');
    sourceField.help = createHelp(translator.getString('dba.form.source.help'));
    sourceField.displayType = selectionDisplayType;

    var procedureField = new Field();
    procedureField.name = PROCEDURE_FIELD;
    procedureField.value = dunningProcedure ? dunningProcedure.id : null;
    procedureField.type = 'select';
    procedureField.label = translator.getString('dba.form.procedure');
    procedureField.help = createHelp(translator.getString('dba.form.procedure.help'));
    procedureField.displayType = selectionDisplayType;

    if (sourceField.value) {
      procedureField.options = getProcedureOptions(sourceField.value);
    }

    var dunningManagerField = new Field();
    dunningManagerField.name = 'custpage_3805_dunning_manager';
    dunningManagerField.type = 'text';
    dunningManagerField.value = dunningProcedure ? getDunningManagerText(dunningProcedure.dunningManager) : null;
    dunningManagerField.label = translator.getString('dba.form.dunning_manager');
    dunningManagerField.help = createHelp(translator.getString('dba.form.dunning_manager.help'));
    dunningManagerField.displayType = 'inline';

    return [fromProcedureField, sourceField, procedureField, dunningManagerField];
  }

  function getRecTypeId () {
    return request['custpage_3805_dunning_source'];
  }

  function getTabDefinitionInput (dunningProcedure, translator) {
    var tabDefinitionInput = new suite_l10n.view.SubListTabDefinitionGeneratorInput();
    tabDefinitionInput.request = request;
    tabDefinitionInput.dunningProcedureView = dunningProcedure;
    tabDefinitionInput.translator = translator;
    return tabDefinitionInput;
  }

  var SUBLIST_GENERATOR_CLASS_MAP = {
    'customer': dunning.app.CustomerAssignmentSubListDefinition,
    'invoice': dunning.app.InvoiceAssignmentSubListDefinition
  };

  function getTabs (dunningSourceVariables, dunningProcedure, translator) {
    var tabs = [];

    var tabDefinitionInput = getTabDefinitionInput(dunningProcedure, translator);
    var recType = dunningSourceVariables.getValueById(getRecTypeId());

    var generatorClass = SUBLIST_GENERATOR_CLASS_MAP[recType] || SUBLIST_GENERATOR_CLASS_MAP['customer'];
    var defGenerator = new generatorClass(tabDefinitionInput);
    var rawSubListDef = defGenerator.generateSubListTabDefinition();

    var generator = new suite_l10n.app.SubListTabGenerator(rawSubListDef);
    tabs.push(generator.getSubListTab());

    return tabs;
  }

  function getTranslator (locale) {
    if (!translator) {
      translator = new Translator(locale);
    }
    return translator;
  }

  function getForm (dunningSourceVariables, translator) {
    var form = new Form();
    form.title = translator.getString('dba.form.title');
    form.script = 'customscript_3805_cs_bulk_assignment';
    var recType = dunningSourceVariables.getValueById(getRecTypeId());
    form.submitButton = translator.getString('dba.form.action.assign_' + recType);
    form.disableSubmitButton = !getProcedureId();
    return form;
  }

  function getProcedureId () {
    return request[PROCEDURE_FIELD];
  }

  function getDunningProcedure () {
    var procedureId = getProcedureId();
    var procedure = null;

    if (procedureId) {
      var procedureDAO = new DunningProcedureDAO();
      procedure = procedureDAO.retrieve(procedureId);
    }
    return procedure;
  }

  function getRestrictionSection (dunningSourceVariables, procedure, translator) {
    var group = new FieldGroup();
    group.name = 'custpage_3805_restriction_group';
    group.label = translator.getString('dba.form.restriction');
    group.collapsible = true;
    group.hidden = true;
    group.showBorder = true;

    var subsidiaryField = new Field();
    subsidiaryField.name = 'custpage_3805_restriction_sub';
    subsidiaryField.label = translator.getString('dba.form.restriction.subsidiary');
    subsidiaryField.type = 'multiselect';
    subsidiaryField.source = 'subsidiary';
    subsidiaryField.displayType = 'inline';
    subsidiaryField.value = procedure ? procedure.subsidiaries : null;

    group.fields.push(subsidiaryField);
    var recType = dunningSourceVariables.getValueById(getRecTypeId());
    var searchValue = procedure ? procedure.savedSearchCustomerText : null;
    if (recType === 'invoice') {
      var locationsField = new Field();
      locationsField.name = 'custpage_3805_restriction_loc';
      locationsField.label = translator.getString('dba.form.restriction.location');
      locationsField.type = 'multiselect';
      locationsField.source = 'location';
      locationsField.displayType = 'inline';
      locationsField.value = procedure ? procedure.locations : null;

      var departmentsField = new Field();
      departmentsField.name = 'custpage_3805_restriction_department';
      departmentsField.label = translator.getString('dba.form.restriction.dept');
      departmentsField.type = 'multiselect';
      departmentsField.source = 'department';
      departmentsField.displayType = 'inline';
      departmentsField.value = procedure ? procedure.departments : null;

      var classesField = new Field();
      classesField.name = 'custpage_3805_restriction_class';
      classesField.label = translator.getString('dba.form.restriction.class');
      classesField.type = 'multiselect';
      classesField.source = 'classification';
      classesField.displayType = 'inline';
      classesField.value = procedure ? procedure.classes : null;

      group.fields.push(locationsField, departmentsField, classesField);
      searchValue = procedure ? procedure.savedSearchInvoiceText : null;
    }

    var searchField = new Field();
    searchField.name = 'custpage_3805_restriction_search';
    searchField.label = translator.getString('dba.form.restriction.search');
    searchField.type = 'text';
    searchField.displayType = 'inline';
    searchField.value = searchValue;

    group.fields.push(searchField);

    return group;
  }

  function getSelectionFieldGroup (dunningSourceVariables, dunningProcedure, translator) {
    var group = new FieldGroup();
    group.name = 'custpage_3805_selection_group';
    group.label = translator.getString('dba.form.selection');
    group.collapsible = false;
    group.hidden = false;
    group.showBorder = true;

    group.fields = getSelectionFields(dunningSourceVariables, dunningProcedure, translator);

    return group;
  }

  function convertToButtonDef (baseObj, translator) {
    var button = new Button();
    var keys = Object.keys(button);
    for (var i = 0; i < keys.length; i++) {
      var currKey = keys[i];
      if (baseObj.hasOwnProperty(currKey)) {
        if (currKey === 'label') {
          button[currKey] = translator.getString(baseObj[currKey]);
        } else {
          button[currKey] = baseObj[currKey];
        }
      }
    }

    return button;
  }

  function getButtons (translator) {
    var buttons = [];

    for (var i = 0; i < obj.FORM_BUTTONS.length; i++) {
      buttons.push(convertToButtonDef(obj.FORM_BUTTONS[i], translator));
    }

    return buttons;
  }

  function createPage () {
    var config = new Configuration('userpreferences');
    var translator = obj.getTranslator(config.getFieldValue('LANGUAGE'));
    var formBuilder = new FormBuilder();

    var dunningProcedure = getDunningProcedure();

    var dunningSourceVariables = getDunningSourceVariables();
    formBuilder.setForm(getForm(dunningSourceVariables, translator));
    formBuilder.addFieldGroups([
      getSelectionFieldGroup(dunningSourceVariables, dunningProcedure, translator),
      getRestrictionSection(dunningSourceVariables, dunningProcedure, translator)]);
    formBuilder.addButtons(getButtons(translator));
    formBuilder.addTabs(getTabs(dunningSourceVariables, dunningProcedure, translator));

    return formBuilder.buildForm();
  }

  return obj;
};
