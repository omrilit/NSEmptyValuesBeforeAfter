/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author ldimayuga
 *
 * libraries:
 ns_wrapper_window.js
 ns_wrapper_api_sublist.js
 ns_wrapper_api_url.js
 app_dunning_queue_action_requester.js
 view_suite_l10n.js
 ns_wrapper_nlobjcontext.js
 app_message_loader.js
 app_parent_message_loader.js
 app_message_loader_context_creator.js
 ns_wrapper_date.js
 ns_wrapper_api_field.js
 cs_queue_filter.js
 suite_l10n_string.js
 app_dunning_queue_filter_manager.js
 */

var dunning = dunning || {};
dunning.component = dunning.component || {};
dunning.component.cs = dunning.component.cs || {};

dunning.component.cs.DunningQueue = function DunningQueue () {
  var DUNNING_QUEUE_SEND_DEPLOY = 'customdeploy_3805_dunning_queue_send';
  var DUNNING_QUEUE_REMOVE_DEPLOY = 'customdeploy_3805_dunning_queue_remove';
  var DUNNING_QUEUE_PRINT_DEPLOY = 'customdeploy_3805_dunning_queue_print';

  var DUNNING_ROLE_FIELD = 'custpage_3805_dunning_queue_dunning_role';

  var SEND = 'send';
  var REMOVE = 'remove';
  var PRINT = 'print';

  var messages;
  var MESSAGE_SEND = 'dq.validation.str_send';
  var MESSAGE_REMOVE = 'dq.validation.str_remove';
  var MESSAGE_PRINT = 'dq.validation.str_print';
  var MESSAGE_CHOOSE_ACTION = 'dq.validation.chooseAction';
  var MESSAGE_REMOVAL_CONFIRMATION = 'dq.validation.removalConfirmation';

  loadMessageObjects();
  function loadMessageObjects () {
    if (!messages) {
      var stringCodes = [
        MESSAGE_SEND,
        MESSAGE_PRINT,
        MESSAGE_REMOVE,
        MESSAGE_CHOOSE_ACTION,
        MESSAGE_REMOVAL_CONFIRMATION];
      var messageLoaderContextCreator = new suite_l10n.app.MessageLoaderContextCreator();
      var messageLoaderContext = messageLoaderContextCreator.getLoaderContext(stringCodes);
      var messageLoader = new suite_l10n.app.MessageLoader(messageLoaderContext);

      messages = messageLoader.getMessageMap();
      SEND = messages[MESSAGE_SEND];
      REMOVE = messages[MESSAGE_REMOVE];
      PRINT = messages[MESSAGE_PRINT];
    }
  }

  this.send = function () {
    doAction(DUNNING_QUEUE_SEND_DEPLOY, SEND);
  };

  this.print = function () {
    doAction(DUNNING_QUEUE_PRINT_DEPLOY, PRINT);
  };

  this.remove = function () {
    doAction(DUNNING_QUEUE_REMOVE_DEPLOY, REMOVE);
  };

  function doAction (deploymentId, action) {
    loadMessageObjects();
    var requester = new dunning.app.DunningQueueActionRequester(messages);
    if (requester.requestAction(deploymentId, action)) {
      refreshPage();
    }
  }

  function refreshPage () {
    new ns_wrapper.Window().reload();
  }

  this.filter = function () {
    var dunningRole = nlapiGetFieldValue(DUNNING_ROLE_FIELD);
    /** Cannot proceed with the search as long as the dunning role hidden field is not yet updated.
     * The field will be updated as soon as the dunning role retrieval thought service is complete. */
    if (dunningRole !== 'UNUPDATED_VALUE') {
      var dqFilterManager = new dunning.app.DunningQueueFilterManager();
      var formStateObj = dqFilterManager.getFormStateObject();
      var filteredPage = new infra.comp.cs.DunningQueueFilter(formStateObj);
      filteredPage.renderPage();
    }
  };

  this.pageInit = function () {
    var dunningRole = getDunningRole();
    nlapiSetFieldValue(DUNNING_ROLE_FIELD, dunningRole);
  };

  function getDunningRole () {
    var SERVICE_SCRIPT_ID = 'customscript_3805_search_emp_dun_role_su';
    var SERVICE_DEPLOYMENT_ID = 'customdeploy_3805_search_emp_dun_role_su';

    var ctx = ns_wrapper.context();
    var userId = ctx.getUser();
    var currentRole = ctx.getRole();

    var suiteletURL = ns_wrapper.api.url.resolveUrl('SUITELET', SERVICE_SCRIPT_ID, SERVICE_DEPLOYMENT_ID, true);
    var responseObj = ns_wrapper.api.url.requestUrlCs(suiteletURL, {
      'userId': userId,
      'currentRole': currentRole
    });

    return responseObj.getBody();
  }
};

dunning.dunningQueueCS = new dunning.component.cs.DunningQueue();
