/**
 * @license
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope public
 *
 * Simple Collection of factories for Dependency Injection
 */

define([
  './../common/utils',
  './../queue/search/search_variables',
  './Variables'
],
function (utils, search, Variables) {
  'use strict';

  /**
   * @returns {Variables}
   */
  const variables = function () {
    return new Variables(search.fetchAll());
  };

  return {
    /**
     * @private
     */
    _variables: variables,

    /**
     * It returns a Singleton
     * @returns {Variables}
     */
    variables: utils.memoize(variables)
  };
});
