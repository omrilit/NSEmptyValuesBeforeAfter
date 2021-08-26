/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../../vendor/lodash-4.17.4", "../jobs/matching", "../jobs/referenceGroup", "../jobs/referenceSingle", "../jobs/referenceUnmatching", "../jobs/unmatching"], function (_exports, _lodash, _matching, _referenceGroup, _referenceSingle, _referenceUnmatching, _unmatching) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.historyResolver = void 0;
  var historyResolver = (0, _lodash.flow)(_matching.resolveMatchingHistory, _referenceGroup.resolveReferenceGroupHistory, _referenceUnmatching.resolveReferenceUnmatchingHistory, _unmatching.resolveUnmatchingHistory, _referenceSingle.resolveReferenceSingleHistory);
  _exports.historyResolver = historyResolver;
});