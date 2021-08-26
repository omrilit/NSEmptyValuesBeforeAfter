/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningQueueFormGenerator = function DunningQueueFormGenerator (translator) {
  // Main function to be called
  this.generateForm = function (definition) {
    var DUNNING_QUEUE_FORM_TITLE = definition.title;

    var form = new ns_wrapper.Form();

    form.createForm(DUNNING_QUEUE_FORM_TITLE);

    // Display the queue
    if (definition.display) {
      addSubList(form, definition);
      createButtons(form, definition);
    }

    createFormTypeField(form, definition);
    setFilterFields(form, definition);
    setScript(form, definition);
    createDunningRoleField(form, definition);

    return form;
  };

  function addSubList (form, definition) {
    var sublistDef = new dunning.app.DunningQueueSubListDefinition(translator, definition);
    var list = form.addSubList(sublistDef);
    list.addMarkAllButtons();

    setSubListColumns(list, sublistDef);

    var lineGenerator = new suite_l10n.app.SubListLineGenerator(sublistDef);
    var lines = lineGenerator.generateLineItems();
    list.setValues(lines);
  }

  function setSubListColumns (subList, sublistDef) {
    var fields = sublistDef.fields;
    for (var i = 0; i < fields.length; i++) {
      var fieldView = new suite_l10n.view.Field();

      fieldView.name = fields[i].name;
      fieldView.type = fields[i].type;
      fieldView.label = fields[i].label;
      fieldView.source = fields[i].source;

      var field = subList.addField(fieldView);

      postProcessField(field, fields[i]);
    }
  }

  function postProcessField (field, origField) {
    var displayType = origField.displayType;
    if (displayType) {
      field.setDisplayType(displayType);
    }

    var linkText = origField.linkText;
    if (linkText) {
      field.setLinkText(linkText);
    }
  }

  function createButtons (form, definition) {
    var buttons = definition.buttons;
    for (var i = 0; i < buttons.length; i++) {
      var button = buttons[i];
      form.addButton(button);
    }
  }

  function setScript (form, definition) {
    form.setScript(definition.script);
  }

  function buildField (parent, fieldDef, fieldGroup) {
    if (fieldGroup) {
      fieldDef.tabOrGroup = fieldGroup;
    }

    var field = parent.addField(fieldDef);

    if (fieldDef.value) {
      field.setValue(fieldDef.value);
    }

    if (fieldDef.displayType) {
      field.setDisplayType(fieldDef.displayType);
    }
    if (fieldDef.options && fieldDef.options.length > 0) {
      field.addOptions(fieldDef.options);
    }

    if (fieldDef.help) {
      field.setHelp(fieldDef.help);
    }
  }

  function buildFields (parent, fields, fieldGroup) {
    for (var i = 0; i < fields.length; i++) {
      buildField(parent, fields[i], fieldGroup);
    }
  }

  function buildFieldGroup (parent, fieldGroupDef) {
    parent.addFieldGroup(fieldGroupDef);

    if (fieldGroupDef.fields.length > 0) {
      buildFields(parent, fieldGroupDef.fields, fieldGroupDef.name);
    }
  }

  function setFilterFields (form, definition) {
    var formType = definition.formType;
    var queueFilterView = createFilterFields(formType, definition);

    var filterFieldGroup = queueFilterView.fieldGroup;
    var filterFields = queueFilterView.filterFields;
    var applyFilterButton = queueFilterView.applyFiltersButton;

    filterFieldGroup.fields = filterFields;
    buildFieldGroup(form, filterFieldGroup);

    form.addButton(applyFilterButton);
  }

  function createFilterFields (formType, definition) {
    var filtersGenerator = new dunning.app.DunningQueueFiltersGenerator(formType, translator, definition);
    return filtersGenerator.getDunningQueueFilters();
  }

  function createFormTypeField (form, definition) {
    form.addField(definition.deploymentId);
  }

  function createDunningRoleField (form, definition) {
    var dunningRoleField = new suite_l10n.view.Field();
    dunningRoleField.name = 'custpage_3805_dunning_queue_dunning_role';
    dunningRoleField.type = 'text';
    dunningRoleField.value = 'UNUPDATED_VALUE';
    dunningRoleField.label = 'Dunning Role';
    /* not intended for translation since hidden */
    dunningRoleField.displayType = 'hidden';

    form.addField(dunningRoleField);
  }
};
