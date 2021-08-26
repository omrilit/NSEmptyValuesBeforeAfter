/**
 * @license
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope public
 */

define([], function () {
  'use strict';

  const identity = function (x) { return x; };

  return {

    /**
     * It executes the search and returns first found value
     * @param {module:N/search.Search} search
     * @param {function(Result, ?number=):*} [mapper]
     * @returns {*}
     */
    fetchFirst: function (search, mapper) {
      var output = null;
      var index = 0;

      search.run().each(function (result) {
        output = (mapper || identity)(result, index++);
        return false;
      });

      return output;
    },

    /**
     * It executes the search and returns first found value
     * @param {module:N/search.Search} search
     * @param {function(Result, ?number=):*} [mapper]
     * @returns {Array}
     */
    fetchAll: function (search, mapper) {
      const length = 1000;
      const resultSet = search.run();

      var output = [];
      var index = 0;
      var page = 0;
      var results;
      var _mapper;

      if (mapper) {
        _mapper = function (x) {
          output.push(mapper(x, index++));
        };
      } else {
        _mapper = function (x) {
          output.push(x);
        };
      }

      do {
        results = resultSet.getRange({
          start: length * page,
          end: length * (page + 1) - 1
        })
          .map(_mapper);

        page++;
      } while (results.length === length);

      return output;
    }
  };
});
