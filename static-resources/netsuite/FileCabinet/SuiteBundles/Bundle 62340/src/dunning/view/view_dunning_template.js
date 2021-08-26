/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.view = dunning.view || {};

dunning.view.DunningTemplateValidator = function DunningTemplateValidator () {
  var SublistAPI = ns_wrapper.api.sublist;
  var FieldAPI = ns_wrapper.api.field;
  var INVALID_DEFAULT = 'dt.validator.invalidDefault';
  var NO_TEMPLATE_DOCUMENTS = 'dt.validator.noTemplateDocs';
  var NO_PDF_DOCUMENTS = 'dt.validator.noPDFDocs';
  var NO_EMAIL_DOCUMENTS = 'dt.validator.noEMailDocs';
  var CANNOT_DELETE_DEFAULT = 'dt.validator.defaultDeletion';
  var XML_EMAIL_DEPRECATED = 'dt.validator.xmlEmailDeprecated';
  var DELETE_ALL_XML_LINES = 'dt.validator.deleteAllXMLLines';
  var DUPLICATE_LANGUAGE = 'dt.validator.duplicateLanguage';
  var MULTIPLE_DEFAULT = 'dt.validator.multipleDefault';

  var TEMPLATE_DOC_EMAIL = 'recmachcustrecord_3805_template_parent_email';
  var TEMPLATE_DOC_PDF = 'recmachcustrecord_3805_template_parent_pdf';
  var TEMPLATE_CRM_EMAIL = 'recmachcustrecord_3805_dun_crm_email_temp_par';

  var TEMPLATE_DEFAULT_CBX = 'custrecord_3805_template_default';
  var TEMPLATE_CRM_DEFAULT_CBX = 'custrecord_3805_dun_crm_email_default';
  var CRM_LANG_FIELD = 'custrecord_3805_dun_crm_email_temp_lang';
  var XML_LANG_FIELD = 'custrecord_3805_template_language';
  var STATEMENT_DATE = 'custrecord_3805_statement_date';

  var messageHandler;
  var messages;
  var deleteAllDocEmails = false;
  var LocalizationVariableList = suite_l10n.variable.LocalizationVariableList;

  function getMessageHandler () {
    if (!messageHandler) {
      messageHandler = new suite_l10n.message.MessageHandler();
    }

    return messageHandler;
  }

  this.validateTemplate = function validateTemplate () {
    var crmEmailCount = SublistAPI.getLineItemCount(TEMPLATE_CRM_EMAIL);
    var xmlEmailCount = SublistAPI.getLineItemCount(TEMPLATE_DOC_EMAIL);
    var xmlPDFCount = SublistAPI.getLineItemCount(TEMPLATE_DOC_PDF);
    loadMessages();

    fillInDefaultStatementDateRange();

    // TODO: refactor this
    var noEmailTemplates = (crmEmailCount + xmlEmailCount) < 1;
    var noPDFTemplates = xmlPDFCount < 1;

    if (noEmailTemplates && noPDFTemplates) {
      return preventSave(messages[NO_TEMPLATE_DOCUMENTS]);
    }

    if (noEmailTemplates) {
      return preventSave(messages[NO_EMAIL_DOCUMENTS]);
    }

    if (noPDFTemplates) {
      return preventSave(messages[NO_PDF_DOCUMENTS]);
    }

    if (crmEmailCount > 0 && !validateOneDefaultOnly(TEMPLATE_CRM_EMAIL, crmEmailCount)) {
      return preventSave(messages[INVALID_DEFAULT]);
    }

    if (!validateOneDefaultOnly(TEMPLATE_DOC_PDF, xmlPDFCount)) {
      return preventSave(messages[INVALID_DEFAULT]);
    }
    if (!validateOneLanguageEach(TEMPLATE_CRM_EMAIL)) {
      return preventSave(messages[DUPLICATE_LANGUAGE]);
    }
    if (!validateOneLanguageEach(TEMPLATE_DOC_PDF)) {
      return preventSave(messages[DUPLICATE_LANGUAGE]);
    }
    return true;
  };

  function fillInDefaultStatementDateRange () {
    var SYS_PARAMS = 'syspar_type';
    var DEFAULT_STATEMENT_DATE = 'DEFAULT_STATEMENT_DATE';
    var sysParamsVariables = new LocalizationVariableList(SYS_PARAMS);

    var defaultStatementDate = sysParamsVariables.getValue(DEFAULT_STATEMENT_DATE);

    if (!FieldAPI.getFieldValue(STATEMENT_DATE)) {
      FieldAPI.setFieldValue(STATEMENT_DATE, defaultStatementDate, false, true);
    }
  }

  function validateOneDefaultOnly (sublist, count) {
    var hasDefault = false;
    for (var ctr = 1; ctr <= count; ctr++) {
      var defField = (sublist === TEMPLATE_CRM_EMAIL) ? TEMPLATE_CRM_DEFAULT_CBX : TEMPLATE_DEFAULT_CBX;
      var cbxValue = nlapiGetLineItemValue(sublist, defField, ctr);
      if (cbxValue == 'T' && !hasDefault) {
        hasDefault = true;
      } else if (cbxValue == 'T' && hasDefault) {
        return false;
      }
    }
    // There should be one default if there are document templates
    return count > 0 ? hasDefault : true;
  }

  function validateOneLanguageEach (sublist) {
    var TEMPLATE_LANGUAGE = (sublist === TEMPLATE_CRM_EMAIL) ? CRM_LANG_FIELD : XML_LANG_FIELD;
    var count = SublistAPI.getLineItemCount(sublist);
    var languageExistence = {};
    for (var ctr = 1; ctr <= count; ctr++) {
      var languageId = nlapiGetLineItemValue(sublist, TEMPLATE_LANGUAGE, ctr);

      if (!languageExistence[languageId]) {
        languageExistence[languageId] = languageId;
      } else {
        return false;
      }
    }
    return true;
  }

  function preventSave (errMsg) {
    if (!messageHandler) {
      messageHandler = new suite_l10n.message.MessageHandler();
    }
    messageHandler.showMessage(errMsg);

    return false;
  }

  function loadMessages () {
    if (!messages) {
      var stringCodes = [
        NO_TEMPLATE_DOCUMENTS,
        INVALID_DEFAULT,
        CANNOT_DELETE_DEFAULT,
        XML_EMAIL_DEPRECATED,
        DELETE_ALL_XML_LINES,
        DUPLICATE_LANGUAGE,
        NO_PDF_DOCUMENTS,
        NO_EMAIL_DOCUMENTS,
        MULTIPLE_DEFAULT];

      var messageLoaderContextCreator = new suite_l10n.app.MessageLoaderContextCreator();
      var messageLoaderContext = messageLoaderContextCreator.getLoaderContext(stringCodes);
      var messageLoader = new suite_l10n.app.MessageLoader(messageLoaderContext);

      messages = messageLoader.getMessageMap();
    }
  }

  function getDefaultLine (sublist, defaultField) {
    var count = SublistAPI.getLineItemCount(sublist);
    var defaultLine = 0;
    for (var i = 1; i <= count; i++) {
      if (SublistAPI.getLineItemValue(sublist, defaultField, i) === 'T') {
        defaultLine = i;
        break;
      }
    }
    return defaultLine;
  }

  this.validateDefault = function validateDefault (sublist, defaultField, lineNum) {
    var defaultLine = getDefaultLine(sublist, defaultField);
    var allowChange = true;
    var hasDefault = (defaultLine !== 0);
    var setNewDefaultLine = SublistAPI.getCurrentLineItemValue(sublist, defaultField) === 'T';
    if (hasDefault && setNewDefaultLine && defaultLine !== Number(lineNum)) {
      loadMessages();
      allowChange = getMessageHandler().showConfirmationMessage(messages[MULTIPLE_DEFAULT]);
    }

    if (allowChange && hasDefault) {
      SublistAPI.setLineItemValue(sublist, defaultField, defaultLine, 'F');
    }

    return allowChange;
  };

  this.validateLanguage = function validateLanguage (sublist) {
    var allowChange = true;
    var templateLanguage = (sublist === TEMPLATE_CRM_EMAIL) ? CRM_LANG_FIELD : XML_LANG_FIELD;
    var language = SublistAPI.getCurrentLineItemValue(sublist, templateLanguage);
    var currLine = Number(SublistAPI.getCurrentLineItemIndex(sublist));
    var line = Number(SublistAPI.findLineItemValue(sublist, templateLanguage, language));

    if (line > 0 && currLine !== line) {
      loadMessages();
      preventSave(messages[DUPLICATE_LANGUAGE]);
      allowChange = false;
    }
    return allowChange;
  };

  this.validateDeleteDefault = function validateDelateDefault (sublist) {
    var defField = (sublist === TEMPLATE_CRM_EMAIL) ? TEMPLATE_CRM_DEFAULT_CBX : TEMPLATE_DEFAULT_CBX;
    var cbxValue = SublistAPI.getCurrentLineItemValue(sublist, defField);
    var sublistCount = SublistAPI.getLineItemCount(sublist);
    loadMessages();

    if (!deleteAllDocEmails && cbxValue == 'T' && validateOneDefaultOnly(sublist, sublistCount)) {
      // cannot delete default
      if (!messageHandler) {
        messageHandler = new suite_l10n.message.MessageHandler();
      }

      messageHandler.showMessage(messages[CANNOT_DELETE_DEFAULT]);
      return false;
    }

    return true;
  };

  this.validateXMLEmail = function validateXMLEmail (isDelete) {
    var isValid = false;
    if (isDelete && deleteAllDocEmails) {
      isValid = true;
    } else {
      loadMessages();
      var messageHandler = getMessageHandler();
      messageHandler.showMessage(messages[XML_EMAIL_DEPRECATED]);
    }

    return isValid;
  };

  this.validateCRMEmailLine = function validateCRMEmailLine () {
    var crmEmailCount = SublistAPI.getLineItemCount(TEMPLATE_CRM_EMAIL);
    var xmlEmailCount = SublistAPI.getLineItemCount(TEMPLATE_DOC_EMAIL);
    var isValid = true;

    if (crmEmailCount > 0 && xmlEmailCount > 0) {
      loadMessages();
      var messageHandler = getMessageHandler();

      isValid = messageHandler.showConfirmationMessage(messages[DELETE_ALL_XML_LINES]);

      deleteAllDocEmails = isValid;
    }
    return isValid;
  };
};
