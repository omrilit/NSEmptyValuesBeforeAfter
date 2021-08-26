/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author ldimayuga
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.CurrencyConverter = function CurrencyConverter () {
  var currencySearch = new dunning.app.CurrencySymbolSearchHandler();
  var CURRENCY_SYMBOLS = currencySearch.searchCurrencySymbols();

  this.convertIdsToSymbol = function convertIdsToSymbol (ids) {
    var currencyIds = ids.split(',');
    var symbols = [];

    for (var i = 0; i < currencyIds.length; i++) {
      var id = currencyIds[i];
      symbols.push(CURRENCY_SYMBOLS[id]);
    }
    return symbols.join(', ');
  };

  this.convertIdToSymbol = function convertIdToSymbol (id) {
    return CURRENCY_SYMBOLS[id];
  };
};
