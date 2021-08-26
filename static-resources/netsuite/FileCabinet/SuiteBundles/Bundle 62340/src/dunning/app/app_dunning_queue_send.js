/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningQueueSend = function DunningQueueSend () {
  this.performAction = function (dunningQueueActionInput) {
    var derIdList = dunningQueueActionInput.derIdList;
    var EVAL_RESULT_CUSTOM_REC = 'customrecord_3805_dunning_eval_result';
    var WF_ID = 'customworkflow_3805_dunning_email_wf';

    for (var i = 0; i < derIdList.length; i++) {
      var derId = derIdList[i];

      ns_wrapper.api.wf.initiateWorkflow(EVAL_RESULT_CUSTOM_REC, derId, WF_ID);
    }
  };
};
