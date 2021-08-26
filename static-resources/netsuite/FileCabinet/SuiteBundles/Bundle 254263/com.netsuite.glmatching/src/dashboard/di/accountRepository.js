/**
 * @copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../suiteapi/di/runQuery", "../AccountRepository"], function (_exports, _runQuery, _AccountRepository) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.accountRepository = void 0;
  var accountRepository = new _AccountRepository.AccountRepository(_runQuery.runQuery);
  _exports.accountRepository = accountRepository;
});