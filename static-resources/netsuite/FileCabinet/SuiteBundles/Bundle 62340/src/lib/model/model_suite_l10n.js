/**
 * @license
 * Copyright © 2016, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var suite_l10n = suite_l10n || {};
suite_l10n.model = suite_l10n.model || {};

suite_l10n.model.Customer = function () {
  this.id = null;
  this.subsidiary = null;
  this.isPerson = null;
};

suite_l10n.model.Invoice = function () {
  this.id = null;
  this.subsidiary = null;
  this.classification = null;
  this.location = null;
  this.department = null;
  this.customer = null;
};

suite_l10n.model.Subsidiary = function () {
  this.id = null;
  this.name = null;
  this.currency = null;
};

suite_l10n.model.Currency = function () {
  this.id = null;
  this.currencyFormatSample = null;
  this.displaySymbol = null;
  this.exchangeRate = 0;
  this.autoUpdateFXRate = false;
  this.isBaseCurrency = false;
  this.name = null;
  this.overrideCurrencyFormat = null;
  this.symbol = null;
  this.symbolPlacement = null;
};

suite_l10n.model.Folder = function () {
  this.id = null;
  this.name = null;
  this.parent = null;
};
