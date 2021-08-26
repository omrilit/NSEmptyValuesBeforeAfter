/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author mjaurigue
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningBulkUpdateProcessManager = function DunningBulkUpdateProcessManager () {
  var scheduler = new ns_wrapper.Scheduler();

  this.bulkUpdate = function bulkUpdate (model) {
    return createBulkUpdateBatch(model);
  };

  function createBulkUpdateBatch (model) {
    var batchDAO = new dao.DunningBulkUpdateBatchDAO();
    return batchDAO.create(model);
  }

  this.scheduleBulkUpdate = function scheduleBulkUpdate () {
    var SS_SCRIPT = 'customscript_3805_bulk_updater_cust';
    var SS_DEPLOYMENT = 'customdeploy_3805_bulk_updater_cust';
    var params = [];

    var scheduleResult = scheduler.scheduleScript(SS_SCRIPT, SS_DEPLOYMENT, params);

    if (!scheduleResult ||
      scheduleResult == 'UNDEPLOYED' ||
      scheduleResult == 'NULL') {
      var errorDetails = {
        code: 'DUNNING_CUSTOMER_BULK_UPDATE_SS_DEPLOYMENT_NOT_FOUND',
        details: 'No deployment found for Customer Dunning Bulk Update SS.'
      };

      throw nlapiCreateError(errorDetails.code, errorDetails.details);
    }
  };
};
