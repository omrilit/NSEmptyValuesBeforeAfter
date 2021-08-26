/**
 * @copyright © 2020, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../vendor/tslib", "./Maybe"], function (_exports, _tslib, _Maybe) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.logToPSGLoggerConstructor = logToPSGLoggerConstructor;
  _exports.logELKMetric4Constructor = logELKMetric4Constructor;

  function logToPSGLoggerConstructor(elasticLogger) {
    var psgLogger = elasticLogger.create({
      type: elasticLogger.Type.PSG
    });
    return function (psgParams, generalParams) {
      psgLogger.info((0, _tslib.__assign)((0, _tslib.__assign)({
        bundleName: "GL Matching",
        bundleVersion: "2.03.0"
      }, psgParams), generalParams));
    };
  }

  function countFiltersUsedInSearch(parameters) {
    var matchingStatusFilterUsed = parameters.matchingStatus.isSelected("none"
    /* NONE */
    ) && parameters.matchingStatus.isSelected("paired"
    /* PAIRED */
    ) && !parameters.matchingStatus.isSelected("matched"
    /* MATCHED */
    ) ? 0 : 1; // 0 if default, 1 otherwise

    var transactionTypeFilterUsed = parameters.transactionTypes.length > 0 ? 1 : 0;
    var otherFiltersUsed = (0, _Maybe.onlyJustValues)([parameters.matchingCode, parameters.matchingReference, parameters.memo, parameters.memoLine, parameters.customer, parameters.vendor, parameters.employee, parameters.billingStatus, parameters.dateMin, parameters.dateMax, parameters.amountMin, parameters.amountMax, parameters.department, parameters.classification, parameters.location]).length;
    return matchingStatusFilterUsed + transactionTypeFilterUsed + otherFiltersUsed;
  }

  function logELKMetric4Constructor(logToPSGLogger) {
    return function (totalSearchResults, parameters) {
      logToPSGLogger({
        featureName: "ELK metric #4"
      }, {
        totalAmount: totalSearchResults,
        instanceCount: countFiltersUsedInSearch(parameters)
      });
    };
  }
});