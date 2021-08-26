/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author ldimayuga
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.CurrencySymbolSearchHandler = function CurrencySymbolSearchHandler () {
  this.searchCurrencySymbols = function searchCurrencySymbols () {
    var URLAPI = ns_wrapper.api.url;

    var suiteletURL = URLAPI.resolveUrl('SUITELET',
      'customscript_3805_search_currency_symbol', 'customdeploy_3805_search_currency_symbol');
    var responseObj = URLAPI.requestUrlCs(suiteletURL, {});
    return JSON.parse(responseObj.getBody());
  };
};
