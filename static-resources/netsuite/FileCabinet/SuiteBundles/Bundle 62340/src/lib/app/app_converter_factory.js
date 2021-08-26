/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var suite_l10n = suite_l10n || {};
suite_l10n.app = suite_l10n.app || {};
suite_l10n.app.factory = suite_l10n.app.factory || {};

suite_l10n.app.factory.ConverterFactory = function ConverterFactory () {
  var obj = new suite_l10n.app.factory.BasicFactory();

  obj.getConverter = function getConverter (className) {
    return obj.getInstance(className);
  };

  return obj;
};
