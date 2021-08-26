/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var suite_l10n = suite_l10n || {};
suite_l10n.dao = suite_l10n.dao || {};

suite_l10n.dao.CurrencyDAO = function CurrencyDAO () {
  var RECORD_TYPE = 'currency';
  var obj = new suite_l10n.dao.BasicDAO(RECORD_TYPE);
  var FIELD_MAP = {
    'currencyFormatSample': 'currencyformatsample',
    'displaySymbol': 'displaysymbol',
    'exchangeRate': 'exchangerate',
    'autoUpdateFXRate': 'includeinfxrateupdates',
    'isBaseCurrency': 'isbasecurrency',
    'name': 'name',
    'overrideCurrencyFormat': 'overridecurrencyformat',
    'symbol': 'symbol',
    'symbolPlacement': 'symbolplacement'
  };

  obj.setFieldMap(FIELD_MAP);
  obj.setModelClass(suite_l10n.model.Currency);

  return obj;
};
