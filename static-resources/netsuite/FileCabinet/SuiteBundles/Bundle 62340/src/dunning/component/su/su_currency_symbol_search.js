/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author ldimayuga
 */

var dunning = dunning || {};
dunning.component = dunning.component || {};
dunning.component.su = dunning.component.su || {};

dunning.component.su.CurrencySymbolSuitelet = function CurrencySymbolSuitelet () {
  var INTERNAL_ID = 'internalid';
  var SYMBOL = 'symbol';
  var CURRENCY_RECORD = 'currency';

  function runSuitelet (request, response) {
    var currencySymbols = geCurrencySymbols();
    response.write(JSON.stringify(currencySymbols));
  }

  function geCurrencySymbols () {
    var currencies = [];
    var columns = [
      new nlobjSearchColumn(INTERNAL_ID),
      new nlobjSearchColumn(SYMBOL)
    ];

    var search = new ns_wrapper.Search(CURRENCY_RECORD);
    search.addColumns(columns);
    var it = search.getIterator();

    if (it) {
      var r;
      var internalId;
      var symbol;
      while (it.hasNext()) {
        r = it.next();
        internalId = r.getValue(INTERNAL_ID);
        symbol = r.getValue(SYMBOL);

        if (!currencies[internalId]) {
          currencies[internalId] = symbol;
        }
      }
    }
    return currencies;
  }

  return {
    runSuitelet: runSuitelet
  };
};

function runSuitelet (request, response) { // eslint-disable-line no-unused-vars
  var suitelet = new dunning.component.su.CurrencySymbolSuitelet();

  suitelet.runSuitelet(request, response);
}
