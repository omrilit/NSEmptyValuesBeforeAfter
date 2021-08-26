/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningQueueAction = function DunningQueueAction (actionImpl) {
  function performAction (derId) {
    if (actionImpl) {
      return actionImpl.performAction(derId);
    } else {
      throw nlapiCreateError('DUNNING_QUEUE_ACTION_CLASS_NOT_IMPLEMENTED', 'Please implement a dunning queue action');
    }
  }

  return {
    performAction: performAction
  };
};
