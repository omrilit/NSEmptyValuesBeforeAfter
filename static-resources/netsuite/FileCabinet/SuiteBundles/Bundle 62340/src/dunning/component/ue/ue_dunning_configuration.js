/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author ldimayuga
 */

var dunning = dunning || {};
dunning.component = dunning.component || {};
dunning.component.ue = dunning.component.ue || {};

dunning.component.ue.DunningConfigUE = function DunningConfigUE () {
  var roleAssesor = new dunning.app.DunningRoleAssessor();
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

  /**
   * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
   * @appliedtorecord recordType
   *
   * @param {string} type Operation types: create, edit, view, copy, print, email
   * @param {nlobjForm} form Current form
   * @param {nlobjRequest} request
   */
  this.beforeLoad = function beforeLoad (type, form, request) {
    loadMessageObjects();
    if (type == 'edit') {
      if (!roleAssesor.isDunningDirector()) {
        throw nlapiCreateError('FOR_DUNNING_DIRECTOR_ACCOUNTANT_ADMIN_ACCESS_ONLY', messages[MESSAGE_ACCESS_ERROR]);
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
    loadMessageObjects();

    if (type == 'delete') {
      if (context.getRoleId() != 'administrator') {
        throw nlapiCreateError('DUNNING_DELETE_PERMISSION_FOR_ADMIN_ONLY', messages[MESSAGE_DELETE_ERROR]);
      }
    } else if (type == 'xedit') {
      if (!roleAssesor.isDunningDirector()) {
        throw nlapiCreateError('FOR_DUNNING_DIRECTOR_ACCOUNTANT_ADMIN_ACCESS_ONLY', messages[MESSAGE_ACCESS_ERROR]);
      }
    }
  };
};

dunning.component.ue.dcUE = new dunning.component.ue.DunningConfigUE();
