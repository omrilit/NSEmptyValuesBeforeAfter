/**
 * @copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "./generator"], function (_exports, _generator) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.SequenceService = void 0;

  var SequenceService =
  /** @class */
  function () {
    function SequenceService(sequenceRepository) {
      this.sequenceRepository = sequenceRepository;
    }

    SequenceService.prototype.nextMatchingCode = function (account, subsidiary, accountingBook) {
      var codes = this.sequenceRepository.find(account, subsidiary, accountingBook);
      var code = "a";

      if (codes.length === 0) {
        this.sequenceRepository.create(code, account, subsidiary, accountingBook);
      } else {
        code = (0, _generator.generateNextCode)(codes[0].lastSequenceNumber);
        this.sequenceRepository.update(codes[0].id, code);
      }

      return code;
    };

    return SequenceService;
  }();

  _exports.SequenceService = SequenceService;
});