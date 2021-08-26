/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.x
 */

define([
  '../search/results',
  '../../../constants'
],
function (searchResults, C) {
  'use strict';

  /**
   * Updates status of Dunning Evaluation records determined by internalIds and letterTypeId from Queued to Pending
   * @param {(string|number)[]} internalIds
   * @param {(string|number)} letterTypeId
   */
  return function (internalIds, letterTypeId) {
    searchResults.queued(internalIds, letterTypeId).forEach(function changeStatus (result) {
      result.changeStatusTo(C.QUEUE_MODULE.STATUS.PENDING);
    });
  };
});
