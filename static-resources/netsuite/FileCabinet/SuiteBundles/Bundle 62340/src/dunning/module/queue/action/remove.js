/**
 * @license
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope public
 */

define([
  './asyncRemove',
  '../../common/cache'
],
function (asyncRemove, cache) {
  'use strict';

  /**
   * @param {Request} request
   */
  function remove (request) {
    const ids = request.getIds();

    if (ids.length === 0) {
      return;
    }

    asyncRemove(ids, request.getLetterTypeId());
    cache.appendLockedResults(ids);
  }

  return remove;
});
