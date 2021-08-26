/**
 * @copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../suiteapi/di/cache", "../../suiteapi/di/runQuery", "../../translator/di/translate", "../TranTypeRepository"], function (_exports, _cache, _runQuery, _translate, _TranTypeRepository) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.tranTypeRepository = void 0;
  var tranTypeRepository = new _TranTypeRepository.TranTypeRepository(_cache.getCache, _runQuery.runQuery, _translate.translate);
  _exports.tranTypeRepository = tranTypeRepository;
});