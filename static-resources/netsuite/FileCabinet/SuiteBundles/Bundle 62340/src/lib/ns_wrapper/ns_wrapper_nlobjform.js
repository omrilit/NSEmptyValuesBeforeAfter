/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var ns_wrapper = ns_wrapper || {};

ns_wrapper.Form = function Form (nsForm) {
  var fields = {};
  var fieldGroups = {};
  var subLists = {};
  var tabs = {};
  var buttons = {};

  var obj = {
    setForm: setForm,
    createForm: createForm,
    getFormObject: getFormObject,
    addButton: addButton,
    addField: addNSField,
    addSubmitButton: addSubmitButton,
    addResetButton: addResetButton,
    setScript: setScript,
    addTab: addTab,
    addSubList: addSubList,
    addFieldGroup: addFieldGroup,
    getField: getField
  };

  function addSubmitButton (name) {
    var submitBtnParams = [];

    if (name) {
      submitBtnParams.push(name);
    }
    return nsForm.addSubmitButton.apply(nsForm, submitBtnParams);
  }

  function addResetButton () {
    nsForm.addResetButton();
  }

  function addButton (buttonModel) {
    var button = nsForm.addButton(
      buttonModel.name,
      buttonModel.label ? buttonModel.label : ' ',
      buttonModel.script);

    buttons[buttonModel.name] = new ns_wrapper.Button(button, buttonModel);

    return buttons[buttonModel.name];
  }

  function addNSField (fieldModel) {
    var field = null;
    if (fieldModel.tabOrGroup) {
      field = nsForm
        .addField(fieldModel.name, fieldModel.type, fieldModel.label, fieldModel.source || fieldModel.isRadio, fieldModel.tabOrGroup);
    } else {
      field = nsForm.addField(fieldModel.name, fieldModel.type, fieldModel.label, fieldModel.source ||
        fieldModel.isRadio);
    }

    fields[fieldModel.name] = new ns_wrapper.Field(field, fieldModel);

    return fields[fieldModel.name];
  }

  function addSubList (subListModel) {
    var subList = null;

    if (subListModel.tabOrGroup) {
      subList = nsForm
        .addSubList(subListModel.name, subListModel.type, subListModel.label, subListModel.tabOrGroup);
    } else {
      subList = nsForm.addSubList(subListModel.name, subListModel.type, subListModel.label);
    }

    subLists[subListModel.name] = new ns_wrapper.SubList(subList, subListModel);
    return subLists[subListModel.name];
  }

  function addFieldGroup (fieldGroupModel) {
    var fieldGroup = null;

    if (fieldGroupModel.tabOrGroup) {
      fieldGroup = nsForm.addFieldGroup(fieldGroupModel.name, fieldGroupModel.label, fieldGroupModel.tabOrGroup);
    } else {
      fieldGroup = nsForm.addFieldGroup(fieldGroupModel.name, fieldGroupModel.label);
    }
    fieldGroups[fieldGroupModel.name] = new ns_wrapper.FieldGroup(fieldGroup, fieldGroupModel);

    return fieldGroups[fieldGroupModel.name];
  }

  function addTab (tabModel) {
    var tab = nsForm.addTab(tabModel.name, tabModel.label);
    tabs[tabModel.name] = new ns_wrapper.Tab(tab, tabModel);

    return tabs[tabModel.name];
  }

  function getFormObject () {
    return nsForm;
  }

  function setForm (form) {
    nsForm = form;
  }

  function setScript (script) {
    nsForm.setScript(script);
  }

  function createForm (title, hideNavbar) {
    nsForm = nlapiCreateForm(title, hideNavbar);

    return obj;
  }

  function getField (fieldId) {
    return nsForm.getField(fieldId);
  }

  return obj;
};
