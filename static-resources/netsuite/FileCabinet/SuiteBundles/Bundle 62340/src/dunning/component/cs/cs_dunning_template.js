/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.template = dunning.template || {};

dunning.template.validator = new dunning.view.DunningTemplateValidator();
dunning.template.deletedXMLEmails = false;
dunning.template.DELETED_XML_EMAILS = 'dt.messages.deleteXMLEmails';

dunning.template.getMessages = function getMessages () {
  if (!dunning.template.messages) {
    var stringCodes = [dunning.template.DELETED_XML_EMAILS];

    var messageLoaderContextCreator = new suite_l10n.app.MessageLoaderContextCreator();
    var messageLoaderContext = messageLoaderContextCreator.getLoaderContext(stringCodes);
    var messageLoader = new suite_l10n.app.MessageLoader(messageLoaderContext);
    dunning.template.messages = messageLoader.getMessageMap();
  }
  return dunning.template.messages;
};

dunning.template.pageInit = function pageInit () {
  var formHandler = new dunning.app.DunningTemplateFormHandler();
  formHandler.init();
};

dunning.template.saveRecord = function saveRecord () {
  var templateValidator = dunning.template.validator;
  var isValid = true;

  var hasCRM = ns_wrapper.api.sublist.getLineItemCount('recmachcustrecord_3805_dun_crm_email_temp_par') > 0;

  var isAllowCRM = templateValidator.validateCRMEmailLine();
  isValid = hasCRM ? isAllowCRM : isValid;
  if (hasCRM && isAllowCRM) {
    var formHandler = new dunning.app.DunningTemplateFormHandler();
    dunning.template.deletedXMLEmails = formHandler.clearXMLEmailSubList(isValid);
  }

  return isValid && templateValidator.validateTemplate();
};

dunning.template.fieldChanged = function fieldChanged (type, name, linenum) {
  var formHandler = new dunning.app.DunningTemplateFormHandler();
  formHandler.engageFieldChangeEvents(name);
};

dunning.template.validateInsertLine = function validateInsertLine (type) {
  var templateValidator = dunning.template.validator;
  var isValid = true;

  if (type === 'recmachcustrecord_3805_template_parent_email') {
    isValid = templateValidator.validateXMLEmail(true);
  }
  return isValid;
};

dunning.template.validateDeleteLine = function validateDeleteLine (type) {
  var templateValidator = dunning.template.validator;
  var isValid = true;

  if (type === 'recmachcustrecord_3805_template_parent_email') {
    isValid = templateValidator.validateXMLEmail(true);
  } else {
    isValid = templateValidator.validateDeleteDefault(type);
  }
  return isValid;
};

dunning.template.validateField = function validateField (type, field, lineNum) {
  var TEMPLATE_DOC_PDF = 'recmachcustrecord_3805_template_parent_pdf';
  var TEMPLATE_CRM_EMAIL = 'recmachcustrecord_3805_dun_crm_email_temp_par';
  var TEMPLATE_DEFAULT_CBX = 'custrecord_3805_template_default';
  var TEMPLATE_CRM_DEFAULT_CBX = 'custrecord_3805_dun_crm_email_default';

  var isValid = true;

  var isDefaultEmail = type === TEMPLATE_CRM_EMAIL && field === TEMPLATE_CRM_DEFAULT_CBX;
  var isDefaultPDF = type === TEMPLATE_DOC_PDF && field === TEMPLATE_DEFAULT_CBX;
  if (isDefaultEmail || isDefaultPDF) {
    var templateValidator = dunning.template.validator;
    isValid = templateValidator.validateDefault(type, field, lineNum);
  }
  return isValid;
};

dunning.template.lineInit = function lineInit (type) {
  var formHandler = new dunning.app.DunningTemplateFormHandler();
  formHandler.lineInit(type);
};

dunning.template.validateLine = function validateLine (type) {
  var templateValidator = dunning.template.validator;
  var TEMPLATE_DOC_EMAIL = 'recmachcustrecord_3805_template_parent_email';

  var isValid = true;
  if (type === TEMPLATE_DOC_EMAIL) {
    isValid = templateValidator.validateXMLEmail();
  } else {
    isValid = templateValidator.validateLanguage(type);
  }
  return isValid;
};
