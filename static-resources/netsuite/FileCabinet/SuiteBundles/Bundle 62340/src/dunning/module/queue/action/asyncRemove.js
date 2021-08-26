/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.x
 * @NModuleScope public
 */

define([
  '../search/deployments',
  '../RequestQueueEntry',
  '../../../constants'
],
function (deployments, RequestQueueEntry, C) {
  'use strict';

  /**
   * Updates status of Dunning Evaluation records determined by internalIds and letterTypeId from Queued to Pending
   * @param {InternalId[]} internalIds
   * @param {InternalId} letterTypeId
   */
  return function (internalIds, letterTypeId) {
    const data = {};
    data[C.QUEUE_MODULE.ASYNC_REMOVE.PARAM.IDS] = JSON.stringify(internalIds);
    data[C.QUEUE_MODULE.ASYNC_REMOVE.PARAM.TYPE] = letterTypeId;

    const scripts = deployments.search(C.QUEUE_MODULE.ASYNC_REMOVE.SCRIPT);
    RequestQueueEntry.create(scripts[0].scriptId, scripts[0].deploymentId, data);

    RequestQueueEntry.scheduleQueueHandler();
  };
});
