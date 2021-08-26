/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author mjaurigue
 */

var dunning = dunning || {};
dunning.component = dunning.component || {};
dunning.component.su = dunning.component.su || {};

dunning.component.su.BulkUpdateSuitelet = function BulkUpdateSuitelet () {
  var MESSAGE_PAGE_PRIVILEGE_ERROR = 'l10n.noPagePrivilege';
  var messages;

  this.run = function run (request, response) {
    var wrRequest = new ns_wrapper.Request(request);
    var wrResponse = new ns_wrapper.Response(response);

    if (wrRequest.getMethod() === 'POST') {
      update(wrRequest, wrResponse);
    }

    showForm(wrRequest, wrResponse);
  };

  function update (wrRequest, wrResponse) {
    var obj = retrieveRequestValues(wrRequest);
    var processManager = new dunning.app.DunningBulkUpdateProcessManager();
    processManager.bulkUpdate(obj);
  }

  function showForm (wrRequest, wrResponse) {
    var roleAssesor = new dunning.app.DunningRoleAssessor();
    if (!roleAssesor.isDunningDirector()) {
      loadMessageObjects();
      throw nlapiCreateError('DUNNING_PERMISSION_ERROR', messages[MESSAGE_PAGE_PRIVILEGE_ERROR]);
    } else {
      var manager = new dunning.app.DunningBulkUpdateFormManager();
      var form = manager.generateForm();
      wrResponse.writeForm(form);
    }
  }

  function retrieveRequestValues (wrRequest) {
    var SUBSIDIARY_FIELD = 'custpage_3805_dunning_bulk_update_sub';
    var ALLOW_EMAIL_FIELD = 'custpage_3805_dunning_bulk_update_email';
    var ALLOW_PRINT_FIELD = 'custpage_3805_dunning_bulk_update_print';
    var DO_NOT_SENT_TO_CUST_FIELD = 'custpage_3805_dunning_bulk_dont_send_cust_mail';

    var subsidiary = wrRequest.getParameter(SUBSIDIARY_FIELD);
    var allowEmail = wrRequest.getParameter(ALLOW_EMAIL_FIELD);
    var allowPrint = wrRequest.getParameter(ALLOW_PRINT_FIELD);
    var doNotSendCustEmail = wrRequest.getParameter(DO_NOT_SENT_TO_CUST_FIELD);

    return {
      'subsidiary': subsidiary,
      'allowByEmail': allowEmail,
      'allowByPrint': allowPrint,
      'dontSendToCustomer': doNotSendCustEmail,
      'status': 1 /* PENDING STATUS */
    };
  }

  function loadMessageObjects () {
    if (!messages) {
      var stringCodes = [MESSAGE_PAGE_PRIVILEGE_ERROR];

      var messageLoaderContextCreator = new suite_l10n.app.MessageLoaderContextCreator();
      var messageLoaderContext = messageLoaderContextCreator.getLoaderContext(stringCodes);
      var messageLoader = new suite_l10n.app.ServerSideMessageLoader(messageLoaderContext);
      messages = messageLoader.getMessageMap();
    }
  }
};

function runSuitelet (request, response) { // eslint-disable-line no-unused-vars
  var bulkUpdate = new dunning.component.su.BulkUpdateSuitelet();
  bulkUpdate.run(request, response);
}
