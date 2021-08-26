/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningTemplateManager = function DunningTemplateManager () {
  this.convertToTemplateView = function convertToTemplateView (template, templateDoc, crmTemplate) {
    var templateConv = new dunning.app.DunningTemplateConverter();
    var templateDocConv = new dunning.app.DunningTemplateDocumentConverter();
    var crmTemplateConv = new dunning.app.DunningCRMTemplateConverter();

    var templateView = templateConv.castToView(template);

    if (templateDoc) {
      templateView.dunningTemplateDocument = templateDocConv.castToView(templateDoc);
    }

    if (crmTemplate) {
      templateView.dunningCRMTemplate = crmTemplateConv.castToView(crmTemplate);
    }

    return templateView;
  };

  var templateDAO;
  this.getTemplateDAO = function getTemplateDAO () {
    if (!templateDAO) {
      templateDAO = new dao.DunningTemplateDAO();
    }
    return templateDAO;
  };

  this.getTemplateModel = function getTemplateModel (templateId) {
    var templateDAO = this.getTemplateDAO();
    return templateDAO.retrieveById(templateId);
  };

  /* default behavior in the parent class, should be defined in subclass */
  this.getTemplateDocumentModel = function () {
    return null;
  };

  /* default behavior in the parent class, should be defined in subclass */
  this.getCRMTemplateModel = function () {
    return null;
  };

  this.getEmailTemplateDocumentModel = function (templateId, languageId) {
    var templateDAO = this.getTemplateDAO();
    return templateDAO.retrieveEmailDocument(templateId, languageId);
  };

  this.getEmailCRMTemplateModel = function (templateId, languageId) {
    var templateDAO = this.getTemplateDAO();
    return templateDAO.retrieveEmailCRMTemplate(templateId, languageId);
  };

  this.getPDFTemplateDocumentModel = function (templateId, languageId) {
    var templateDAO = this.getTemplateDAO();
    return templateDAO.retrievePDFDocument(templateId, languageId);
  };

  this.getLanguageId = function getLanguageId (language) {
    var languageId;
    if (language) {
      var map = new suite_l10n.app.LanguageMap();
      languageId = map.getCorrespondingId(language);
    }
    return languageId;
  };

  this.getDunningTemplate = function getDunningTemplate (templateId, language) {
    var template = this.getTemplateModel(templateId);
    var languageId = this.getLanguageId(language);

    var templateDoc = this.getTemplateDocumentModel(templateId, languageId);
    var crmTemplate = this.getCRMTemplateModel(templateId, languageId);

    var view = this.convertToTemplateView(template, templateDoc, crmTemplate);

    if (view.dunningTemplateDocument) {
      view.dunningTemplateDocument.locale = language;
    }

    if (view.dunningCRMTemplate) {
      view.dunningCRMTemplate.locale = language;
    }

    return view;
  };
};
