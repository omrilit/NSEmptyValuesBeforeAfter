/**
 * @copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../vendor/tslib"], function (_exports, _tslib) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.runQueryConstructor = runQueryConstructor;

  function runQueryConstructor(runSuiteQL) {
    return function (query, parameters) {
      // For easier debugging
      // var t = Date.now();
      // var size = 2000;
      // for (var i = 0, j = 1; i < query.length; i += size, j++) {
      //     log.debug({title: t + " query#" + j, details: query.substring(i, i + size)});
      // }
      // log.debug({title: t + " parameters", details: parameters});
      // var t0 = Date.now();
      // var results = runSuiteQL({params: parameters, query: query}).asMappedResults();
      // log.debug({title: t + " LENGTH", details: parameters.length});
      // log.debug({title: t + " TIME", details: Date.now() - t0});
      // return results;
      if (parameters === void 0) {
        parameters = [];
      }

      return runSuiteQL({
        params: (0, _tslib.__spreadArrays)(parameters),
        query: query
      }).results.map(function (x) {
        return x.values;
      });
    };
  }
});