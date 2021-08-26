/**
 * @copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @NModuleScope Public
 */
define(["exports", "N/cache", "N/log"], function (_exports, _cache, _log) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.onRequest = void 0;
  var locales = ["cs_CZ", "da_DK", "de_DE", "en_US", "es_AR", "es_ES", "fi_FI", "fr_CA", "fr_FR", "id_ID", "it_IT", "ja_JP", "ko_KR", "nb_NO", "nl_NL", "pt_BR", "ru_RU", "sv_SE", "th_TH", "tr_TR", "vi_VN", "zh_CN", "zh_TW"];

  var onRequest = function onRequest(context) {
    var cache = (0, _cache.getCache)({
      name: "glm-v2",
      scope: _cache.Scope.PUBLIC
    });
    locales.forEach(function (locale) {
      {
        var key = "TransactionSearch.findAllowedTranTypes(\"" + locale + "\")";
        (0, _log.debug)(key, cache.get({
          key: key
        }));
        cache.remove({
          key: key
        });
      }
      {
        var key = "TransactionSearch.findAllowedTranTypes(\"" + locale.substr(0, 2) + "\")";
        (0, _log.debug)(key, cache.get({
          key: key
        }));
        cache.remove({
          key: key
        });
      }
      {
        var key = "fetchAllVariables";
        (0, _log.debug)(key, cache.get({
          key: key
        }));
        cache.remove({
          key: key
        });
      }
    });
    context.response.write(JSON.stringify({
      success: true
    }));
  };

  _exports.onRequest = onRequest;
});