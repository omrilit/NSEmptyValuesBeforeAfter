/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningQueueFormManager = function DunningQueueFormManager () {
  this.generateForm = function (dunningQueueFormView) {
    var locale = ns_wrapper.context().getUserLanguage();
    var translator = new ns_wrapper.Translator(locale);

    var dqDef = createFormDefinition(translator, dunningQueueFormView);

    var dqFormGen = new dunning.app.DunningQueueFormGenerator(translator);
    return dqFormGen.generateForm(dqDef);
  };

  function getFormType () {
    var QUEUE_FORM_TYPE = 'custscript_3805_dunning_queue_form_type';
    var L10N_VAR = 'customrecord_suite_l10n_variable';
    var VAR_VL = 'custrecord_3805_variable_value';

    var ctx = ns_wrapper.context();
    var formTypeId = ctx.getScriptSetting(QUEUE_FORM_TYPE);
    return ns_wrapper.api.field.lookupField(L10N_VAR, formTypeId, VAR_VL);
  }

  function createFormDefinition (translator, dunningQueueFormView) {
    var formType = getFormType();
    var dqDefCreator = new dunning.app.DunningQueueFormDefinitionCreator(translator);
    var dqDef = dqDefCreator.createDefinition(formType);

    dqDef.display = dunningQueueFormView.display;
    dqDef.queueFilters = dunningQueueFormView.queueFilters;
    dqDef.queueFilterFieldValues = dunningQueueFormView.queueFilterFieldValues;
    dqDef.dunningRole = dunningQueueFormView.dunningRole;

    return dqDef;
  }
};
