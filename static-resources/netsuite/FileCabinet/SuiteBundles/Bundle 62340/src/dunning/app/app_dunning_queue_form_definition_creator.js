/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningQueueFormDefinitionCreator = function DunningQueueFormDefinitionCreator (translator) {
  var FORM_SEND = 'form_send';
  var FORM_SEND_DEP_ID = 'customdeploy_3805_dunning_queue_f_send';

  var FORM_PRINT = 'form_print';
  var FORM_PRINT_DEP_ID = 'customdeploy_3805_dunning_queue_f_print';

  var definitionMap = {};

  /* COMMON */
  var SCRIPT = 'customscript_3805_cs_dunning_queue';

  var REMOVE_BUTTON = new suite_l10n.view.Button();
  REMOVE_BUTTON.name = 'custpage_3805_dunning_queue_remove';
  REMOVE_BUTTON.label = translator.getString('dqf.form.action.remove');
  REMOVE_BUTTON.script = 'dunning.dunningQueueCS.remove()';

  /* SEND */
  var SEND_BUTTON = new suite_l10n.view.Button();
  SEND_BUTTON.name = 'custpage_3805_dunning_queue_send';
  SEND_BUTTON.label = translator.getString('dqf.form.action.send');
  SEND_BUTTON.script = 'dunning.dunningQueueCS.send()';

  /* DEPLOYMENT ID */
  var DEPLOYMENT_ID_FIELD = new suite_l10n.view.Field();
  DEPLOYMENT_ID_FIELD.name = 'custpage_3805_dunning_queue_deploy';
  DEPLOYMENT_ID_FIELD.type = 'text';
  DEPLOYMENT_ID_FIELD.value = '';
  DEPLOYMENT_ID_FIELD.displayType = 'hidden';

  definitionMap[FORM_SEND] = {};
  definitionMap[FORM_SEND].title = translator.getString('dqf.form.send.title');
  definitionMap[FORM_SEND].buttons = [SEND_BUTTON, REMOVE_BUTTON];
  definitionMap[FORM_SEND].savedSearch = 'customsearch_3805_dunning_queue_send';
  definitionMap[FORM_SEND].deploymentId = DEPLOYMENT_ID_FIELD;

  /* PRINT */
  var PRINT_BUTTON = new suite_l10n.view.Button();
  PRINT_BUTTON.name = 'custpage_3805_dunning_queue_print';
  PRINT_BUTTON.label = translator.getString('dqf.form.action.print');
  PRINT_BUTTON.script = 'dunning.dunningQueueCS.print()';

  definitionMap[FORM_PRINT] = {};
  definitionMap[FORM_PRINT].title = translator.getString('dqf.form.print.title');
  definitionMap[FORM_PRINT].buttons = [PRINT_BUTTON, REMOVE_BUTTON];
  definitionMap[FORM_PRINT].savedSearch = 'customsearch_3805_dunning_queue_print';
  definitionMap[FORM_PRINT].deploymentId = DEPLOYMENT_ID_FIELD;

  this.createDefinition = function (formType) {
    var definition = new dunning.view.DunningQueueFormDefinition();
    definitionMap[formType].deploymentId.value = formType == FORM_SEND
      ? FORM_SEND_DEP_ID : FORM_PRINT_DEP_ID;

    definition.title = definitionMap[formType].title;
    definition.buttons = definitionMap[formType].buttons;
    definition.script = SCRIPT;
    definition.savedSearch = definitionMap[formType].savedSearch;
    definition.deploymentId = definitionMap[formType].deploymentId;
    definition.formType = formType;

    return definition;
  };
};
