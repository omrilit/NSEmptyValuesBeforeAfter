/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author mjaurigue
 * 2.00      12 May 2014    mmoya        Added logic for setting weight
 */

var dunning = dunning || {};
dunning.procedure = dunning.procedure || {};

dunning.procedure.SUBLIST_ID = 'recmachcustrecord_3805_dl_procedure';
dunning.procedure.FIELD_NAME = 'name';
dunning.procedure.FIELD_WEIGHT = 'custrecord_3805_dp_weighting';
dunning.procedure.DUNNING_SOURCE = 'custrecord_3805_dp_type';
dunning.procedure.LEVEL_PROCEDURE_FIELD_ID = 'custrecord_3805_dl_procedure';
dunning.procedure.LEVEL_RECORD_TYPE = 'customrecord_3805_dunning_level';

dunning.procedure.STATEMENT_PROCEDURE_FIELD_ID = 'custrecord_3805_des_procedure';
dunning.procedure.STATEMENT_RECORD_TYPE = 'customrecord_3805_dunning_eval_statement';

var MESSAGE_DP_TYPE_EDIT_NOT_ALLOWED = 'dp.validateDP.editNotAllowed';
var MESSAGE_ACCESS_ERROR = 'l10n.accessForDDandAccountant';

var SublistAPI = ns_wrapper.api.sublist;
var FieldAPI = ns_wrapper.api.field;
var RecordAPI = ns_wrapper.api.record;
var Field = suite_l10n.view.Field;
var StringFormatter = suite_l10n.string.StringFormatter;
var ChildRemoverSetting = suite_l10n.view.ChildRemoverSetting;
var ChildRecordRemover = suite_l10n.app.ChildRecordRemover;

var messages;

function loadMessageObjects () {
  if (!messages) {
    var stringCodes = [MESSAGE_DP_TYPE_EDIT_NOT_ALLOWED, MESSAGE_ACCESS_ERROR];
    var messageLoaderContextCreator = new suite_l10n.app.MessageLoaderContextCreator();
    var messageLoaderContext = messageLoaderContextCreator.getLoaderContext(stringCodes);
    var messageLoader = new suite_l10n.app.ServerSideMessageLoader(messageLoaderContext);
    messages = messageLoader.getMessageMap();
  }
}

dunning.procedure.userEventBeforeLoad = function userEventBeforeLoad (type, form) {
  var context = ns_wrapper.context();
  var execContext = context.getExecutionContext();

  if (type == 'create' || type == 'edit' || type == 'copy') {
    var roleAssessor = new dunning.app.DunningRoleAssessor();
    if (!roleAssessor.isDunningDirector()) {
      loadMessageObjects();
      throw nlapiCreateError('FOR_DUNNING_DIRECTOR_ACCOUNTANT_ADMIN_ACCESS_ONLY', messages[MESSAGE_ACCESS_ERROR]);
    }
  }

  if (execContext === 'userinterface') {
    configureForm(type, form);
  }

  function configureForm (type, form) {
    var nlObjField;

    if (type == 'edit') {
      form.getField(dunning.procedure.DUNNING_SOURCE).setDisplayType('inline');

      var itemCount = Number(SublistAPI.getLineItemCount(dunning.procedure.SUBLIST_ID));
      for (var i = 1; i <= itemCount; i++) {
        nlObjField = SublistAPI.getLineItemField(dunning.procedure.SUBLIST_ID, dunning.procedure.FIELD_NAME, i);
        new ns_wrapper.Field(nlObjField, getFieldData(nlObjField)).setDisplayType('hidden');
      }
    } else if (type == 'create') {
      nlObjField = SublistAPI.getLineItemField(dunning.procedure.SUBLIST_ID, dunning.procedure.FIELD_NAME, -1);
      if (nlObjField) {
        new ns_wrapper.Field(nlObjField, getFieldData(nlObjField)).setDisplayType('hidden');
      }
    }
  }
};

dunning.procedure.userEventBeforeSubmit = function userEventBeforeSubmit (type) {
  setDunningLevelNames();
  var roleAssessor = new dunning.app.DunningRoleAssessor();
  var isDD = roleAssessor.isDunningDirector();

  if (!isDD && (type == 'xedit' || type == 'delete')) {
    loadMessageObjects();
    throw nlapiCreateError('FOR_DUNNING_DIRECTOR_ACCOUNTANT_ADMIN_ACCESS_ONLY', messages[MESSAGE_ACCESS_ERROR]);
  } else {
    if (type == 'create') {
      setDunningPriorityFields();
    } else if (type == 'xedit') {
      validateDPType();
    } else if (type == 'delete') {
      removeLevels();
      removeStatements();
    }
  }

  function setDunningLevelNames () {
    var lineNumberCount = Number(SublistAPI.getLineItemCount(dunning.procedure.SUBLIST_ID));
    for (var i = 1; i <= lineNumberCount; i++) {
      SublistAPI.setLineItemValue(dunning.procedure.SUBLIST_ID, dunning.procedure.FIELD_NAME, i, String(i));
    }
  }

  function removeLevels () {
    var setting = new ChildRemoverSetting();
    setting.childRecordType = dunning.procedure.LEVEL_RECORD_TYPE;
    setting.parentFieldId = dunning.procedure.LEVEL_PROCEDURE_FIELD_ID;
    setting.subListId = dunning.procedure.SUBLIST_ID;
    setting.record = RecordAPI.getNewRecord();

    var childRemover = new ChildRecordRemover(setting);
    childRemover.removeChildren();
  }

  function removeStatements () {
    var setting = new ChildRemoverSetting();
    setting.childRecordType = dunning.procedure.STATEMENT_RECORD_TYPE;
    setting.parentFieldId = dunning.procedure.STATEMENT_PROCEDURE_FIELD_ID;
    setting.record = RecordAPI.getNewRecord();

    var childRemover = new ChildRecordRemover(setting);
    childRemover.removeChildren();
  }

  function setDunningPriorityFields () {
    var dunningProcedureDAO = new dao.DunningProcedureDAO();
    var model = dunningProcedureDAO.castToModel(RecordAPI.getNewRecord(), false);

    var dunningProcedureConverter = new dunning.app.DunningProcedureConverter();
    var view = dunningProcedureConverter.castToView(model);

    var dunningPriorityProcessor = new dunning.priority.DunningPriorityProcessor();
    var dunningPriority = dunningPriorityProcessor.computeDunningPriority(view);

    FieldAPI.setFieldValue(dunning.procedure.FIELD_WEIGHT, dunningPriority.priorityNumber, false, false);
    FieldAPI.setFieldValue(dunningPriority.priorityFieldName, dunningPriority.priorityListId, false, false);
  }

  function validateDPType () {
    // "newRecDunningSource" will be null if there will be no changes in the dunning procedure type field
    var newRecDunningSource = RecordAPI.getNewRecord().getFieldValue('custrecord_3805_dp_type');
    if (newRecDunningSource) {
      loadMessageObjects();

      var message = new StringFormatter(messages[MESSAGE_DP_TYPE_EDIT_NOT_ALLOWED]);
      throw nlapiCreateError('DUNNING_PROC_TYPE_MODIFICATION_NOT_ALLOWED', String(message));
    }
  }

  return true;
};

dunning.procedure.userEventAfterSubmit = function (type) {
  var context = ns_wrapper.context();
  var hasMultipleCurrencies = context.hasMultipleCurrencies();
  var execContext = context.getExecutionContext();
  var newRecord = ns_wrapper.api.record.getNewRecord();

  var input = new dunning.view.ProcedureCurrencyManagerInput();
  input.oldRecord = ns_wrapper.api.record.getOldRecord();
  input.newRecord = newRecord;
  input.type = type;
  input.context = execContext;
  input.isOneWorld = context.isOW();

  if (hasMultipleCurrencies) {
    var currencySupportManager = new dunning.app.ProcedureCurrencyManager(input);
    currencySupportManager.addSupportForNewCurrencies();
  }

  if (type == 'create' && execContext === 'userinterface') {
    var dunningProcedureDAO = new dao.DunningProcedureDAO();
    var model = dunningProcedureDAO.castToModel(RecordAPI.getNewRecord(), false);
    var dunningProcedureConverter = new dunning.app.DunningProcedureConverter();
    var view = dunningProcedureConverter.castToView(model);
    var params = {
      'custpage_3805_dunning_procedure': view.id,
      'custpage_3805_dunning_source': view.dunningSource,
      'custpage_3805_from_procedure': 'T'
    };
    ns_wrapper.api.url.setRedirectURL('SUITELET', 'customscript_3805_su_bulk_assignment', 'customdeploy_3805_su_bulk_assignment', false, params);
  }

  if (type != 'delete') {
    var evalStatementManager = new dunning.app.DunningEvalStatementManager();
    evalStatementManager.updateEvaluationStatementRecords([newRecord.getId()]);
  }
};

function getFieldData (nlObjField) {
  var fieldData = new Field();

  fieldData.name = nlObjField.getName();
  fieldData.label = nlObjField.getLabel();
  fieldData.type = nlObjField.getType();

  return fieldData;
}
