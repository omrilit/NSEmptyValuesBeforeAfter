/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author mjaurigue
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningBulkUpdateFormGenerator = function DunningBulkUpdateFormGenerator () {
  var FormBuilder = suite_l10n.app.FormBuilder;

  this.generateForm = function generateForm (definition) {
    var formBuilder = new FormBuilder();
    formBuilder.setForm(getForm(definition));

    var fieldGroups = [];

    fieldGroups.push(definition.mainFieldGroup);

    var isOW = ns_wrapper.context().isOW();
    if (isOW) {
      fieldGroups.push(definition.primaryFormFieldGroup);
    }
    fieldGroups.push(definition.bulkUpdateFieldGroup);

    formBuilder.addFieldGroups(fieldGroups);
    return formBuilder.buildForm();
  };

  function getForm (definition) {
    var form = new suite_l10n.view.Form();
    form.title = definition.title;
    form.script = definition.csScript;
    form.submitButton = definition.submitButton;
    return form;
  }
};
