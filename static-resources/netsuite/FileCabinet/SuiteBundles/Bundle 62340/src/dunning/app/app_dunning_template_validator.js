/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};
dunning.app.dunning_template_validator = dunning.app.dunning_template_validator || {};

dunning.app.DunningTemplateValidator = function DunningTemplateValidator () {
  var TEMPLATE_DOC_PDF = 'recmachcustrecord_3805_template_parent_pdf';

  var HEADER_DOC = 'custrecord_3805_header_doc';
  var BODY_DOC = 'custrecord_3805_body_doc';
  var FOOTER_DOC = 'custrecord_3805_footer_doc';

  var XSD_FILE_NAME = 'DunningTemplate.xsd';
  var XSD_ID;

  var EMAIL_SUBJECT = 'dt.validator.subject';
  var EMAIL_BODY = 'dt.validator.body';

  var l10nXmlValidator;
  var failedValidations = [];

  var messages = {};

  /**
   * @param {nlobjRecord} obj
   */
  this.validateTemplate = function validateTemplate (obj) {
    loadXsdId();
    l10nXmlValidator = new ns_wrapper.XMLValidator(XSD_ID);

    validatePerType(TEMPLATE_DOC_PDF, obj);

    if (failedValidations.length > 0) {
      notifyUser();
    }
  };

  function validatePerType (sublist, obj) {
    var count = obj.getLineItemCount(sublist);

    for (var ctr = 1; ctr <= count; ctr++) {
      var header = obj.getLineItemValue(sublist, HEADER_DOC, ctr);
      var body = obj.getLineItemValue(sublist, BODY_DOC, ctr);
      var footer = obj.getLineItemValue(sublist, FOOTER_DOC, ctr);

      if (header) {
        var headerValidationResult = l10nXmlValidator.validate(header);
        if (!headerValidationResult.success) { failedValidations.push(header); }
      }

      var bodyValidationResult = l10nXmlValidator.validate(body);
      if (!bodyValidationResult.success) { failedValidations.push(body); }

      if (footer) {
        var footerValidationResult = l10nXmlValidator.validate(footer);
        if (!footerValidationResult.success) { failedValidations.push(header); }
      }
    }
  }

  function notifyUser () {
    var search = new ns_wrapper.Search('file');
    search.addFilter('internalid', 'anyof', failedValidations);
    search.addColumn('name');
    var resultIterator = search.getIterator();
    var context = nlapiGetContext();
    var email = context.getEmail();
    var currentUser = context.getUser();

    loadMessages();
    var subject = messages[EMAIL_SUBJECT]; // "Failed Dunning Template Document Validation";
    var body = messages[EMAIL_BODY]; // ["The following template documents are invalid:"];
    while (resultIterator.hasNext()) {
      body.push(resultIterator.next().getValue('name'));
    }
    body = body.join('\n');

    var emailSender = new ns_wrapper.EmailSender();
    emailSender.send(currentUser, email, subject, body);
  }

  function loadXsdId () {
    var search = new ns_wrapper.Search('file');
    search.addFilter('name', 'is', XSD_FILE_NAME);

    var resultIterator = search.getIterator();

    XSD_ID = resultIterator.next().getId();
  }

  function loadMessages () {
    if (!messages) {
      var stringCodes = [EMAIL_BODY,
        EMAIL_SUBJECT];

      var messageLoaderContext = new suite_l10n.app.MessageLoaderContextCreator();
      var messageLoader = new suite_l10n.app.MessageLoader(messageLoaderContext.getLoaderContext(stringCodes));

      messages = messageLoader.getMessageMap();
    }
  }
};
