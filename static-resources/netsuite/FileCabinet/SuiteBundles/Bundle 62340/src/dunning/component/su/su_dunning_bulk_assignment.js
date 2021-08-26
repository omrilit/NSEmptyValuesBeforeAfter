/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dunning = dunning || {};
dunning.component = dunning.component || {};
dunning.component.su = dunning.component.su || {};

dunning.component.su.DunningBulkAssignment = function DunningBulkAssignment (request, response) {
  var DunningAssignmentPageCreator = dunning.app.DunningAssignmentPageCreator;

  var MESSAGE_PAGE_PRIVILEGE_ERROR = 'l10n.noPagePrivilege';

  var messages;

  var obj = {
    run: run,
    processAssignment: processAssignment,
    showPage: showPage
  };

  function processAssignment (request, response) {
    if (request.getParameter('custpage_3805_dunning_procedure')) {
      var controller = new dunning.controller.BulkAssignmentRequestController(request);
      controller.selectBulkAssignmentMethod();
      ns_wrapper.api.url.setRedirectURL('RECORD', 'customrecord_3805_dunning_procedure', request
        .getParameter('custpage_3805_dunning_procedure'));
    } else {
      obj.showPage(request, response);
    }
  }

  function showPage (request, response) {
    var roleAssesor = new dunning.app.DunningRoleAssessor();
    if (!roleAssesor.isDunningDirector()) {
      loadMessageObjects();
      throw nlapiCreateError('DUNNING_PERMISSION_ERROR', messages[MESSAGE_PAGE_PRIVILEGE_ERROR]);
    } else {
      var requestAdaptor = new dunning.component.su.DBARequestAdaptor(request);
      var requestView = requestAdaptor.getRequestAsObject();
      var pageCreator = new DunningAssignmentPageCreator(requestView);
      response.writeForm(pageCreator.createPage());
    }
  }

  function run () {
    switch (request.getMethod()) {
      case 'POST':
        obj.processAssignment(request, response);
        break;
      case 'GET':
      default:
        obj.showPage(request, response);
    }
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

  return obj;
};

dunning.component.su.DBARequestAdaptor = function DunningBulkAssignmentRequestAdaptor (request) {
  var PARAMETERS = [
    'custpage_3805_dunning_procedure',
    'custpage_3805_customer_curr_page',
    'custpage_3805_invoice_curr_page',
    'custpage_3805_from_procedure',
    'custpage_3805_dunning_source'];

  this.getRequestAsObject = function getRequestAsObject () {
    var obj = {};

    for (var i = 0; i < PARAMETERS.length; i++) {
      var currField = PARAMETERS[i];
      obj[currField] = request.getParameter(currField);
    }

    return obj;
  };
};

/**
 * @param {nlobjRequest} request
 * @param {nlobjResponse} response
 */
dunning.component.su.DunningAssignment = function DunningAssignment (request, response) {
  var suitelet = new dunning.component.su.DunningBulkAssignment(
    new ns_wrapper.Request(request),
    new ns_wrapper.Response(response)
  );
  suitelet.run();
};
