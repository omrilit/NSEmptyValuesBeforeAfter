/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author mmoya
 */

var dunning = dunning || {};
dunning.priority = dunning.priority || {};

dunning.priority.SUBLIST_CUSTOMER = 'recmachcustrecord_3805_dunning_cust_priority';
dunning.priority.SUBLIST_INVOICE = 'recmachcustrecord_3805_dunning_invc_priority';
dunning.priority.FIELD_WEIGHT = 'custrecord_3805_dp_weighting';

var sublistAPI = ns_wrapper.api.sublist;
var Field = suite_l10n.view.Field;
var context = ns_wrapper.context();

var MESSAGE_ACCESS_ERROR = 'l10n.accessForDDandAccountant';
var MESSAGE_DELETE_ERROR = 'l10n.deleteAccessForAdministrator';
var messages;

function loadMessageObjects () {
  if (!messages) {
    var stringCodes = [MESSAGE_ACCESS_ERROR, MESSAGE_DELETE_ERROR];

    var messageLoaderContextCreator = new suite_l10n.app.MessageLoaderContextCreator();
    var messageLoaderContext = messageLoaderContextCreator.getLoaderContext(stringCodes);
    var messageLoader = new suite_l10n.app.ServerSideMessageLoader(messageLoaderContext);
    messages = messageLoader.getMessageMap();
  }
}

dunning.priority.userEventBeforeSubmit = function userEventBeforeSubmit (type) {
  if (type == 'delete') {
    if (context.getRoleId() != 'administrator') {
      loadMessageObjects();
      throw nlapiCreateError('DUNNING_DELETE_PERMISSION_FOR_ADMIN_ONLY', messages[MESSAGE_DELETE_ERROR]);
    }
  } else if (type == 'xedit') {
    var dunningRoleAssessor = new dunning.app.DunningRoleAssessor();
    if (!dunningRoleAssessor.isDunningDirector()) {
      loadMessageObjects();
      throw nlapiCreateError('FOR_DUNNING_DIRECTOR_ACCOUNTANT_ADMIN_ACCESS_ONLY', messages[MESSAGE_ACCESS_ERROR]);
    }
  }

  if (type == 'edit') {
    recalculateWeights(dunning.priority.SUBLIST_CUSTOMER);
    recalculateWeights(dunning.priority.SUBLIST_INVOICE);
  }

  function recalculateWeights (sublistID) {
    var listCount = sublistAPI.getLineItemCount(sublistID);

    for (var i = 1; i <= listCount; i++) {
      sublistAPI.setLineItemValue(sublistID, dunning.priority.FIELD_WEIGHT, i, i);
    }
  }

  return true;
};

dunning.priority.userEventBeforeLoad = function userEventBeforeLoad (type) {
  if (type == 'edit' || type == 'create' || type == 'copy') {
    var dunningRoleAssessor = new dunning.app.DunningRoleAssessor();
    if (!dunningRoleAssessor.isDunningDirector()) {
      loadMessageObjects();
      throw nlapiCreateError('FOR_DUNNING_DIRECTOR_ACCOUNTANT_ADMIN_ACCESS_ONLY', messages[MESSAGE_ACCESS_ERROR]);
    }
  }

  var execContext = context.getExecutionContext();

  if (execContext === 'userinterface' && type == 'edit') {
    var nameField = ns_wrapper.api.field.getField('name');
    nameField.setDisplayType('inline');

    disableFields(dunning.priority.SUBLIST_CUSTOMER);
    disableFields(dunning.priority.SUBLIST_INVOICE);
  }

  function disableFields (sublistID) {
    var record = ns_wrapper.api.record.getNewRecord();
    var sublistFields = record.getAllLineItemFields(sublistID);

    for (var i = 0; i < sublistFields.length; i++) {
      var nlObjField = sublistAPI.getLineItemField(sublistID, sublistFields[i]);
      if (nlObjField) {
        var objField = new ns_wrapper.Field(nlObjField, getFieldData(nlObjField));
        objField.setDisplayType('disabled');
      }
    }
  }
};

function getFieldData (nlObjField) {
  var fieldData = new Field();

  fieldData.name = nlObjField.getName();
  fieldData.label = nlObjField.getLabel();
  fieldData.type = nlObjField.getType();

  return fieldData;
}
