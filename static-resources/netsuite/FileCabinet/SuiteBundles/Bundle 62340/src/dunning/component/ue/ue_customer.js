/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author ssantiago
 */

var dunning = dunning || {};
dunning.component = dunning.component || {};
dunning.component.ue = dunning.component.ue || {};

dunning.component.ue.CustomerUE = function CustomerUE () {
  var FieldAPI = ns_wrapper.api.field;
  var RecordAPI = ns_wrapper.api.record;

  var DUNNING_PROCEDURE = 'custentity_3805_dunning_procedure';
  var DUNNING_MANAGER = 'custentity_3805_dunning_manager';
  var DUNNING_PROC_RECORD = 'customrecord_3805_dunning_procedure';
  var DEFAULT_DUNNING_MGR = 'custrecord_3805_default_dunning_manager';

  this.beforeSubmit = function beforeSubmit (type) {
    var dunningProcedure = ns_wrapper.api.field.getFieldValue('custentity_3805_dunning_procedure');

    if (dunningProcedure) {
      var executionContext = ns_wrapper.context().getExecutionContext();

      if ((type == 'edit' || type == 'create') && executionContext != 'webstore') {
        var loadRecordContext = executionContext == 'csvimport' || executionContext == 'webservices';
        if (loadRecordContext) {
          updateDunningManager(type);
        }

        var formHandler = new dunning.app.CustomerFormHandler();
        var recipientIDs = formHandler.getDunningRecipientIDs(loadRecordContext);

        var DunningCustomerDAO = new dao.DunningCustomerDAO();
        var contacts = DunningCustomerDAO.loadContacts(recipientIDs);

        var customerManager = new dunning.app.CustomerManager(contacts);
        var validationResult = customerManager.getCustomerValidationResults(true, loadRecordContext);

        if (!validationResult.isValid()) {
          throw nlapiCreateError('DUNNING_CUSTOMER_VALIDATION_FAILED', validationResult.getMessage(), true);
        }
      }
    }

    return true;
  };

  function updateDunningManager (type) {
    /* In this section, we are sure that we have value for dunning procedure */

    var roleAssessor = new dunning.app.DunningRoleAssessor();
    var isDunningDirector = roleAssessor.isDunningDirector();

    var dunningProcedure = FieldAPI.getFieldValue(DUNNING_PROCEDURE);
    var dunningManager = FieldAPI.getFieldValue(DUNNING_MANAGER);

    if (type == 'create' && isDunningDirector && !dunningManager) {
      /* On create, apply script sourcing for the dunning manage fieldr is CSV has no dunning manager */
      FieldAPI.setFieldValue(DUNNING_MANAGER, getDefaultDunningManager(dunningProcedure));
    } else if (type == 'edit' && isDunningDirector) {
      var oldRecord = RecordAPI.getOldRecord();
      var oldDunningProcedure = oldRecord.getFieldValue(DUNNING_PROCEDURE);

      if (!dunningManager && dunningProcedure !== oldDunningProcedure) {
        /* if dunning procedure field is updated with non empty value
         *  and there's no dunning manager value (on CSV for example) */
        FieldAPI.setFieldValue(DUNNING_MANAGER, getDefaultDunningManager(dunningProcedure));
      }
    }
  }

  function getDefaultDunningManager (procedureId) {
    var defaultDM;

    if (procedureId) {
      defaultDM = FieldAPI.lookupField(DUNNING_PROC_RECORD,
        procedureId, DEFAULT_DUNNING_MGR);
    }

    return defaultDM;
  }
};

dunning.component.ue.custUE = new dunning.component.ue.CustomerUE();
