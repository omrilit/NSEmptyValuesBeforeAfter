/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../common/expectations", "../common/fn", "../common/MatchingStatus", "../common/Maybe", "../dashboard/request-parsers", "../scheduler/index", "../../lib/errors"], function (_exports, _expectations, _fn, _MatchingStatus, _Maybe, _requestParsers, _index, _errors) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.expectTranLine = expectTranLine;
  _exports.expectMatching = expectMatching;
  _exports.expectMatchingCommand = expectMatchingCommand;
  _exports.expectUnmatchingCommand = expectUnmatchingCommand;
  _exports.expectReferenceGroupCommand = expectReferenceGroupCommand;
  _exports.expectReferenceSingleCommand = expectReferenceSingleCommand;
  _exports.expectReferenceUnmatchingCommand = expectReferenceUnmatchingCommand;
  _exports.expectMatchingRequest = expectMatchingRequest;
  _exports.expectReferenceGroupRequest = expectReferenceGroupRequest;
  _exports.expectReferenceSingleRequest = expectReferenceSingleRequest;
  _exports.expectReferenceUnmatchingRequest = expectReferenceUnmatchingRequest;
  _exports.expectUnmatchingRequest = expectUnmatchingRequest;

  function expectTranLine(value) {
    var object = (0, _expectations.expectPlainObject)(value);
    var account = (0, _expectations.expectInternalId)(object.account);
    var accountingBook = (0, _expectations.expectInternalId)(object.accountingBook);
    var appliedTo = (0, _expectations.expectOptionalInternalId)(object.appliedTo);
    var credit = (0, _expectations.expectOptionalString)(object.credit);
    var debit = (0, _expectations.expectOptionalString)(object.debit);
    var id = (0, _expectations.expectOptionalInternalId)(object.id);
    var isPeriodClosed = Boolean(object.isPeriodClosed);
    var line = (0, _expectations.expectInternalId)(object.line);
    var matching = (0, _Maybe.maybe)(object.matching).fmap(expectMatching);
    var matchingDate = (0, _expectations.expectOptionalDate)(object.matchingDate);
    var reference = (0, _expectations.expectString)(object.reference);
    var subsidiary = (0, _expectations.expectInternalId)(object.subsidiary);
    var transaction = (0, _expectations.expectInternalId)(object.transaction);
    return (0, _fn.compactObject)({
      account: account,
      accountingBook: accountingBook,
      appliedTo: appliedTo,
      credit: credit,
      debit: debit,
      id: id,
      isPeriodClosed: isPeriodClosed,
      line: line,
      matching: matching,
      matchingDate: matchingDate,
      reference: reference,
      subsidiary: subsidiary,
      transaction: transaction
    });
  }

  function expectMatching(value) {
    var object = (0, _expectations.expectPlainObject)(value);
    var code = (0, _expectations.expectString)(object.code);
    var id = (0, _expectations.expectInternalId)(object.id);
    var status = (0, _MatchingStatus.expectMatchingStatus)(object.status);
    return {
      code: code,
      id: id,
      status: status
    };
  }

  function expectMatchingCommand(value) {
    var object = (0, _expectations.expectPlainObject)(value);
    var command = (0, _expectations.expectString)(object.command);

    if (command !== _index.JobType.MATCHING) {
      throw (0, _errors.createTypeError)("Unexpected command type");
    }

    var matching = expectMatching(object.matching);
    var matchingDate = (0, _expectations.expectDate)(object.matchingDate);
    var tranLine = expectTranLine(object.tranLine);
    var user = (0, _expectations.expectInternalId)(object.user);
    return {
      command: command,
      matching: matching,
      matchingDate: matchingDate,
      tranLine: tranLine,
      user: user
    };
  }

  function expectUnmatchingCommand(value) {
    var object = (0, _expectations.expectPlainObject)(value);
    var command = (0, _expectations.expectString)(object.command);

    if (command !== _index.JobType.UNMATCHING) {
      throw (0, _errors.createTypeError)("Unexpected command type");
    }

    var matchingDate = (0, _expectations.expectDate)(object.matchingDate);
    var tranLine = expectTranLine(object.tranLine);
    var user = (0, _expectations.expectInternalId)(object.user);
    return {
      command: command,
      matchingDate: matchingDate,
      tranLine: tranLine,
      user: user
    };
  }

  function expectReferenceGroupCommand(value) {
    var object = (0, _expectations.expectPlainObject)(value);
    var command = (0, _expectations.expectString)(object.command);

    if (command !== _index.JobType.REFERENCE_GROUP) {
      throw (0, _errors.createTypeError)("Unexpected command type");
    }

    var reference = (0, _expectations.expectString)(object.reference);
    var tranLine = expectTranLine(object.tranLine);
    return {
      command: command,
      reference: reference,
      tranLine: tranLine
    };
  }

  function expectReferenceSingleCommand(value) {
    var object = (0, _expectations.expectPlainObject)(value);
    var command = (0, _expectations.expectString)(object.command);

    if (command !== _index.JobType.REFERENCE_SINGLE) {
      throw (0, _errors.createTypeError)("Unexpected command type");
    }

    var reference = (0, _expectations.expectString)(object.reference);
    var tranLine = expectTranLine(object.tranLine);
    return {
      command: command,
      reference: reference,
      tranLine: tranLine
    };
  }

  function expectReferenceUnmatchingCommand(value) {
    var object = (0, _expectations.expectPlainObject)(value);
    var command = (0, _expectations.expectString)(object.command);

    if (command !== _index.JobType.REFERENCE_UNMATCH) {
      throw (0, _errors.createTypeError)("Unexpected command type");
    }

    var matchingDate = (0, _expectations.expectDate)(object.matchingDate);
    var reference = (0, _expectations.expectString)(object.reference);
    var tranLine = expectTranLine(object.tranLine);
    var user = (0, _expectations.expectInternalId)(object.user);
    return {
      command: command,
      matchingDate: matchingDate,
      reference: reference,
      tranLine: tranLine,
      user: user
    };
  }

  function expectMatchingRequest(value) {
    var object = (0, _expectations.expectPlainObject)(value);
    var account = (0, _expectations.expectInternalId)(object.account);
    var accountingBook = (0, _expectations.expectInternalId)(object.accountingBook);
    var entries = (0, _expectations.expectNonEmptyArrayOf)(_requestParsers.expectEntry)(object.entries);
    var forceNewCode = Boolean(object.forceNewCode);
    var matching = (0, _expectations.expectOptionalOf)(expectMatching)(object.matching);
    var subsidiary = (0, _expectations.expectInternalId)(object.subsidiary);
    return (0, _fn.compactObject)({
      account: account,
      accountingBook: accountingBook,
      entries: entries,
      forceNewCode: forceNewCode,
      matching: matching,
      subsidiary: subsidiary
    });
  }

  function expectReferenceGroupRequest(value) {
    var object = (0, _expectations.expectPlainObject)(value);
    var account = (0, _expectations.expectInternalId)(object.account);
    var entries = (0, _expectations.expectNonEmptyArrayOf)(_requestParsers.expectEntry)(object.entries);
    var reference = (0, _expectations.expectString)(object.reference);
    return {
      account: account,
      entries: entries,
      reference: reference
    };
  }

  function expectReferenceSingleRequest(value) {
    var object = (0, _expectations.expectPlainObject)(value);
    var account = (0, _expectations.expectInternalId)(object.account);
    var entries = (0, _expectations.expectNonEmptyArrayOf)(_requestParsers.expectEntry)(object.entries);
    var reference = (0, _expectations.expectString)(object.reference);
    return {
      account: account,
      entries: entries,
      reference: reference
    };
  }

  function expectReferenceUnmatchingRequest(value) {
    var object = (0, _expectations.expectPlainObject)(value);
    var account = (0, _expectations.expectInternalId)(object.account);
    var entries = (0, _expectations.expectNonEmptyArrayOf)(_requestParsers.expectEntry)(object.entries);
    var reference = (0, _expectations.expectString)(object.reference);
    return {
      account: account,
      entries: entries,
      reference: reference
    };
  }

  function expectUnmatchingRequest(value) {
    var object = (0, _expectations.expectPlainObject)(value);
    var account = (0, _expectations.expectInternalId)(object.account);
    var entries = (0, _expectations.expectNonEmptyArrayOf)(_requestParsers.expectEntry)(object.entries);
    return {
      account: account,
      entries: entries
    };
  }
});