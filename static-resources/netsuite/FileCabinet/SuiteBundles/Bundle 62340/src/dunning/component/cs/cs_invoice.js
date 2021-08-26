/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author mjaurigue
 */

var dunning = dunning || {};
dunning.component = dunning.component || {};
dunning.component.cs = dunning.component.cs || {};

var dunningcs = dunning.component.cs;

dunningcs.DUNNING_PAUSE_ID = 'custbody_3805_dunning_paused';
dunningcs.DUNNING_PROCEDURE_ID = 'custbody_3805_dunning_procedure';
dunningcs.DUNNING_MANAGER = 'custbody_3805_dunning_manager';
dunningcs.DUNNING_PROC_RECORD = 'customrecord_3805_dunning_procedure';
dunningcs.DEFAULT_DUNNING_MGR = 'custrecord_3805_default_dunning_manager';
dunningcs.DUNNING_LEVEL = 'custbody_3805_dunning_level';

dunningcs.getMessageHandler = function loadMessageHandler () {
  if (!dunningcs.messageHandler) {
    dunningcs.messageHandler = new suite_l10n.message.MessageHandler();
  }
  return dunningcs.messageHandler;
};

dunningcs.getResumeHandler = function getResumeHandler () {
  dunningcs.resumptionHandler = dunningcs.resumptionHandler ||
    new dunning.app.DunningResumptionHandler(dunningcs.DUNNING_PAUSE_ID, dunningcs.DUNNING_PROCEDURE_ID);
  return dunningcs.resumptionHandler;
};

dunningcs.pageInit = function pageInit () {
  /* Fields in the Customer/Invoice Dunning Subtab are initially hidden/disabled.
   * If the user role is not a Dunning Role, we will keep those fields hidden/disabled. */
  var dunningRoleVerifier = new dunning.app.DunningRoleVerifier(true);

  if (dunningRoleVerifier.isRoleForDunning()) {
    dunningcs.getResumeHandler();
  }
};

dunningcs.clientFieldChanged = function clientFieldChanged (type, name, a) {
  if (name == dunningcs.DUNNING_PROCEDURE_ID) {
    var roleAssesor = new dunning.app.DunningRoleAssessor(true);

    ns_wrapper.api.field.setFieldValue(dunningcs.DUNNING_LEVEL, '', false, true);

    if (roleAssesor.isDunningDirector()) {
      var procedureId = ns_wrapper.api.field.getFieldValue(dunningcs.DUNNING_PROCEDURE_ID);
      var defaultDM = getDefaultDunningManager(procedureId);
      ns_wrapper.api.field.setFieldValue(dunningcs.DUNNING_MANAGER, defaultDM);
    }
  }
};

dunningcs.validateField = function validateField (type, name, lineNum) {
  var isValid = true;
  if (name == dunningcs.DUNNING_PAUSE_ID) {
    isValid = dunningcs.getResumeHandler().handleResumption();
  }
  return isValid;
};

dunningcs.saveRecord = function saveRecord () {
  var invoiceManager = new dunning.app.InvoiceManager();
  return invoiceManager.validateInvoice();
};

function getDefaultDunningManager (procedureId) {
  var defaultDM;

  if (procedureId) {
    defaultDM = ns_wrapper.api.field.lookupField(dunningcs.DUNNING_PROC_RECORD,
      procedureId, dunningcs.DEFAULT_DUNNING_MGR);
  }

  return defaultDM;
}
