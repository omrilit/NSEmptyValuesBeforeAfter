/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.CustomerDunningResultCreator = function CustomerDunningResultCreator (assessmentInput, newLevel) {
  var DunningEvaluationResultDAO = dao.DunningEvaluationResultDAO;
  var DunningCustomerDAO = dao.DunningCustomerDAO;
  var DERModelGeneratorDefinition = dunning.view.DunningEvalResultModelGeneratorDefinition;
  var LocalizationVariableList = suite_l10n.variable.LocalizationVariableList;

  var invoiceList;

  function getInvoiceList () {
    if (!invoiceList) {
      var invoiceObjectList = assessmentInput.invoices;
      invoiceList = [];
      for (var i = 0; i < invoiceObjectList.length; i++) {
        invoiceList.push(invoiceObjectList[i].internalid || invoiceObjectList[i].id);
      }
    }
    return invoiceList;
  }

  var customerDAO = null;

  function getCustomerDAO () {
    if (!customerDAO) {
      customerDAO = new DunningCustomerDAO();
    }
    return customerDAO;
  }

  var contacts;

  function getContacts (customerModel) {
    if (!contacts) {
      contacts = getCustomerDAO().getDunnableContacts(customerModel);
    }
    return contacts;
  }

  function getDERGeneratorDefinition (customerModel) {
    var modelGenDef = new DERModelGeneratorDefinition();
    modelGenDef.customer = customerModel;
    modelGenDef.sourceType = assessmentInput.recordType;
    modelGenDef.procedureId = assessmentInput.procedure;
    modelGenDef.levelId = newLevel ? newLevel.id : null;
    modelGenDef.templateId = newLevel.templateId;
    modelGenDef.dunningManager = assessmentInput.dunningManager;
    modelGenDef.invoices = getInvoiceList();
    modelGenDef.contacts = getContacts(customerModel);
    modelGenDef.excludeCustomer = customerModel.excludeCompanyEmail === 'T';

    return modelGenDef;
  }

  var LETTER_TYPE_MAP = {
    'email': 'sendByEmail',
    'pdf': 'sendByPrint'
  };

  function getModelGeneratorDefinitionList (customerModel, derSourceModel) {
    var modelGeneratorDefinitions = [];
    var variableList = new LocalizationVariableList('letter_type');

    for (var letterType in LETTER_TYPE_MAP) {
      var sendTypeField = LETTER_TYPE_MAP[letterType];
      if (derSourceModel[sendTypeField] === 'T') {
        var modelGeneratorDefinition = getDERGeneratorDefinition(customerModel);
        modelGeneratorDefinition.letterType = variableList.getIdByValue(letterType);
        modelGeneratorDefinition.letterTypeValue = letterType;

        modelGeneratorDefinitions.push(modelGeneratorDefinition);
      }
    }

    return modelGeneratorDefinitions;
  }

  function getDERModels (modelGeneratorDefinitionList) {
    var generator = new dunning.app.DunningEvalResultModelGenerator();
    var dunningResultModels = [];

    for (var i = 0; i < modelGeneratorDefinitionList.length; i++) {
      var generatedModels = generator.generateModels(modelGeneratorDefinitionList[i]);
      dunningResultModels = dunningResultModels.concat(generatedModels);
    }

    return dunningResultModels;
  }

  var invoiceModel;

  function getInvoiceModel () {
    if (!invoiceModel) {
      var invoiceDAO = new dao.DunningInvoiceDAO();
      invoiceModel = invoiceDAO.retrieve(assessmentInput.internalid);
    }
    return invoiceModel;
  }

  var customerModel;

  function getCustomerModel () {
    if (!customerModel) {
      customerModel = getCustomerDAO().retrieve(assessmentInput.customer);
    }
    return customerModel;
  }

  function getDERSourceModel () {
    var model = getCustomerModel();
    if (assessmentInput.recordType === 'invoice') {
      model = getInvoiceModel();
    }
    return model;
  }

  this.createResults = function () {
    var customerModel = getCustomerModel();
    var derSourceModel = getDERSourceModel();
    var modelGeneratorDefinitionList = getModelGeneratorDefinitionList(customerModel, derSourceModel);
    var dunningResultModels = getDERModels(modelGeneratorDefinitionList);
    var dunningEvalResultDAO = new DunningEvaluationResultDAO();

    var createdResults = [];
    for (var i = 0; i < dunningResultModels.length; i++) {
      createdResults.push(dunningEvalResultDAO.create(dunningResultModels[i]));
    }
    return createdResults;
  };
};
