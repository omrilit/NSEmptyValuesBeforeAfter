/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getNearestLocale = getNearestLocale;
  _exports.translateConstructor = translateConstructor;
  // Order in supportedLocales has impact on default locale!!!
  // ie. getNearestLocale("zh") = "zh_CN", because zh_CN is before zh_TW
  var supportedLocales = ["cs_CZ", "da_DK", "de_DE", "en_US", "es_AR", "es_ES", "fi_FI", "fr_FR", "fr_CA", "id_ID", "it_IT", "ja_JP", "ko_KR", "nl_NL", "no_NO", "pt_BR", "ru_RU", "sv_SE", "th_TH", "tr_TR", "vi_VN", "zh_CN", "zh_TW"];

  function getNearestLocale(language) {
    var locale = language.replace("-", "_");

    if (supportedLocales.indexOf(locale) >= 0) {
      return locale;
    }

    var found = supportedLocales.map(function (x) {
      return [x.substring(0, 2), x];
    }).filter(function (x) {
      return x[0] === locale;
    }).map(function (x) {
      return x[1];
    }).shift();
    return found || "en_US";
  }

  function translateConstructor(locale, translations) {
    return function (key) {
      return translations[key][locale] || translations[key].en_US;
    };
  }
});