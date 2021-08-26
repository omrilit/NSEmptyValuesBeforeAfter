/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author mjaurigue
 */

var dunning = dunning || {};
dunning.component = dunning.component || {};
dunning.component.ue = dunning.component.ue || {};

dunning.component.ue.BulkUpdateUE = function BulkUpdateUE () {
  this.afterSubmit = function afterSubmit (type) {
    if (type == 'create') {
      var processManager = new dunning.app.DunningBulkUpdateProcessManager();
      processManager.scheduleBulkUpdate();
    }
  };
};

dunning.component.ue.buUE = new dunning.component.ue.BulkUpdateUE();
