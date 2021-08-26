/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.component = dunning.component || {};
dunning.component.cs = dunning.component.cs || {};

dunning.component.cs.DunningBulkAssignmentCS = function DunningBulkAssignmentCS () {
  var obj = {
    onFieldChange: onFieldChange,
    redirectToRecord: redirectToRecord,
    doCancel: doCancel,
    onSubmit: onSubmit,
    getPageManager: getPageManager
  };

  var messages;
  var MESSAGE_PREV_PAGE_FAILED = 'dba.pagination.failedPrevPage';
  var MESSAGE_HIGH_NUMBER_OF_RECORDS = 'dba.form.notification.highnumberofrecord';

  var SUITELET_ID = 'customscript_3805_su_bulk_assignment';
  var SUITELET_DEPLOYMENT_ID = 'customdeploy_3805_su_bulk_assignment';
  var CURRENT_PAGE;
  var DUNNING_SOURCE = 'custpage_3805_dunning_source';
  var DUNNING_PROCEDURE = 'custpage_3805_dunning_procedure';
  var SUITELET_TYPE = 'SUITELET';

  function loadMessageObjects () {
    if (!messages) {
      var stringCodes = [MESSAGE_PREV_PAGE_FAILED, MESSAGE_HIGH_NUMBER_OF_RECORDS];
      var messageLoaderContextCreator = new suite_l10n.app.MessageLoaderContextCreator();
      var messageLoaderContext = messageLoaderContextCreator.getLoaderContext(stringCodes);
      var messageLoader = new suite_l10n.app.MessageLoader(messageLoaderContext);
      messages = messageLoader.getMessageMap();
    }
  }

  function doCancel () {
    try {
      if (history && history.back) {
        history.back();
      }
    } catch (e) {
      loadMessageObjects();
      var messageHandler = new suite_l10n.message.MessageHandler();
      messageHandler.showMessage(messages[MESSAGE_PREV_PAGE_FAILED]);
    }
  }

  function forceChangeLocation (url) {
    var wrWindow = new ns_wrapper.Window();
    wrWindow.forceChangeLocation(url);
  }

  function getSourceType () {
    return ns_wrapper.api.field.getFieldValue(DUNNING_SOURCE);
  }

  function getAsURLParam (id) {
    return [id, ns_wrapper.api.field.getFieldValue(id)].join('=');
  }

  function getSuiteletURL () {
    return ns_wrapper.api.url
      .resolveUrl(SUITELET_TYPE, SUITELET_ID, SUITELET_DEPLOYMENT_ID);
  }

  function getFieldValue (field) {
    return ns_wrapper.api.field.getFieldValue(field);
  }

  function handleDunningSource () {
    var sourceType = getSourceType();
    if (sourceType && sourceType.length > 0) {
      var url = [getSuiteletURL(), getAsURLParam(DUNNING_SOURCE)].join('&');
      forceChangeLocation(url);
    }
  }

  function handleDunningProcedure () {
    var dunningProcedure = ns_wrapper.api.field.getFieldValue(DUNNING_PROCEDURE);
    if (dunningProcedure && dunningProcedure.length > 0) {
      var url = [
        getSuiteletURL(),
        getAsURLParam(DUNNING_SOURCE),
        getAsURLParam(DUNNING_PROCEDURE)].join('&');
      forceChangeLocation(url);
    }
  }

  var formStateObject;

  function getFormStateObject () {
    if (!formStateObject) {
      formStateObject = {};

      formStateObject.type = SUITELET_TYPE;
      formStateObject.identifier = SUITELET_ID;
      formStateObject.id = SUITELET_DEPLOYMENT_ID;

      var param = {};
      param.custpage_3805_dunning_source = getFieldValue(DUNNING_SOURCE);
      param.custpage_3805_dunning_procedure = getFieldValue(DUNNING_PROCEDURE);
      param[CURRENT_PAGE] = getFieldValue(CURRENT_PAGE);

      formStateObject.parameters = param;
    }
    return formStateObject;
  }

  var csSublistPagination;

  function getPageManager (pageField) {
    CURRENT_PAGE = pageField;
    if (!csSublistPagination) {
      var formStateObject = getFormStateObject();
      csSublistPagination = new infra.comp.cs.SublistPagination(formStateObject);
    }
    return csSublistPagination;
  }

  function handlePaginationDropdown (pageField) {
    getPageManager(pageField).renderPage();
  }

  function fieldChange (name) {
    switch (name) {
      case DUNNING_SOURCE:
        setWindowChanged(window, false);
        handleDunningSource();
        break;
      case DUNNING_PROCEDURE:
        setWindowChanged(window, false);
        handleDunningProcedure();
        break;
      case 'custpage_3805_customer_curr_page':
      case 'custpage_3805_invoice_curr_page':
        handlePaginationDropdown(name);
        break;
    }
  }

  function onFieldChange (type, name) {
    if (!type) {
      fieldChange(name);
    }
  }

  function redirectToRecord (record, id) {
    var url = ns_wrapper.api.url.resolveUrl('RECORD', record, id);
    forceChangeLocation(url);
  }

  function onSubmit () {
    var definition = new suite_l10n.view.LocalizationVariableDefinition();
    definition.type = 'syspar_type';
    definition.variable = 'BULK_ASSIGNMENT_HIGH_RECORD_COUNT_THRESHOLD';
    var HIGH_REC_THRESHOLD = 10;
    var MSG_MESSAGE_HIGH_NUMBER_OF_RECORDS = 'This request might take a few seconds to complete. Please wait until you are redirected to the Dunning Procedure page.';

    var count = getAssignmentCount();
    var variableListLoader = new suite_l10n.app.LocalizationVariableListLoader();
    var highRecordThresholdObj = variableListLoader.getLocalizationVariable(definition);

    if (highRecordThresholdObj && highRecordThresholdObj.value) {
      HIGH_REC_THRESHOLD = highRecordThresholdObj.value;
    }

    if (count > HIGH_REC_THRESHOLD) {
      loadMessageObjects();
      var messageHandler = new suite_l10n.message.MessageHandler();
      if (messages[MESSAGE_HIGH_NUMBER_OF_RECORDS]) {
        MSG_MESSAGE_HIGH_NUMBER_OF_RECORDS = messages[MESSAGE_HIGH_NUMBER_OF_RECORDS];
      }
      messageHandler.showMessage(MSG_MESSAGE_HIGH_NUMBER_OF_RECORDS);
    }
    return true;
  }

  function getAssignmentCount () {
    var DUNNING_ASSIGNMENT_CUST_SUBLIST = 'custpage_3805_customer_sublist';
    var DUNNING_ASSIGNMENT_INV_SUBLIST = 'custpage_3805_invoice_sublist';
    var sublist = DUNNING_ASSIGNMENT_CUST_SUBLIST;

    var DUNNING_ASSIGNMENT_SUBLIST_ROW_MARK = 'assign_dunning';
    var SublistAPI = ns_wrapper.api.sublist;

    var source = ns_wrapper.api.field.getFieldText(DUNNING_SOURCE);

    if (source == 'Invoice') {
      sublist = DUNNING_ASSIGNMENT_INV_SUBLIST;
    }

    var length = SublistAPI.getLineItemCount(sublist);
    var count = 0;
    for (var i = 1; i <= length; i++) {
      var rowMark = SublistAPI.getLineItemValue(sublist, DUNNING_ASSIGNMENT_SUBLIST_ROW_MARK, i);
      if (rowMark == 'T') {
        count++;
      }
    }

    return count;
  }

  return obj;
};

dunning.bulkAssignCS = new dunning.component.cs.DunningBulkAssignmentCS();
