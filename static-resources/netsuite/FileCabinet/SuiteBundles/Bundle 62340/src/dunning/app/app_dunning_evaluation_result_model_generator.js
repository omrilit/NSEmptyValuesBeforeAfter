/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningEvalResultModelGenerator = function DERModelGenerator () {
  var DunningEvaluationResult = dunning.model.DunningEvaluationResult;

  var EMAIL = 'email';

  function createResultModel (evalResultDef, entity) {
    var model = new DunningEvaluationResult();

    model.entity = entity.id;
    model.recipient = entity.email;
    model.procedure = evalResultDef.procedureId;
    model.level = evalResultDef.levelId;
    model.invoices = evalResultDef.invoices;
    model.dunningManager = evalResultDef.dunningManager;
    model.templateId = evalResultDef.templateId;
    model.sourceType = evalResultDef.sourceType;
    model.letterType = evalResultDef.letterType;
    model.dunningManager = evalResultDef.dunningManager;

    var customer = evalResultDef.customer;
    model.customer = customer.id;

    return model;
  }

  function getCustomerDER (evalResultDef) {
    var model = createResultModel(evalResultDef, evalResultDef.customer);
    model.assignedToCustomer = 'T';
    return model;
  }

  this.generateModels = function generateModels (evalResultDef) {
    var dunnableContacts = evalResultDef.contacts;
    var dunningResultModels = [];

    for (var i = 0; i < dunnableContacts.length; i++) {
      var currContact = dunnableContacts[i];
      var model = createResultModel(evalResultDef, currContact);
      dunningResultModels.push(model);
    }

    if (evalResultDef.letterTypeValue !== EMAIL || !evalResultDef.excludeCustomer) {
      var customerResultModel = getCustomerDER(evalResultDef);
      dunningResultModels.push(customerResultModel);
    }

    return dunningResultModels;
  };
};
