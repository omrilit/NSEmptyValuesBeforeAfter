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
  _exports.getCacheConstructor = void 0;

  var getCacheConstructor = function getCacheConstructor(cache) {
    return function () {
      return cache.getCache({
        name: "glm-v2",
        scope: cache.Scope.PUBLIC
      });
    };
  };

  _exports.getCacheConstructor = getCacheConstructor;
});