/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningQueueActionRequestAdapter = function DunningQueueActionRequestAdapter () {
  this.extract = function extract (request) {
    var input = new dunning.view.DunningQueueActionInput();
    input.derIdList = request.getParameter('custpage_3805_dunning_queue_sl').split(',');
    return input;
  };
};
