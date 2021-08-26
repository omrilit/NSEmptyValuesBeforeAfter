/**
 * @license
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope public
 */

define([
  './send',
  './print',
  './asyncPending',
  '../../common/cache'
],
function (send, print, asyncPending, cache) {
  'use strict';

  /**
   * @param {Request} request
   */
  function process (request) {
    const ids = request.getIds();
    if (ids.length === 0) {
      return;
    }

    if (request.isSyncLimitExceeded()) {
      asyncPending(ids, request.getLetterTypeId());
      cache.appendLockedResults(ids);
      return;
    }

    if (request.isEmailQueue()) {
      ids.forEach(send);
      return;
    }

    if (request.isPdfQueue()) {
      ids.forEach(print);
    }
  }

  return process;
});
