/**
 * @copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../suiteapi/di/runtime", "../index", "../translations"], function (_exports, _runtime, _index, _translations) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.translate = _exports.getTranslator = void 0;

  var getTranslator = function getTranslator(language) {
    return (0, _index.translateConstructor)((0, _index.getNearestLocale)(language), _translations.translations);
  };

  _exports.getTranslator = getTranslator;
  var translate = getTranslator(_runtime.runtime.getLanguage());
  _exports.translate = translate;
});