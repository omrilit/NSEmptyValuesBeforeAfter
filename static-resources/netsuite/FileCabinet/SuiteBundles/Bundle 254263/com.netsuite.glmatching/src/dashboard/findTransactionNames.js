/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../vendor/tslib"], function (_exports, _tslib) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.findTransactionNamesConstructor = findTransactionNamesConstructor;

  function findTransactionNamesConstructor(query) {
    return function (transactionIds) {
      if (transactionIds.length === 0) {
        return Promise.resolve({});
      }

      var q = query.create({
        type: query.Type.TRANSACTION
      });
      q.columns = [q.createColumn({
        fieldId: "id"
      }), q.createColumn({
        fieldId: "trandisplayname"
      })];
      q.condition = q.createCondition({
        fieldId: "id",
        operator: query.Operator.ANY_OF,
        values: (0, _tslib.__spreadArrays)(transactionIds)
      });
      return q.runPaged.promise({
        pageSize: 5000
      }).then(function (pagedData) {
        return pagedData.pageRanges.map(function (_a) {
          var index = _a.index;
          return pagedData.fetch(index).data.results.map(function (x) {
            return x.values;
          });
        }).reduce(function (a, x) {
          return (0, _tslib.__spreadArrays)(a, x);
        }, []).reduce(function (a, _a) {
          var _b;

          var recordId = _a[0],
              transactionName = _a[1];
          return (0, _tslib.__assign)((0, _tslib.__assign)({}, a), (_b = {}, _b[String(recordId)] = String(transactionName), _b));
        }, {});
      });
    };
  }
});