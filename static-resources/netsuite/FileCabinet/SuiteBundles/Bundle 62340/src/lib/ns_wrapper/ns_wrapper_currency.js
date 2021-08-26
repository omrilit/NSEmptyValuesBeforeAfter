/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var ns_wrapper = ns_wrapper || {};

ns_wrapper.CurrencyConverter = function CurrencyConverter (input) {
  var rate = 0;

  this.convert = function convert (amount) {
    return rate * amount;
  };

  function init () {
    if (!input) {
      throw nlapiCreateError('DUNNING_CURRENCY_CONVERTER_PARAMETER_REQUIRED', 'Currency Converter Input is mandatory constructor parameter');
    }
    rate = nlapiExchangeRate(input.sourceCurrency, input.targetCurrency, input.effectiveDate || null);
  }

  init();
  // I have to assign it here instead of init due to the context of this.
  this.definition = input;
};
