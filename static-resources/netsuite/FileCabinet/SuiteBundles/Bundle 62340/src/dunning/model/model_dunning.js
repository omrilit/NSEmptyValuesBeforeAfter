/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.model = dunning.model || {};

dunning.model.DunningTemplate = function () {
  this.id = null;
  this.name = null;
  this.description = null;
  this.attachStatement = null;
  this.attachCopiesOfInvoices = null;
  this.onlyOpenInvoicesOnTheStatement = null;
  this.onlyOverdueInvoices = null;
  this.statementDate = null;
  this.statementStartDate = null;
  this.dunningTemplateDocuments = {email: {}, pdf: {}};
  this.dunningCRMTemplates = {email: {}, pdf: {}};
};

dunning.model.DunningTemplate.prototype = {
  getDunningTemplateDocumentPdf: function (languageId) {
    return this.dunningTemplateDocuments.pdf[languageId] ||
      this.getDefaultDunningTemplateDocumentPdf();
  },

  getDunningTemplateDocumentEmail: function (languageId) {
    return this.dunningTemplateDocuments.email[languageId] ||
      this.getDefaultDunningTemplateDocumentEmail();
  },

  getDunningCRMTemplateEmail: function (languageId) {
    return this.dunningCRMTemplates.email[languageId] ||
      this.getDefaultDunningCRMTemplateEmail();
  },

  getDefaultDunningTemplateDocumentEmail: function () {
    return this.getDefaultDunningTemplateDocument('email');
  },

  getDefaultDunningCRMTemplateEmail: function () {
    return this.getDefaultDunningCRMTemplate('email');
  },

  getDefaultDunningTemplateDocumentPdf: function () {
    return this.getDefaultDunningTemplateDocument('pdf');
  },

  getDefaultDunningTemplateDocument: function (type) {
    if (!this.dunningTemplateDocuments.hasOwnProperty(type)) {
      return;
    }
    for (var language in this.dunningTemplateDocuments[type]) {
      if (this.dunningTemplateDocuments[type].hasOwnProperty(language)) {
        var doc = this.dunningTemplateDocuments[type][language];
        if (doc.default === 'T') {
          return doc;
        }
      }
    }
  },

  getDefaultDunningCRMTemplate: function (type) {
    if (!this.dunningCRMTemplates.hasOwnProperty(type)) {
      return;
    }
    for (var language in this.dunningCRMTemplates[type]) {
      if (this.dunningCRMTemplates[type].hasOwnProperty(language)) {
        var doc = this.dunningCRMTemplates[type][language];
        if (doc.default === 'T') {
          return doc;
        }
      }
    }
  },

  addTemplateDocumentEmail: function (templateDoc) {
    this.dunningTemplateDocuments.email[templateDoc.language] = templateDoc;
  },

  addCRMTemplateEmail: function (crmRec) {
    this.dunningCRMTemplates.email[crmRec.language] = crmRec;
  },

  addTemplateDocumentPdf: function (templateDoc) {
    this.dunningTemplateDocuments.pdf[templateDoc.language] = templateDoc;
  },

  /**
   * Updates properties that are null.
   * @param {Object} defaults
   * @returns {boolean} returns true, if something has been changed
   */
  setUpDefaults: function (defaults) {
    var fields = [
      'id',
      'name',
      'description',
      'attachStatement',
      'attachCopiesOfInvoices',
      'onlyOpenInvoicesOnTheStatement',
      'onlyOverdueInvoices',
      'statementDate',
      'statementStartDate'
    ];
    var obj = this;

    return fields.filter(function (key) {
      return defaults.hasOwnProperty(key) &&
          (obj[key] == null || obj[key] == '') &&
          obj[key] != defaults[key];
    })
      .map(function (key) {
        obj[key] = defaults[key];
      })
      .length > 0;
  }
};

dunning.model.DunningTemplateDocument = function () {
  this.id = null;
  this.name = null;
  this.language = null;
  this.subject = null;
  this.headerDocument = null;
  this.bodyDocument = null;
  this.footerDocument = null;
  this.default = null;
  this.dunningTemplateEmailParent = null;
  this.dunningTemplatePdfParent = null;
};

dunning.model.DunningCRMTemplate = function () {
  this.id = null;
  this.name = null;
  this.locale = null;
  this.language = null;
  this.emailTemplate = null;
  this.default = null;
  this.dunningCRMTemplateEmailParent = null;
};

dunning.model.DunningSavedSearch = function () {
  this.id = null;
  this.type = null;
  this.name = null;
  this.internalid = null;
  this.searchColumns = {};
};

dunning.model.DunningSavedSearchColumn = function () {
  this.id = null;
  this.join = null;
  this.label = null;
};

dunning.model.Level = function () {
  this.id = null;
  this.name = null;
  this.procedureID = null;
  this.daysOverdue = null;
  this.minOutstandingAmount = null;
  this.templateId = null;
  this.currency = null;
};

dunning.model.DunningEvaluationResult = function () {
  this.id = null;
  this.procedure = null;
  this.level = null;
  this.entity = null;
  this.assignedToCustomer = null;
  this.invoices = null;
  this.recipient = null;
  this.recipientEmail = null;
  this.subject = null;
  this.message = null;
  this.dunningManager = null;
  this.subsidiary = null;
  this.templateId = null;
  this.sourceType = null;
  this.customer = null;
  this.letterType = null;
};

dunning.model.DunningProcedure = function () {
  this.id = null;
  this.description = null;
  this.dunningSource = null;
  this.sendingSchedule = null;
  this.daysBetweenSendingLetters = null;
  this.subsidiaries = null;
  this.savedSearchCustomer = null;
  this.savedSearchInvoice = null;
  this.savedSearchCustomerText = null;
  this.savedSearchInvoiceText = null;
  this.weighting = null;
  this.allowOverride = null;
  this.departments = null;
  this.classes = null;
  this.locations = null;
  this.preferredLanguage = null;
  this.assignAutomatically = null;
  this.currency = null;
  this.dunningManager = null;
  this.operator = null;
};

/**
 * @extends {suite_l10n.model.Customer}
 * @constructor
 */
dunning.model.DunningCustomer = function () {
  this.id = null;
  this.subsidiary = null;
  this.isPerson = null;
  this.language = null;
  this.sendByEmail = null;
  this.sendByPrint = null;
  this.isDunningPaused = null;
  this.lastSentDate = null;
  this.dunningProcedureId = null;
  this.dunningLevelId = null;
  this.dunningManager = null;
  this.email = null;
  this.source = null;
  this.recordType = null;
  this.excludeCompanyEmail = null;
};

/**
 * @extends {suite_l10n.model.Invoice}
 * @constructor
 */
dunning.model.DunningInvoice = function () {
  this.id = null;
  this.subsidiary = null;
  this.classification = null;
  this.location = null;
  this.department = null;
  this.customer = null;
  this.dunningProcedureId = null;
  this.dunningLevelId = null;
  this.sendByEmail = null;
  this.sendByPrint = null;
  this.isDunningPaused = null;
  this.lastSentDate = null;
  this.dunningManager = null;
  this.status = null;
  this.substatus = null;
};

dunning.model.DunningEvaluationStatement = function () {
  this.id = null;
  this.currency = null;
  this.statement = null;
  this.dunningProcedure = null;
};

dunning.model.DunningLevelRuleAmount = function () {
  this.parent = null;
  this.currency = null;
  this.statement = '';
  this.amount = 0;
  this.totalOverdueBalance = 0;
  this.default = 'F';
  this.systemGenerated = 'F';
};

dunning.model.ProcedureCurrencyManagerInput = function () {
  this.type = null;
  this.oldRecord = null;
  this.newRecord = null;
  this.context = null;
  this.isOneWorld = false;
};

dunning.model.DunningConfiguration = function () {
  this.id = null;
  this.subsidiary = null;
  this.autoAssignForInvoices = 'T';
  this.autoAssignForCustomers = 'T';
};
