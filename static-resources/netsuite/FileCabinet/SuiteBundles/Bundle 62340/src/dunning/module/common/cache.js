/**
 * @license
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope public
 */

define([
  'N/cache',
  './utils'
],
function (nCache, utils) {
  'use strict';

  const KEY = 'locked_results';
  const getCache = utils.memoize(function () {
    return nCache.getCache({
      name: 'dunning',
      scope: nCache.Scope.PRIVATE
    });
  });

  return {

    /**
     * @returns {string[]}
     */
    getLockedResults: function () {
      return JSON.parse(getCache().get({key: KEY})) || [];
    },

    /**
     * @param {string[]} ids
     */
    appendLockedResults: function (ids) {
      getCache().put({
        key: KEY,
        value: JSON.stringify(utils.unique(this.getLockedResults().concat(ids))),
        ttl: 3600
      });
    }
  };
});
