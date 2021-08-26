/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author ldimayuga
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningLevelRuleAmountProcessor = function DunningLevelRuleAmountProcessor (dlraObjects) {
  var overdueBalance;
  var minimalInvoiceAmount;
  var defaultCurrency;
  var currencyIds = [];
  init();

  this.getTotalOverdueBalance = function getTotalOverDueBalance () {
    return overdueBalance;
  };

  this.getDefaultCurrency = function getDefaultCurrency () {
    return defaultCurrency;
  };

  this.getCurrencies = function getCurrencies () {
    return currencyIds.join(',');
  };

  this.getMinimalInvoiceAmount = function getMinimalInvoiceAmount () {
    return minimalInvoiceAmount;
  };

  function init () {
    for (var i = 0; i < dlraObjects.length; i++) {
      var isDefault = dlraObjects[i].defaultflag;
      if (isDefault == 'T') {
        overdueBalance = dlraObjects[i].toa;
        defaultCurrency = dlraObjects[i].currency;
        minimalInvoiceAmount = dlraObjects[i].amount;
      }
      currencyIds.push(dlraObjects[i].currency);
    }
  }
};
