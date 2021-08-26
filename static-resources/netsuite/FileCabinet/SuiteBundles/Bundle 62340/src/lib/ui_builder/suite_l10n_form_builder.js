/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var suite_l10n = suite_l10n || {};
suite_l10n.ui_builder = suite_l10n.ui_builder || {};

suite_l10n.ui_builder.FormBuilder = function FormBuilder () {
  var FieldBuilder = suite_l10n.ui_builder.FieldBuilder;
  var Form = ns_wrapper.Form;

  var fieldDefs = [];
  var buttonDefs = [];
  var script;
  var formObj;
  var hideNavBar = false;
  var title;
  var submitButtonTitle;
  var hasSubmitButton = false;
  var hasResetButton = false;

  function setTitle (newTitle) {
    title = newTitle;
  }

  function setHideNavBar (isHideNavBar) {
    hideNavBar = isHideNavBar;
  }

  function setScript (newScript) {
    script = newScript;
  }

  function addSubmitButton (buttonModel) {
    hasSubmitButton = true;
    submitButtonTitle = buttonModel ? buttonModel.name : null;
  }

  function addResetButton () {
    hasResetButton = true;
  }

  function setForm (form) {
    formObj = form;
  }

  function addButtonDefinition (buttonDef) {
    buttonDefs.push(buttonDef);
  }

  function addButtonDefinitions (buttonDefs) {
    for (var i = 0; i < buttonDefs.length; i++) {
      addButtonDefinition(buttonDefs[i]);
    }
  }

  function addFieldDefinition (fieldDef) {
    fieldDefs.push(fieldDef);
  }

  function addFieldDefinitions (newFields) {
    for (var i = 0; i < newFields.length; i++) {
      addFieldDefinition(newFields[i]);
    }
  }

  function addButtons (formObj) {
    if (hasSubmitButton) {
      formObj.addSubmitButton(submitButtonTitle);
    }

    if (hasResetButton) {
      formObj.addResetButton();
    }

    for (var i = 0; i < buttonDefs.length; i++) {
      formObj.addButton(buttonDefs[i]);
    }
  }

  function addFields (formObj) {
    var fieldBuilder = new FieldBuilder();
    for (var i = 0; i < fieldDefs.length; i++) {
      var fieldObj = formObj.addField(fieldDefs[i]);
      fieldBuilder.buildField(fieldObj, fieldDefs[i]);
    }
  }

  /**
   * Build a form given a wrapped form object and a list of field definitions
   */
  function buildForm () {
    if (!formObj && title) {
      formObj = new Form().createForm(title, hideNavBar);
    } else if (!title) {
      throw nlapiCreateError('DUNNING_FORM_TITLE_MISSING', 'Provide a form title using setTitle.');
    }

    addFields(formObj);
    addButtons(formObj);

    if (script) {
      formObj.setScript(script);
    }

    return formObj;
  }

  return {
    buildForm: buildForm,
    setForm: setForm,
    addFieldDefinition: addFieldDefinition,
    addFieldDefinitions: addFieldDefinitions,
    addSubmitButton: addSubmitButton,
    addResetButton: addResetButton,
    addButtonDefinition: addButtonDefinition,
    addButtonDefinitions: addButtonDefinitions,
    setScript: setScript,
    setTitle: setTitle,
    setHideNavBar: setHideNavBar
  };
};
