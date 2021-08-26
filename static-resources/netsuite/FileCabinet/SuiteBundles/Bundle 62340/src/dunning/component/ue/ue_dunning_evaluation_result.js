/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author ssantiago
 */

var dunning = dunning || {};
dunning.component = dunning.component || {};
dunning.component.ue = dunning.component.ue || {};

dunning.component.ue.DunningEvaluationResultUE = function DunningEvaluationResultUE () {
  var MESSAGE_ACCESS_ERROR = 'l10n.accessForAdministrator';
  var MESSAGE_DELETE_ERROR = 'l10n.deleteAccessForAdministrator';

  var context = ns_wrapper.context();
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

  /**
   * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
   * @appliedtorecord recordType
   *
   * @param {string} type Operation types: create, edit, view, copy, print, email
   * @param {nlobjForm} form Current form
   * @param {nlobjRequest} request
   */
  this.beforeLoad = function beforeLoad (type, form, request) {
    if (context.getExecutionContext() == 'userinterface') {
      if (type == 'edit' || type == 'create' || type == 'copy') {
        if (context.getRoleId() != 'administrator') {
          loadMessageObjects();
          throw nlapiCreateError('DUNNING_FOR_ADMINISTRATOR_ACCESS_ONLY', messages[MESSAGE_ACCESS_ERROR]);
        }
      }
    }
  };

  /**
   * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
   * @appliedtorecord recordType
   *
   * @param {string} type Operation types: create, edit, delete, xedit
   *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
   *                      pack, ship (IF)
   *                      markcomplete (Call, Task)
   *                      reassign (Case)
   *                      editforecast (Opp, Estimate)
   */
  this.beforeSubmit = function beforeSubmit (type) {
    if (context.getExecutionContext() == 'userinterface') {
      if (type == 'delete') {
        if (context.getRoleId() != 'administrator') {
          loadMessageObjects();
          throw nlapiCreateError('DUNNING_DELETE_PERMISSION_FOR_ADMIN_ONLY', messages[MESSAGE_DELETE_ERROR]);
        }
      } else if (type == 'xedit') {
        if (context.getRoleId() != 'administrator') {
          loadMessageObjects();
          throw nlapiCreateError('DUNNING_FOR_ADMINISTRATOR_ACCESS_ONLY', messages[MESSAGE_ACCESS_ERROR]);
        }
      }
    }
  };
};

dunning.component.ue.derUE = new dunning.component.ue.DunningEvaluationResultUE();
