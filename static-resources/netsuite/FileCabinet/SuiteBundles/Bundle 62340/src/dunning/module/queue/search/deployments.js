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
function (N_search, searchUtil) {
  'use strict';

  return {

    /**
     * @param {string} script
     * @returns {Array.<{scriptId:number,deploymentId:number}>}
     */
    search: function (script) {
      const filters = [
        N_search.createFilter({
          name: 'scriptid',
          join: 'script',
          operator: N_search.Operator.IS,
          values: script
        }),
        N_search.createFilter({
          name: 'isdeployed',
          operator: N_search.Operator.IS,
          values: true
        })
      ];

      const search = N_search.create({
        type: N_search.Type.SCRIPT_DEPLOYMENT,
        columns: ['scriptid'],
        filters: filters
      });

      return searchUtil.fetchAll(search, function (result) {
        return {
          scriptId: script,
          deploymentId: result.getValue({name: 'scriptid'}).toLowerCase()
        };
      });
    }
  };
});
