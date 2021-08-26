/**
 * @license
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope public
 */

define([
  'N/search',
  '../../common/search_util',
  '../../../constants'
],
function (N_search, search_util, C) {
  'use strict';

  return {
    /**
     * @returns {Array.<Variable>}
     */
    fetchAll: function () {
      const FIELD = C.FIELD.LOCALIZATION_VARIABLE;

      /**
       * @param {N/search.Result} result
       * @returns {Variable}
       */
      const mapper = function (result) {
        return {
          id: result.id,
          name: result.getValue({name: FIELD.NAME}),
          value: result.getValue({name: FIELD.VALUE}),
          type: result.getValue({name: FIELD.TYPE})
        };
      };

      const search = N_search.create({
        type: C.TYPE.LOCALIZATION_VARIABLE,
        columns: [
          FIELD.NAME,
          FIELD.VALUE,
          FIELD.TYPE
        ]
      });

      return search_util.fetchAll(search, mapper);
    }
  };
});
