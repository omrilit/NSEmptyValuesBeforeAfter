/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};
dunning.app.assignment = dunning.app.assignment || {};

dunning.app.BulkAssignmentRequestAdapter = function BulkAssignmentRequestAdapter () {
  function extract (request, appliesToType) {
    var recordTypeId = request.getParameter(dunning.view.BULK_ASSIGNMENT_RECORD_TYPE);
    var recordType = appliesToType[recordTypeId];
    var classMap = dunning.view.BULK_ASSIGNMENT_CLASS_MAP[recordType];
    var sublistId = classMap.sublist;
    var sublistCount = request.getLineItemCount(sublistId);
    var recordIdsToUpdate = getRecsToUpdate(request, sublistId, sublistCount);
    var dunningProcedureId = request.getParameter(dunning.view.BULK_ASSIGNMENT_DUNNING_PROCEDURE_ID);

    return {
      sublistId: sublistId,
      sublistCount: sublistCount,
      recordIdsToUpdate: recordIdsToUpdate || [],
      dunningProcedureId: dunningProcedureId,
      recordType: recordType
    };
  }

  function getRecsToUpdate (request, sublistId, count) {
    var recs = [];
    for (var i = 1; i <= count; i++) {
      if (request.getLineItemValue(sublistId, 'assign_dunning', i) === 'T') {
        recs.push(request.getLineItemValue(sublistId, 'id', i));
      }
    }

    return recs;
  }

  return {
    extract: extract
  };
};
