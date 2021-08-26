/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.x
 * @NModuleScope public
 */

define(['N/plugin'], function (N_plugin) {
  'use strict';

  /**
   * @param {InternalId} internalId
   */
  return function (internalId) {
    const plugin = N_plugin.loadImplementation({
      type: 'customscript_l10n_job_plugin',
      implementation: 'customscript_3805_print'
    });
    const fakeTask = {
      record: internalId,
      setData: function () {}
    };

    plugin.executeTask(fakeTask);
  };
});
