/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.x
 * @NModuleScope public
 */

define([
  'N/workflow',
  '../../../constants'
],
function (N_workflow, C) {
  'use strict';

  /**
     * @param {InternalId} internalId
     */
  return function (internalId) {
    N_workflow.initiate({
      recordType: C.TYPE.EVALUATION_RESULT,
      recordId: internalId,
      workflowId: 'customworkflow_3805_dunning_email_wf'
    });
  };
});
