/**
 * @license
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope public
 */

define([
  'N/search',
  '../../common/search_util'
],
function (N_search, search_util) {
  'use strict';

  return {
    /**
     * @param {string} name
     * @returns {number[]}
     */
    getRuleIdsByName: function (name) {
      const search = N_search.create({
        type: 'customrecord_3805_dunning_eval_rule',
        filters: [
          N_search.createFilter({
            name: 'name',
            operator: N_search.Operator.IS,
            values: name
          })
        ]
      });

      return search_util.fetchAll(search, function (result) {
        return result.id;
      });
    }
  };
});
