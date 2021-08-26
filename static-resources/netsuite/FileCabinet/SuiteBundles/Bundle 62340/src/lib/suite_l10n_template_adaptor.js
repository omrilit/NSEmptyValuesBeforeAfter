/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var ns_wrapper = ns_wrapper || {};

ns_wrapper.TemplateAdaptor = function TemplateAdaptor (nlobjRequestWrapper) {
  var requestWrapper = null;

  this.getViewObject = function getViewObject () {
    var reqData = requestWrapper.getParameter('custpage_3805_dt_data');
    var JSONParser = new suite_l10n.parser.JSONParser();
    var jsonObj = JSONParser.parse(JSON.stringify(reqData));

    var viewDunningTemplate = new dunning.view.ViewDunningTemplate();
    viewDunningTemplate.id = jsonObj.id;
    viewDunningTemplate.name = jsonObj.name;
    viewDunningTemplate.description = jsonObj.description;
    viewDunningTemplate.attachStatement = jsonObj.attachStatement;
    viewDunningTemplate.onlyOverdueInvoicesStmt = jsonObj.onlyOverdueInvoicesStmt;
    viewDunningTemplate.inactive = jsonObj.inactive;
    viewDunningTemplate.attachCopiesofInvoices = jsonObj.attachCopiesofInvoices;
    viewDunningTemplate.onlyOverdueInvoices = jsonObj.onlyOverdueInvoices;

    // subject for change if there are multiple languages supported
    reqData = requestWrapper.getParameter('custpage_3805_dt_data_en_us');
    jsonObj = JSONParser.parse(JSON.stringify(reqData));

    var viewDunningTemplateText = new dunning.view.ViewDunningTemplateText();
    viewDunningTemplateText.language = jsonObj.language;
    viewDunningTemplateText.subject = jsonObj.subject;
    viewDunningTemplateText.bodyText = jsonObj.content;
    viewDunningTemplate.dunningTemplateTexts[jsonObj.language] = viewDunningTemplateText;

    return viewDunningTemplate;
  };

  this.parseViewToModel = function parseViewToModel (viewObj) {
    var modelDunningTemplate = new dunning.model.DunningTemplate();

    modelDunningTemplate.id = viewObj.id;
    modelDunningTemplate.name = viewObj.name;
    modelDunningTemplate.description = viewObj.description;
    modelDunningTemplate.attachStatement = viewObj.attachStatement;
    modelDunningTemplate.onlyOverdueInvoicesStmt = viewObj.onlyOverdueInvoicesStmt;
    modelDunningTemplate.inactive = viewObj.inactive;
    modelDunningTemplate.attachCopiesofInvoices = viewObj.attachCopiesofInvoices;
    modelDunningTemplate.onlyOverdueInvoices = viewObj.onlyOverdueInvoices;

    var dunningTemplateTexts = viewObj.dunningTemplateTexts;

    var propertyCount = countProperties(dunningTemplateTexts);

    for (var i = 0; i < propertyCount; i++) {
      var viewText = dunningTemplateTexts[i];
      var modelDunningTemplateText = new dunning.model.DunningTemplateText();

      modelDunningTemplateText.language = viewText.language;
      modelDunningTemplateText.subject = viewText.subject;
      modelDunningTemplateText.content = viewText.content;

      modelDunningTemplate.dunningTemplateTexts[viewText.language] = modelDunningTemplateText;
    }

    return modelDunningTemplate;
  };

  function countProperties (obj) {
    var count = 0;
    for (var property in obj) {
      if (obj.hasOwnProperty(property)) {
        count++;
      }
    }
    return count;
  }
};
