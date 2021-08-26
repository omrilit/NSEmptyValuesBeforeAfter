/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningQueueActionDelegate = function DunningQueueActionDelegate () {
  this.performDunningQueueAction = function performDunningQueueAction (wrRequest) {
    var input = new dunning.app.DunningQueueActionRequestAdapter().extract(wrRequest);
    var className = nlapiGetContext().getSetting('SCRIPT', 'custscript_3805_dunning_queue_action');
    var factory = new suite_l10n.app.factory.BasicFactory();
    factory.getInstance(className).performAction(input);
  };
};
