/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "./TransactionEventHandler", "../../vendor/lodash-4.17.4", "./expectations"], function (_exports, _TransactionEventHandler, _lodash, _expectations) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getInputCSVDataConstructor = getInputCSVDataConstructor;
  _exports.mapCSVConstructor = mapCSVConstructor;
  _exports.reduceCSVConstructor = reduceCSVConstructor;
  _exports.summarizeCSVConstructor = summarizeCSVConstructor;
  _exports.tranlineToEntry = tranlineToEntry;
  _exports.toReferenceSingleRequest = toReferenceSingleRequest;

  function getInputCSVDataConstructor(tranLineSearch, logError, accountRepository) {
    return function () {
      try {
        return (0, _lodash.map)((0, _lodash.groupBy)((0, _TransactionEventHandler.filterLinesForReference)(tranLineSearch.findReferenceCSVLines(), accountRepository.findOptions().map(function (o) {
          return o.value;
        })), function (o) {
          return o.transaction;
        })).map(function (o) {
          return JSON.stringify(o);
        });
      } catch (e) {
        logError("getInputData", {
          message: e.message,
          name: e.name,
          stack: e.stack
        });
        throw e;
      }
    };
  }

  function mapCSVConstructor(logError) {
    return function (context) {
      try {
        var values = JSON.parse(context.value);

        if (values.length > 0) {
          context.write("0", JSON.stringify(toReferenceSingleRequest(values, values[0].reference)));
        }
      } catch (e) {
        logError("map", {
          message: e.message,
          name: e.name,
          stack: e.stack
        });
        throw e;
      }
    };
  }

  function reduceCSVConstructor(createReferenceSingleJob, record, transactionSearch, logError) {
    return function (context) {
      try {
        context.values.map(function (o) {
          return (0, _expectations.expectReferenceSingleRequest)(JSON.parse(o));
        }).forEach(function (request) {
          var transactionId = request.entries[0].id;
          record.submitFields({
            type: transactionSearch.fetchRecordTypeById(transactionId),
            id: transactionId,
            values: {
              custbody_glm_csv_reference: ""
            }
          });
          createReferenceSingleJob(request);
        });
        context.write(context.key, "passed");
      } catch (e) {
        logError("reduce", {
          message: e.message,
          name: e.name,
          stack: e.stack
        });
        throw e;
      }
    };
  }

  function summarizeCSVConstructor(logError, scheduler) {
    return function () {
      try {
        scheduler.tryReschedule();
      } catch (e) {
        logError("summarize", {
          message: e.message,
          name: e.name,
          stack: e.stack
        });
        throw e;
      }
    };
  }

  function tranlineToEntry(data) {
    return {
      accountingBook: data.accountingBook,
      id: data.transaction,
      isPeriodClosed: data.isPeriodClosed,
      line: data.line,
      reference: data.reference
    };
  }

  function toReferenceSingleRequest(data, reference) {
    return {
      account: data[0].account,
      entries: data.map(tranlineToEntry),
      reference: reference
    };
  }
});