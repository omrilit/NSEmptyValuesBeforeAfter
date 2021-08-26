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

  /**
   * Returns all unique names of Dunning Levels sorted ascendingly
   * @returns {string[]}
   */
  const fetchAllNames = function () {
    const column = N_search.createColumn({
      name: C.FIELD.LEVEL_RULE.NAME,
      join: C.FIELD.LEVEL.RULE,
      summary: N_search.Summary.GROUP,
      sort: N_search.Sort.ASC
    });
    const search = N_search.create({
      type: C.TYPE.LEVEL,
      columns: [column]
    });

    return search_util.fetchAll(search, function (result) {
      return result.getValue(column);
    });
  };

  return {
    fetchAllNames: fetchAllNames
  };
});
