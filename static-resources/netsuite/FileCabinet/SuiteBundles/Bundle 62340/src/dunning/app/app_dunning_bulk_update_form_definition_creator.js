/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author mjaurigue
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningBulkUpdateFormDefinitionCreator = function DunningBulkUpdateFormDefinitionCreator (translator) {
  var PAGE_TITLE = translator.getString('dbu.form.title') || 'Bulk Update Customer Records for Dunning';
  var CS_SCRIPT = 'customscript_3805_cs_dunning_bulk_update';
  var SUBMIT_BUTTON_LABEL = translator.getString('dbu.form.update_button') || 'Update';

  var SUBSIDIARY_FIELD_LABEL = translator.getString('dbu.form.field.subsidiary') || 'Subsidiary';
  var SUBSIDIARY_FIELD_FLH = translator.getString('dbu.form.flh.subsidiary') || 'Select the subsidiary for which you want to do a bulk update of the dunning fields on customer records. Updates will be applied to all customer records that belong to the selected subsidiary.';
  var ALLOW_EMAIL_FIELD_LABEL = translator.getString('dbu.form.field.allow_email') || 'Allow letters to be emailed';
  var ALLOW_EMAIL_FIELD_FLH = translator.getString('dbu.form.flh.allow_email') || 'Select a value to be applied to this field on the customer records after performing the bulk update:\nUnchanged – The current value of the field will not be changed. \nChecked – The box will be checked on customer records after the bulk update. \nNot checked – The box will be clear after the bulk update.';
  var ALLOW_PRINT_FIELD_LABEL = translator.getString('dbu.form.field.allow_print') || 'Allow letters to be printed';
  var ALLOW_PRINT_FIELD_FLH = translator.getString('dbu.form.flh.allow_print') || 'Select a value to be applied to this field on the customer records after performing the bulk update:\nUnchanged – The current value of the field will not be changed. \nChecked – The box will be checked on customer records after the bulk update. \nNot checked – The box will be clear after the bulk update.';
  var DO_NOT_SEND_CUST_EMAIL_FIELD_LABEL = translator.getString('dbu.form.field.dont_send_cust_email') || 'Do Not Send Letters to Customer Email';
  var DO_NOT_SEND_CUST_EMAIL_FLH = translator.getString('dbu.form.flh.dont_send_cust_email') || 'Select a value to be applied to this field on the customer records after performing the bulk update:\nUnchanged – The current value of the field will not be changed. \nChecked – The box will be checked on customer records after the bulk update. \nNot checked – The box will be clear after the bulk update.';
  var FORM_INLINE_HELP = translator.getString('dbu.form.reminderinlinehelp') || 'NetSuite recommends that you use the bulk update feature outside of your normal business hours. This is to ensure that other users in your company are not updating customer records during the bulk update process.';

  var PRIMARY_FIELD_GROUP_LABEL = translator.getString('dbu.form.primary_field_group') || 'Criteria';
  var BULK_UPDATE_FIELD_GROUP_LABEL = translator.getString('dbu.form.bulk_update_field_group') || 'Bulk Update Fields';

  var UNCHANGED_OPTION = translator.getString('dbu.form.options.unchanged') || '- Unchanged -';
  var CHECKED_OPTION = translator.getString('dbu.form.options.checked') || 'Checked';
  var NOT_CHECKED_OPTION = translator.getString('dbu.form.options.not_checked') || 'Not checked';

  var SUBSIDIARY_FIELD_ID = 'custpage_3805_dunning_bulk_update_sub';
  var ALLOW_EMAIL_ID = 'custpage_3805_dunning_bulk_update_email';
  var ALLOW_PRINT_ID = 'custpage_3805_dunning_bulk_update_print';
  var DO_NOT_SEND_CUST_EMAIL_ID = 'custpage_3805_dunning_bulk_dont_send_cust_mail';

  this.createFormDefinition = function createFormDefinition () {
    var definition = new dunning.app.DunningBulkUpdateFormDefinitionView();
    definition.title = PAGE_TITLE;
    definition.csScript = CS_SCRIPT;
    definition.submitButton = SUBMIT_BUTTON_LABEL;
    definition.mainFieldGroup = createMainFieldGroup();
    definition.primaryFormFieldGroup = createPrimaryFormFieldGroup();
    definition.bulkUpdateFieldGroup = createBulkUpdateFieldGroup();

    return definition;
  };

  /* Creates field group that has no border, similar to the MAIN section of NS native records */
  function createMainFieldGroup () {
    var fields = [];

    /* The name and title bar of this field group are not being shown in the UI. */
    var fldGroup = new suite_l10n.view.FieldGroup();
    fldGroup.name = 'custpage_3805_main_fieldgroup';
    fldGroup.label = 'BORDERLESS FIELD GROUP';
    fldGroup.collapsible = true;
    fldGroup.hidden = false;
    fldGroup.showBorder = false;

    var inlineHelp = new suite_l10n.view.Field();
    inlineHelp.name = 'custpage_3805_bulk_update_inline_help_reminder';
    inlineHelp.type = 'help';
    inlineHelp.displayType = 'normal';
    inlineHelp.label = FORM_INLINE_HELP;
    fields.push(inlineHelp);

    fldGroup.fields = fields;

    return fldGroup;
  }

  function createPrimaryFormFieldGroup () {
    var fields = [];

    var fldGroup = new suite_l10n.view.FieldGroup();
    fldGroup.name = 'custpage_3805_bulk_update_prim_fieldgroup';
    fldGroup.label = PRIMARY_FIELD_GROUP_LABEL;
    fldGroup.collapsible = true;
    fldGroup.hidden = false;
    fldGroup.showBorder = true;

    var subsidiaryField = new suite_l10n.view.Field();
    subsidiaryField.name = SUBSIDIARY_FIELD_ID;
    subsidiaryField.type = 'select';
    subsidiaryField.source = 'subsidiary';
    subsidiaryField.mandatory = true;
    subsidiaryField.label = SUBSIDIARY_FIELD_LABEL;
    subsidiaryField.help = createHelp(SUBSIDIARY_FIELD_FLH);
    subsidiaryField.displayType = 'normal';
    fields.push(subsidiaryField);

    fldGroup.fields = fields;

    return fldGroup;
  }

  function createBulkUpdateFieldGroup () {
    var fields = [];

    var fldGroup = new suite_l10n.view.FieldGroup();
    fldGroup.name = 'custpage_3805_bulk_update_fieldgroup';
    fldGroup.label = BULK_UPDATE_FIELD_GROUP_LABEL;
    fldGroup.collapsible = true;
    fldGroup.hidden = false;
    fldGroup.showBorder = true;

    var allowEmailField = new suite_l10n.view.Field();
    allowEmailField.name = ALLOW_EMAIL_ID;
    allowEmailField.type = 'select';
    allowEmailField.options = createEventOptions();
    allowEmailField.label = ALLOW_EMAIL_FIELD_LABEL;
    allowEmailField.help = createHelp(ALLOW_EMAIL_FIELD_FLH);
    allowEmailField.displayType = 'normal';
    fields.push(allowEmailField);

    var allowPrintField = new suite_l10n.view.Field();
    allowPrintField.name = ALLOW_PRINT_ID;
    allowPrintField.type = 'select';
    allowPrintField.options = createEventOptions();
    allowPrintField.label = ALLOW_PRINT_FIELD_LABEL;
    allowPrintField.help = createHelp(ALLOW_PRINT_FIELD_FLH);
    allowPrintField.displayType = 'normal';
    fields.push(allowPrintField);

    var donotSendMainContactField = new suite_l10n.view.Field();
    donotSendMainContactField.name = DO_NOT_SEND_CUST_EMAIL_ID;
    donotSendMainContactField.type = 'select';
    donotSendMainContactField.options = createEventOptions();
    donotSendMainContactField.label = DO_NOT_SEND_CUST_EMAIL_FIELD_LABEL;
    donotSendMainContactField.help = createHelp(DO_NOT_SEND_CUST_EMAIL_FLH);
    donotSendMainContactField.displayType = 'normal';
    fields.push(donotSendMainContactField);

    fldGroup.fields = fields;

    return fldGroup;
  }

  function createHelp (text, isInline) {
    var help = new suite_l10n.view.Help();
    help.text = text;
    help.isInline = isInline || false;
    return help;
  }

  function createEventOptions () {
    var options = [];

    var unchangedOption = new suite_l10n.view.SelectOption();
    unchangedOption.value = '';
    unchangedOption.text = UNCHANGED_OPTION;
    options.push(unchangedOption);

    var checkedOption = new suite_l10n.view.SelectOption();
    checkedOption.value = 'T';
    checkedOption.text = CHECKED_OPTION;
    options.push(checkedOption);

    var notCheckedOption = new suite_l10n.view.SelectOption();
    notCheckedOption.value = 'F';
    notCheckedOption.text = NOT_CHECKED_OPTION;
    options.push(notCheckedOption);

    return options;
  }
};

dunning.app.DunningBulkUpdateFormDefinitionView = function DunningBulkUpdateFormDefinitionView () {
  var obj = {
    'title': null,
    'csScript': null,
    'submitButton': null,
    'mainFieldGroup': null,
    'bulkUpdateFieldGroup': null,
    'primaryFormFieldGroup': null
  };

  Object.seal(obj);
  return obj;
};
