/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "./request-parsers"], function (_exports, _requestParsers) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.dashboardHandlerConstructor = dashboardHandlerConstructor;

  function dashboardHandlerConstructor(deps) {
    return function (request, response) {
      switch ((0, _requestParsers.parseAction)(request)) {
        case "match"
        /* MATCH */
        :
          return deps.match(request, response);

        case "unmatch"
        /* UNMATCH */
        :
          return deps.unmatch(request, response);

        case "ref_all"
        /* CHANGE_REFERENCE_ON_ALL_MATCHED_TRANSACTIONS */
        :
          return deps.changeReferenceOnMatchedTransactions(request, response);

        case "ref_single"
        /* CHANGE_REFERENCE_ON_SINGLE_TRANSACTION */
        :
          return deps.changeReferenceOnSingleTransaction(request, response);

        case "ref_unmatch"
        /* CHANGE_REFERENCE_AND_UNMATCH_TRANSACTION */
        :
          return deps.changeReferenceAndUnmatchTransaction(request, response);

        case "exportCSV"
        /* EXPORT_CSV */
        :
          return deps.exportCsvController(request, response);

        default:
          return deps.dashboardController(request, response);
      }
    };
  }
});