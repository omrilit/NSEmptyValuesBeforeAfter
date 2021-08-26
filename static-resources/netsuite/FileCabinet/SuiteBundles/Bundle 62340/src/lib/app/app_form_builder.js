/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var suite_l10n = suite_l10n || {};
suite_l10n.app = suite_l10n.app || {};

suite_l10n.app.FormBuilder = function FormBuilder () {
  var Form = ns_wrapper.Form;

  var obj = {
    buildForm: buildForm,
    setForm: setForm,
    addFields: addFields,
    addSubLists: addSubLists,
    addTabs: addTabs,
    addFieldGroups: addFieldGroups,
    addButtons: addButtons
  };

  var formDefinition = null;
  var fields = [];
  var subLists = [];
  var tabs = [];
  var fieldGroups = [];
  var buttons = [];

  function addButtons (newButtons) {
    buttons = buttons.concat(newButtons);
  }

  function setForm (newForm) {
    formDefinition = newForm;
  }

  function addFields (newFields) {
    fields = fields.concat(newFields);
  }

  function addSubLists (newSubLists) {
    subLists = subLists.concat(newSubLists);
  }

  function addTabs (newTabs) {
    tabs = tabs.concat(newTabs);
  }

  function addFieldGroups (newGroups) {
    fieldGroups = fieldGroups.concat(newGroups);
  }

  function buildForm () {
    var form = new Form();
    form.createForm(formDefinition.title, formDefinition.isHideNavBar);

    if (formDefinition.submitButton) {
      var button = form.addSubmitButton(formDefinition.submitButton);
      button.setDisabled(formDefinition.disableSubmitButton);
    }

    if (formDefinition.script) {
      form.setScript(formDefinition.script);
    }

    var combinedFields = fields.concat(formDefinition.fields);
    if (combinedFields) {
      buildFields(form, combinedFields);
    }

    var combinedSubLists = subLists.concat(formDefinition.subLists);

    if (combinedSubLists.length > 0) {
      buildSubLists(form, combinedSubLists);
    }

    var combinedTabs = tabs.concat(formDefinition.tabs);

    if (combinedTabs.length > 0) {
      buildTabs(form, combinedTabs);
    }

    var combinedFieldGroups = fieldGroups.concat(formDefinition.fieldGroups);

    if (combinedFieldGroups.length > 0) {
      buildFieldGroups(form, combinedFieldGroups);
    }

    var combinedButtons = buttons.concat(formDefinition.buttons);
    if (combinedButtons.length > 0) {
      buildButtons(form, combinedButtons);
    }

    return form;
  }

  function buildSubList (parent, subListDef, tab) {
    if (tab) {
      subListDef.tabOrGroup = tab;
    }

    var subList = parent.addSubList(subListDef);

    if (subListDef.buttons.length > 0) {
      buildButtons(subList, subListDef.buttons);
    }

    if (subListDef.addMarkAllButtons) {
      subList.addMarkAllButtons();
    }

    if (subListDef.fields.length > 0) {
      buildFields(subList, subListDef.fields);
    }

    if (subListDef.values.length > 0) {
      subList.setValues(subListDef.values);
    }
  }

  function buildSubLists (parent, subLists, tab) {
    for (var i = 0; i < subLists.length; i++) {
      buildSubList(parent, subLists[i], tab);
    }
  }

  function buildFieldGroup (parent, fieldGroupDef, tab) {
    if (tab) {
      fieldGroupDef.tabOrGroup = tab;
    }

    parent.addFieldGroup(fieldGroupDef, tab);

    if (fieldGroupDef.fields.length > 0) {
      buildFields(parent, fieldGroupDef.fields, fieldGroupDef.name);
    }
  }

  function buildFieldGroups (parent, fieldGroups, tab) {
    for (var i = 0; i < fieldGroups.length; i++) {
      buildFieldGroup(parent, fieldGroups[i], tab);
    }
  }

  function buildTab (parent, tabDef) {
    parent.addTab(tabDef);

    if (tabDef.fields.length > 0) {
      buildFields(parent, tabDef.fields, tabDef.name);
    }

    if (tabDef.fieldGroups.length > 0) {
      buildFieldGroups(parent, tabDef.fieldGroups, tabDef.name);
    }

    if (tabDef.subLists.length > 0) {
      buildSubLists(parent, tabDef.subLists, tabDef.name);
    }
  }

  function buildTabs (parent, tabs) {
    for (var i = 0; i < tabs.length; i++) {
      buildTab(parent, tabs[i]);
    }
  }

  function buildField (parent, fieldDef, tabOrGroup) {
    if (tabOrGroup) {
      fieldDef.tabOrGroup = tabOrGroup;
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

  function buildFields (parent, fields, tabOrGroup) {
    for (var i = 0; i < fields.length; i++) {
      buildField(parent, fields[i], tabOrGroup);
    }
  }

  function buildButton (parent, buttonDef) {
    parent.addButton(buttonDef);
  }

  function buildButtons (parent, buttons) {
    for (var i = 0; i < buttons.length; i++) {
      buildButton(parent, buttons[i]);
    }
  }

  return obj;
};
