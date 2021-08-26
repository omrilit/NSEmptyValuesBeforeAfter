/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.x
 * @NModuleScope public
 */

define(['N/task'], function (N_task) {
  'use strict';

  /**
   * Creates Job in Job Engine Framework
   * @param {(string|number)[]} internalIds
   * @param {(string|number)} letterTypeId
   */
  return function (internalIds, letterTypeId) {
    N_task.create({
      taskType: N_task.TaskType.SCHEDULED_SCRIPT,
      scriptId: 'customscript_3805_ss_file_job',
      deploymentId: 'customdeploy_3805_ss_file_job',
      params: {
        custscript_3805_ss_file_job_ids: JSON.stringify(internalIds),
        custscript_3805_ss_file_job_type: letterTypeId
      }
    })
      .submit();
  };
});
