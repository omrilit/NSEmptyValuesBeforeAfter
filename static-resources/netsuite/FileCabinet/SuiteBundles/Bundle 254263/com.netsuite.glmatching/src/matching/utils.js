/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../vendor/tslib", "../common/fn", "../common/Maybe", "../common/Summary", "../../vendor/lodash-4.17.4"], function (_exports, _tslib, _fn, _Maybe, _Summary, _lodash) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.clearEntries = clearEntries;
  _exports.hasDifferentMatching = hasDifferentMatching;
  _exports.isMatchingEqual = isMatchingEqual;
  _exports.getMatchingIds = getMatchingIds;
  _exports.isReferenceDifferent = isReferenceDifferent;
  _exports.totalTranLines = totalTranLines;
  _exports.getChangedMatchingIds = getChangedMatchingIds;
  _exports.flattenHistory = flattenHistory;

  function clearEntries(entries) {
    return entries.map(function (entry) {
      return (0, _tslib.__assign)((0, _tslib.__assign)({}, entry), {
        matching: undefined
      });
    });
  }

  function hasDifferentMatching(matchingId) {
    return function (tranLine) {
      return !isMatchingEqual(matchingId)(tranLine);
    };
  }

  function isMatchingEqual(matchingId) {
    return function (tranLine) {
      return tranLine.matching.test(function (_a) {
        var id = _a.id;
        return id === matchingId;
      });
    };
  }

  function getMatchingIds(tranLines) {
    return (0, _lodash.uniq)((0, _Maybe.onlyJustValues)(tranLines.map(function (_a) {
      var matching = _a.matching;
      return matching;
    })).map(function (_a) {
      var id = _a.id;
      return id;
    }));
  }

  function isReferenceDifferent(reference) {
    return function (tranLine) {
      return tranLine.reference !== reference;
    };
  }

  function totalTranLines(tranLines) {
    return _Summary.Summary.sum(tranLines.map(_Summary.Summary.fromRecord));
  }

  function getChangedMatchingIds(history) {
    return (0, _lodash.uniq)(history.map(function (x) {
      return x.matching;
    }).filter(function (x) {
      return x != null;
    }).filter(function (_a) {
      var after = _a.after,
          before = _a.before;
      return after !== before;
    }).reduce(function (a, _a) {
      var after = _a.after,
          before = _a.before;
      return (0, _tslib.__spreadArrays)(a, [after, before].filter(_fn.isInternalId));
    }, []));
  }
  /**
   * It takes a HistoryData with N TranLines in the transaction field and returns N copies of the HistoryData
   * with only one TranLine[i]
   */


  function flattenHistory(history) {
    return history.transactions.map(function (transaction) {
      return (0, _tslib.__assign)((0, _tslib.__assign)({}, history), {
        transactions: [transaction]
      });
    });
  }
});