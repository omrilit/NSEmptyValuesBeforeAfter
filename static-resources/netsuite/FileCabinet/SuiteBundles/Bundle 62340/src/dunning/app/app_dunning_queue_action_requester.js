/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningQueueActionRequester = function DunningQueueActionRequester (messages) {
  var SublistAPI = ns_wrapper.api.sublist;
  var URLAPI = ns_wrapper.api.url;
  var DUNNING_QUEUE_SUBLIST_JSON = 'custpage_3805_dunning_queue_sl';

  var MESSAGE_CHOOSE_ACTION = 'dq.validation.chooseAction';
  var MESSAGE_REMOVAL_CONFIRMATION = 'dq.validation.removalConfirmation';
  var DUNNING_QUEUE_REMOVE_DEPLOY = 'customdeploy_3805_dunning_queue_remove';

  this.requestAction = function (deploymentId, action) {
    var postObj = createPostObj();

    if (postObj[DUNNING_QUEUE_SUBLIST_JSON].length > 0) {
      return requestUrl(postObj, deploymentId);
    } else {
      warnNoSelected(action);
    }
  };

  function retrieveUrl (deploymentId) {
    return URLAPI.resolveUrl('SUITELET', 'customscript_3805_dunning_queue', deploymentId);
  }

  function requestUrl (postObj, deploymentId) {
    // var header = {"Content-Type": "application/json"}; // To be same with other browsers
    var header = null;

    if (deploymentId == DUNNING_QUEUE_REMOVE_DEPLOY &&
      !confirm(messages[MESSAGE_REMOVAL_CONFIRMATION])) {
      return false;
    }

    var actionUrl = retrieveUrl(deploymentId);
    URLAPI.requestUrlCs(actionUrl, postObj, header, null, 'POST');

    return true;
  }

  function createPostObj () {
    var DUNNING_QUEUE_SUBLIST = 'custpage_3805_dunning_queue';
    var DUNNING_QUEUE_SUBLIST_ROW_MARK = 'dunning_mark';
    var DUNNING_QUEUE_SUBLIST_ROW_ID = 'id';

    var postObj = {};
    postObj[DUNNING_QUEUE_SUBLIST_JSON] = [];

    var length = SublistAPI.getLineItemCount(DUNNING_QUEUE_SUBLIST);
    for (var i = 1; i <= length; i++) {
      var rowMark = SublistAPI.getLineItemValue(DUNNING_QUEUE_SUBLIST, DUNNING_QUEUE_SUBLIST_ROW_MARK, i);
      if (rowMark == 'T') {
        var id = SublistAPI.getLineItemValue(DUNNING_QUEUE_SUBLIST, DUNNING_QUEUE_SUBLIST_ROW_ID, i);
        postObj[DUNNING_QUEUE_SUBLIST_JSON].push(id);
      }
    }

    return postObj;
  }

  function warnNoSelected (action) {
    alert([messages[MESSAGE_CHOOSE_ACTION], action].join(''));
  }
};
