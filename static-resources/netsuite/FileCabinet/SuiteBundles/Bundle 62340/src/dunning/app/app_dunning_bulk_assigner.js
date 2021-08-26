/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.BulkAssigner = function BulkAssigner (bulkAssignerView) {
  var dao = bulkAssignerView.dao;
  var DUNNING_PROCEDURE_ID = 'dunningProcedureId';
  var DUNNING_PROCEDURE_LEVEL_ID = 'dunningLevelId';
  var DUNNING_MANAGER = 'dunningManager';

  function assignDunningProcedure (model) {
    return dao.updateFields(model, [DUNNING_PROCEDURE_ID, DUNNING_PROCEDURE_LEVEL_ID, DUNNING_MANAGER]);
  }

  function createModels (ids) {
    return ids.map(createModel);
  }

  function createModel (id) {
    var model = new bulkAssignerView.modelClass();

    model.id = id;
    model[DUNNING_PROCEDURE_ID] = bulkAssignerView.dunningProcedureId;
    model[DUNNING_PROCEDURE_LEVEL_ID] = '';
    model[DUNNING_MANAGER] = bulkAssignerView.dunningManagerId;

    return model;
  }

  this.bulkAssignDunningProcedure = function (ids) { // So caller can opt to use another set of ID's
    try {
      bulkAssignerView.dunningManagerId = this.lookupDefaultManager(bulkAssignerView.dunningProcedureId);

      createModels(ids || bulkAssignerView.recordIdsToUpdate).forEach(assignDunningProcedure);
    } catch (e) {
      nlapiLogExecution('ERROR', 'dunning.app.BulkAssigner.bulkAssignDunningProcedure', e);
      return false;
    }
    return true;
  };

  this.lookupDefaultManager = function (dunningProcedureId) {
    return ns_wrapper.api.field.lookupField('customrecord_3805_dunning_procedure', dunningProcedureId,
      'custrecord_3805_default_dunning_manager');
  };
};
