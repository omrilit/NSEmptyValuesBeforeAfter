/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../common/csv", "../common/NameCollection", "./request-parsers"], function (_exports, _csv, _NameCollection, _requestParsers) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.exportCsvControllerConstructor = exportCsvControllerConstructor;

  function exportCsvControllerConstructor(csvBuilder, findNames, transactionSearch) {
    return function (request, response) {
      try {
        var parameters = (0, _requestParsers.parseFilterParameters)(request);
        var results = transactionSearch.fetchResults(parameters.set({
          pageNumber: 1,
          pageSize: 1000000
        }));
        var nameCollection = findNames(_NameCollection.IdentifierCollection.join(results.map(function (x) {
          return x.getIdentifiers();
        })));
        response.write((0, _csv.renderCSV)(csvBuilder(results, nameCollection, parameters.subsidiary)));
        response.addHeader({
          name: "Content-type",
          value: "text/csv; header=present; charset=utf-8"
        });
        response.addHeader({
          name: "Content-disposition",
          value: "attachment; filename=GLM_Export.csv"
        });
      } catch (e) {
        response.write("ERROR : " + e.message);
        response.addHeader({
          name: "Content-type",
          value: "text/plain; header=present; charset=utf-8"
        });
        response.addHeader({
          name: "Content-disposition",
          value: "attachment; filename=GLM_Export.txt"
        });
      }
    };
  }
});