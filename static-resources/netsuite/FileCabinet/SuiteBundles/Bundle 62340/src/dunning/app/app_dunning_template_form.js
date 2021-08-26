/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningTemplateForm = function DunningTemplateForm (request, response) {
  var FormBuilder = suite_l10n.ui_builder.FormBuilder;
  var DunningTemplate = dunning.model.DunningTemplate;
  var ButtonDefinition = suite_l10n.ui_builder.ButtonDefinition;
  var DunningTemplateFieldGenerator = dunning.app.DunningTemplateFieldGenerator;
  var DunningTemplateDAO = dao.DunningTemplateDAO;
  var Translator = ns_wrapper.Translator;

  function getDunningId () {
    return request.getParameter('custpage_3805_id');
  }

  function addButtons (formBuilder, translator) {
    var submitButtonDef = new ButtonDefinition();
    submitButtonDef.name = translator
      .getString('form.dunning_template.button.submit');

    formBuilder.addSubmitButton(submitButtonDef);
    formBuilder.addResetButton();
  }

  function getDefaultDunningTemplate () {
    var id = getDunningId();
    var dunningTemplate = new DunningTemplate();

    if (id && id.length < 0) {
      dunningTemplate.id = id;
      dunningTemplate = (new DunningTemplateDAO())
        .retrieve(dunningTemplate);
    }

    return dunningTemplate;
  }

  function showForm () {
    var translator = new Translator('en-US');
    var dunningTemplate = getDefaultDunningTemplate();

    var formTitle = translator.getString('form.dunning_template.title');
    var formBuilder = new FormBuilder();
    formBuilder.setTitle(formTitle);

    var fieldGenerator = new DunningTemplateFieldGenerator();
    var fieldDefs = fieldGenerator
      .generateFieldDefinitions(translator, dunningTemplate);
    formBuilder.addFieldDefinitions(fieldDefs);

    addButtons(formBuilder, translator);
    formBuilder.setScript('customscript_3805_dunning_template_cs');

    response.writeForm(formBuilder.buildForm());
  }

  return {
    showForm: showForm
  };
};

dunning.app.DunningTemplateFieldGenerator = function DunningTemplateFieldGenerator () {
  var FieldDefinition = suite_l10n.ui_builder.FieldDefinition;
  var StringFormatter = suite_l10n.string.StringFormatter;
  var HTMLTemplateDAO = dao.HTMLTemplateDAO;
  var DunningTemplateDAO = dao.DunningTemplateDAO;

  var LABEL_STUBS = [
    'form.dunning_template.title',
    'form.dunning_template.button.submit'];

  function getActionField () {
    var actionField = new FieldDefinition();
    actionField.name = 'custpage_3805_action';
    actionField.label = '';
    actionField.type = 'text';
    actionField.displayType = 'hidden';
    actionField.value = '';
    return actionField;
  }

  function getIdField (dunningTemplate) {
    var idField = new FieldDefinition();
    idField.name = 'custpage_3805_id';
    idField.label = '';
    idField.type = 'text';
    idField.displayType = 'hidden';
    idField.value = dunningTemplate.id;
    idField.mandatory = true;

    return idField;
  }

  function getFormField (dunningTemplate, labelTranslations) {
    var containerField = new FieldDefinition();
    containerField.name = 'custpage_3805_dt_form';
    containerField.label = '';
    containerField.type = 'inlinehtml';
    containerField.displayType = 'normal';

    var htmlDao = new HTMLTemplateDAO();
    var htmlObj = htmlDao.retrieveByName('DUNNING_TEMPLATE');

    var strFormatter = new StringFormatter(htmlObj.content);
    strFormatter.replaceParameters(dunningTemplate);
    strFormatter.replaceStubs(labelTranslations);

    containerField.value = strFormatter.toString();

    return containerField;
  }

  function getTranslationsField (labelTranslations) {
    var translationsField = new FieldDefinition();
    translationsField.name = 'custpage_3805_dt_translations';
    translationsField.label = '';
    translationsField.type = 'longtext';
    translationsField.displayType = 'hidden';

    var strFormatter = new StringFormatter();
    strFormatter.stringify(labelTranslations);

    translationsField.value = strFormatter.toString();

    return translationsField;
  }

  function getDataContainerField (dunningTemplate) {
    var dataContainerField = new FieldDefinition();
    dataContainerField.name = 'custpage_3805_dt_data';
    dataContainerField.label = '';
    dataContainerField.type = 'longtext';
    dataContainerField.displayType = 'hidden';

    var strFormatter = new StringFormatter();
    strFormatter.stringify(dunningTemplate);

    dataContainerField.value = strFormatter.toString();

    return dataContainerField;
  }

  function getTextContainerField (dtText) {
    var textContainerField = new FieldDefinition();
    textContainerField.name = 'custpage_3805_dt_data_' +
      dtText.language.toLowerCase();
    textContainerField.label = '';
    textContainerField.type = 'longtext';
    textContainerField.displayType = 'hidden';
    var strFormatter = new StringFormatter();
    strFormatter.stringify(dtText);

    textContainerField.value = strFormatter.toString();
    return textContainerField;
  }

  function getTextContainerFields (dunningTemplate, supportedLanguages) {
    var fields = [];
    var dunningTemplateDAO = new DunningTemplateDAO();

    for (var i = 0; i < supportedLanguages.length; i++) {
      var currText = { language: supportedLanguages[i] } ||
          dunningTemplateDAO.getText(dunningTemplate, supportedLanguages[i]);
      fields.push(getTextContainerField(currText));
    }

    return fields;
  }

  function getSupportedLanguages () {
    var subLanguage = nlapiLoadRecord('subsidiary', 1)
      .getFieldValue('languagelocale');

    var supportedLanguages = ['en_US'];

    if (subLanguage && supportedLanguages.indexOf(subLanguage) == -1) {
      supportedLanguages.push(subLanguage);
    }

    var companyPreferences = nlapiLoadConfiguration('companypreferences');
    var translationCount = companyPreferences.getLineItemCount('tranlang');

    for (var i = 1; i <= translationCount; i++) {
      var currLanguage = companyPreferences
        .getLineItemValue('tranlang', 'langkey', i);
      if (supportedLanguages.indexOf(currLanguage) == -1) {
        supportedLanguages.push(currLanguage);
      }
    }

    return supportedLanguages;
  }

  function getLabelTranslations (translator) {
    var translations = {};

    for (var i = 0; i < LABEL_STUBS.length; i++) {
      translations[LABEL_STUBS[i]] = translator.getString(i);
    }

    return translations;
  }

  function generateFieldDefinitions (translator, dunningTemplate) {
    var labelTranslations = getLabelTranslations(translator);

    var actionField = getActionField();
    var idField = getIdField(dunningTemplate);
    var formField = getFormField(dunningTemplate, labelTranslations);
    var translationsField = getTranslationsField(labelTranslations);
    var dataContainerField = getDataContainerField(dunningTemplate);

    var supportedLanguages = getSupportedLanguages();
    var textContainerFields = getTextContainerFields(dunningTemplate, supportedLanguages);

    return [
      actionField,
      idField,
      formField,
      translationsField,
      dataContainerField].concat(textContainerFields);
  }

  return {
    generateFieldDefinitions: generateFieldDefinitions
  };
};
