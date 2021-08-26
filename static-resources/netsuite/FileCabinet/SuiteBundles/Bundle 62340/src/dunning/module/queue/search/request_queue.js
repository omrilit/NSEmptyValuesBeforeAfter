/**
 * @license
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope public
 */

define([
  'N/search',
  '../RequestQueueEntry',
  '../../common/search_util',
  '../../../constants'
],
function (N_search, RequestQueueEntry, searchUtil, C) {
  'use strict';

  const FIELDS = C.FIELD.QUEUE_REQUEST;

  return {

    /**
     * @returns {Array.<RequestQueueEntry>}
     */
    next: function () {
      const search = N_search.create({
        type: C.TYPE.QUEUE_REQUEST,
        filters: [
          N_search.createFilter({
            name: FIELDS.STATUS,
            operator: N_search.Operator.IS,
            values: C.REQUEST_QUEUE_STATUS.PENDING
          })
        ],
        columns: [
          N_search.createColumn({name: FIELDS.DATA}),
          N_search.createColumn({name: FIELDS.SCRIPT}),
          N_search.createColumn({name: FIELDS.DEPLOYMENT}),
          N_search.createColumn({name: 'created', sort: N_search.Sort.ASC})
        ]
      });
      const isFirst = function (result, i) { return i === 0; };

      return searchUtil.fetchAll(search)
        .filter(isFirst)
        .map(RequestQueueEntry.fromResult);
    }
  };
});
